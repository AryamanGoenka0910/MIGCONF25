// app/announcements/page.tsx/

import Announcement from "@/components/Annoucement";

export default function AnnouncementPage() {
  return (
    <>
      <title> Quant Conference Schedule</title>
      <meta name="description" content="Schedule for the Quant Conference Day" />
      <main className="bg-gray-100 min-h-screen">
      <div className="relative w-full flex flex-col items-center justify-center h-max p-32">
        <div className="absolute inset-0 w-full h-full bg-[url('/IMG_6198.jpg')] bg-cover bg-center blur-[2px] "></div>
        <div className="absolute inset-0 bg-black bg-opacity-50 h-full"></div>
        <h1 className="relative z-10 text-4xl font-montserrat font-bold text-center text-white">
          Announcements
        </h1>
      </div>
          <Announcement />
      </main>
    </>
  );
}
