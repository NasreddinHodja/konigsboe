<script lang="ts">
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/favicon.png" type="image/png" />
</svelte:head>

<div class="flex min-h-screen flex-col bg-bg text-fg">
	<header class="sticky top-0 z-50 border-b border-border bg-bg">
		<nav class="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
			<a href="/" class="font-display text-sm font-bold tracking-tight text-fg sm:text-base">Königsboe</a>
			<div class="flex items-center gap-3 sm:gap-6">
				<a href="/pandeiro" class="text-xs text-fg-muted transition-opacity hover:opacity-70 sm:text-sm">Pandeiro</a>
				<a href="/art" class="text-xs text-fg-muted transition-opacity hover:opacity-70 sm:text-sm">Art</a>
				<a href="/blog" class="text-xs text-fg-muted transition-opacity hover:opacity-70 sm:text-sm">Writing</a>
				<a href="/rss.xml" class="text-xs text-fg-muted transition-opacity hover:opacity-70 sm:text-sm">RSS</a>
			</div>
		</nav>
	</header>

	<main class="flex-1">
		{@render children()}
	</main>

	<footer class="mt-20 border-t border-border py-10">
		<div class="mx-auto flex max-w-3xl items-center justify-between px-6 text-sm text-fg-muted">
			<span class="font-display">Königsboe</span>
			<div class="flex gap-4">
				<a href="/rss.xml" class="underline-offset-2 hover:underline">RSS</a>
				<a href="/sitemap.xml" class="underline-offset-2 hover:underline">Sitemap</a>
			</div>
		</div>
	</footer>
</div>
