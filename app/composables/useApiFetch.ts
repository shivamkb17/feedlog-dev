// SSR-safe $fetch wrapper that forwards cookie headers during server-side rendering.
// Safe to call from store actions (outside Vue setup context).
export function useApiFetch<T>(url: string, opts?: Parameters<typeof $fetch>[1]) {
  const headers: Record<string, string> = {}

  if (import.meta.server) {
    try {
      const cookie = useRequestHeaders(['cookie']).cookie
      if (cookie) headers.cookie = cookie
    } catch {
      // Called outside Nuxt context (e.g. from store action after await),
      // cookie forwarding is not available — this is expected on client-side navigations.
    }
  }

  return $fetch<T>(url, {
    ...opts,
    headers: { ...headers, ...opts?.headers },
  })
}
