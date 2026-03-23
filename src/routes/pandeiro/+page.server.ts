import { pandeiro } from '$lib/content';

export function load() {
	return { posts: pandeiro.getAll() };
}
