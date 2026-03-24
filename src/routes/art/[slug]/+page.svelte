<script lang="ts">
	import type { PageData } from './$types';
	import PostDetail from '$lib/components/PostDetail.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.post.metadata.title} | Königsboe</title>
	<meta name="description" content={data.post.metadata.description} />
	<meta property="og:title" content={data.post.metadata.title} />
	<meta property="og:description" content={data.post.metadata.description} />
	<meta property="og:type" content="article" />
	{#if data.post.metadata.cover}
		<meta property="og:image" content={data.post.metadata.cover} />
	{/if}
</svelte:head>

<PostDetail post={data.post} prev={data.prev} next={data.next} section="art" />
