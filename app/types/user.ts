export interface User {
  id: number
  full_name: string
  email: string
  is_active: number
  role_ids?: number[]
  roles?: Array<{ id: number; name: string }>
  created_at?: string
  updated_at?: string
}

export interface UserCreateInput {
  full_name: string
  email: string
  password: string
  is_active: number
  role_ids: number[]
}

export interface UserUpdateInput {
  full_name?: string
  email?: string
  password?: string
  is_active?: number
  role_ids?: number[]
}

export interface UsersListParams {
  page?: number
  per_page?: number
  search?: string
  role?: string
}
