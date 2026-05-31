/**
 * rideService — the single data-access / "API" layer for CampusRide.
 *
 * Every screen talks to Firestore THROUGH this file (never directly), so the
 * data model lives in one place and request/chat logic can't drift between
 * screens. Think of it as the backend SDK for the app.
 *
 * Firestore collections (the model):
 *   users         — { uid, name, email, phone, dept, year, ... }            (created at register)
 *   rides         — { hostId, hostName, from, to, time, vehicleType, ... }  (created when hosting)
 *   rideRequests  — a passenger asking to join a ride                       (this file)
 *   chats         — a 1:1 conversation, created ONLY when a request is accepted
 *   chats/{id}/messages — the messages in that conversation
 */
import {
  collection, onSnapshot, query, where, orderBy,
  doc, getDoc, setDoc, updateDoc, addDoc,
} from 'firebase/firestore';
import { auth, db } from '@/app/firebase';

// ---------- Model ----------
export type RequestStatus = 'pending' | 'accepted' | 'rejected';

export interface RideRequest {
  id: string;
  rideId: string;
  hostId: string;
  hostName: string;
  passengerId: string;
  passengerName: string;
  passengerDept: string;
  passengerEmail: string;
  rideFrom: string;
  rideTo: string;
  rideTime: string;
  vehicleModel: string;
  status: RequestStatus;
  createdAt: string;
}

export interface Chat {
  id: string;
  participants: string[];
  participantInfo: { [uid: string]: { name: string } };
  rideId: string;
  rideFrom: string;
  rideTo: string;
  rideTime: string;
  lastMessage: string;
  lastMessageAt: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  name?: string;
  email?: string;
  phone?: string;
  dept?: string;
  year?: string;
  vehicle?: string;
  rating?: number;
  totalRides?: number;
}

// Deterministic IDs => one request / one chat per (ride, passenger). No duplicates.
export const requestId = (rideId: string, passengerId: string) => `${rideId}_${passengerId}`;
export const chatId = (rideId: string, passengerId: string) => `${rideId}_${passengerId}`;

const nowIso = () => new Date().toISOString();

// ---------- Requests ----------

/** Passenger asks to join a ride. Writes a `pending` rideRequests doc. */
export async function sendRideRequest(ride: any): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('not-authenticated');
  if (ride.hostId === user.uid) throw new Error('own-ride');

  const meSnap = await getDoc(doc(db, 'users', user.uid));
  const me: any = meSnap.exists() ? meSnap.data() : {};

  await setDoc(doc(db, 'rideRequests', requestId(ride.id, user.uid)), {
    rideId: ride.id,
    hostId: ride.hostId,
    hostName: ride.hostName || 'Student',
    passengerId: user.uid,
    passengerName: me.name || user.displayName || user.email?.split('@')[0] || 'Student',
    passengerDept: me.dept || 'Student',
    passengerEmail: user.email || '',
    rideFrom: ride.from || '',
    rideTo: ride.to || '',
    rideTime: ride.time || '',
    vehicleModel: ride.vehicleModel || '',
    status: 'pending' as RequestStatus,
    createdAt: nowIso(),
  });
}

/** Live map of rideId -> status for requests the current user has SENT. */
export function listenSentRequests(
  uid: string,
  cb: (statusByRideId: { [rideId: string]: RequestStatus }, requests: RideRequest[]) => void,
) {
  const q = query(collection(db, 'rideRequests'), where('passengerId', '==', uid));
  return onSnapshot(q, (snap) => {
    const requests = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as RideRequest[];
    requests.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    const map: { [rideId: string]: RequestStatus } = {};
    requests.forEach(r => { map[r.rideId] = r.status; });
    cb(map, requests);
  });
}

/** Live list of requests the current user has RECEIVED (they are the host). */
export function listenReceivedRequests(uid: string, cb: (requests: RideRequest[]) => void) {
  const q = query(collection(db, 'rideRequests'), where('hostId', '==', uid));
  return onSnapshot(q, (snap) => {
    const requests = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as RideRequest[];
    requests.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    cb(requests);
  });
}

/** Live count of pending requests on the host's rides (for the bell badge). */
export function listenPendingCount(uid: string, cb: (count: number) => void) {
  const q = query(
    collection(db, 'rideRequests'),
    where('hostId', '==', uid),
    where('status', '==', 'pending'),
  );
  return onSnapshot(q, (snap) => cb(snap.size));
}

/** Host accepts a request -> flips status AND opens the chat (the only way a chat is created). */
export async function acceptRideRequest(req: RideRequest): Promise<void> {
  await updateDoc(doc(db, 'rideRequests', req.id), { status: 'accepted' });
  const now = nowIso();
  await setDoc(doc(db, 'chats', chatId(req.rideId, req.passengerId)), {
    participants: [req.hostId, req.passengerId],
    participantInfo: {
      [req.hostId]: { name: req.hostName || 'Host' },
      [req.passengerId]: { name: req.passengerName || 'Student' },
    },
    rideId: req.rideId,
    rideFrom: req.rideFrom || '',
    rideTo: req.rideTo || '',
    rideTime: req.rideTime || '',
    lastMessage: 'Ride request accepted — say hi! 👋',
    lastMessageAt: now,
    createdAt: now,
  }, { merge: true });
}

/** Host declines a request. */
export async function rejectRideRequest(req: RideRequest): Promise<void> {
  await updateDoc(doc(db, 'rideRequests', req.id), { status: 'rejected' });
}

// ---------- Support ----------

/** Email where support reports are sent / addressed to. */
export const ADMIN_EMAIL = 'mohansanka5182@gmail.com';

/** Save a support report so there's a record (admin can read it in Firestore). */
export async function submitSupportTicket(input: {
  uid: string; email: string; name: string; subject: string; message: string;
}): Promise<void> {
  await addDoc(collection(db, 'supportTickets'), {
    ...input,
    status: 'open',
    createdAt: new Date().toISOString(),
  });
}

// ---------- Profile ----------

/** Live profile doc for a user (users/{uid}). */
export function listenUserProfile(uid: string, cb: (profile: UserProfile | null) => void) {
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    cb(snap.exists() ? ({ uid, ...(snap.data() as any) }) as UserProfile : null);
  });
}

/** Live list of rides the user has hosted, newest first. */
export function listenHostedRides(uid: string, cb: (rides: any[]) => void) {
  const q = query(collection(db, 'rides'), where('hostId', '==', uid));
  return onSnapshot(q, (snap) => {
    const rides = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    rides.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    cb(rides);
  });
}

// ---------- Chats ----------

/** Live list of the current user's conversations. */
export function listenChats(uid: string, cb: (chats: Chat[]) => void) {
  const q = query(collection(db, 'chats'), where('participants', 'array-contains', uid));
  return onSnapshot(q, (snap) => {
    const chats = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Chat[];
    chats.sort((a, b) => (b.lastMessageAt || '').localeCompare(a.lastMessageAt || ''));
    cb(chats);
  });
}

/** Live messages within one conversation, oldest -> newest. */
export function listenMessages(id: string, cb: (messages: ChatMessage[]) => void) {
  const q = query(collection(db, 'chats', id, 'messages'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as ChatMessage[]);
  });
}

/** Send a message and bump the conversation's last-message preview. */
export async function sendChatMessage(id: string, senderId: string, text: string): Promise<void> {
  const now = nowIso();
  await addDoc(collection(db, 'chats', id, 'messages'), { senderId, text, createdAt: now });
  await updateDoc(doc(db, 'chats', id), { lastMessage: text, lastMessageAt: now });
}
