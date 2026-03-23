import { getPostBySlug, getAllPosts } from '$lib/content';
import { error } from '@sveltejs/kit';

export function load({ params }: { params: { slug: string } }) {
	const post = getPostBySlug(params.slug);
	if (!post) throw error(404, 'Post not found');

	const all = getAllPosts();
	const idx = all.findIndex((p) => p.slug === params.slug);
	const prev = all[idx + 1] ?? null;
	const next = all[idx - 1] ?? null;

	return { post, prev, next };
}
