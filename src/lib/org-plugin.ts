import { unified } from "unified";
import uniorgParse from "uniorg-parse";
import extractKeywords from "uniorg-extract-keywords";
import uniorg2rehype from "uniorg-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeShiki from "@shikijs/rehype";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import type { Plugin as VitePlugin } from "vite";
import type { Plugin as UnifiedPlugin } from "unified";
import type { Segment } from "./types";
import { createRequire } from "module";
const tex2svg: (source: string) => Promise<string> =
	createRequire(import.meta.url)("node-tikzjax").default;

// Rehype plugin: trim trailing whitespace from the last text node in <p>
// uniorg includes trailing newlines in paragraph text nodes; without trimming
// the newline renders as a visible space before prose's closing-quote ::after.
function rehypeTrimParaTrailingSpace() {
	return (tree: Parameters<typeof visit>[0]) => {
		visit(tree, "element", (node: any) => {
			if (node.tagName !== "p") return;
			const children = node.children as any[];
			if (!children?.length) return;
			const last = children[children.length - 1];
			if (last?.type === "text" && typeof last.value === "string") {
				last.value = last.value.trimEnd();
			}
		});
	};
}

// Rehype plugin: fix [[fig:N]] links
// uniorg2rehype renders [[fig:1]] as <a href="fig:1">fig:1</a>.
// This rewrites the href to #fig-N and defaults the text to [N].
function rehypeFigLinks() {
	return (tree: Parameters<typeof visit>[0]) => {
		visit(tree, "element", (node: any) => {
			if (node.tagName !== "a") return;
			const href = node.properties?.href as string;
			if (!href?.startsWith("fig:")) return;
			const num = href.slice(4);
			node.properties.href = `#fig-${num}`;
			if (
				node.children.length === 1 &&
				node.children[0].type === "text" &&
				node.children[0].value === href
			) {
				node.children[0].value = `[${num}]`;
			}
		});
	};
}

// Extensible attribute keys
// Add keys here to make them available as preceding-sibling org keywords.
// e.g. adding 'ALT' lets you write #+alt: some text before #+figure: ...
const CUSTOM_SIBLING_KEYS = new Set(["ID", "AUTHOR"]);

// Element keyword keys we handle
const MEDIA_KEYS = new Set(["FIGURE", "IMAGE", "VIDEO"]);

// Helpers
function extractCaption(
	affiliated: Record<string, unknown> | undefined,
): string | undefined {
	const raw = affiliated?.CAPTION;
	if (!Array.isArray(raw) || !raw.length) return undefined;
	// CAPTION is an array of inline-node arrays; collect text values
	return (raw[0] as Array<{ value?: string }>)
		.map((n) => n.value ?? "")
		.join("")
		.trim() || undefined;
}

function placeholder(n: number): string {
	return `#+begin_export html\n<!--SEG:${n}-->\n#+end_export`;
}

function exportBlock(html: string): object {
	return { type: "export-block", backend: "html", value: html };
}

// Unified plugin: use CUSTOM_ID as heading id
// rehypeSlug generates ids from heading text, but org :CUSTOM_ID: properties
// are used in internal [[#id]] links. The CUSTOM_ID lives in a property-drawer
// sibling of the headline inside the section. Set hProperties.id on the
// headline so rehypeSlug (which skips headings that already have an id) leaves
// it alone.
function uniorgCustomId(): UnifiedPlugin {
	return () => (tree: any) => {
		visit(tree, "section", (node: any) => {
			const headline = node.children?.find((c: any) =>
				c.type === "headline"
			);
			if (!headline) return;
			const drawer = node.children?.find((c: any) =>
				c.type === "property-drawer"
			);
			if (!drawer) return;
			const prop = drawer.children?.find((c: any) =>
				c.type === "node-property" && c.key === "CUSTOM_ID"
			);
			if (!prop?.value) return;
			headline.data = {
				...headline.data,
				hProperties: { ...headline.data?.hProperties, id: prop.value },
			};
		});
	};
}

// Unified plugin: handle [@N] list counter-set syntax
// uniorg-parse already parses [@N] and stores it in list-item.counter (stripped
// from content). We just need to propagate it as the <ol start> attribute.
function uniorgListCounters(): UnifiedPlugin {
	return () => (tree: any) => {
		visit(tree, "plain-list", (node: any) => {
			const firstItem = node.children?.find((c: any) => c.type === "list-item");
			if (!firstItem?.counter) return;
			const n = parseInt(firstItem.counter);
			if (isNaN(n)) return;
			node.data = {
				...node.data,
				hProperties: { ...node.data?.hProperties, start: n },
			};
		});
	};
}

