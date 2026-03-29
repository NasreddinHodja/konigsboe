<script lang="ts">
  interface Props {
    content: string;
  }
  let { content }: Props = $props();
</script>

<aside class="observation my-6 border-l-2 border-accent pl-4 py-1 text-fg-muted italic">
  <p>{content}</p>
</aside>
