<script lang="ts">
  import Figure from './Figure.svelte';
  import katex from 'katex';
  interface Props {
    latex: string;
    caption?: string;
    figNum?: number;
    id?: string;
  }
  let { latex, caption, figNum, id }: Props = $props();
  const rendered = $derived(katex.renderToString(latex, { displayMode: true, throwOnError: false }));
</script>

<Figure {id} {caption} {figNum}>
  {@html rendered}
</Figure>
