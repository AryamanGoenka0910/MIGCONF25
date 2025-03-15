import React from 'react';

// Sample announcements data; replace with your dynamic data when needed.
const announcements = [
  {
    id: '1',
    title: 'Welcome to the MIG Conference!',
    date: 'Feb 20th, 2025',
    content:
    <span>
    Our <a 
      className="underline" 
      href="https://forms.gle/WTdQdMp8XVGQuywM9" 
      target="_blank" 
      rel="noopener noreferrer"
    >
      <strong>application</strong>
    </a> is now live for the 2025 conference.  
  
    Please contact <a 
      className="underline" 
      href="mailto:mig.board@umich.edu" 
      target="_blank" 
      rel="noopener noreferrer"
    >
      <strong>mig.board@umich.edu</strong>
    </a> if you have any questions.
  </span>
  },
  {
    id: '2',
    title: 'Schedule Released',
    date: 'Marcg 15, 2025',
    content:
      'The full schedule is now available and the event will be held in Tauber Colloqium @ The Ross School of Business. We look forward to seeing you in person!',
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
            <h2 className="text-gray-700 text-2xl font-semibold mb-2">{announcement.title}</h2>
            <p className="text-gray-500 text-sm mb-4">{announcement.date}</p>
            <p className="text-gray-700">{announcement.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
