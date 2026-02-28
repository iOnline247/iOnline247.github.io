<script>
  let { title = "Svelte list", items = ["Fast", "Flexible", "Client-only"] } = $props();
</script>

<div class="rounded border border-gray-300 dark:border-gray-700 p-4 mt-4 space-y-2">
  <p class="font-semibold">{title}</p>
  <ul class="list-disc ml-5 text-sm opacity-80">
    {#each items as item}
      <li>{item}</li>
    {/each}
  </ul>
</div>
