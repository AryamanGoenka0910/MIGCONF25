"use client";

import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-client";

export type SessionState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  role: "attendee" | "sponsor" | "admin" | string;
};

export function useSession() {
  const [state, setState] = useState<SessionState>({
    session: null,
    user: null,
    loading: true,
    role: "attendee",
  });

  useEffect(() => {
    let mounted = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setState((prev) => ({
          ...prev,
          session: data.session,
          user: data.session?.user ?? null,
          loading: false,
          role: data.session?.user?.app_metadata?.role ?? data.session?.user?.user_metadata?.role ?? "attendee",
        }));
      })
      .catch(() => {
        if (!mounted) return;
        setState((prev) => ({ ...prev, loading: false }));
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (!mounted) return;
      setState({
        session,
        user: session?.user ?? null,
        loading: false,
        role: session?.user?.app_metadata?.role ?? session?.user?.user_metadata?.role ?? "attendee",
      });
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return state;
}

