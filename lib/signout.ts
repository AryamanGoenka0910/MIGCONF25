export type RouterLike = {
  push: (href: string) => void;
};

export type SignOutOptions = {
  /**
   * Where to send the user after their local session is cleared.
   * Defaults to "/signin".
   */
  returnTo?: string;
};

export function getSignOutHref(options: SignOutOptions = {}) {
  const returnTo = options.returnTo ?? "/signin";
  const params = new URLSearchParams();
  if (returnTo) params.set("returnTo", returnTo);
  const qs = params.toString();
  return qs ? `/signout?${qs}` : "/signout";
}

/**
 * Navigate immediately to the sign-out screen.
 * That screen performs the actual local Supabase sign-out.
 */
export function beginSignOut(router: RouterLike, options: SignOutOptions = {}) {
  router.push(getSignOutHref(options));
}

/**
 * Clears the current session locally.
 * Falls back to manually wiping stored tokens if the API call fails (e.g. 403).
 */
export async function localSignOut() {
  const { supabase } = await import("@/lib/supabase-client");
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    // API call failed — manually clear every Supabase auth key from storage.
    if (typeof window !== "undefined") {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("sb-"))
        .forEach((k) => localStorage.removeItem(k));
    }
  }
}

