<template>
  <div class="rounded border border-gray-300 dark:border-gray-700 p-4 mt-4 space-y-2">
    <p class="font-semibold">{{ title }}</p>
    <p class="text-sm opacity-80">Hello, {{ name }}.</p>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: "Vue card"
  },
  name: {
    type: String,
    default: "world"
  }
});
</script>
