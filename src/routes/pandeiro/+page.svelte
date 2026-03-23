<script lang="ts">
	import type { PageData } from './$types';
	import { formatDate, youtubeId, youtubeThumbnail } from '$lib/utils';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Pandeiro — Königsboe</title>
	<meta name="description" content="Pandeiro notes and writings on Königsboe." />
</svelte:head>

<div class="mx-auto max-w-3xl px-6 py-16">
	<header class="mb-16">
		<h1 class="font-display text-4xl font-bold">Pandeiro</h1>
		<p class="mt-2 text-sm text-fg-muted">
			{data.posts.length} post{data.posts.length === 1 ? '' : 's'}
		</p>
	</header>

	{#if data.posts.length === 0}
		<p class="text-sm text-fg-muted">Nothing here yet.</p>
	{:else}
		<ul class="border-t border-border">
			{#each data.posts as post (post.slug)}
				<li class="border-b border-border pt-6">
					<a href="/pandeiro/{post.slug}" class="group block">
						{#if post.metadata.cover}
							{@const ytId = youtubeId(post.metadata.cover)}
							<div class="overflow-hidden">
								<img
									src={ytId ? youtubeThumbnail(ytId) : post.metadata.cover}
									alt={post.metadata.title}
									class="w-full aspect-video object-cover grayscale group-hover:grayscale-0 transition-[filter] duration-300"
								/>
							</div>
						{/if}
						<div class="py-8">
							<h2 class="font-display text-xl font-bold underline-offset-2 group-hover:underline">
								{post.metadata.title}
							</h2>
							{#if post.metadata.description}
								<p class="mt-1 text-sm text-fg-muted">{post.metadata.description}</p>
							{/if}
						</div>
					</a>
					<div class="-mt-4 pb-8 flex flex-wrap items-center gap-3 text-xs text-fg-muted">
						<time class="font-mono">{formatDate(post.metadata.date)}</time>
						{#each post.metadata.tags as tag (tag)}
							<a href="/tag/{tag}" class="px-2 py-0.5 transition-opacity hover:opacity-80 bg-accent-bg text-accent">
								{tag}
							</a>
						{/each}
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>
