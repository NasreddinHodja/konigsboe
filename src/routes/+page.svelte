<script lang="ts">
	import type { PageData } from './$types';
	import { formatDate, youtubeId, youtubeThumbnail } from '$lib/utils';
	import { ArrowRight } from '@lucide/svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Königsboe</title>
	<meta name="description" content="Nas' corner" />
</svelte:head>

<div class="mx-auto max-w-3xl px-6">
	<section class="flex flex-col items-center py-24 text-center">
		<h1 class="mb-6 text-5xl font-bold leading-tight font-display">
			Königsboe
		</h1>
		<p class="text-xl text-fg-muted">
			Nas' corner
		</p>
		<img src="/images/me_3.png" alt="Nas" class="mt-10 md:h-[500px] object-contain" />
	</section>

	<section class="py-16">
		<h2 class="mb-10 text-xs uppercase tracking-widest text-fg-muted font-mono">
			Recent
		</h2>
		<ul class="border-t border-border">
			{#each data.posts as post (post.slug + post.section)}
				<li class="border-b border-border py-8">
					<a href="/{post.section}/{post.slug}" class="group block">
						<div class="flex items-center gap-2 text-xs text-fg-muted font-mono mb-2">
							<time>{formatDate(post.metadata.date)}</time>
							<span>·</span>
							<span>{post.section}</span>
						</div>
						<h3 class="text-xl font-bold underline-offset-2 group-hover:underline font-display">
							{post.metadata.title}
						</h3>
						{#if post.metadata.description}
							<p class="mt-1 text-sm text-fg-muted">{post.metadata.description}</p>
						{/if}
						{#if post.metadata.cover}
							{@const ytId = youtubeId(post.metadata.cover)}
							<div class="mt-4 overflow-hidden">
								<img
									src={ytId ? youtubeThumbnail(ytId) : post.metadata.cover}
									alt={post.metadata.title}
									class="w-full aspect-video object-cover grayscale group-hover:grayscale-0 transition-[filter] duration-300"
								/>
							</div>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</section>
</div>
