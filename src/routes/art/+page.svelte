<script lang="ts">
	import type { PageData } from './$types';
	import PostList from '$lib/components/PostList.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Art — Königsboe</title>
	<meta name="description" content="Art on Königsboe." />
</svelte:head>

<div class="mx-auto max-w-3xl px-6 py-16">
	<header class="mb-16">
		<h1 class="font-display text-4xl font-bold">Art</h1>
		<p class="mt-2 text-sm text-fg-muted">
			{data.posts.length} post{data.posts.length === 1 ? '' : 's'}
		</p>
	</header>

	<PostList posts={data.posts} section="art" />
</div>
