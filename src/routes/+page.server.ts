import { blog, pandeiro, art } from '$lib/content';

export function load() {
	const tag = (section: string) => (p: ReturnType<typeof blog.getAll>[number]) =>
		({ ...p, section });

	const all = [
		...blog.getAll().map(tag('blog')),
		...pandeiro.getAll().map(tag('pandeiro')),
		...art.getAll().map(tag('art'))
	]
		.sort((a, b) => b.metadata.date.localeCompare(a.metadata.date))
		.slice(0, 5);

	return { posts: all };
}
