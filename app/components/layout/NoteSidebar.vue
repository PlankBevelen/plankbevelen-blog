<template>
  <aside class="note-sidebar">
    <nav>
      <div v-for="group in navGroups" :key="group.id" class="nav-group">
        <button
          class="nav-group-header"
          @click="toggleGroup(group.id)"
        >
          <span class="nav-group-title">{{ group.title }}</span>
          <span class="nav-group-chevron" :class="{ expanded: isExpanded(group.id) }">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </button>
        <Transition name="collapse">
          <ul v-if="isExpanded(group.id)" class="nav-group-items">
            <li v-for="item in group.items" :key="item.id">
              <button
                class="nav-item"
                :class="{ active: activeId === item.id }"
                @click="onSelectItem(group.id, item.id)"
              >
                <span class="nav-item-title">{{ item.title }}</span>
              </button>
            </li>
          </ul>
        </Transition>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PropType } from 'vue'

interface NoteNavItem {
  id: string
  title: string
  summary?: string
}

interface NoteNavGroup {
  id: string
  title: string
  count?: number
  items: NoteNavItem[]
}

const props = defineProps({
  navGroups: {
    type: Array as PropType<NoteNavGroup[]>,
    default: () => []
  },
  activeId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits<{
  select: [groupId: string, itemId: string]
}>()

const expandedGroups = ref(new Set<string>())

watch(
  () => props.activeId,
  (value) => {
    if (!value) return
    const currentGroup = props.navGroups.find(group => group.items.some(item => item.id === value))
    if (currentGroup) {
      expandedGroups.value.add(currentGroup.id)
    }
  },
  { immediate: true }
)

function isExpanded(groupId: string): boolean {
  if (expandedGroups.value.has(groupId)) return true
  return !expandedGroups.value.size
}

function toggleGroup(groupId: string) {
  if (expandedGroups.value.has(groupId)) {
    expandedGroups.value.delete(groupId)
  } else {
    expandedGroups.value.add(groupId)
  }
}

function onSelectItem(groupId: string, itemId: string) {
  emit('select', groupId, itemId)
}
</script>

<style lang="less" scoped>
.note-sidebar {
  width: 100%;
  flex-shrink: 0;
  height: 100%;
  overflow-y: auto;
  padding: 12px 0;
}

.brand-link {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-decoration: none;
}

.brand-title {
  font-size: @font-size-xl;
  font-weight: 700;
  color: var(--text-color);
}

.brand-caption {
  font-size: @font-size-xs;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--tertiary-color);
}

/* .nav-group {
  &:not(:last-child) {
    // 分割线
    border-bottom: 1px solid var(--border-color);    
  }
} */

.nav-group {
  position: relative;
  &:not(:last-child) {
    padding-bottom: 8px;
    &::after {
      content: '';
      position: absolute;
      left: 12px;
      right: 12px;
      bottom: 0;
      border-bottom: 1px solid var(--border-color);
    }
  }
}

.nav-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 20px;
  border: none;
  background: transparent;
  color: var(--text-color);
  font-size: @font-size-sm;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: var(--mute-bg-color);
  }
}

.nav-group-title {
  text-align: left;
}

/* .nav-group:not(:last-child) {
  border-bottom: none !important;
} */

/* .nav-group:not(:last-child){
  position: relative;
  display: inline-block;
}
 */
/* .nav-group:not(:last-child) .nav-group::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -6px;
  border-bottom: 1px solid var(--border-color);
} */

.nav-group-chevron {
  display: flex;
  align-items: center;
  color: var(--secondary-color);
  transition: transform 0.2s ease;
  flex-shrink: 0;

  &.expanded {
    transform: rotate(180deg);
  }
}

.nav-group-items {
  list-style: none;
  margin: 0;
  overflow: hidden;
}

.nav-item {
  width: 100%;
  padding: 8px 20px 8px 30px;
  border: none;
  background: transparent;
  color: var(--secondary-color);
  font-size: @font-size-sm;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;

  &:hover {
    color: var(--text-color);
    background: var(--mute-bg-color);
  }

  &.active {
    color: var(--el-color-primary);
    background: color-mix(in srgb, var(--el-color-primary) 10%, transparent);
    font-weight: 500;
  }
}

.nav-item-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  line-height: 1.45;
}

.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 999px;
}

@media (max-width: 1024px) {
  .note-sidebar {
    padding-top: 18px;
  }

  .sidebar-brand {
    padding-left: 16px;
    padding-right: 16px;
  }

  .nav-group-header {
    padding-left: 16px;
    padding-right: 16px;
  }

  .nav-item {
    padding-left: 24px;
    padding-right: 16px;
  }
}
</style>
