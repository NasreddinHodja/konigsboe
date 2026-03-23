import { getAllPosts, getAllTags } from '$lib/content';

export const prerender = true;

const SITE_URL = 'https://konigsboe.blog';

export function GET() {
	const posts = getAllPosts();
	const tags = getAllTags();

	const urls = [
		SITE_URL + '/',
		SITE_URL + '/blog',
		...posts.map((p) => `${SITE_URL}/blog/${p.slug}`),
		...tags.map((t) => `${SITE_URL}/tag/${t}`)
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map((url) => `<url><loc>${url}</loc></url>`).join('\n  ')}
</urlset>`;

	return new Response(xml, {
		headers: { 'Content-Type': 'application/xml; charset=utf-8' }
	});
}
