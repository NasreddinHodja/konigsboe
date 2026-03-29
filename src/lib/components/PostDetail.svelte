<script lang="ts">
	import type { Post } from '$lib/content';
	import { formatDate, youtubeId, extractToc } from '$lib/utils';
	import { ArrowLeft, ArrowRight, ChevronRight, X } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { pushState } from '$app/navigation';
	import Image from '$lib/components/org/Image.svelte';
	import Video from '$lib/components/org/Video.svelte';
	import Equation from '$lib/components/org/Equation.svelte';
	import Tikz from '$lib/components/org/Tikz.svelte';
	import Observation from '$lib/components/org/Observation.svelte';

	interface Props {
		post: Post;
		prev: Post | null;
		next: Post | null;
		section: string;
		embedVideo?: boolean;
	}

	let { post, prev, next, section, embedVideo = false }: Props = $props();

	const sectionLabel = $derived(section.charAt(0).toUpperCase() + section.slice(1));
	const toc = $derived(extractToc(post.html));

	let peek = $state<{ html: string; id: string } | null>(null);

	function closePeek() {
		peek = null;
	}

	function getSectionHtml(el: Element): string {
		if (!/^H[1-6]$/.test(el.tagName)) return el.outerHTML;
		const level = parseInt(el.tagName[1]);
		let html = el.outerHTML;
		let next = el.nextElementSibling;
		while (next) {
			if (/^H[1-6]$/.test(next.tagName) && parseInt(next.tagName[1]) <= level) break;
			html += next.outerHTML;
			next = next.nextElementSibling;
		}
		return html;
	}

	function goToSection() {
		if (!peek) return;
		const id = peek.id;
		const target = document.getElementById(id);
		closePeek();
		if (!target) return;
		pushState(`#${id}`, {});
		const PADDING = 80;
		const rect = target.getBoundingClientRect();
		if (rect.top >= PADDING && rect.bottom <= window.innerHeight - PADDING) {
			flashElement(target);
		} else {
			const scrollAmount =
				rect.top < PADDING ? rect.top - PADDING : rect.bottom - window.innerHeight + PADDING;
			window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
			window.addEventListener('scrollend', () => flashElement(target), { once: true });
		}
	}

	function flashElement(el: Element) {
		el.classList.remove('target-flash');
		void (el as HTMLElement).offsetWidth;
		el.classList.add('target-flash');
		el.addEventListener('animationend', () => el.classList.remove('target-flash'), { once: true });
	}

	onMount(() => {
		document.querySelectorAll('pre').forEach((pre) => {
			const btn = document.createElement('button');
			btn.textContent = 'Copy';
			btn.className = 'copy-btn';
			btn.addEventListener('click', () => {
				navigator.clipboard.writeText(pre.querySelector('code')?.textContent ?? '');
				btn.textContent = 'Copied!';
				setTimeout(() => (btn.textContent = 'Copy'), 2000);
			});
			pre.style.position = 'relative';
			pre.appendChild(btn);
		});

		document.addEventListener('click', (e) => {
			const link = (e.target as Element).closest('a[href^="#"]');
			if (!link) return;
			const href = link.getAttribute('href')!;
			const id = href.slice(1);
			const target = document.getElementById(id);
			if (!target) return;

			e.preventDefault();

			const PADDING = 80;
			const rect = target.getBoundingClientRect();
			const fullyInView = rect.top >= PADDING && rect.bottom <= window.innerHeight - PADDING;
			const partiallyInView = rect.bottom > 0 && rect.top < window.innerHeight;

			if (fullyInView) {
				pushState(href, {});
				flashElement(target);
			} else if (partiallyInView) {
				pushState(href, {});
				const scrollAmount =
					rect.top < PADDING ? rect.top - PADDING : rect.bottom - window.innerHeight + PADDING;
				window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
				window.addEventListener('scrollend', () => flashElement(target), { once: true });
			} else {
				peek = { html: getSectionHtml(target), id };
			}
		}, { capture: true });
	});
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') closePeek();
	}}
/>

