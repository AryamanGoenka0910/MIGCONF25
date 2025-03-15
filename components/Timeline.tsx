import React from 'react';

interface TimelineData {
  time: string;
  title: string;
  description: string;
}

const timelineData: TimelineData[] = [
  {
    time: "11:30 AM",
    title: "Registration & Breakfast",
    description: "Check in, grab a coffee, and network with other participants.",
  },
  {
    time: "12:00 PM",
    title: "MIG Welcome",
    description: "A warm welcome from the MIG Team and a brief overview of the conference.",
  },
  {
    time: "12:20 PM",
    title: "Trading Game 1",
    description: "Our First Quant Game for the Day",
  },
  {
    time: "01:20 PM",
    title: "IMC Panel",
    description: "IMC Panel Discussion with engineers and trades from the firm",
  },
  {
    time: "02:10 PM",
    title: "Panel Discussion",
    description: "Enjoy lunch and network with peers and our partner firms",
  },
  {
    time: "02:45 PM",
    title: "Old Mission Panel",
    description: "Old Mission Panel Discussion with engineers and trades from the firm",
  },
  {
    time: "03:35 PM",
    title: "MIG Workshop",
    description: "Hands-on workshop led by MIG members",
  },
  {
    time: "04:00 PM",
    title: "Trading Game 2",
    description: "Our last trading game of the day",
  },
  {
    time: "05:00 PM",
    title: "Closing Remarks and Awards",
    description: "A final thank you to all attendees and prizes for our winners",
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
