<template>
  <div class="container-fluid dashboard-default-sec">
    <div class="row">
      <DashboardDefault />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useRouter } from 'vue-router';

definePageMeta({
  name: 'home',
  path: '/',
  layout: 'default',
  requiresAuth: true,
  public: false,
})

useHead({
  title: 'Viho - Premium Nuxt Admin Template',
});
const router = useRouter();
onMounted(() => {
  router.replace('/dashboard');
});
</script>
