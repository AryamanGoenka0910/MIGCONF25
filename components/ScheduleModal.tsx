"use client";

import React from "react";

interface TimelineData {
  time: string;
  title: string;
  description: string;
}

const timelineData: TimelineData[] = [
  { time: "12:30 AM", title: "Check In & Brunch", description: "Check in, grab a coffee, and network with other participants and our sponors." },
  { time: "01:00 PM", title: "MIG Welcome", description: "A warm welcome from the MIG Team and a brief overview of the conference." },
  { time: "01:20 PM", title: "Trading Game 1", description: "Our First Quant Game for the Day" },
  { time: "02:00 PM", title: "Trading Game 2", description: "Our Second Quant Game for the Day" },
  { time: "02:50 PM", title: "Sponsor Panel", description: "Discussion with engineers and traders from our sponsor firms" },
  { time: "03:30 PM", title: "MIG Algo Dev Overview", description: "Overview of MIG's Algo Development Program" },
  { time: "04:10 PM", title: "Trading Game 3", description: "Our Third Quant Game for the Day" },
  { time: "05:00 PM", title: "Dinner", description: "Enjoy dinner and network with peers and our partner firms" },
  { time: "05:40 PM", title: "Alumni Panel", description: "Discussion with alumni accross the industry" },
  { time: "06:30 PM", title: "Trading Game 4", description: "Our Last Trading Game for the Day" },
  { time: "07:00 PM", title: "Closing Remarks and Awards", description: "A final thank you to all attendees and prizes for our winners" },
];

export default function ScheduleModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-8"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Conference Schedule"
    >
      <div
        className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-3xl border border-border bg-card/90 p-8 backdrop-blur shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">March 20th, 2026</p>
            <h2 className="mt-1 text-xl font-semibold">Conference Schedule</h2>
          </div>
          <button
            type="button"
            className="rounded-md px-2 py-1 text-muted-foreground hover:text-foreground"
            onClick={onClose}
            aria-label="Close schedule"
          >
            ×
          </button>
        </div>

        <div className="space-y-0">
          {timelineData.map((item, index) => (
            <div key={index} className="flex items-start gap-4">
              {/* Line + dot */}
              <div className="flex flex-col items-center">
                <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                {index < timelineData.length - 1 && (
                  <div className="w-px flex-1 bg-border" style={{ minHeight: "2.5rem" }} />
                )}
              </div>

              {/* Content */}
              <div className="pb-6 min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{item.time}</p>
                <p className="mt-0.5 text-sm font-semibold">{item.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
