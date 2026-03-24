import { getAllWithSections } from '$lib/content';
import { SITE_URL } from '$lib/config';

export const prerender = true;

export function GET() {
	const urls = [
		SITE_URL + '/',
		SITE_URL + '/art',
		SITE_URL + '/pandeiro',
		...getAllWithSections().map((p) => `${SITE_URL}/${p.section}/${p.slug}`)
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map((url) => `<url><loc>${url}</loc></url>`).join('\n  ')}
</urlset>`;

	return new Response(xml, {
		headers: { 'Content-Type': 'application/xml; charset=utf-8' }
	});
}
