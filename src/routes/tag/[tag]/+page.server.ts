import { getAllWithSections } from '$lib/content';

export function entries() {
	const tags = [...new Set(getAllWithSections().flatMap((p) => p.metadata.tags ?? []))].sort();
	return tags.map((tag) => ({ tag }));
}

export function load({ params }: { params: { tag: string } }) {
	const posts = getAllWithSections().filter((p) => p.metadata.tags?.includes(params.tag));
	return { tag: params.tag, posts };
}
