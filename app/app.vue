<template>
  <NuxtLayout>
    <NuxtPage />
    <ToastContainer />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { useSettings } from '~/composables/useSettings'

const { fetchSettings } = useSettings()

onBeforeMount(() => {
  fetchSettings()
})
</script>
