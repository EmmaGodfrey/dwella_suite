export interface User {
  id: number
  name: string
  email: string
  role: string
  created_at?: string
  updated_at?: string
}

export interface UserCreateInput {
  name: string
  email: string
  password: string
  role: string
}

export interface UserUpdateInput {
  name?: string
  email?: string
  password?: string
  role?: string
}

export interface UsersListParams {
  page?: number
  per_page?: number
  search?: string
  role?: string
}
