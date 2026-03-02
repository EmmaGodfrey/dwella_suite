export default defineNuxtRouteMiddleware((to, from) => {
  const publicPaths = ['/login'];
  const authStore = useAuthStore();

  if (authStore.isAuthenticated) {
    if (publicPaths.includes(to.path)) {
      return navigateTo('/dashboard');
    }
  } else {
    if (!publicPaths.includes(to.path)) {
      return navigateTo('/login');
    }
  }
});
