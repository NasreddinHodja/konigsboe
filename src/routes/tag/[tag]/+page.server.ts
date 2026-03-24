import { art, pandeiro } from '$lib/content';

export function entries() {
	const allPosts = [...art.getAll(), ...pandeiro.getAll()];
	const tags = [...new Set(allPosts.flatMap((p) => p.metadata.tags ?? []))].sort();
	return tags.map((tag) => ({ tag }));
}

export function load({ params }: { params: { tag: string } }) {
	const allPosts = [
		...art.getAll().map((p) => ({ ...p, section: 'art' as const })),
		...pandeiro.getAll().map((p) => ({ ...p, section: 'pandeiro' as const }))
	];
	const posts = allPosts.filter((p) => p.metadata.tags?.includes(params.tag));
	return { tag: params.tag, posts };
}
