<script setup lang="ts">
import { toast } from 'vue-sonner'

const { resetPassword } = useAuth()
const route = useRoute()

const token = computed(() => route.query.token as string | undefined)
const error = computed(() => route.query.error as string | undefined)

const form = reactive({
  newPassword: '',
  confirmPassword: '',
})

const loading = ref(false)
const success = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

async function onSubmit() {
  if (!token.value) return
  if (form.newPassword !== form.confirmPassword) {
    toast.error('Passwords do not match')
    return
  }
  if (form.newPassword.length < 8) {
    toast.error('Password must be at least 8 characters')
    return
  }

  loading.value = true
  try {
    const { error: resetError } = await resetPassword({
      newPassword: form.newPassword,
      token: token.value,
    })
    if (resetError) {
      toast.error(resetError.message || 'Failed to reset password')
      return
    }
    success.value = true
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-[60vh] w-full items-center justify-center px-4">
    <Card class="w-full max-w-sm shadow-warm">
      <!-- Success state -->
      <template v-if="success">
        <CardHeader class="text-center space-y-2">
          <div class="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Icon name="lucide:check" size="24" class="text-green-600 dark:text-green-400" />
          </div>
          <CardTitle class="font-heading text-xl">Password Reset</CardTitle>
          <CardDescription>Your password has been reset successfully.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button class="w-full" size="lg" @click="navigateTo('/')">
            Go to Home
          </Button>
        </CardContent>
      </template>

      <!-- Error state (invalid/expired token) -->
      <template v-else-if="error || !token">
        <CardHeader class="text-center space-y-2">
          <div class="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <Icon name="lucide:alert-circle" size="24" class="text-destructive" />
          </div>
          <CardTitle class="font-heading text-xl">Link Expired</CardTitle>
          <CardDescription>
            This password reset link has expired or is invalid. Please request a new one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button class="w-full" size="lg" @click="navigateTo('/')">
            Go to Home
          </Button>
        </CardContent>
      </template>

      <!-- Reset form -->
      <template v-else>
        <CardHeader class="text-center space-y-2">
          <div class="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon name="lucide:key-round" size="24" class="text-primary" />
          </div>
          <CardTitle class="font-heading text-xl">Reset Your Password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form class="space-y-4" @submit.prevent="onSubmit">
            <div class="space-y-2">
              <label class="text-sm font-medium" for="reset-new-password">New Password</label>
              <div class="relative">
                <Input
                  id="reset-new-password"
                  v-model="form.newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  placeholder="At least 8 characters"
                  required
                  minlength="8"
                  class="pr-10"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  @click="showNewPassword = !showNewPassword"
                >
                  <Icon :name="showNewPassword ? 'lucide:eye-off' : 'lucide:eye'" size="16" />
                </button>
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium" for="reset-confirm-password">Confirm Password</label>
              <div class="relative">
                <Input
                  id="reset-confirm-password"
                  v-model="form.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  required
                  minlength="8"
                  class="pr-10"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <Icon :name="showConfirmPassword ? 'lucide:eye-off' : 'lucide:eye'" size="16" />
                </button>
              </div>
            </div>
            <Button type="submit" class="w-full" size="lg" :disabled="loading">
              <Spinner v-if="loading" class="mr-2 size-4" />
              Reset Password
            </Button>
          </form>
          <p class="text-center text-sm text-muted-foreground mt-4">
            <NuxtLink to="/" class="text-primary hover:underline font-medium">
              ← Back to home
            </NuxtLink>
          </p>
        </CardContent>
      </template>
    </Card>
  </div>
</template>
