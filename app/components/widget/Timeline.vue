<template>
  <BaseCard :class="['timeline-card', { clickable: clickableCard }]" @click="goTimeline">
    <template #header>
      <div class="header-wrap">
        <span>成长时间线</span>
        <span class="hint">查看全部</span>
      </div>
    </template>
    <div class="timeline">
      <div v-for="item in displayedTimeline" :key="item.year + item.title" class="timeline-item">
        <div class="dot"></div>
        <div class="timeline-content">
          <p class="year">{{ item.year }}</p>
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GrowthTimelineItem } from '@/composables/useGrowthTimeline'

const props = withDefaults(
  defineProps<{
    timeline: GrowthTimelineItem[]
    compact?: boolean
    clickableCard?: boolean
  }>(),
  {
    compact: false,
    clickableCard: false
  }
)

const localePath = useLocalePath()
const router = useRouter()

const displayedTimeline = computed(() =>
  props.compact ? props.timeline.slice(0, 3) : props.timeline
)

const goTimeline = () => {
  if (!props.clickableCard) return
  router.push(localePath('/timeline'))
}
</script>

<style scoped lang="less">
.timeline-card.clickable {
  cursor: pointer;
}

.header-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: @space-lg;
}

.hint {
  font-size: @font-size-xs;
  color: var(--primary-color);
}

.timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: @space-xl;
}

.timeline-item {
  display: grid;
  grid-template-columns: 18px 1fr;
  gap: @space-lg;
}

.dot {
  width: 10px;
  height: 10px;
  margin-top: @space-xs;
  border-radius: 50%;
  background: var(--primary-color);
  box-shadow: 0 0 0 6px var(--shallow-active-bg-color);
}

.timeline-content {
  padding: @space-lg @space-xl;
  border-radius: @large-border-radius;
  border: 1px solid var(--border-color);
  background: color-mix(in srgb, var(--card-color) 82%, #f6fbff);

  .year {
    margin: 0;
    font-size: @font-size-xs;
    color: var(--primary-color);
  }

  h3 {
    margin: @space-xs 0 0;
    font-size: @font-size-md;
    color: var(--text-color);
  }

  p {
    margin: @space-base 0 0;
    font-size: @font-size-sm;
    line-height: 1.8;
    color: var(--secondary-color);
  }
}
</style>
