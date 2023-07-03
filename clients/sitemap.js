


function generateSiteMap(partnersPaths, projectsPaths, guidesPaths, resourcesPaths) {
    return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>https://studios.decentraland.org</loc>
       <lastmod>2023-06-01</lastmod>
     </url>
     <url>
       <loc>https://studios.decentraland.org/jobs</loc>
       <lastmod>2023-06-01</lastmod>
     </url>
     <url>
       <loc>https://studios.decentraland.org/studios</loc>
       <lastmod>${partnersPaths[0][1] || partnersPaths[0][2]}</lastmod>
     </url>
     <url>
       <loc>https://studios.decentraland.org/projects</loc>
       <lastmod>${projectsPaths[0][1] || projectsPaths[0][2]}</lastmod>
     </url>
     <url>
       <loc>https://studios.decentraland.org/resources</loc>
       <lastmod>${resourcesPaths[0][1] || resourcesPaths[0][2]}</lastmod>
     </url>
     ${[ ...partnersPaths, ...projectsPaths, ...guidesPaths]
            .map(([path, date_updated, date_created]) => {
                return `
       <url>
           <loc>https://studios.decentraland.org/${path}</loc>
           <lastmod>${date_updated || date_created}</lastmod>
       </url>
     `;
            })
            .join('')}
   </urlset>
 `;
}

async function writeSitemap() {

    console.log('Generating public/sitemap.xml')

    const fs = require("fs")

    const DB_URL = `${process.env.NEXT_PUBLIC_PARTNERS_DATA_URL}`

    const partnersPaths = (await (await fetch(`${DB_URL}/items/profile?fields=slug,date_updated,date_created&limit=-1&sort=-date_created,-date_updated`)).json()).data.map((item) => [`profile/${item.slug}`, item.date_updated, item.date_created])

    const projectsPaths = (await (await fetch(`${DB_URL}/items/projects?fields=id,date_updated,date_created&limit=-1&sort=-date_created,-date_updated`)).json()).data.map((item) => [`project/${item.id}`, item.date_updated, item.date_created])
    
    const guidesPaths = (await (await fetch(`${DB_URL}/items/landings?fields=slug,date_updated,date_created&limit=-1&sort=-date_created,-date_updated`)).json()).data.map((item) => [`p/${item.slug}`, item.date_updated, item.date_created])
    
    const resourcesPaths = (await (await fetch(`${DB_URL}/items/resources?fields=id,date_updated,date_created&limit=1&sort=-date_created,-date_updated`)).json()).data.map((item) => [item.id, item.date_updated, item.date_created])
    
    const sitemap = generateSiteMap(partnersPaths, projectsPaths, guidesPaths, resourcesPaths);

    fs.writeFileSync('public/sitemap.xml', sitemap)
}

writeSitemap()