<script setup lang="ts">
// Landing page for email verification link callback
// better-auth redirects here after successful verification with autoSignInAfterVerification
const { data: session } = await useAuthSession()

// If session exists (auto sign-in worked), redirect to home after a brief delay
onMounted(() => {
  if (session.value?.user) {
    setTimeout(() => navigateTo('/'), 2000)
  }
})
</script>

<template>
  <div class="flex min-h-[60vh] w-full items-center justify-center px-4">
    <Card class="w-full max-w-sm shadow-warm">
      <CardHeader class="text-center space-y-2">
        <div class="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <Icon name="lucide:check" size="24" class="text-green-600 dark:text-green-400" />
        </div>
        <CardTitle class="font-heading text-xl">Email Verified</CardTitle>
        <CardDescription>
          Your email has been verified successfully.
          <template v-if="session?.user">
            Redirecting...
          </template>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button class="w-full" size="lg" @click="navigateTo('/')">
          Go to Home
        </Button>
      </CardContent>
    </Card>
  </div>
</template>
