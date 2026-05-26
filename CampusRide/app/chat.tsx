import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';

const chats = [
  { id:'1', name:'Arjun M.', avatar:'A', role:'Ride Host', msg:'Sure! I will pick you up at Adyar signal 👍', time:'8:12 AM', unread:2, color:'#1A56DB' },
  { id:'2', name:'Priya S.', avatar:'P', role:'Ride Host', msg:'I have 3 seats free today, want to join?', time:'Yesterday', unread:0, color:'#2563EB' },
  { id:'3', name:'Rahul K.', avatar:'R', role:'Ride Host', msg:'Ride confirmed for tomorrow 7:55 AM ✅', time:'Mon', unread:0, color:'#1D4ED8' },
  { id:'4', name:'Sneha T.', avatar:'S', role:'Ride Host', msg:'Thanks for the ride request!', time:'Sun', unread:1, color:'#16A34A' },
];

const mockMessages: {[key:string]: {id:string, text:string, mine:boolean, time:string}[]} = {
  '1': [
    { id:'1', text:'Hi! I saw your ride posting from Adyar Signal', mine:true, time:'8:05 AM' },
    { id:'2', text:'Can I join your ride today?', mine:true, time:'8:06 AM' },
    { id:'3', text:'Sure! I will pick you up at Adyar signal 👍', mine:false, time:'8:12 AM' },
    { id:'4', text:'Be there by 8:10 AM', mine:false, time:'8:12 AM' },
    { id:'5', text:'Perfect! Thank you so much 🙏', mine:true, time:'8:13 AM' },
  ],
};

