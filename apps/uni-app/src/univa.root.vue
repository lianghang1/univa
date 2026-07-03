<script setup lang="ts">
function showToast(msg: string) {
  console.log(msg)
}

defineExpose({
  showToast,
})
</script>

<template>
  <view>
    rot55
    <KuRootView />
  </view>
</template>
