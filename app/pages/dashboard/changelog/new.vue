<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'admin' })
useHead({ title: 'New Changelog' })
</script>

<template>
  <div class="flex-1 overflow-auto">
    <ChangelogEditor />
  </div>
</template>
