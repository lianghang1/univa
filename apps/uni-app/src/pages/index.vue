<script setup lang="ts">
import DemoAsync from '@/components-async/Demo/index.vue'

defineOptions({
  componentPlaceholder: {
    DemoAsync: 'view',
  },
})
</script>

<template>
  <view class="root-container">
    <AppLogos />
    <InputEntry />
    <AppFooter />
    <BizDemo />
    <DemoAsync />
  </view>
</template>

<style scoped>
.root-container {
  padding: 5rem 2.5rem;
  text-align: center;
}
</style>
