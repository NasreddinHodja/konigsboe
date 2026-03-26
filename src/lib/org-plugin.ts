import { unified } from 'unified';
import uniorgParse from 'uniorg-parse';
import extractKeywords from 'uniorg-extract-keywords';
import uniorg2rehype from 'uniorg-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeShiki from '@shikijs/rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import type { Plugin as VitePlugin } from 'vite';
import type { Plugin as UnifiedPlugin } from 'unified';
import type { Segment } from './types';

// ─── Rehype plugin: fix [[fig:N]] links ──────────────────────────────────────
// uniorg2rehype renders [[fig:1]] as <a href="fig:1">fig:1</a>.
// This rewrites the href to #fig-N and defaults the text to [N].
function rehypeFigLinks() {
	return (tree: Parameters<typeof visit>[0]) => {
		visit(tree, 'element', (node: any) => {
			if (node.tagName !== 'a') return;
			const href = node.properties?.href as string;
			if (!href?.startsWith('fig:')) return;
			const num = href.slice(4);
			node.properties.href = `#fig-${num}`;
			if (node.children.length === 1 && node.children[0].type === 'text' && node.children[0].value === href) {
				node.children[0].value = `[${num}]`;
			}
		});
	};
}

// ─── Extensible attribute keys ────────────────────────────────────────────────
// Add keys here to make them available as preceding-sibling org keywords.
// e.g. adding 'ALT' lets you write #+alt: some text before #+figure: ...
const CUSTOM_SIBLING_KEYS = new Set(['ID', 'AUTHOR']);

// ─── Element keyword keys we handle ──────────────────────────────────────────
const MEDIA_KEYS = new Set(['FIGURE', 'IMAGE', 'VIDEO']);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function extractCaption(affiliated: Record<string, unknown> | undefined): string | undefined {
	const raw = affiliated?.CAPTION;
	if (!Array.isArray(raw) || !raw.length) return undefined;
	// CAPTION is an array of inline-node arrays; collect text values
	return (raw[0] as Array<{ value?: string }>)
		.map((n) => n.value ?? '')
		.join('')
		.trim() || undefined;
}

function placeholder(n: number): string {
	return `#+begin_export html\n<!--SEG:${n}-->\n#+end_export`;
}

function exportBlock(html: string): object {
	return { type: 'export-block', backend: 'html', value: html };
}

// ─── Unified plugin: mark alphabetic ordered lists ───────────────────────────
// uniorg2rehype renders a) b) c) lists as <ol> without type, so browsers show
// 1, 2, 3. This sets data.hProperties.type on the plain-list node — uniorg2rehype
// reads hProperties and merges them onto the output element.
function uniorgAlphaLists(): UnifiedPlugin {
	return () => (tree: any) => {
		visit(tree, 'plain-list', (node: any) => {
			if (node.listType !== 'ordered') return;
			const bullet = (node.children?.[0]?.bullet as string) ?? '';
			if (/^[a-z]\)/.test(bullet)) {
				node.data = { ...node.data, hProperties: { ...node.data?.hProperties, type: 'a' } };
			} else if (/^[A-Z]\)/.test(bullet)) {
				node.data = { ...node.data, hProperties: { ...node.data?.hProperties, type: 'A' } };
			}
		});
	};
}

