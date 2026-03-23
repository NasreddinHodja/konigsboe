import { getAllPosts } from '$lib/content';

export function load() {
	return { posts: getAllPosts() };
}
