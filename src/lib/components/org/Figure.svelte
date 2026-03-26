<script lang="ts">
  import type { Snippet } from 'svelte';
  interface Props {
    id?: string;
    caption?: string;
    figNum?: number;
    children: Snippet;
  }
  let { id, caption, figNum, children }: Props = $props();
  const captionText = $derived([figNum !== undefined ? `[${figNum}]` : undefined, caption].filter(Boolean).join(' '));
</script>

<figure {id} class="mx-auto block w-fit max-w-full">
  {@render children()}
  {#if captionText}
    <figcaption class="text-fg-muted text-center">{captionText}</figcaption>
  {/if}
</figure>
