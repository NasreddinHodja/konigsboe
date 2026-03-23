import { art } from '$lib/content';

export function load() {
	return { posts: art.getAll() };
}
