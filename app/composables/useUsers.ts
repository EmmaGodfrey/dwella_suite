import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
import type { User, UserCreateInput, UserUpdateInput, UsersListParams } from '../types/user'
import type { PaginatedResponse } from '../types/api'

export const useUsers = () => {
  const usersStore = useUsersStore()
  const queryClient = useQueryClient()

  // Fetch users query
  const useFetchUsersQuery = (params: Ref<UsersListParams>) => {
    return useQuery({
      queryKey: ['users', params],
      queryFn: async () => {
        const response = await usersStore.fetchUsers(params.value)
        return response.data as PaginatedResponse<User>
      },
    })
  }

  // Create user mutation
  const useCreateUserMutation = () => {
    const mutation = useMutation({
      mutationFn: (userData: UserCreateInput) => usersStore.createUser(userData),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] })
      },
    })

    watch(
      () => mutation.isSuccess.value,
      (isSuccess) => {
        if (isSuccess) {
          toast.success('User created successfully')
        }
      }
    )

    watch(
      () => mutation.isError.value,
      (isError) => {
        if (isError) {
          toast.error('Failed to create user')
        }
      }
    )

    return mutation
  }

  // Update user mutation
  const useUpdateUserMutation = () => {
    const mutation = useMutation({
      mutationFn: ({ id, userData }: { id: number; userData: UserUpdateInput }) =>
        usersStore.updateUser(id, userData),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] })
      },
    })

    watch(
      () => mutation.isSuccess.value,
      (isSuccess) => {
        if (isSuccess) {
          toast.success('User updated successfully')
        }
      }
    )

    watch(
      () => mutation.isError.value,
      (isError) => {
        if (isError) {
          toast.error('Failed to update user')
        }
      }
    )

    return mutation
  }

  // Delete user mutation
  const useDeleteUserMutation = () => {
    const mutation = useMutation({
      mutationFn: (id: number) => usersStore.deleteUser(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] })
      },
    })

    watch(
      () => mutation.isSuccess.value,
      (isSuccess) => {
        if (isSuccess) {
          toast.success('User deleted successfully')
        }
      }
    )

    watch(
      () => mutation.isError.value,
      (isError) => {
        if (isError) {
          toast.error('Failed to delete user')
        }
      }
    )

    return mutation
  }

  return {
    useFetchUsersQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
  }
}
