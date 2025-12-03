'use client';


import { AuthProvider, useAuth } from './AuthProvider';
import { LoginPanel } from './components/LoginPanel';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatWindow } from './components/ChatWindow';
import { PinGate } from './components/PinGate';
import { useChatData } from './hooks/useChatData';
import { useE2EE } from './hooks/useE2EE';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const ChatExperience = () => {
  const { user, token, loading } = useAuth();
  const currentUserId = user?.id?.toString() ?? null;
  const encryption = useE2EE(token ?? null);
  const chatState = useChatData({
    token: token ?? null,
    currentUserId,
    currentUsername: user?.username,
    encryptionReady: encryption.ready,
    encryptionVersion: encryption.version,
  });

  const [skeletonVisible, setSkeletonVisible] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(1);

  useEffect(() => {
    try {
      if (sessionStorage.getItem('chat-skeleton') === '1') {
        sessionStorage.removeItem('chat-skeleton');
        setSkeletonVisible(true);
      }
      if (sessionStorage.getItem('chat-fade') === '1') {
        sessionStorage.removeItem('chat-fade');
        setOverlayVisible(true);
        requestAnimationFrame(() => setTimeout(() => setOverlayOpacity(0), 30));
        const t = setTimeout(() => setOverlayVisible(false), 950);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!skeletonVisible) return;
    const loading = !!(chatState.chatsLoading || chatState.activeMeta?.loading);
    if (!loading) {
      const t = setTimeout(() => setSkeletonVisible(false), 200);
      return () => clearTimeout(t);
    }
  }, [skeletonVisible, chatState.chatsLoading, chatState.activeMeta]);

  useEffect(() => {
    const textTargets = new Set(['features', 'app', 'team']);
    const attrSelectors = [
      '[data-overview-subsection]',
      '[data-subsection]',
      '.overview-subsection',
      '.overview .subitems',
      '.overview .submenu',
    ];

    const changed = new Map<HTMLElement, string | null>();

    const hideEl = (el: HTMLElement) => {
      if (!changed.has(el)) changed.set(el, el.style.display || null);
      el.style.display = 'none';
    };

    attrSelectors.forEach((sel) => {
      document.querySelectorAll<HTMLElement>(sel).forEach(hideEl);
    });

    document.querySelectorAll<HTMLElement>('nav a, nav button, nav [role="link"], nav li').forEach((el) => {
      const text = (el.textContent || '').trim().toLowerCase();
      if (textTargets.has(text)) hideEl(el);
    });

    return () => {
      changed.forEach((orig, el) => {
        if (orig === null) el.style.removeProperty('display');
        else el.style.display = orig;
      });
      changed.clear();
    };
  }, []);

  if (loading) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center text-white/70">
       
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

  if (!encryption.ready) {
    return (
      <main className="px-4 pb-14 pt-28 text-white relative min-h-screen">
        <PinGate
          unlocking={encryption.unlocking}
          error={encryption.error}
          onUnlock={encryption.unlock}
          onReset={encryption.reset}
        />
      </main>
    );
  }

  const selectedChat =
    chatState.chats.find((chat) => chat.id === chatState.selectedChatId) || null;

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#0b1228] via-[#0a0d1d] to-[#0b162f] px-3 pb-4 pt-14 text-white">
      {overlayVisible && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 60,
            background: 'rgba(0,0,0,0.6)',
            opacity: overlayOpacity,
            transition: 'opacity 900ms ease',
            pointerEvents: 'none',
          }}
        />
      )}

      <div className="flex h-[calc(100vh-96px)] w-full gap-4">
        {skeletonVisible ? (
          <div className="flex w-full gap-4">
            <div className="w-[400px] rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="h-10 w-40 rounded bg-white/10 animate-pulse" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-2xl bg-white/6 animate-pulse" />
                ))}
              </div>
            </div>
            <div className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="h-10 w-48 rounded bg-white/10 animate-pulse" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className={`h-10 rounded-2xl bg-white/6 animate-pulse ${i % 2 ? 'w-3/4' : 'w-1/2'}`} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex h-full w-[400px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-black/30 shadow-[0_20px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl">
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
            </div>
            <div className="flex h-full flex-1 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl">
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
                canViewEncrypted={encryption.ready}
                authToken={token}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default function ChatPage() {
  const router = useRouter();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const link = target.closest('a, button, [role="link"], [data-nav]') as HTMLElement | null;
      if (!link) return;

      const text = (link.textContent || '').trim().toLowerCase();
      const isOverview =
        link.getAttribute('data-nav') === 'overview' ||
        link.hasAttribute('data-overview') ||
        text === 'overview';

      if (isOverview) {
        e.preventDefault();
        router.push('/');
      }
    };

    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [router]);

  return (
    <AuthProvider>
      <ChatExperience />
    </AuthProvider>
  );
}
