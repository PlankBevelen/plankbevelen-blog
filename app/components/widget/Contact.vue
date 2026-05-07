<template>
  <BaseCard class="contact-card">
    <template #header>{{ $t('contact.title') }}</template>
    <ul class="contact-grid">
      <li v-for="item in contactList" :key="item.icon" class="contact-item">
        <nuxt-icon :name="item.icon" class="icon-wrap"/>
        <span class="meta">
          <span class="label">{{ item.label }}</span>
          <span class="value">{{ item.value }}</span>
        </span>
      </li>
    </ul>
  </BaseCard>
</template>

<script setup lang="ts">
const contactList = [
  {
    icon: 'gmail',
    label: $t('contact.email'),
    value: 'plankbevelen@gmail.com',
  },
  {
    icon: 'wechat',
    label: $t('contact.wechat'),
    value: 'PlankBevelen',
  },
  {
    icon: 'github',
    label: 'GitHub',
    value: '@PlankBevelen',
  },
]
</script>

<style scoped lang="less">
.contact-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin: 0;
  padding: 0;
}

.contact-item {
  list-style: none;
  min-height: 86px;
  display: flex;
  align-items: center;
  border-radius: @large-border-radius;
  gap: 12px;
  border: 1px solid color-mix(in srgb, var(--primary-color) 22%, var(--border-color));
  padding: 6px 12px;
  text-decoration: none;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.icon-wrap {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  color: var(--tertiary-color);
  font-size: @font-size-sm;
  line-height: 1.2;
}

.value {
  color: var(--text-color);
  font-size: @font-size-sm;
  line-height: 1.2;
  /* 换行 */
  word-break: break-word;
}

@media (max-width: 960px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }
}
</style>
