"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiMail, FiEdit } from 'react-icons/fi';
import Navbar from '@/app/components/Navbar';

interface User {
  id: string;
  username: string;
  email: string;
  profile_picture: string;
}

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('token');
          router.push('/login');
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
        router.push('/login');
      }
    };

    fetchUserData();
  }, [router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <p>Could not load profile. Please try to <a href="/login" className="text-blue-400 hover:underline">log in</a> again.</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pt-32 pb-12 px-4">
        <div className="max-w-4xl mx-auto p-8 bg-white/5 rounded-2xl shadow-lg backdrop-blur-lg border border-white/10 mt-52">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative group">
              <Image
                src={user.profile_picture}
                alt={user.username}
                width={150}
                height={150}
                className="rounded-full border-4 border-blue-500 object-cover"
              />
              <button className="absolute bottom-1 right-1 bg-blue-600 p-3 rounded-full hover:bg-blue-700 transition-colors duration-300 opacity-0 group-hover:opacity-100 cursor-not-allowed" title="Edit profile picture (coming soon)">
                <FiEdit size={20} />
              </button>
            </div>
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-4xl font-bold">{user.username}</h1>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-gray-400">
                <FiMail />
                <span>{user.email}</span>
              </div>
              <div className="mt-8">
                <h2 className="text-2xl font-semibold border-b-2 border-blue-500 pb-2 inline-block">About Me</h2>
                <p className="mt-4 text-gray-300 italic">
                  Profile description not available yet. This section will be editable in the future.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
