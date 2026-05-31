import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { colorFor, initialOf } from '../constants/avatars';
import { listenChats, listenMessages, sendChatMessage } from '@/lib/rideService';

export default function ChatScreen() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
    return () => unsub();
  }, []);

  // My conversations (chats are created only when a ride request is accepted)
  useEffect(() => {
    if (!currentUser) { setChats([]); setLoading(false); return; }
    const unsub = listenChats(currentUser.uid, (data) => {
      setChats(data);
      setLoading(false);
    });
    return () => unsub();
  }, [currentUser]);

  // Live messages for the open conversation
  useEffect(() => {
    if (!activeChat) { setMessages([]); return; }
    const unsub = listenMessages(activeChat.id, (msgs) => {
      setMessages(msgs);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return () => unsub();
  }, [activeChat]);

  const otherInfo = (chat: any) => {
    const otherId = (chat.participants || []).find((p: string) => p !== currentUser?.uid);
    const info = chat.participantInfo?.[otherId] || {};
    return { id: otherId, name: info.name || 'Student' };
  };

  const sendMessage = async () => {
    if (!message.trim() || !activeChat || !currentUser) return;
    const text = message.trim();
    setMessage('');
    setSending(true);
    try {
      await sendChatMessage(activeChat.id, currentUser.uid, text);
    } catch (e) {
      console.log('send error', e);
      setMessage(text); // restore on failure
    } finally {
      setSending(false);
    }
  };

  const fmtTime = (iso?: string) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  // ---- Conversation view ----
  if (activeChat) {
    const other = otherInfo(activeChat);
    const c = colorFor(other.id);
    return (
      <View style={styles.container}>
        <View style={styles.chatHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setActiveChat(null)}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.chatHeaderInfo}>
            <View style={[styles.chatHeaderAvatar, { backgroundColor: c + '33' }]}>
              <Text style={[styles.chatHeaderAvatarText, { color: c }]}>{initialOf(other.name)}</Text>
            </View>
            <View>
              <Text style={styles.chatHeaderName}>{other.name}</Text>
              <Text style={styles.chatHeaderRole}>{activeChat.rideFrom} → {activeChat.rideTo}</Text>
            </View>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.msgList}
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 ? (
            <View style={styles.dateBadge}><Text style={styles.dateBadgeText}>Say hello 👋</Text></View>
          ) : messages.map(msg => {
            const mine = msg.senderId === currentUser?.uid;
            return (
              <View key={msg.id} style={[styles.msgRow, mine && styles.msgRowMine]}>
                <View style={[styles.msgBubble, mine ? styles.msgBubbleMine : styles.msgBubbleOther]}>
                  <Text style={[styles.msgText, mine && styles.msgTextMine]}>{msg.text}</Text>
                  <Text style={[styles.msgTime, mine && styles.msgTimeMine]}>{fmtTime(msg.createdAt)}</Text>
                </View>
              </View>
            );
          })}
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
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={sending}>
            <Text style={styles.sendBtnText}>➤</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ---- Conversation list ----
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
        {loading ? (
          <View style={styles.emptyBox}><ActivityIndicator size="large" color="#1A56DB" /></View>
        ) : chats.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>No chats yet</Text>
            <Text style={styles.emptySub}>
              Chats open once a ride request is accepted.{'\n'}Request a ride or accept one to start talking.
            </Text>
            <TouchableOpacity onPress={() => router.push('/requests' as any)}>
              <Text style={styles.emptyLink}>View ride requests →</Text>
            </TouchableOpacity>
          </View>
        ) : chats.map(chat => {
          const other = otherInfo(chat);
          const c = colorFor(other.id);
          return (
            <TouchableOpacity key={chat.id} style={styles.chatItem} onPress={() => setActiveChat(chat)}>
              <View style={[styles.chatAvatar, { backgroundColor: c + '22' }]}>
                <Text style={[styles.chatAvatarText, { color: c }]}>{initialOf(other.name)}</Text>
              </View>
              <View style={styles.chatInfo}>
                <View style={styles.chatInfoTop}>
                  <Text style={styles.chatName}>{other.name}</Text>
                  <Text style={styles.chatTime}>{fmtTime(chat.lastMessageAt)}</Text>
                </View>
                <Text style={styles.chatRole}>{chat.rideFrom} → {chat.rideTo}</Text>
                <Text style={styles.chatMsg} numberOfLines={1}>{chat.lastMessage}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
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
  emptyBox: { alignItems: 'center', padding: 44, backgroundColor: '#ffffff', borderRadius: 18, marginTop: 12 },
  emptyIcon: { fontSize: 44, marginBottom: 12 },
  emptyText: { fontSize: 15, color: '#0A0F2E', fontWeight: '700', marginBottom: 8 },
  emptySub: { fontSize: 12, color: '#888', textAlign: 'center', lineHeight: 18, marginBottom: 14 },
  emptyLink: { fontSize: 14, color: '#1A56DB', fontWeight: '800' },
  chatItem: { backgroundColor: '#ffffff', borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  chatAvatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  chatAvatarText: { fontSize: 17, fontWeight: '800' },
  chatInfo: { flex: 1 },
  chatInfoTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  chatName: { fontSize: 14, fontWeight: '700', color: '#0A0F2E' },
  chatTime: { fontSize: 10, color: '#bbb', fontWeight: '600' },
  chatRole: { fontSize: 10, color: '#1A56DB', fontWeight: '600', marginBottom: 2 },
  chatMsg: { fontSize: 12, color: '#888', fontWeight: '400' },
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
