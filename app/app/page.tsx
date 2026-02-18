'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StorageService } from '../services/StorageService';

export default function AppRootPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await StorageService.getAuthToken();
      if (!token) {
        router.push('/login');
        return;
      }
      router.push('/app/chats');
    };
    
    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
}