export default function ChatScreen() {
  const router = useRouter();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(mockMessages);

  const sendMessage = () => {
    if (!message.trim() || !activeChat) return;
    const newMsg = { id: Date.now().toString(), text: message, mine: true, time: 'Now' };
    setMessages(prev => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), newMsg]
    }));
    setMessage('');
  };

  if (activeChat) {
    const chat = chats.find(c => c.id === activeChat)!;
    const msgs = messages[activeChat] || [];
    return (
      <View style={styles.container}>
        <View style={styles.chatHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setActiveChat(null)}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.chatHeaderInfo}>
            <View style={[styles.chatHeaderAvatar, { backgroundColor: chat.color + '33' }]}>
              <Text style={[styles.chatHeaderAvatarText, { color: chat.color }]}>{chat.avatar}</Text>
            </View>
            <View>
              <Text style={styles.chatHeaderName}>{chat.name}</Text>
              <Text style={styles.chatHeaderRole}>{chat.role}</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.msgList} contentContainerStyle={{ padding: 16, paddingBottom: 20 }}>
          <View style={styles.dateBadge}><Text style={styles.dateBadgeText}>Today</Text></View>
          {msgs.map(msg => (
            <View key={msg.id} style={[styles.msgRow, msg.mine && styles.msgRowMine]}>
              <View style={[styles.msgBubble, msg.mine ? styles.msgBubbleMine : styles.msgBubbleOther]}>
                <Text style={[styles.msgText, msg.mine && styles.msgTextMine]}>{msg.text}</Text>
                <Text style={[styles.msgTime, msg.mine && styles.msgTimeMine]}>{msg.time}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.msgInputRow}>
          <View style={styles.msgInputBox}>
            <TextInput
              style={styles.msgInput}
              placeholder="Type a message..."
              placeholderTextColor="#aaa"
              value={message}
              onChangeText={setMessage}
              multiline
            />
          </View>
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Text style={styles.sendBtnText}>➤</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/home' as any)}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.list} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {chats.map(chat => (
          <TouchableOpacity
            key={chat.id}
            style={styles.chatItem}
            onPress={() => setActiveChat(chat.id)}
          >
            <View style={[styles.chatAvatar, { backgroundColor: chat.color + '22' }]}>
              <Text style={[styles.chatAvatarText, { color: chat.color }]}>{chat.avatar}</Text>
            </View>
            <View style={styles.chatInfo}>
              <View style={styles.chatInfoTop}>
                <Text style={styles.chatName}>{chat.name}</Text>
                <Text style={styles.chatTime}>{chat.time}</Text>
              </View>
              <Text style={styles.chatRole}>{chat.role}</Text>
              <Text style={styles.chatMsg} numberOfLines={1}>{chat.msg}</Text>
            </View>
            {chat.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{chat.unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.bottomNav}>
        {[
          { icon: '🏠', label: 'Home', route: '/home', i: 0 },
          { icon: '🔍', label: 'Find', route: '/find', i: 1 },
          { icon: '➕', label: 'Host', route: '/host', i: 2 },
          { icon: '💬', label: 'Chat', route: '/chat', i: 3 },
          { icon: '👤', label: 'Profile', route: '/profile', i: 4 },
        ].map(nav => (
          <TouchableOpacity key={nav.i} style={styles.navItem} onPress={() => router.push(nav.route as any)}>
            <Text style={styles.navIcon}>{nav.icon}</Text>
            <Text style={[styles.navLabel, nav.i === 3 && styles.navLabelActive]}>{nav.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A56DB', paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  backBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  backText: { fontSize: 13, color: '#ffffff', fontWeight: '700' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#ffffff' },
  list: { flex: 1 },
  chatItem: { backgroundColor: '#ffffff', borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  chatAvatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  chatAvatarText: { fontSize: 17, fontWeight: '800' },
  chatInfo: { flex: 1 },
  chatInfoTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  chatName: { fontSize: 14, fontWeight: '700', color: '#0A0F2E' },
  chatTime: { fontSize: 10, color: '#bbb', fontWeight: '600' },
  chatRole: { fontSize: 10, color: '#1A56DB', fontWeight: '600', marginBottom: 2 },
  chatMsg: { fontSize: 12, color: '#888', fontWeight: '400' },
  unreadBadge: { backgroundColor: '#1A56DB', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  unreadText: { fontSize: 10, fontWeight: '800', color: '#ffffff' },
  chatHeader: { backgroundColor: '#1A56DB', paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  chatHeaderInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chatHeaderAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  chatHeaderAvatarText: { fontSize: 14, fontWeight: '800' },
  chatHeaderName: { fontSize: 15, fontWeight: '800', color: '#ffffff' },
  chatHeaderRole: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  msgList: { flex: 1 },
  dateBadge: { alignSelf: 'center', backgroundColor: '#E8EEFF', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 16 },
  dateBadgeText: { fontSize: 11, color: '#888', fontWeight: '600' },
  msgRow: { marginBottom: 8 },
  msgRowMine: { alignItems: 'flex-end' },
  msgBubble: { maxWidth: '75%', borderRadius: 16, padding: 12 },
  msgBubbleMine: { backgroundColor: '#1A56DB', borderBottomRightRadius: 4 },
  msgBubbleOther: { backgroundColor: '#ffffff', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  msgText: { fontSize: 14, color: '#0A0F2E', fontWeight: '400', lineHeight: 20 },
  msgTextMine: { color: '#ffffff' },
  msgTime: { fontSize: 10, color: '#aaa', marginTop: 4, textAlign: 'right' },
  msgTimeMine: { color: 'rgba(255,255,255,0.7)' },
  msgInputRow: { flexDirection: 'row', padding: 16, gap: 10, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#E8EEFF', alignItems: 'flex-end' },
  msgInputBox: { flex: 1, backgroundColor: '#F8F9FF', borderRadius: 24, borderWidth: 1, borderColor: '#E8EEFF', paddingHorizontal: 16, paddingVertical: 10, minHeight: 48 },
  msgInput: { fontSize: 14, color: '#0A0F2E', maxHeight: 100 },
  sendBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#1A56DB', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  sendBtnText: { fontSize: 18, color: '#ffffff' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#E8EEFF', flexDirection: 'row', paddingBottom: 20, paddingTop: 10, elevation: 10 },
  navItem: { flex: 1, alignItems: 'center', gap: 3 },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 10, color: '#aaa', fontWeight: '600' },
  navLabelActive: { color: '#1A56DB' },
});