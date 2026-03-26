<script lang="ts">
  import Figure from './Figure.svelte';
  interface Props {
    src: string;
    caption?: string;
    figNum?: number;
    id?: string;
  }
  let { src, caption, figNum, id }: Props = $props();
</script>

<Figure {id} {caption} {figNum}>
  <img {src} alt={caption ?? ''} class="block h-auto max-w-full" />
</Figure>