// ─── Unified plugin ───────────────────────────────────────────────────────────
function uniorgSegments(segMap: Map<number, Segment>, source: string): UnifiedPlugin {
	let segCounter = 0;

	function processChildren(children: Array<Record<string, unknown>>): Array<unknown> {
		const out: Array<unknown> = [];
		let pending: Record<string, string> = {};

		for (const node of children) {
			// Collect custom sibling keywords into pending
			if (node.type === 'keyword' && CUSTOM_SIBLING_KEYS.has(node.key as string)) {
				pending[node.key as string] = node.value as string;
				continue;
			}

			// ── Media: #+figure / #+image / #+video ──────────────────────────
			if (node.type === 'keyword' && MEDIA_KEYS.has(node.key as string)) {
				const src = node.value as string;
				const caption = extractCaption(node.affiliated as Record<string, unknown>);
				const rawId = pending.ID;
				const figNum = rawId ? parseInt(rawId) : undefined;
				const id = rawId ? `fig-${rawId}` : undefined;
				const isVideo = node.key === 'VIDEO';

				const n = segCounter++;
				if (isVideo) {
					segMap.set(n, { type: 'video', src, caption, figNum, id });
				} else {
					segMap.set(n, { type: 'figure', src, caption, figNum, id });
				}
				out.push(exportBlock(`<!--SEG:${n}-->`));
				pending = {};
				continue;
			}

			// ── Equation: #+begin_equation ───────────────────────────────────
			if (node.type === 'special-block' && node.blockType === 'equation') {
				const latex = source
					.slice(node.contentsBegin as number, node.contentsEnd as number)
					.trim();
				const rawId = pending.ID;
				const figNum = rawId ? parseInt(rawId) : undefined;
				const id = rawId ? `fig-${rawId}` : undefined;
				const caption = extractCaption(node.affiliated as Record<string, unknown>);

				const n = segCounter++;
				segMap.set(n, { type: 'equation', latex, caption, figNum, id });
				out.push(exportBlock(`<!--SEG:${n}-->`));
				pending = {};
				continue;
			}

			// ── Attributed quote ─────────────────────────────────────────────
			if (node.type === 'quote-block' && pending.AUTHOR) {
				const author = pending.AUTHOR;
				// Walk the AST to preserve inline markup (bold, italic, etc.)
				function extractInlineText(nodes: Array<Record<string, unknown>>): string {
					return nodes.map((n) => {
						if (n.type === 'text') return (n.value as string) ?? '';
						if (n.type === 'bold') return `<strong>${extractInlineText((n.children as Array<Record<string, unknown>>) ?? [])}</strong>`;
						if (n.type === 'italic') return `<em>${extractInlineText((n.children as Array<Record<string, unknown>>) ?? [])}</em>`;
						if (n.type === 'underline') return `<u>${extractInlineText((n.children as Array<Record<string, unknown>>) ?? [])}</u>`;
						if (n.type === 'strike-through') return `<s>${extractInlineText((n.children as Array<Record<string, unknown>>) ?? [])}</s>`;
						if (n.type === 'code' || n.type === 'verbatim') return `<code>${(n.value as string) ?? ''}</code>`;
						if (Array.isArray(n.children)) return extractInlineText(n.children as Array<Record<string, unknown>>);
						return (n.value as string) ?? '';
					}).join('');
				}
				const innerHtml = (node.children as Array<Record<string, unknown>>)
					.map((p) => `<p>${extractInlineText((p.children as Array<Record<string, unknown>>) ?? [])}</p>`)
					.join('');
				const html = `<blockquote>${innerHtml}<cite style="display:block;text-align:right">— ${author}</cite></blockquote>`;
				out.push(exportBlock(html));
				pending = {};
				continue;
			}

			// ── Recurse into container nodes ─────────────────────────────────
			if (Array.isArray(node.children)) {
				out.push({ ...node, children: processChildren(node.children as Array<Record<string, unknown>>) });
			} else {
				out.push(node);
			}
			pending = {};
		}

		return out;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return () => (tree: any) => {
		tree.children = processChildren(tree.children);
	};
}

// ─── Vite plugin ─────────────────────────────────────────────────────────────
export function orgPlugin(): VitePlugin {
	return {
		name: 'vite-plugin-org',
		async transform(code, id) {
			if (!id.endsWith('.org')) return;

			const segMap = new Map<number, Segment>();

			const result = await unified()
				.use(uniorgParse)
				.use(extractKeywords)
				.use(uniorgSegments(segMap, code))
				.use(uniorgAlphaLists())
				.use(uniorg2rehype)
				.use(rehypeFigLinks)
				.use(rehypeKatex)
				.use(rehypeSlug)
				.use(rehypeAutolinkHeadings, { behavior: 'wrap' })
				.use(rehypeShiki, {
					theme: 'vesper',
					defaultColor: false,
					colorReplacements: { '#101010': 'transparent' }
				})
				.use(rehypeStringify, { allowDangerousHtml: true })
				.process(code);

			const html = String(result);
			const metadata = result.data as Record<string, unknown>;

			// Split on SEG markers to build segments array
			const segMarkerRe = /<!--SEG:(\d+)-->/;
			const parts = html.split(segMarkerRe);
			const segments: Segment[] = [];
			for (let i = 0; i < parts.length; i++) {
				if (i % 2 === 0) {
					if (parts[i].trim()) segments.push({ type: 'html', content: parts[i] });
				} else {
					const seg = segMap.get(parseInt(parts[i]));
					if (seg) segments.push(seg);
				}
			}

			return {
				code: `
					export const html = ${JSON.stringify(html)};
					export const segments = ${JSON.stringify(segments)};
					export const metadata = ${JSON.stringify(metadata)};
					export default { html: ${JSON.stringify(html)}, segments: ${JSON.stringify(segments)}, metadata: ${JSON.stringify(metadata)} };
				`,
				map: null
			};
		},

		handleHotUpdate({ file, server }) {
			if (file.endsWith('.org')) {
				server.ws.send({ type: 'full-reload' });
			}
		}
	};
}
