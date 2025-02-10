import React from 'react';

// Sample announcements data; replace with your dynamic data when needed.
const announcements = [
  {
    id: '1',
    title: 'Welcome to the Conference!',
    date: 'Feb 10, 2025',
    content:
      'We are excited to welcome you to our annual quant conference. Get ready for a day full of insightful talks and networking opportunities.',
  },
  {
    id: '2',
    title: 'Schedule Released',
    date: 'Feb 09, 2025',
    content:
      'The full schedule is now available. Check out all the sessions and plan your day accordingly!',
  },
  {
    id: '3',
    title: 'Networking Evening',
    date: 'Feb 08, 2025',
    content:
      'Join us after the sessions for an informal networking event. A great opportunity to connect with industry experts and peers.',
  },
];

export default function Announcement() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            <h2 className="text-2xl font-semibold mb-2">{announcement.title}</h2>
            <p className="text-gray-500 text-sm mb-4">{announcement.date}</p>
            <p className="text-gray-700">{announcement.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
