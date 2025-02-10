import React from 'react';

interface TimelineData {
  time: string;
  title: string;
  description: string;
}

const timelineData: TimelineData[] = [
  {
    time: "09:00 AM",
    title: "Registration & Breakfast",
    description: "Check in, grab a coffee, and network with other participants.",
  },
  {
    time: "10:00 AM",
    title: "Keynote Speech",
    description: "Keynote presentation by our leading quant expert.",
  },
  {
    time: "11:00 AM",
    title: "Session 1: Market Analytics",
    description: "Deep dive into the latest quantitative market analysis techniques.",
  },
  {
    time: "12:00 PM",
    title: "Lunch Break",
    description: "Enjoy a buffet lunch and network with peers.",
  },
  {
    time: "01:30 PM",
    title: "Panel Discussion",
    description: "Experts discuss emerging trends in quantitative finance.",
  },
  {
    time: "03:00 PM",
    title: "Workshop",
    description: "Hands-on session with industry-standard tools and techniques.",
  },
  {
    time: "04:30 PM",
    title: "Closing Remarks",
    description: "Summary of the day and announcements for future events.",
  },
];

interface TimelineItemProps {
  time: string;
  title: string;
  description: string;
  isLast: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ time, title, description, isLast }) => (
  // Wrap the entire timeline item in a "group" for hover targeting
  <div className="flex items-start mb-8 group">
    {/* Timeline Marker */}
    <div className="flex flex-col items-center mr-4">
      <div className="w-4 h-4 bg-blue-500 rounded-full z-10" />
      {!isLast && (
        <div
          className="flex-1 w-px bg-gray-300"
          style={{ minHeight: '3rem' }}
        />
      )}
    </div>

    <div className="bg-white shadow rounded-lg p-4 w-full transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
      <div className="text-sm text-gray-500">{time}</div>
      <h3 className="font-semibold text-lg text-gray-800 mt-1">{title}</h3>
      <p className="text-gray-600 mt-1">{description}</p>
    </div>
  </div>
);

const Timeline: React.FC = () => {
  return (
    <>
    <h1 className='text-3xl font-bold text-center mt-12 text-gray-800'>
        Conference Schedule
    </h1>
    <div className="flex-col justify-center items-center container mx-auto px-4 py-8">
      {timelineData.map((item, index) => (
        <TimelineItem
          key={index}
          time={item.time}
          title={item.title}
          description={item.description}
          isLast={index === timelineData.length - 1}
        />
      ))}
    </div>
    </>
  );
};

export default Timeline;
