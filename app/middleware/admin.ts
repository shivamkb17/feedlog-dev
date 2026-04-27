export default defineNuxtRouteMiddleware(async () => {
  const { data } = await useAuthSession()

  if (!data.value?.user) {
    return navigateTo('/')
  }

  if (data.value.user.role !== 'admin') {
    return navigateTo('/')
  }
})
