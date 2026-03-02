import { defineStore, acceptHMRUpdate } from 'pinia'

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface LoginCredentials {
  email: string
  password: string
}

export const useAuthStore = defineStore('auth', () => {
  const { $api } = useNuxtApp() as any
  const currentUser = ref<User | null>(null)
  const permissions = ref<string[]>([])
  const token = ref<string | null>(null)

  const isAuthenticated = computed(() => !!currentUser.value && !!token.value)

  function initAuth() {
    if (process.client) {
      const storedToken = sessionStorage.getItem('authToken')
      if (storedToken) {
        token.value = storedToken
      }
    }
  }

  async function login(credentials: LoginCredentials) {
    const response = await $api.post('/auth/login', credentials)
    if (response.success && response.data?.user) {
      currentUser.value = response.data.user
      permissions.value = response.data.permissions || []
      
      if (response.data.token) {
        token.value = response.data.token
        if (process.client) {
          sessionStorage.setItem('authToken', response.data.token)
        }
      }
    }
    return response
  }

  async function logout() {
    try {
      await $api.post('/auth/logout')
    } finally {
      currentUser.value = null
      permissions.value = []
      token.value = null
      
      if (process.client) {
        sessionStorage.removeItem('authToken')
      }
      
      navigateTo('/login')
    }
  }

  function hasPermission(permission: string): boolean {
    return permissions.value.includes(permission)
  }

  // Initialize auth on store creation
  initAuth()

  return {
    currentUser,
    permissions,
    token,
    isAuthenticated,
    login,
    logout,
    hasPermission,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
