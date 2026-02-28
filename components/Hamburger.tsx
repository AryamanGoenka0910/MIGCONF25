"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";
import { beginSignOut } from "@/lib/signout";


const HamburgerDrawer = () => {
  const router = useRouter();
  const { user } = useSession();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const pathname = usePathname();

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    closeMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  const shouldUseScrollBackground =
    isScrolled && (pathname === "/" || pathname === "/faq" || pathname === "/sponsors");

  return (
    <>
      <nav
        className={`fixed top-0 left-0 z-40 w-full text-white transition-colors duration-200 ${
          shouldUseScrollBackground ? "bg-background/40 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <button
            type="button"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            onClick={toggleMenu}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 backdrop-blur-md"
          >
            <span className="sr-only">{isOpen ? "Close menu" : "Open menu"}</span>
            <div className="relative h-5 w-6">
              <span
                className={`absolute left-0 top-0 block h-0.5 w-6 bg-white transition-transform duration-200 ${
                  isOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-2 block h-0.5 w-6 bg-white transition-opacity duration-200 ${
                  isOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 top-4 block h-0.5 w-6 bg-white transition-transform duration-200 ${
                  isOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </div>
          </button>

          <Link href="/" className="flex items-center" onClick={closeMenu}>
            {pathname !== "/schedule" ? (
              <img
                src="/MichiganLogoWhite.png"
                alt="MIG 2025 Quant Conference"
                className="h-14 w-auto"
              />
            ) : (
              <img
                src="/finalLogoRedone.png"
                alt="MIG 2025 Quant Conference"
                className="h-14 w-auto"
              />
            )}
          </Link>
        </div>
      </nav>

      {/* Overlay + drawer */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isOpen}
      >
        <button
          type="button"
          aria-label="Close menu overlay"
          className="absolute inset-0 bg-black/50"
          onClick={closeMenu}
        />

        <aside
          className={`absolute right-0 top-0 h-full w-[50vw] max-w-sm transform border-l border-white/10 bg-background/95 shadow-2xl backdrop-blur-md transition-transform duration-200 ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div className="flex items-center justify-between px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              Menu
            </p>
          </div>

          <div className="px-3 pb-6">
            <div className="space-y-1">
              <Link
                href="/"
                onClick={closeMenu}
                className="block rounded-xl px-4 py-3 text-sm font-semibold tracking-widest text-white/90 hover:bg-white/10"
              >
                Home
              </Link>
              {/* <Link
                href="/schedule"
                onClick={closeMenu}
                className="block rounded-xl px-4 py-3 text-sm font-semibold tracking-widest text-white/90 hover:bg-white/10"
              >
                Schedule
              </Link>
              <Link
                href="/announcements"
                onClick={closeMenu}
                className="block rounded-xl px-4 py-3 text-sm font-semibold tracking-widest text-white/90 hover:bg-white/10"
              >
                Announcements
              </Link> */}
              <Link
                href="/sponsors"
                onClick={closeMenu}
                className="block rounded-xl px-4 py-3 text-sm font-semibold tracking-widest text-white/90 hover:bg-white/10"
              >
                Sponsors
              </Link>
              <Link
                href="/faq"
                onClick={closeMenu}
                className="block rounded-xl px-4 py-3 text-sm font-semibold tracking-widest text-white/90 hover:bg-white/10"
              >
                FAQ
              </Link>
            </div>

            {user ? 
            (
              <div className="mt-4 border-t border-white/10 pt-4 space-y-4 flex flex-col items-center justify-center w-full">
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => router.push("/dashboard")}
                >
                  Dashboard
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => beginSignOut(router, { returnTo: "/" })}
                >
                  Sign Out
                </Button>
              </div>

            ) : (
              <div className="mt-4 border-t border-white/10 pt-4 space-y-4 flex flex-col items-center justify-center w-full">
                <Button
                  variant="default"
                  onClick={() => router.push("/signup")}
                  className="w-full"
                >
                  Sign Up
                </Button>
              
                <Button
                  variant="outline"
                  onClick={() => router.push("/signin")}
                  className="w-full"
                >
                  Sign In
                </Button>
              </div>
            )}
                
            
          </div>
        </aside>
      </div>
    </>
  );
};

export default HamburgerDrawer;
