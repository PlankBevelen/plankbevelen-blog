<template>
  <LayoutDefaultHeader />
  <main id="main">
    <NuxtPage />
  </main>
  <LayoutDefaultFooter />
  <ClientOnly>
    <el-backtop :right="24" :bottom="24" :visibility-height="480" />
  </ClientOnly>
</template>

