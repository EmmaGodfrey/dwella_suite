<template>
  <button class="btn btn-primary-light" type="button" @click="logOut">
    <a class="d-flex"> <Icon name="mdi:logout" class="" size="20" />Log out </a>
  </button>
</template>
<script lang="ts" setup>
const authStore = useAuthStore()

function logOut() {
  authStore.logout()
}
</script>
