"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Client-side component to handle password recovery tokens
 * Supabase sends recovery tokens as hash fragments (#access_token=...)
 * This component detects them and redirects to the reset password page
 */
export function RecoveryTokenHandler() {
  const router = useRouter();

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    // Check if there's a hash fragment
    const hash = window.location.hash;
    if (!hash) return;

    // Parse hash parameters
    const hashParams = new URLSearchParams(hash.substring(1));
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token');

    // If this is a recovery token, redirect to reset password page
    if (type === 'recovery' && accessToken) {
      // Preserve the hash fragment for the reset password page
      router.push(`/reset-password${hash}`);
    }
  }, [router]);

  // This component doesn't render anything
  return null;
}
