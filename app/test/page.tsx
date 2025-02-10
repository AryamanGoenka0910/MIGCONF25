const { Client } = require('@notionhq/client');

export default async function AnnouncementsPage() {
    const notion = new Client({ auth: process.env.NOTION_API_KEY });

   async () => { const response = await notion.databases.query({
            database_id: '19688b3df83680abad5de078aac6c65a',
        // Add any filters or sorts here if needed
        // filter: { ... },
        // sorts: [ ... ],
        });
    };
    

        return (
            <div>
             <h1>Test</h1>
            </div>
        );
}
