// pages/schedule.js
import Timeline from "@/components/Timeline";

export default function SchedulePage() {
  return (
    <>
      <title> Quant Conference Schedule</title>
      <meta name="description" content="Schedule for the Quant Conference Day" />
      <main className="bg-gray-100 min-h-screen">
        <div className="py-10">
          <Timeline />
        </div>
      </main>
    </>
  );
}
