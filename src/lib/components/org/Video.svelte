<script lang="ts">
  import Figure from './Figure.svelte';
  interface Props {
    src: string;
    caption?: string;
    figNum?: number;
    id?: string;
  }
  let { src, caption, figNum, id }: Props = $props();
  const type = $derived(src.endsWith('.webm') ? 'video/webm' : 'video/mp4');
</script>

<Figure {id} {caption} {figNum}>
  <video autoplay loop muted playsinline>
    <source {src} {type} />
  </video>
</Figure>
