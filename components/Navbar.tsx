"use client";

// components/NavBar.js
import Hamburger from "@/components/Hamburger";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";


export default function NavBar() {

  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const pathname = usePathname();

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
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  
  return (
    <>
      {isSmallScreen ? (
        <Hamburger />
      ) : (
        <nav className="bg-transparent text-white fixed top-0 left-0 w-full z-10">
          <div className="max-w-7xl mx-auto px-2 py-3 flex items-center justify-between">
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
            <div className="space-x-4 font-mono font-semibold">
                <Link className={`hover:bg-gray-700 px-3 py-2 rounded-md ${pathname === '/schedule' ? 'text-gray-900' : ''}`} href='/schedule'>Schedule</Link> 
                <Link className={`hover:bg-gray-700 px-3 py-2 rounded-md ${pathname === '/schedule' ? 'text-gray-900' : ''}`} href='/announcements'>Announcements</Link>
                {/* <a className="hover:bg-gray-700 px-3 py-2 rounded-md" href='/sponsors'>Sponsors</a> */}
                <Link className={`bg-yellow-700 hover:bg-gray-700 px-3 py-2 rounded-md ${pathname === '/schedule' ? 'text-gray-900' : ''}`} href='https://forms.gle/WTdQdMp8XVGQuywM9'>Signup</Link>
            </div>
          </div>
        </nav>
      
      )}
    </>
  );
}
