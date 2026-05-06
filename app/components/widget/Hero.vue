<template>
  <BaseCard class="hero-card">
    <div class="hero-grid-bg"></div>
    <div class="hero-content">
      <p class="hero-kicker">{{ $t("hero.kicker") }}</p>
      <h2 class="hero-title" :style="{ fontSize: heroTitleFontSize }">
        {{ $t("hero.title1") }}
        <br />
        {{ $t("hero.title2") }}
      </h2>
      <p class="hero-desc">
        {{ $t("hero.desc") }}
      </p>
      <!-- <p class="hero-stack">Vue · Nuxt · Node.js · GSAP · Three.js</p> -->
      <div class="hero-actions">
        <NuxtLink class="hero-btn hero-btn--primary" :to="localePath('/article')">
          {{ $t("hero.article") }}
        </NuxtLink>
        <NuxtLink class="hero-btn hero-btn--ghost" :to="localePath('/project')">
          {{ $t("hero.project") }}
        </NuxtLink>
      </div>
    </div>
  </BaseCard>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()

const heroTitleFontSize = computed(() => (
  locale.value.startsWith('en')
    ? 'clamp(30px, 5.2vw, 58px)'
    : 'clamp(40px, 6vw, 80px)'
))

</script>

<style lang="less" scoped>
.hero-card {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 80% 0%, color-mix(in srgb, var(--primary-color) 24%, transparent), transparent 38%),
    linear-gradient(180deg, color-mix(in srgb, var(--card-color) 92%, #f8fbff), var(--card-color));
  border: 1px solid color-mix(in srgb, var(--primary-color) 32%, var(--border-color));
}

.hero-grid-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(to right, color-mix(in srgb, var(--primary-color) 12%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in srgb, var(--primary-color) 12%, transparent) 1px, transparent 1px);
  background-size: 36px 36px;
  opacity: 0.55;
}

.hero-content {
  position: relative;
  z-index: 2;
  padding: 12px 6px;
}

.hero-kicker {
  margin: 0;
  font-size: 14px;
  color: var(--primary-color);
}

.hero-title {
  margin: 14px 0 0;
  line-height: 1.08;
  font-size: clamp(40px, 6vw, 84px);
  color: var(--text-color);
  letter-spacing: 0.02em;
}

.hero-desc {
  margin-top: 18px;
  font-size: 16px;
  line-height: 1.8;
  color: var(--secondary-color);
}

.hero-stack {
  margin-top: 12px;
  font-size: 18px;
  color: color-mix(in srgb, var(--text-color) 80%, #8197af);
}

.hero-actions {
  margin-top: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-btn {
  height: 42px;
  min-width: 130px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  border-radius: 12px;
  text-decoration: none;
  font-size: 15px;
  transition: all 0.2s ease;
}

.hero-btn--primary {
  color: #fff;
  background: var(--primary-color);

  &:hover {
    background: var(--primary-hover-color);
  }
}

.hero-btn--ghost {
  color: var(--text-color);
  border: 1px solid var(--border-color);
  background: color-mix(in srgb, var(--card-color) 70%, #f4f8ff);

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
}
</style>