// Unified plugin: map all org ordered-list bullet styles to HTML
// uniorg2rehype renders all ordered lists as plain <ol>, losing type and suffix.
// Bullet styles: 1. 1) a. a) A. A)
// HTML type attribute handles a/A/1; `)` suffix needs a `paren` class + CSS.
function uniorgAlphaLists(): UnifiedPlugin {
	return () => (tree: any) => {
		visit(tree, "plain-list", (node: any) => {
			if (node.listType !== "ordered") return;
			const bullet = (node.children?.[0]?.bullet as string) ?? "";
			let type: string | undefined;
			let cls: string | undefined;
			if (/^[a-z]\)/.test(bullet))      { type = "a"; cls = "list-lower-alpha-paren"; }
			else if (/^[a-z]\./.test(bullet)) { type = "a"; }
			else if (/^[A-Z]\)/.test(bullet)) { type = "A"; cls = "list-upper-alpha-paren"; }
			else if (/^[A-Z]\./.test(bullet)) { type = "A"; }
			else if (/^\d+\)/.test(bullet))   { cls = "list-decimal-paren"; }
			if (type || cls) {
				node.data = {
					...node.data,
					hProperties: {
						...node.data?.hProperties,
						...(type && { type }),
						...(cls && { class: cls }),
					},
				};
			}
		});
	};
}

type TikzSource = { source: string; caption?: string; figNum?: number; id?: string };

