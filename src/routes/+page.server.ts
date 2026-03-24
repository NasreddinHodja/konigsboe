import { getAllWithSections } from '$lib/content';

export function load() {
	return { posts: getAllWithSections().slice(0, 5) };
}
