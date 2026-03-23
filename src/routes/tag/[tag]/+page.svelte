<script lang="ts">
	import type { PageData } from './$types';
	import { formatDate } from '$lib/utils';
	import { ArrowLeft } from '@lucide/svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>#{data.tag} — Königsboe</title>
	<meta name="description" content="Posts tagged {data.tag} on Königsboe." />
</svelte:head>

<div class="mx-auto max-w-3xl px-6 py-16">
	<header class="mb-16">
		<p class="mb-2 text-xs uppercase tracking-widest text-fg-muted font-mono">
			Tag
		</p>
		<h1 class="text-4xl font-bold font-display">{data.tag}</h1>
		<p class="mt-2 text-sm text-fg-muted">
			{data.posts.length} post{data.posts.length === 1 ? '' : 's'}
		</p>
	</header>

	<ul class="border-t border-border">
		{#each data.posts as post}
			<li class="border-b border-border py-10">
				<a href="/blog/{post.slug}" class="group block">
					<h2 class="text-xl font-bold underline-offset-2 group-hover:underline font-display">
						{post.metadata.title}
					</h2>
					{#if post.metadata.description}
						<p class="mt-1 text-sm text-fg-muted">{post.metadata.description}</p>
					{/if}
				</a>
				<div class="mt-3 flex items-center gap-3 text-xs text-fg-muted">
					<time class="font-mono">{formatDate(post.metadata.date)}</time>
	
				</div>
			</li>
		{/each}
	</ul>

	<a href="/blog" class="mt-12 inline-flex items-center gap-1.5 border-b border-transparent pb-px text-sm text-accent hover:border-current">
		<ArrowLeft class="h-3 w-3" /> All posts
	</a>
</div>
