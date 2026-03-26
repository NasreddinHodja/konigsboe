import { blog } from '$lib/content';
import { error } from '@sveltejs/kit';

export function entries() {
	return blog.getAll().map((p) => ({ slug: p.slug }));
}

export function load({ params }: { params: { slug: string } }) {
	const post = blog.getBySlug(params.slug);
	if (!post) throw error(404, 'Post not found');

	const all = blog.getAll();
	const idx = all.findIndex((p) => p.slug === params.slug);
	const prev = all[idx + 1] ?? null;
	const next = all[idx - 1] ?? null;

	return { post, prev, next };
}