<div class="mx-auto max-w-3xl px-6 py-16">
	<nav class="mb-8 flex items-center gap-1.5 font-mono text-xs text-fg-muted">
		<a href="/" class="text-fg-muted underline-offset-2 hover:underline">Home</a>
		<ChevronRight class="h-3 w-3" />
		<a href="/{section}" class="text-fg-muted underline-offset-2 hover:underline">{sectionLabel}</a>
		<ChevronRight class="h-3 w-3" />
		<span class="truncate text-fg">{post.metadata.title}</span>
	</nav>

	<header class="mb-12 pb-8 {post.segments.length > 0 ? 'border-b border-border' : ''}">
		{#if post.metadata.cover}
			<div class="-mx-6 mb-8 overflow-hidden">
				{#if embedVideo}
					{@const ytId = youtubeId(post.metadata.cover)}
					{#if ytId}
						<div class="relative aspect-video w-full">
							<iframe
								src="https://www.youtube.com/embed/{ytId}"
								title={post.metadata.title}
								frameborder="0"
								allowfullscreen
								class="absolute inset-0 h-full w-full"
							></iframe>
						</div>
					{:else}
						<img
							src={post.metadata.cover}
							alt={post.metadata.title}
							class="aspect-video w-full object-cover"
						/>
					{/if}
				{:else}
					<img
						src={post.metadata.cover}
						alt={post.metadata.title}
						class="max-h-[80vh] w-full object-contain"
					/>
				{/if}
			</div>
		{/if}
		<div class="mb-4 flex flex-wrap items-center gap-2 text-xs text-fg-muted">
			<time class="font-mono">{formatDate(post.metadata.date)}</time>
			{#each post.metadata.tags as tag (tag)}
				<a
					href="/tag/{tag}"
					class="bg-accent-bg px-2 py-0.5 text-accent transition-opacity hover:opacity-80"
				>
					{tag}
				</a>
			{/each}
		</div>
		<h1 class="font-display text-4xl leading-tight font-bold break-words">
			{post.metadata.title}
		</h1>
		{#if post.metadata.description}
			<p class="mt-4 text-lg text-fg-muted">{post.metadata.description}</p>
		{/if}
	</header>

	{#if toc.length > 0}
		<nav class="mb-12 border border-border bg-accent-bg p-5 text-sm">
			<p class="mb-3 font-mono text-xs tracking-widest text-fg-muted uppercase">Contents</p>
			<ul class="space-y-1.5">
				{#each toc as item (item.id)}
					<li style="padding-left:{(item.level - 1) * 0.75}rem">
						<a href="#{item.id}" class="text-fg underline-offset-2 hover:underline">{item.text}</a>
					</li>
				{/each}
			</ul>
		</nav>
	{/if}

	<article class="prose max-w-none prose-stone dark:prose-invert prose-h1:text-4xl prose-h1:leading-tight prose-h1:mt-12 prose-h1:mb-3 prose-h2:mt-8 prose-h2:mb-2 prose-h3:mt-6 prose-h3:mb-1 prose-li:my-0.5" data-pagefind-body>
		{#each post.segments as seg}
			{#if seg.type === 'html'}
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html seg.content}
			{:else if seg.type === 'figure'}
				<Image src={seg.src} caption={seg.caption} figNum={seg.figNum} id={seg.id} />
			{:else if seg.type === 'video'}
				<Video src={seg.src} caption={seg.caption} figNum={seg.figNum} id={seg.id} />
			{:else if seg.type === 'equation'}
				<Equation latex={seg.latex} caption={seg.caption} figNum={seg.figNum} id={seg.id} />
			{:else if seg.type === 'tikz'}
				<Tikz svg={seg.svg} caption={seg.caption} figNum={seg.figNum} id={seg.id} />
			{:else if seg.type === 'observation'}
				<Observation content={seg.content} />
			{/if}
		{/each}
	</article>

	{#if prev || next}
		<nav class="mt-16 flex justify-between gap-4 border-t border-border pt-8">
			{#if prev}
				<a href="/{section}/{prev.slug}" class="group max-w-[45%] text-sm">
					<span class="mb-1 flex items-center gap-1 font-mono text-xs text-fg-muted"
						><ArrowLeft class="h-3 w-3" /> Older</span
					>
					<span class="block truncate font-display font-medium underline-offset-2 group-hover:underline">
						{prev.metadata.title}
					</span>
				</a>
			{:else}
				<div></div>
			{/if}
			{#if next}
				<a href="/{section}/{next.slug}" class="group max-w-[45%] text-right text-sm">
					<span class="mb-1 flex items-center justify-end gap-1 font-mono text-xs text-fg-muted"
						>Newer <ArrowRight class="h-3 w-3" /></span
					>
					<span class="block truncate font-display font-medium underline-offset-2 group-hover:underline">
						{next.metadata.title}
					</span>
				</a>
			{:else}
				<div></div>
			{/if}
		</nav>
	{/if}
</div>

{#if peek}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div role="presentation" class="fixed inset-0 z-40" onclick={closePeek}></div>
	<div class="peek-panel fixed top-4 right-4 z-50 flex w-[min(28rem,calc(100vw-2rem))] flex-col border border-border bg-bg shadow-2xl" style="max-height: calc(100vh - 2rem)">
		<div class="flex items-center justify-between border-b border-border px-4 py-2.5">
			<span class="font-mono text-xs tracking-widest text-fg-muted uppercase">Peek</span>
			<button onclick={closePeek} class="text-fg-muted transition-colors hover:text-fg">
				<X class="h-3.5 w-3.5" />
			</button>
		</div>
		<div class="prose prose-stone prose-sm dark:prose-invert max-w-none flex-1 overflow-y-auto px-5 py-4 [&_h1]:mt-4 [&_h2]:mt-4 [&_h3]:mt-3">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html peek.html}
		</div>
		<div class="border-t border-border px-5 py-3 flex justify-end">
			<button
				onclick={goToSection}
				class="font-mono text-xs text-accent underline-offset-2 hover:underline"
			>
				Go to section
			</button>
		</div>
	</div>
{/if}

<style>
	.peek-panel {
		animation: peek-in 0.15s ease-out;
	}

	@keyframes peek-in {
		from {
			opacity: 0;
			transform: translateX(0.75rem);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	:global(.copy-btn) {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		padding: 0.2rem 0.5rem;
		font-size: 0.7rem;
		background: var(--color-border);
		color: var(--color-fg-muted);
		border: none;
		border-radius: 0;
		cursor: pointer;
		font-family: var(--font-mono);
		opacity: 0;
		transition: opacity 0.15s;
	}

	:global(pre:hover .copy-btn) {
		opacity: 1;
	}

	/* Attribute selectors can't be expressed as Tailwind prose modifiers */
	:global(.prose ol[type='a']) {
		list-style-type: lower-alpha;
	}
	:global(.prose ol[type='A']) {
		list-style-type: upper-alpha;
	}

	:global(:target),
	:global(.target-flash) {
		animation: target-flash 1.4s ease-out;
	}

	@keyframes target-flash {
		0% {
			box-shadow:
				0 0 0 8px rgba(255, 255, 255, 0.25),
				inset 0 0 0 9999px rgba(255, 255, 255, 0.25);
		}
		100% {
			box-shadow:
				0 0 0 8px rgba(255, 255, 255, 0),
				inset 0 0 0 9999px rgba(255, 255, 255, 0);
		}
	}
</style>
