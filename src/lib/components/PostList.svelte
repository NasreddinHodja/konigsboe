<script lang="ts">
	import type { Post } from '$lib/content';
	import { formatDate, youtubeId, youtubeThumbnail } from '$lib/utils';

	interface Props {
		posts: Post[];
		section: string;
		grayscale?: boolean;
	}

	let { posts, section, grayscale = false }: Props = $props();
</script>

{#if posts.length === 0}
	<p class="text-sm text-fg-muted">Nothing here yet.</p>
{:else}
	<ul class="border-t border-border">
		{#each posts as post (post.slug)}
			<li class="border-b border-border pt-6">
				<a href="/{section}/{post.slug}" class="group block">
					{#if post.metadata.cover}
						{@const ytId = youtubeId(post.metadata.cover)}
						<div class="overflow-hidden">
							<img
								src={ytId ? youtubeThumbnail(ytId) : post.metadata.cover}
								alt={post.metadata.title}
								class="aspect-video w-full object-cover transition-[filter] duration-300 {grayscale
									? 'grayscale group-hover:grayscale-0'
									: ''}"
							/>
						</div>
					{/if}
					<div class="py-8">
						<h2
							class="truncate font-display text-xl font-bold underline-offset-2 group-hover:underline"
						>
							{post.metadata.title}
						</h2>
						{#if post.metadata.description}
							<p class="mt-1 text-sm text-fg-muted">{post.metadata.description}</p>
						{/if}
					</div>
				</a>
				<div class="-mt-4 flex flex-wrap items-center gap-3 pb-8 text-xs text-fg-muted">
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
			</li>
		{/each}
	</ul>
{/if}
