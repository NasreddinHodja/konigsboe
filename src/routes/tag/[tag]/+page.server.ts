import { getAllPosts, getAllTags } from '$lib/content';

export function entries() {
	return getAllTags().map((tag) => ({ tag }));
}

export function load({ params }: { params: { tag: string } }) {
	const posts = getAllPosts().filter((p) => p.metadata.tags?.includes(params.tag));
	return { tag: params.tag, posts };
}
