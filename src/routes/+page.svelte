<script lang="ts">
	import type { PageData } from './$types';
	import { formatDate, youtubeId, youtubeThumbnail } from '$lib/utils';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Königsboe</title>
	<meta name="description" content="Nas' corner" />
</svelte:head>

<div class="mx-auto max-w-3xl px-6">
	<section class="flex flex-col items-center py-8 text-center md:py-24">
		<h1 class="mb-6 font-display text-5xl leading-tight font-bold">Königsboe</h1>
		<p class="text-xl text-fg-muted">Nas' corner</p>
		<img src="/images/me_3.png" alt="Nas" class="mt-10 object-contain md:h-[500px]" />
	</section>

	<section class="py-16">
		<h2 class="mb-10 font-mono text-xs tracking-widest text-fg-muted uppercase">Recent</h2>
		<ul class="border-t border-border">
			{#each data.posts as post (post.slug + post.section)}
				<li class="border-b border-border py-8">
					<a href="/{post.section}/{post.slug}" class="group block">
						<div class="mb-2 flex items-center gap-2 font-mono text-xs text-fg-muted">
							<time>{formatDate(post.metadata.date)}</time>
							<span>·</span>
							<span>{post.section}</span>
						</div>
						<h3
							class="truncate font-display text-xl font-bold underline-offset-2 group-hover:underline"
						>
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
									class="aspect-video w-full object-cover grayscale transition-[filter] duration-300 group-hover:grayscale-0"
								/>
							</div>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</section>
</div>
