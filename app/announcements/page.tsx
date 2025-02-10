// app/announcements/page.tsx/

import Announcement from "@/components/Annoucement";

export default function AnnouncementPage() {
  return (
    <>
      <title> Quant Conference Schedule</title>
      <meta name="description" content="Schedule for the Quant Conference Day" />
      <main className="bg-gray-100 min-h-screen">
        <div className="py-10">
            <h1 className="text-3xl font-bold text-center mt-12 text-gray-800">Announcements</h1>
            <Announcement />
        </div>
      </main>
    </>
  );
}
