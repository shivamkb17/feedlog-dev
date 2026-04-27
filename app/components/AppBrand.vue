<!--
  Brand mark (logo + wordmark) rendered in the default layout header.
  Extracted as its own component so downstream layers (e.g. feedlog-ee) can
  override the wordmark / link target by shipping their own AppBrand.vue —
  Nuxt layer merge: consumer layer's component wins for duplicate names.
-->
<template>
  <NuxtLink to="/" class="flex items-center gap-2 md:gap-3">
    <AppLogo :size="32" class="md:size-10" />
    <span class="font-heading text-xl md:text-2xl font-bold tracking-tight">FeedLog</span>
  </NuxtLink>
</template>
