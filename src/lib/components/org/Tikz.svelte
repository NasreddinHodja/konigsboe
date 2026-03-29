<script lang="ts">
  import Figure from './Figure.svelte';
  interface Props {
    svg: string;
    caption?: string;
    figNum?: number;
    id?: string;
  }
  let { svg, caption, figNum, id }: Props = $props();
</script>

<Figure {id} {caption} {figNum}>
  <div class="tikz bg-black rounded-sm p-6 [&>svg]:block [&>svg]:w-full [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:invert">
    {@html svg}
  </div>
</Figure>