// Unified plugin
function uniorgSegments(
	segMap: Map<number, Segment>,
	source: string,
	tikzSourceMap: Map<number, TikzSource>,
): UnifiedPlugin {
	let segCounter = 0;

	function processChildren(
		children: Array<Record<string, unknown>>,
	): Array<unknown> {
		const out: Array<unknown> = [];
		let pending: Record<string, string> = {};

		for (const node of children) {
			// Collect custom sibling keywords into pending
			if (
				node.type === "keyword" &&
				CUSTOM_SIBLING_KEYS.has(node.key as string)
			) {
				pending[node.key as string] = node.value as string;
				continue;
			}

			// #+HTML: raw html passthrough
			if (node.type === "keyword" && node.key === "HTML") {
				out.push(exportBlock(node.value as string));
				continue;
			}

			// Media: #+figure / #+image / #+video
			if (node.type === "keyword" && MEDIA_KEYS.has(node.key as string)) {
				const src = node.value as string;
				const caption = extractCaption(
					node.affiliated as Record<string, unknown>,
				);
				const rawId = pending.ID;
				const figNum = rawId ? parseInt(rawId) : undefined;
				const id = rawId ? `fig-${rawId}` : undefined;
				const isVideo = node.key === "VIDEO";

				const n = segCounter++;
				if (isVideo) {
					segMap.set(n, { type: "video", src, caption, figNum, id });
				} else {
					segMap.set(n, { type: "figure", src, caption, figNum, id });
				}
				out.push(exportBlock(`<!--SEG:${n}-->`));
				pending = {};
				continue;
			}

			// Equation: \begin{equation}...\end{equation}
			if (node.type === "latex-environment") {
				const latex = (node.value as string).trim();
				const rawId = pending.ID;
				const figNum = rawId ? parseInt(rawId) : undefined;
				const id = rawId ? `fig-${rawId}` : undefined;
				const caption = extractCaption(
					node.affiliated as Record<string, unknown>,
				);

				if (caption || rawId) {
					const n = segCounter++;
					segMap.set(n, { type: "equation", latex, caption, figNum, id });
					out.push(exportBlock(`<!--SEG:${n}-->`));
					pending = {};
					continue;
				}
			}

			// TikZ: #+begin_export tikz
			if (
				node.type === "export-block" &&
				(node.backend as string)?.toLowerCase() === "tikz"
			) {
				const tikzSource = (node.value as string).trim();
				const rawId = pending.ID;
				const figNum = rawId ? parseInt(rawId) : undefined;
				const id = rawId ? `fig-${rawId}` : undefined;
				const caption = extractCaption(
					node.affiliated as Record<string, unknown>,
				);

				const n = segCounter++;
				tikzSourceMap.set(n, { source: tikzSource, caption, figNum, id });
				out.push(exportBlock(`<!--SEG:${n}-->`));
				pending = {};
				continue;
			}

			// Attributed quote
			if (node.type === "quote-block" && pending.AUTHOR) {
				const author = pending.AUTHOR;
				// Walk the AST to preserve inline markup (bold, italic, etc.)
				function extractInlineText(
					nodes: Array<Record<string, unknown>>,
				): string {
					return nodes.map((n) => {
						if (n.type === "text") return (n.value as string) ?? "";
						if (n.type === "bold") {
							return `<strong>${
								extractInlineText(
									(n.children as Array<
										Record<string, unknown>
									>) ?? [],
								)
							}</strong>`;
						}
						if (n.type === "italic") {
							return `<em>${
								extractInlineText(
									(n.children as Array<
										Record<string, unknown>
									>) ?? [],
								)
							}</em>`;
						}
						if (n.type === "underline") {
							return `<u>${
								extractInlineText(
									(n.children as Array<
										Record<string, unknown>
									>) ?? [],
								)
							}</u>`;
						}
						if (n.type === "strike-through") {
							return `<s>${
								extractInlineText(
									(n.children as Array<
										Record<string, unknown>
									>) ?? [],
								)
							}</s>`;
						}
						if (n.type === "code" || n.type === "verbatim") {
							return `<code>${(n.value as string) ?? ""}</code>`;
						}
						if (Array.isArray(n.children)) {
							return extractInlineText(
								n.children as Array<Record<string, unknown>>,
							);
						}
						return (n.value as string) ?? "";
					}).join("");
				}
				const innerHtml =
					(node.children as Array<Record<string, unknown>>)
						.map((p) =>
							`<p>${
								extractInlineText(
									(p.children as Array<
										Record<string, unknown>
									>) ?? [],
								).trimEnd()
							}</p>`
						)
						.join("");
				const html =
					`<blockquote>${innerHtml}<cite style="display:block;text-align:right">— ${author}</cite></blockquote>`;
				out.push(exportBlock(html));
				pending = {};
				continue;
			}

			// Observation: #+begin_export observation
			if (
				node.type === "export-block" &&
				(node.backend as string)?.toLowerCase() === "observation"
			) {
				const content = (node.value as string).trim();
				const n = segCounter++;
				segMap.set(n, { type: "observation", content });
				out.push(exportBlock(`<!--SEG:${n}-->`));
				pending = {};
				continue;
			}

			// Recurse into container nodes
			if (Array.isArray(node.children)) {
				out.push({
					...node,
					children: processChildren(
						node.children as Array<Record<string, unknown>>,
					),
				});
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

// Vite plugin
export function orgPlugin(): VitePlugin {
	return {
		name: "vite-plugin-org",
		async transform(code, id) {
			if (!id.endsWith(".org")) return;

			const segMap = new Map<number, Segment>();
			const tikzSourceMap = new Map<number, TikzSource>();

			const result = await unified()
				.use(uniorgParse)
				.use(extractKeywords)
				.use(uniorgSegments(segMap, code, tikzSourceMap))
				.use(uniorgListCounters())
				.use(uniorgAlphaLists())
				.use(uniorgCustomId())
				.use(uniorg2rehype)
				.use(rehypeFigLinks)
				.use(rehypeTrimParaTrailingSpace)
				.use(rehypeKatex)
				.use(rehypeSlug)
				.use(rehypeAutolinkHeadings, { behavior: "wrap" })
				.use(rehypeShiki, {
					theme: "vesper",
					defaultColor: false,
					colorReplacements: { "#101010": "transparent" },
				})
				.use(rehypeStringify, { allowDangerousHtml: true })
				.process(code);

			const html = String(result);
			const metadata = result.data as Record<string, unknown>;

			// Resolve TikZ sources to SVGs (sequential — node-tikzjax is not concurrent-safe)
			for (const [n, data] of tikzSourceMap) {
				const wrapped = `\\usetikzlibrary{calc}\n\\begin{document}\n${data.source}\n\\end{document}`;
				const svg = await tex2svg(wrapped);
				segMap.set(n, { type: "tikz", svg, caption: data.caption, figNum: data.figNum, id: data.id });
			}

			// Split on SEG markers to build segments array
			const segMarkerRe = /<!--SEG:(\d+)-->/;
			const parts = html.split(segMarkerRe);
			const segments: Segment[] = [];
			for (let i = 0; i < parts.length; i++) {
				if (i % 2 === 0) {
					if (parts[i].trim()) {
						segments.push({ type: "html", content: parts[i] });
					}
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
					export default { html: ${JSON.stringify(html)}, segments: ${
					JSON.stringify(segments)
				}, metadata: ${JSON.stringify(metadata)} };
				`,
				map: null,
			};
		},

		handleHotUpdate({ file, server }) {
			if (file.endsWith(".org")) {
				server.ws.send({ type: "full-reload" });
			}
		},
	};
}
