<script setup lang="ts">
// Create / rename dialog for an SSO signing secret. One surface for both modes
// — the body is identical (a single optional label), only the copy differs.
// Create: backend generates the secret. Rename: only the label changes; the
// key is untouched.

const props = defineProps<{
  mode: 'create' | 'rename'
  initialLabel?: string
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  submit: [payload: { label: string }]
}>()

const label = ref('')
const labelInput = ref<HTMLInputElement | null>(null)

watch(open, (v) => {
  if (v) {
    label.value = props.initialLabel ?? ''
    nextTick(() => labelInput.value?.focus())
  }
})

const copy = computed(() => props.mode === 'rename'
  ? {
      title: 'Rename secret',
      desc: 'Update the label used to tell this secret apart. The key itself is unchanged.',
      action: 'Save',
      icon: 'lucide:pencil',
    }
  : {
      title: 'Create signing secret',
      desc: 'A new HS256 secret your backend uses to sign SSO tokens. You can reveal and copy it again any time.',
      action: 'Create secret',
      icon: 'lucide:plus',
    })

function submit() {
  emit('submit', { label: label.value.trim() })
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="font-heading">{{ copy.title }}</DialogTitle>
        <DialogDescription class="text-sm">{{ copy.desc }}</DialogDescription>
      </DialogHeader>

      <div>
        <label class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Label <span class="font-normal normal-case">(optional)</span></label>
        <input
          ref="labelInput"
          v-model="label"
          type="text"
          placeholder="e.g. Production, EU region, mobile app"
          class="mt-2 w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary transition-colors"
          @keydown.enter="submit"
        >
        <p class="text-[11px] text-muted-foreground mt-1.5">Helps you tell multiple secrets apart when rotating.</p>
      </div>

      <DialogFooter>
        <button class="h-9 px-4 rounded-lg border border-border bg-background text-xs font-semibold hover:bg-secondary transition-colors" @click="open = false">
          Cancel
        </button>
        <button
          class="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-heading font-bold hover:opacity-90 transition-all flex items-center gap-1.5"
          @click="submit"
        >
          <Icon :name="copy.icon" size="14" />
          {{ copy.action }}
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
