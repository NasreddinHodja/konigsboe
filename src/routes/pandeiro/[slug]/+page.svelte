<script lang="ts">
	import type { PageData } from './$types';
	import PostDetail from '$lib/components/PostDetail.svelte';
	import { youtubeId, youtubeThumbnail } from '$lib/utils';

	let { data }: { data: PageData } = $props();

	const cover = data.post.metadata.cover;
	const ogImage = cover
		? (() => { const id = youtubeId(cover); return id ? youtubeThumbnail(id) : cover; })()
		: undefined;
</script>

<svelte:head>
	<title>{data.post.metadata.title} | Königsboe</title>
	<meta name="description" content={data.post.metadata.description} />
	<meta property="og:title" content={data.post.metadata.title} />
	<meta property="og:description" content={data.post.metadata.description} />
	<meta property="og:type" content="article" />
	{#if ogImage}
		<meta property="og:image" content={ogImage} />
	{/if}
</svelte:head>

<PostDetail post={data.post} prev={data.prev} next={data.next} section="pandeiro" embedVideo />
