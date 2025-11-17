'use client';

import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { AuthProvider, useAuth } from './AuthProvider';
import { LoginPanel } from './components/LoginPanel';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatWindow } from './components/ChatWindow';
import { useChatData } from './hooks/useChatData';

const ChatExperience = () => {
  const { user, token, loading } = useAuth();
  const currentUserId = user?.id?.toString() ?? null;
  const chatState = useChatData({
    token: token ?? null,
    currentUserId,
    currentUsername: user?.username,
  });

  if (loading) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center text-white/70">
        <p>Bejelentkezés ellenőrzése...</p>
      </section>
    );
  }

  if (!token || !user || !currentUserId) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center px-6">
        <LoginPanel />
      </section>
    );
  }

  const selectedChat =
    chatState.chats.find((chat) => chat.id === chatState.selectedChatId) || null;

  return (
    <main className="px-6 pb-20 pt-40 text-white">
      <div className="mx-auto flex min-h-[70vh] max-w-6xl rounded-[32px] border border-white/10 bg-white/5 shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-3xl">
        <ChatSidebar
          user={user}
          chats={chatState.chats}
          loading={chatState.chatsLoading}
          error={chatState.chatsError}
          selectedChatId={chatState.selectedChatId}
          onSelectChat={chatState.setSelectedChatId}
          onRefresh={chatState.refreshChats}
          unreadCounts={chatState.unreadCounts}
          userStatuses={chatState.userStatuses}
          typingForChat={chatState.typingForChat}
          messagesByChat={chatState.messagesByChat}
          currentUserId={currentUserId}
        />
        <ChatWindow
          chat={selectedChat}
          messages={chatState.messages}
          typingUsers={chatState.typingUsers}
          hasMore={chatState.activeMeta.hasMore}
          isLoading={chatState.activeMeta.loading}
          onLoadOlder={() => chatState.loadOlderMessages()}
          onSend={(message) => chatState.sendMessage(message)}
          wsConnected={chatState.wsConnected}
          currentUserId={currentUserId}
        />
      </div>
    </main>
  );
};

export default function ChatPage() {
  return (
    <AuthProvider>
      <Navbar />
      <ChatExperience />
      <Footer />
    </AuthProvider>
  );
}
