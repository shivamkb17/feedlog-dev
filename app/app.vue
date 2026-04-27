<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
</script>

<template>
  <NuxtLoadingIndicator color="var(--primary)" :height="3" :throttle="200" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ConfirmDialogProvider />
  <Toaster position="bottom-right" :duration="3000" rich-colors close-button />
</template>
