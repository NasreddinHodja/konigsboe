<script lang="ts">
	import { page } from '$app/stores';
	import { ArrowLeft } from '@lucide/svelte';
</script>

<svelte:head>
	<title>{$page.status} | Königsboe</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-6 py-32 text-center">
	<p class="mb-4 font-mono text-sm text-fg-muted">{$page.status}</p>
	<h1 class="mb-6 font-display text-4xl font-bold">
		{$page.error?.message ?? 'Something went wrong'}
	</h1>
	<a
		href="/"
		class="inline-flex items-center gap-1.5 border-b border-transparent pb-px text-sm text-accent hover:border-current"
	>
		<ArrowLeft class="h-3 w-3" /> Home
	</a>
</div>
