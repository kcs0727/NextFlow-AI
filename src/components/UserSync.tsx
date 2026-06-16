'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useUserStore } from '@/store/userStore';

export default function UserSync() {
  const { user, isLoaded } = useUser();
  const { getuser } = useUserStore();

  useEffect(() => {
    if (isLoaded && user) {
      getuser();
    }
  }, [user, isLoaded]);

  return null;
}
