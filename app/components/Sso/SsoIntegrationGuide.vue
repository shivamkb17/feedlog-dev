<script setup lang="ts">
// Integration guide: endpoint + query params + JWT payload + signing snippet +
// TTL guidance. Pure reference content for the customer's developer.
//
// The endpoint is derived from the CURRENT origin — i.e. whatever host is
// serving this dashboard — so the integrator always copies a working URL.

const origin = useRequestURL().origin
const endpoint = computed(() => `${origin}/api/sso/jwt`)

const queryParams = [
  { name: 'jwt', required: true, desc: 'HS256-signed token (see payload below).' },
  { name: 'return_to', required: false, desc: 'Where to land after sign-in. Same-host path or URL only (host-whitelisted). Defaults to /.' },
]

const payloadFields = [
  { name: 'email', required: true, desc: 'Identity key (globally unique) + notifications.' },
  { name: 'name', required: true, desc: 'Display name.' },
  { name: 'picture', required: false, desc: 'Avatar URL.' },
  { name: 'exp', required: true, desc: 'Expiry (Unix seconds). Required — see TTL below.' },
]

const snippet = computed(() => `import jwt from 'jsonwebtoken'

// Pre-sign at render time (page load / widget init), NOT on click —
// this avoids a network round-trip when the user follows the link.
function buildFeedbackUrl(user, returnTo = '/') {
  const token = jwt.sign(
    {
      email:   user.email,   // required — identity key
      name:    user.name,    // required — display name
      picture: user.avatar,  // optional — avatar URL
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // required — ~1h recommended
    },
    process.env.FEEDLOG_SSO_SECRET, // one of this workspace's enabled secrets
    { algorithm: 'HS256' },
  )

  const base = '${endpoint.value}'
  return \`\${base}?jwt=\${token}&return_to=\${encodeURIComponent(returnTo)}\`
}`)

const copiedKey = ref<string | null>(null)
function copy(key: string, text: string) {
  navigator.clipboard?.writeText(text)
  copiedKey.value = key
  setTimeout(() => { copiedKey.value = null }, 1500)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Endpoint -->
    <section class="rounded-xl border border-border bg-card overflow-hidden">
      <div class="px-5 py-3 border-b border-border">
        <h3 class="font-heading font-bold text-sm">Endpoint</h3>
        <p class="text-[11px] text-muted-foreground mt-0.5">Redirect signed-in users from your product to this URL.</p>
      </div>
      <div class="px-5 py-4 space-y-4">
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-bold uppercase tracking-wider bg-secondary text-primary px-1.5 py-0.5 rounded shrink-0">GET</span>
          <code class="flex-1 min-w-0 truncate text-xs font-mono px-2.5 py-1.5 rounded-md bg-muted border border-border">{{ endpoint }}</code>
          <button
            class="w-8 h-8 rounded-md hover:bg-secondary transition-colors flex items-center justify-center shrink-0"
            :class="copiedKey === 'endpoint' ? 'text-[var(--status-done)]' : 'text-muted-foreground'"
            @click="copy('endpoint', endpoint)"
          >
            <Icon :name="copiedKey === 'endpoint' ? 'lucide:check' : 'lucide:copy'" size="14" />
          </button>
        </div>

        <!-- Query params -->
        <div>
          <p class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Query parameters</p>
          <ul class="divide-y divide-border rounded-lg border border-border overflow-hidden">
            <li v-for="q in queryParams" :key="q.name" class="px-3 py-2.5 flex items-start gap-3 bg-background">
              <code class="text-xs font-mono font-bold text-foreground shrink-0 w-[88px]">{{ q.name }}</code>
              <span
                class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
                :class="q.required ? 'bg-secondary text-primary' : 'bg-muted text-muted-foreground'"
              >{{ q.required ? 'Required' : 'Optional' }}</span>
              <span class="text-xs text-muted-foreground leading-snug">{{ q.desc }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- JWT payload -->
    <section class="rounded-xl border border-border bg-card overflow-hidden">
      <div class="px-5 py-3 border-b border-border">
        <h3 class="font-heading font-bold text-sm">JWT payload</h3>
        <p class="text-[11px] text-muted-foreground mt-0.5">The signed-in user's info, carried in the token. FeedLog reads only these fields — any other claims are ignored.</p>
      </div>
      <ul class="divide-y divide-border">
        <li v-for="f in payloadFields" :key="f.name" class="px-5 py-2.5 flex items-start gap-3">
          <code class="text-xs font-mono font-bold text-foreground shrink-0 w-[110px]">{{ f.name }}</code>
          <span
            class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
            :class="f.required ? 'bg-secondary text-primary' : 'bg-muted text-muted-foreground'"
          >{{ f.required ? 'Required' : 'Optional' }}</span>
          <span class="text-xs text-muted-foreground leading-snug">{{ f.desc }}</span>
        </li>
      </ul>
    </section>

    <!-- Signing example -->
    <section class="rounded-xl border border-border bg-card overflow-hidden">
      <div class="px-5 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h3 class="font-heading font-bold text-sm">Sign &amp; redirect (Node.js)</h3>
          <p class="text-[11px] text-muted-foreground mt-0.5">Build the link on your backend.</p>
        </div>
        <button
          class="h-8 px-2.5 rounded-md border border-border bg-background hover:bg-secondary transition-colors flex items-center gap-1.5 text-xs font-semibold"
          :class="copiedKey === 'snippet' ? 'text-[var(--status-done)]' : 'text-muted-foreground'"
          @click="copy('snippet', snippet)"
        >
          <Icon :name="copiedKey === 'snippet' ? 'lucide:check' : 'lucide:copy'" size="13" />
          {{ copiedKey === 'snippet' ? 'Copied' : 'Copy' }}
        </button>
      </div>
      <pre class="px-5 py-4 overflow-x-auto text-xs font-mono leading-relaxed text-foreground bg-muted/40"><code>{{ snippet }}</code></pre>
    </section>

    <!-- TTL guidance -->
    <div class="flex items-start gap-2.5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
      <Icon name="lucide:clock" size="15" class="mt-0.5 shrink-0 text-amber-600" />
      <div class="text-xs leading-relaxed">
        <p class="font-bold">Token expiry (<code class="font-mono">exp</code>) is required</p>
        <p class="mt-1">
          Recommended ~1 hour; hard cap 24 hours (±60s clock tolerance). Pre-sign tokens when you render the page —
          not when the user clicks — to avoid an extra round-trip.
        </p>
      </div>
    </div>

    <!-- How it works footnote -->
    <p class="text-[11px] text-muted-foreground leading-relaxed">
      <Icon name="lucide:info" size="11" class="inline mr-1" />
      Users are matched by <span class="font-semibold">email</span>. A first-time email creates an end-user account (no
      extra login screen); changing a user's email creates a new account and does not migrate history.
    </p>
  </div>
</template>
