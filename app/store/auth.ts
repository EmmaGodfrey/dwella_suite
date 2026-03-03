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

  const isAuthenticated = computed(() => {
    // Check if we have both token and user data
    return !!token.value && !!currentUser.value
  })

  function initAuth() {
    if (process.client) {
      const storedToken = sessionStorage.getItem('authToken')
      const storedUser = sessionStorage.getItem('authUser')
      const storedPermissions = sessionStorage.getItem('authPermissions')
      
      if (storedToken) {
        token.value = storedToken
      }
      if (storedUser) {
        try {
          currentUser.value = JSON.parse(storedUser)
        } catch (e) {
          console.error('Failed to parse stored user:', e)
        }
      }
      if (storedPermissions) {
        try {
          permissions.value = JSON.parse(storedPermissions)
        } catch (e) {
          console.error('Failed to parse stored permissions:', e)
        }
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
          sessionStorage.setItem('authUser', JSON.stringify(response.data.user))
          sessionStorage.setItem('authPermissions', JSON.stringify(response.data.permissions || []))
        }
      }
    }
    return response
  }

  async function logout() {
    try {
      await $api.post('/auth/logout')
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      // Clear in-memory state
      currentUser.value = null
      permissions.value = []
      token.value = null
      
      // Clear sessionStorage
      if (process.client) {
        sessionStorage.removeItem('authToken')
        sessionStorage.removeItem('authUser')
        sessionStorage.removeItem('authPermissions')
      }
      
      // Force navigation to login
      await navigateTo('/login', { replace: true, external: false })
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
