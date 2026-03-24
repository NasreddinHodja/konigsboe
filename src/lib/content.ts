const blogModules = import.meta.glob('/src/content/blog/*.org', { eager: true });
const pandeiroModules = import.meta.glob('/src/content/pandeiro/*.org', { eager: true });
const artModules = import.meta.glob('/src/content/art/*.org', { eager: true });

export interface PostMetadata {
	title: string;
	date: string;
	description: string;
	tags: string[];
	cover?: string;
	draft?: boolean;
}

export interface Post {
	slug: string;
	html: string;
	metadata: PostMetadata;
}

export type Section = 'art' | 'pandeiro' | 'blog';

export interface PostWithSection extends Post {
	section: Section;
}

function makeSection(modules: Record<string, unknown>) {
	function getAll(): Post[] {
		return Object.entries(modules)
			.map(([path, mod]) => {
				const slug = path.split('/').pop()!.replace('.org', '');
				const m = mod as { html: string; metadata: PostMetadata & { tags: string | string[] } };
				const tags =
					typeof m.metadata.tags === 'string'
						? m.metadata.tags.split(/\s+/).filter(Boolean)
						: (m.metadata.tags ?? []);
				return { slug, html: m.html, metadata: { ...m.metadata, tags } };
			})
			.filter((p) => !p.metadata.draft || import.meta.env.DEV)
			.sort((a, b) => b.metadata.date.localeCompare(a.metadata.date));
	}

	function getBySlug(slug: string): Post | undefined {
		return getAll().find((p) => p.slug === slug);
	}

	function getTags(): string[] {
		const tags = getAll().flatMap((p) => p.metadata.tags ?? []);
		return [...new Set(tags)].sort();
	}

	return { getAll, getBySlug, getTags };
}

export const blog = makeSection(blogModules);
export const pandeiro = makeSection(pandeiroModules);
export const art = makeSection(artModules);

export function getAllWithSections(): PostWithSection[] {
	return [
		...blog.getAll().map((p) => ({ ...p, section: 'blog' as const })),
		...pandeiro.getAll().map((p) => ({ ...p, section: 'pandeiro' as const })),
		...art.getAll().map((p) => ({ ...p, section: 'art' as const }))
	].sort((a, b) => b.metadata.date.localeCompare(a.metadata.date));
}
