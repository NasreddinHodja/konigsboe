<script lang="ts">
	import type { PageData } from './$types';
	import { formatDate } from '$lib/utils';
	import { ArrowLeft, ArrowRight, ChevronRight } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();
	interface TocItem {
		id: string;
		text: string;
		level: number;
	}

	function extractToc(html: string): TocItem[] {
		const items: TocItem[] = [];
		const re = /<h([23])[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h[23]>/g;
		let m: RegExpExecArray | null;
		while ((m = re.exec(html)) !== null) {
			items.push({ level: parseInt(m[1]), id: m[2], text: m[3].replace(/<[^>]*>/g, '') });
		}
		return items;
	}

	const toc = $derived(extractToc(data.post.html));

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
	});
</script>

<svelte:head>
	<title>{data.post.metadata.title} — Königsboe</title>
	<meta name="description" content={data.post.metadata.description} />
	<meta property="og:title" content={data.post.metadata.title} />
	<meta property="og:description" content={data.post.metadata.description} />
	<meta property="og:type" content="article" />
	{#if data.post.metadata.cover}
		<meta property="og:image" content={data.post.metadata.cover} />
	{/if}
</svelte:head>

<div class="mx-auto max-w-3xl px-6 py-16">
	<nav class="mb-8 flex items-center gap-1.5 font-mono text-xs text-fg-muted">
		<a href="/" class="text-fg-muted underline-offset-2 hover:underline">Home</a>
		<ChevronRight class="h-3 w-3" />
		<a href="/art" class="text-fg-muted underline-offset-2 hover:underline">Art</a>
		<ChevronRight class="h-3 w-3" />
		<span class="text-fg">{data.post.metadata.title}</span>
	</nav>

	<header class="mb-12 pb-8 {data.post.html?.trim() ? 'border-b border-border' : ''}">
		{#if data.post.metadata.cover}
			<div class="-mx-6 mb-8 overflow-hidden">
				<img
					src={data.post.metadata.cover}
					alt={data.post.metadata.title}
					class="w-full object-contain max-h-[80vh]"
				/>
			</div>
		{/if}
		<div class="mb-4 flex flex-wrap items-center gap-2 text-xs text-fg-muted">
			<time class="font-mono">{formatDate(data.post.metadata.date)}</time>
			{#each data.post.metadata.tags as tag (tag)}
				<a href="/tag/{tag}" class="bg-accent-bg px-2 py-0.5 text-accent transition-opacity hover:opacity-80">
					{tag}
				</a>
			{/each}
		</div>
		<h1 class="font-display text-4xl font-bold leading-tight">
			{data.post.metadata.title}
		</h1>
		{#if data.post.metadata.description}
			<p class="mt-4 text-lg text-fg-muted">{data.post.metadata.description}</p>
		{/if}
	</header>

	{#if toc.length > 0}
		<nav class="mb-12 border border-border bg-accent-bg p-5 text-sm">
			<p class="mb-3 font-mono text-xs tracking-widest text-fg-muted uppercase">Contents</p>
			<ul class="space-y-1.5">
				{#each toc as item (item.id)}
					<li style="padding-left:{(item.level - 2) * 1}rem">
						<a href="#{item.id}" class="text-fg underline-offset-2 hover:underline">{item.text}</a>
					</li>
				{/each}
			</ul>
		</nav>
	{/if}

	<article class="prose prose-stone max-w-none dark:prose-invert" data-pagefind-body>
		{@html data.post.html}
	</article>

	{#if data.prev || data.next}
		<nav class="mt-16 flex justify-between gap-4 border-t border-border pt-8">
			{#if data.prev}
				<a href="/art/{data.prev.slug}" class="group max-w-[45%] text-sm">
					<span class="mb-1 flex items-center gap-1 font-mono text-xs text-fg-muted"><ArrowLeft class="h-3 w-3" /> Older</span>
					<span class="font-display font-medium underline-offset-2 group-hover:underline">
						{data.prev.metadata.title}
					</span>
				</a>
			{:else}
				<div></div>
			{/if}
			{#if data.next}
				<a href="/art/{data.next.slug}" class="group max-w-[45%] text-right text-sm">
					<span class="mb-1 flex items-center justify-end gap-1 font-mono text-xs text-fg-muted">Newer <ArrowRight class="h-3 w-3" /></span>
					<span class="font-display font-medium underline-offset-2 group-hover:underline">
						{data.next.metadata.title}
					</span>
				</a>
			{:else}
				<div></div>
			{/if}
		</nav>
	{/if}
</div>

<style>
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
</style>
