"use client";

// components/NavBar.js
import Hamburger from "@/components/Hamburger";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { useSession } from "@/hooks/useSession";


export default function NavBar() {

  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, role } = useSession();

  const metadata = (user?.user_metadata ?? {}) as Record<string, string | undefined>;
  const displayName =
    metadata.full_name ??
    [metadata.first_name, metadata.last_name].filter(Boolean).join(" ").trim() ??
    user?.email ??
    "Guest";

  // Update the state based on the window width
  const handleResize = () => {
    setIsSmallScreen(window.innerWidth <= 790); // Set threshold for small screens (768px)
  };

  useEffect(() => {
    // Set initial value
    handleResize();

    // Add resize event listener
    window.addEventListener("resize", handleResize);

    // Clean up the event listener on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickAway = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    window.addEventListener("click", handleClickAway);
    return () => window.removeEventListener("click", handleClickAway);
  }, []);

  useEffect(() => {
    setDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
  
    if (pathname !== "/") {
      router.push(`/#${id}`); // Navigate to the homepage and append hash
    } else {
      const section = document.getElementById(id);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  };
  
  const shouldUseScrollBackground =
    isScrolled && (pathname === "/" || pathname === "/faq" || pathname === "/sponsors");

  return (
    <>
      {isSmallScreen ? (
        <Hamburger />
      ) : (
        <nav
          className={`text-white fixed top-0 left-0 w-full z-10 transition-colors duration-200 ${
            shouldUseScrollBackground
              ? "bg-background/40 backdrop-blur-md"
              : "bg-transparent"
          }`}
        >
          <div className="relative max-w-7xl mx-auto py-3 flex items-center justify-between sm:px-6">
            <div className="text-xl font-bold">
                <Link href="/" className="flex items-center">
                  {pathname != '/schedule' ? (
                    <img src="/MichiganLogoWhite.png" alt="MIG 2025 Quant Conference" className="h-16 w-auto" />
                  ) : (
                    <img src="/finalLogoRedone.png" alt="MIG 2025 Quant Conference" className="h-16 w-auto" />
                  )}
                </Link>
            </div>

            {/* Nav Links */}
            <div
              ref={navRef}
              className="space-x-4 font-sans font-bold tracking-widest"
            >
                {/* <Link className={`hover:bg-gray-700 px-3 py-2 rounded-md ${pathname === '/schedule' ? 'text-gray-900' : ''}`} href='/schedule'>Schedule</Link>  */}
                <Link className={`hover:bg-gray-700 px-3 py-2 rounded-md ${pathname === '/schedule' ? 'text-gray-900' : ''}`} href='/sponsors'>Sponsors</Link>
                <Link className={`hover:bg-gray-700 px-3 py-2 rounded-md ${pathname === '/schedule' ? 'text-gray-900' : ''}`} href='/faq'>FAQ</Link>
                {/* <Link
                  className={`bg-yellow-700 hover:bg-gray-700 px-3 py-2 rounded-md ${pathname === "/schedule" ? "text-gray-900" : ""}`}
                  href={user ? "/dashboard" : "/signup"}
                >
                  {user ? "Dashboard" : "Signup"}
                </Link>
                {user ? (
                  <div className="relative inline-flex">
                    <button
                      type="button"
                      className="flex items-center gap-1 hover:bg-gray-700 px-3 py-2 rounded-md"
                      onClick={() => setDropdownOpen((prev) => !prev)}
                    >
                      <span>Account</span>
                      <span className="text-xs">{dropdownOpen ? "▲" : "▼"}</span>
                    </button>
                    {dropdownOpen && (
                      <div className="absolute right-0 top-full z-30 mt-2 w-64 rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm shadow-2xl backdrop-blur-sm">
                        <p className="text-xs uppercase tracking-[0.3em] text-white/60">Logged in as</p>
                        <p className="mt-2 font-semibold text-white">{displayName}</p>
                        <p className="text-xs text-white/60">{user.email}</p>
                        <div className="mt-4 border-t border-white/10 pt-3">
                          <button
                            type="button"
                            className="w-full rounded-2xl bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900 transition hover:bg-white/80"
                            onClick={async () => {
                              await supabase.auth.signOut();
                              setDropdownOpen(false);
                              router.push("/");
                            }}
                          >
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    className="hover:bg-gray-700 px-3 py-2 rounded-md"
                    href="/signin"
                  >
                    Sign in
                  </Link>
                )} */}
            </div>
          </div>
        </nav>
      
      )}
    </>
  );
}
