<script setup lang="ts">
// This page is the OAuth popup callback target.
// It notifies the opener window and closes itself.
if (import.meta.client) {
  window.opener?.postMessage({ type: 'auth-callback' }, window.location.origin)
  window.close()
}
</script>

<template>
  <div class="flex min-h-[60vh] items-center justify-center">
    <p class="text-muted-foreground">Signing in...</p>
  </div>
</template>
