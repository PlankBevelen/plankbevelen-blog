<template>
  <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <div class="min-w-0 flex-1">
      <slot></slot>
    </div>
    <div class="flex flex-wrap items-center justify-end gap-2">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

