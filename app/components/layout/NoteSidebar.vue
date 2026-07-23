<template>
  <aside class="note-sidebar">
    <nav>
      <ul v-if="flatItems.length" class="flat-items">
        <li v-for="item in flatItems" :key="item.id">
          <button
            class="nav-item flat"
            :class="{ active: activeId === item.id }"
            @click="onSelectItem('', item.id)"
          >
            <span class="nav-item-title">{{ item.title }}</span>
          </button>
        </li>
      </ul>

      <div v-for="group in navGroups" :key="group.id" class="nav-group">
        <button
          type="button"
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
                type="button"
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
import { reactive, watch } from 'vue'
import type { PropType } from 'vue'

interface NoteNavItem {
  id: string
  title: string
  chapter?: string
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
  flatItems: {
    type: Array as PropType<NoteNavItem[]>,
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

const expandedMap = reactive<Record<string, boolean>>({})

function ensureActiveGroupExpanded() {
  if (!props.activeId) return
  const currentGroup = props.navGroups.find((group) =>
    group.items.some((item) => item.id === props.activeId)
  )
  if (currentGroup) {
    expandedMap[currentGroup.id] = true
  }
}

watch(
  () => [props.activeId, props.navGroups] as const,
  () => {
    ensureActiveGroupExpanded()
  },
  { immediate: true, deep: true }
)

function isExpanded(groupId: string): boolean {
  return expandedMap[groupId] === true
}

function toggleGroup(groupId: string) {
  expandedMap[groupId] = !isExpanded(groupId)
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
  overflow: visible;
  padding: 0;
}

.flat-items {
  list-style: none;
  margin: 0 0 4px;
  padding: 0;
}

.nav-group {
  position: relative;
  &:not(:last-child) {
    margin-bottom: 8px;
    padding-bottom: 8px;
    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
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
  padding: 8px;
  border: none;
  background: transparent;
  color: var(--text-color);
  font-size: @font-size-sm;
  font-weight: 600;
  cursor: pointer;
  border-radius: @small-border-radius;
  transition: background 0.15s;

  &:hover {
    background: var(--shallow-hover-bg-color);
  }
}

.nav-group-title {
  text-align: left;
}

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
  padding: 0;
  overflow: hidden;
}

.nav-item {
  width: 100%;
  padding: 6px 8px 6px 16px;
  border: none;
  background: transparent;
  color: var(--secondary-color);
  font-size: @font-size-sm;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  border-radius: @small-border-radius;

  &.flat {
    padding-left: 8px;
  }

  &:hover {
    color: var(--text-color);
    background: var(--shallow-hover-bg-color);
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
</style>
