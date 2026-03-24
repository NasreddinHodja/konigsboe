import { getAllWithSections } from '$lib/content';
import { SITE_URL, SITE_TITLE, SITE_DESC } from '$lib/config';

export const prerender = true;

export function GET() {
	const posts = getAllWithSections();

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_TITLE}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESC}</description>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    ${posts
			.map(
				(p) => `<item>
      <title><![CDATA[${p.metadata.title}]]></title>
      <link>${SITE_URL}/${p.section}/${p.slug}</link>
      <guid>${SITE_URL}/${p.section}/${p.slug}</guid>
      <description><![CDATA[${p.metadata.description ?? ''}]]></description>
      <pubDate>${new Date(p.metadata.date + 'T00:00:00').toUTCString()}</pubDate>
    </item>`
			)
			.join('\n    ')}
  </channel>
</rss>`;

	return new Response(xml, {
		headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' }
	});
}
