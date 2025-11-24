'use client';

import Navbar from '@/app/components/Navbar';
import { AuthProvider, useAuth } from './AuthProvider';
import { LoginPanel } from './components/LoginPanel';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatWindow } from './components/ChatWindow';
import { EncryptionUnlocker } from './components/EncryptionUnlocker';
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

  const selectedChat =
    chatState.chats.find((chat) => chat.id === chatState.selectedChatId) || null;

  return (
    <main className="px-4 pb-14 pt-28 text-white relative min-h-screen">
      {/* optional dark fade overlay (from navbar click) */}
      {overlayVisible && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 60,
            background: 'rgba(0,0,0,0.95)',
            opacity: overlayOpacity,
            transition: 'opacity 900ms ease',
            pointerEvents: 'none',
          }}
        />
      )}

      <EncryptionUnlocker
        ready={encryption.ready}
        unlocking={encryption.unlocking}
        error={chatState.encryptionError || encryption.error}
        onUnlock={encryption.unlock}
        onReset={encryption.reset}
      />

      {/* set explicit height to match original visual area and let children use h-full */}
      <div className="mx-auto flex min-h-[72vh] h-[calc(100vh-220px)] max-h-[calc(100vh-140px)] max-w-6xl flex-col overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-3xl relative lg:flex-row">
        {/* skeleton frame: shown until chat data finish loading when arriving from navbar */}
        {skeletonVisible ? (
          <>
            {/* left: sidebar skeleton — fill full height */}
            <div className="w-72 p-6 border-r border-white/5 flex flex-col gap-4 h-full">
              <div className="h-8 w-40 bg-white/10 rounded mb-2 animate-pulse" />
              <div className="flex-1 overflow-auto space-y-3">
                <div className="h-12 bg-white/6 rounded animate-pulse" />
                <div className="h-12 bg-white/6 rounded animate-pulse" />
                <div className="h-12 bg-white/6 rounded animate-pulse" />
                <div className="h-12 bg-white/6 rounded animate-pulse" />
                <div className="h-12 bg-white/6 rounded animate-pulse" />
                <div className="h-12 bg-white/6 rounded animate-pulse" />
              </div>
            </div>
            {/* right: chat window skeleton — occupy full height and allow messages area to grow */}
            <div className="flex-1 p-6 flex flex-col h-full">
              <div className="h-10 w-1/3 bg-white/10 rounded mb-4 animate-pulse" />
              <div className="flex-1 overflow-auto space-y-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-10 bg-white/6 rounded ${i % 2 ? 'w-2/3' : 'w-1/3'} animate-pulse`}
                  />
                ))}
              </div>
              <div className="mt-4 h-12 bg-white/8 rounded animate-pulse" />
            </div>
          </>
        ) : (
          <>
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
              canViewEncrypted={encryption.ready}
            />
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
