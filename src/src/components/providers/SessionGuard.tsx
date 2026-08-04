"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef } from "react";
import { App } from "antd";

/**
 * SessionGuard: Polls session every 60s.
 * If the session becomes null (expired), forces logout and shows a message.
 * This prevents users from losing their work by working on a page with an expired session.
 */
export default function SessionGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const wasAuthenticated = useRef(false);
  const { message } = App.useApp();

  useEffect(() => {
    if (status === "authenticated") {
      wasAuthenticated.current = true;
    }

    // If user was authenticated but session is now gone => expired
    if (status === "unauthenticated" && wasAuthenticated.current) {
      message.warning("Session Anda telah habis. Silakan login kembali.");
      setTimeout(async () => {
        await signOut({ redirect: false });
        window.location.href = window.location.origin + "/login";
      }, 1500);
    }
  }, [status]);

  // Periodically refetch session to detect expiry
  useEffect(() => {
    if (status !== "authenticated") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const data = await res.json();
        // If session response has no user, session is expired
        if (!data || !data.user) {
          message.warning("Session Anda telah habis. Silakan login kembali.");
          setTimeout(async () => {
            await signOut({ redirect: false });
            window.location.href = window.location.origin + "/login";
          }, 1500);
        }
      } catch {
        // Network error - ignore
      }
    }, 60000); // Check every 60 seconds

    return () => clearInterval(interval);
  }, [status]);

  return <>{children}</>;
}
