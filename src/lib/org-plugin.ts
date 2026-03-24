import { unified } from 'unified';
import uniorgParse from 'uniorg-parse';
import extractKeywords from 'uniorg-extract-keywords';
import uniorg2rehype from 'uniorg-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeShiki from '@shikijs/rehype';
import rehypeStringify from 'rehype-stringify';
import type { Plugin } from 'vite';

export function orgPlugin(): Plugin {
	return {
		name: 'vite-plugin-org',
		async transform(code, id) {
			if (!id.endsWith('.org')) return;

			const result = await unified()
				.use(uniorgParse)
				.use(extractKeywords)
				.use(uniorg2rehype)
				.use(rehypeSlug)
				.use(rehypeAutolinkHeadings, { behavior: 'wrap' })
				.use(rehypeShiki, {
					theme: 'vesper',
					defaultColor: false,
					colorReplacements: { '#101010': 'transparent' }
				})
				.use(rehypeStringify, { allowDangerousHtml: true })
				.process(code);

			const metadata = result.data as Record<string, unknown>;

			return {
				code: `
                export const html = ${JSON.stringify(String(result))};
                export const metadata = ${JSON.stringify(metadata)};
                export default { html: ${JSON.stringify(
									String(result)
								)}, metadata: ${JSON.stringify(metadata)} };
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
