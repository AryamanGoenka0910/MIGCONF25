// app/announcements/page.tsx
import React from 'react';
import { Client } from '@notionhq/client';

export const revalidate = 60; // Revalidate every 60 seconds

// Define your Announcement type
interface Announcement {
  id: string;
  title: string;
  date: string;
}

export default async function AnnouncementsPage() {
  // 1. Initialize Notion client
  const notion = new Client({ auth: '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' });
  const databaseId = '17e88b3df836809e90a1f834413dd6c0';

  if (!databaseId) {
    throw new Error('Missing Notion announcements database ID in environment variables.');
  }

  // 2. Query the Notion database
const response = await notion.databases.query({
    database_id: databaseId,
    // Add any filters or sorts here if needed
    // filter: { ... },
    // sorts: [ ... ],
  });
  console.log(response);


  // 3. Map the Notion results to your custom Announcement interface
//   const announcements: Announcement[] = response.results.map((page: any) => {
//     const titleProperty = page.properties.Name;
//     const dateProperty = page.properties.Date;

//     return {
//       id: page.id,
//       title: titleProperty?.title?.[0]?.plain_text || '(Untitled)',
//       date: dateProperty?.date?.start || '',
//     };
//   });
  const announcements: Announcement[] = [];

  // 4. Render the page
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Announcements</h1>

      {announcements.length === 0 ? (
        <p>No announcements available at the moment.</p>
      ) : (
        <ul>
          {announcements.map(announcement => (
            <li key={announcement.id} className="mb-4 p-4 border rounded shadow-sm">
              <h2 className="text-xl font-semibold">{announcement.title}</h2>
              <p className="text-sm text-gray-500">{announcement.date}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
