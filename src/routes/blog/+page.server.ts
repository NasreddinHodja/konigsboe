import { blog } from '$lib/content';

export function load() {
	return { posts: blog.getAll() };
}
