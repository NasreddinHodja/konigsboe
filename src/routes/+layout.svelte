<script lang="ts">
	import './layout.css';

	import * as Sheet from '$lib/components/ui/sheet';
	import { Menu } from '@lucide/svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/favicon.png" type="image/png" />
	<meta property="og:image" content="/images/og-cover.jpg" />
</svelte:head>

<div class="flex min-h-screen flex-col bg-bg text-fg">
	<header class="sticky top-0 z-50 border-b border-border bg-bg">
		<nav class="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
			<a href="/" class="font-bold font-display tracking-tight text-fg">
				Königsboe
			</a>

			<!-- Desktop nav -->
			<div class="hidden items-center gap-6 md:flex">
				<a href="/pandeiro" class="text-sm transition-opacity hover:opacity-70 text-fg-muted">Pandeiro</a>
				<a href="/art" class="text-sm transition-opacity hover:opacity-70 text-fg-muted">Art</a>
				<a href="/rss.xml" class="text-sm transition-opacity hover:opacity-70 text-fg-muted">RSS</a>
			</div>

			<!-- Mobile nav -->
			<Sheet.Root>
				<Sheet.Trigger class="md:hidden text-fg-muted hover:opacity-70 transition-opacity">
					<Menu size={20} />
					<span class="sr-only">Open menu</span>
				</Sheet.Trigger>
				<Sheet.Content side="right" class="w-64 bg-bg border-border p-0">
					<Sheet.Header class="border-b border-border px-6 py-4">
						<Sheet.Title class="text-fg font-display font-bold">Königsboe</Sheet.Title>
					</Sheet.Header>
					<nav class="flex flex-col px-6 py-6 gap-6">
						<a href="/pandeiro" class="text-sm text-fg-muted hover:text-fg transition-colors">Pandeiro</a>
						<a href="/art" class="text-sm text-fg-muted hover:text-fg transition-colors">Art</a>
						<a href="/rss.xml" class="text-sm text-fg-muted hover:text-fg transition-colors">RSS</a>
					</nav>
				</Sheet.Content>
			</Sheet.Root>
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
