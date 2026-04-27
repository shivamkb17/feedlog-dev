type ResourceType = 'post' | 'comment'

export function usePermission(authorId: Ref<string | undefined> | ComputedRef<string | undefined>, type: ResourceType) {
  const { data: session } = useAuthSession()

  const userId = computed(() => session.value?.user?.id)
  const isAdmin = computed(() => session.value?.user?.role === 'admin')
  const isOwner = computed(() => !!authorId.value && userId.value === authorId.value)

  const canEdit = computed(() => isOwner.value || isAdmin.value)

  // Post delete: admin only. Comment delete: owner or admin.
  const canDelete = computed(() =>
    type === 'post' ? isAdmin.value : (isOwner.value || isAdmin.value),
  )

  const showMenu = computed(() => canEdit.value || canDelete.value)

  return { isAdmin, isOwner, canEdit, canDelete, showMenu }
}
