import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User } from 'lucide-react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';

export default function ChatModal({ 
  isOpen, 
  onClose, 
  friendId, 
  chatName,
  senderName,
  themeColor,
  themeGradient 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  friendId: string, 
  chatName: string,
  senderName: string,
  themeColor: string,
  themeGradient: string
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !friendId || !auth.currentUser) return;

    const convId = [auth.currentUser.uid, friendId].sort().join('_');
    const path = `conversations/${convId}/messages`;
    const q = query(
      collection(db, 'conversations', convId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return unsubscribe;
  }, [isOpen, friendId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !friendId || !auth.currentUser) return;
    const convId = [auth.currentUser.uid, friendId].sort().join('_');
    const path = `conversations/${convId}/messages`;
    const text = newMessage.trim();
    setNewMessage('');
    
    try {
      await addDoc(collection(db, 'conversations', convId, 'messages'), {
        text,
        senderId: auth.currentUser.uid,
        timestamp: serverTimestamp()
      });

      // Also create a notification for the recipient
      await addDoc(collection(db, 'notifications'), {
        toUid: friendId,
        fromUid: auth.currentUser.uid,
        fromName: senderName,
        type: 'message',
        text: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
        read: false,
        timestamp: Date.now()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-4 right-4 z-[1000] w-full max-w-[360px] h-[500px] bg-zinc-950 border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
      style={{ borderColor: `${themeColor}33` }}
    >
      <div className="p-4 bg-zinc-900/50 border-b border-white/5 flex justify-between items-center backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center border transition-colors shadow-lg"
            style={{ backgroundColor: `${themeColor}10`, borderColor: `${themeColor}20` }}
          >
            <User className="w-5 h-5" style={{ color: themeColor }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-none">{chatName}</h3>
            <div className="text-[10px] text-zinc-500 font-mono mt-1 uppercase tracking-wider">Secure Channel</div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-500 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-zinc-950"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-10">
            <MessageSquare className="w-16 h-16 mb-2" />
            <p className="text-xs font-mono uppercase tracking-[0.2em] font-black">No Logs Found</p>
          </div>
        ) : (
          messages.map((m, i) => {
            const isMe = m.senderId === auth.currentUser?.uid;
            return (
              <div 
                key={m.id || i} 
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[85%] shadow-sm ${
                  isMe 
                    ? `text-zinc-950 rounded-tr-none font-bold bg-gradient-to-br ${themeGradient}` 
                    : 'bg-zinc-900 text-zinc-100 rounded-tl-none border border-white/5'
                }`}>
                  {m.text}
                </div>
                <span className="text-[9px] font-mono text-zinc-600 mt-1 uppercase font-bold px-1">
                  {m.timestamp?.toDate ? m.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Encrypting...'}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 bg-zinc-900/30 border-t border-white/5 backdrop-blur-md">
        <div className="flex gap-2">
          <input 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-zinc-950 border border-white/5 rounded-2xl px-5 py-3 text-sm text-white placeholder:text-zinc-700 outline-none focus:border-white/20 transition-all font-medium"
          />
          <button 
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="disabled:opacity-20 disabled:grayscale p-3 rounded-2xl transition-all shadow-lg active:scale-90 text-zinc-950 flex items-center justify-center"
            style={{ 
              background: `linear-gradient(to bottom right, ${themeColor}, ${themeColor}dd)`,
              boxShadow: newMessage.trim() ? `0 4px 15px ${themeColor}40` : 'none'
            }}
          >
            <Send className="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
