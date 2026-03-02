<template>
  <div>
    <BreadCrumbs title="Users Management" main="Admin" />
    
    <div class="container-fluid">
      <div class="row">
        <div class="col-sm-12">
          <DataTable
            title="Users List"
            :headers="headers"
            :items="users"
            :loading="isLoading"
            :items-per-page="filters.per_page"
            :total-items="usersStore.pagination.total"
            :current-page="currentPage"
            :searchable="false"
            @update:current-page="handlePageChange"
          >
            <!-- Left actions slot for filters -->
            <template #actions-left>
              <UserFilters :filters="filters" @update:filters="handleFiltersUpdate" />
            </template>

            <!-- Right actions slot for add button -->
            <template #actions-right>
              <button 
                type="button"
                class="btn btn-primary btn-sm"
                @click="openAddDialog"
              >
                <i class="fa fa-plus me-1"></i>
                Add User
              </button>
            </template>

            <!-- Role column -->
            <template #item.role="{ item }">
              <span class="badge" :class="getRoleBadgeClass(item.role)">
                {{ item.role }}
              </span>
            </template>

            <!-- Actions column -->
            <template #item.actions="{ item }">
              <button
                type="button"
                class="btn btn-sm btn-outline-primary me-1"
                @click="openEditDialog(item)"
                title="Edit"
              >
                <i class="fa fa-pencil"></i>
              </button>
              <button
                type="button"
                class="btn btn-sm btn-outline-danger"
                @click="handleDelete(item)"
                title="Delete"
              >
                <i class="fa fa-trash"></i>
              </button>
            </template>
          </DataTable>
        </div>
      </div>
    </div>

    <!-- Add User Dialog -->
    <div class="modal fade" id="addUserModal" tabindex="-1" aria-labelledby="addUserModalLabel" aria-hidden="true" ref="addModalEl">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addUserModalLabel">Add New User</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form @submit.prevent="handleAdd" class="needs-validation" :class="{ 'was-validated': addFormSubmitted }" novalidate>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label" for="addName">Name</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="addName"
                  v-model="addForm.name"
                  :class="addFormErrors.name ? 'is-invalid' : ''"
                  required
                />
                <div class="invalid-feedback" v-if="addFormErrors.name">{{ addFormErrors.name }}</div>
              </div>
              
              <div class="mb-3">
                <label class="form-label" for="addEmail">Email</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="addEmail"
                  v-model="addForm.email"
                  :class="addFormErrors.email ? 'is-invalid' : ''"
                  required
                />
                <div class="invalid-feedback" v-if="addFormErrors.email">{{ addFormErrors.email }}</div>
              </div>
              
              <div class="mb-3">
                <label class="form-label" for="addPassword">Password</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="addPassword"
                  v-model="addForm.password"
                  :class="addFormErrors.password ? 'is-invalid' : ''"
                  required
                />
                <div class="invalid-feedback" v-if="addFormErrors.password">{{ addFormErrors.password }}</div>
              </div>
              
              <div class="mb-3">
                <label class="form-label" for="addRole">Role</label>
                <select 
                  class="form-select" 
                  id="addRole"
                  v-model="addForm.role"
                  :class="addFormErrors.role ? 'is-invalid' : ''"
                  required
                >
                  <option value="" disabled>Choose...</option>
                  <option v-for="role in roleOptions" :key="role.value" :value="role.value">
                    {{ role.title }}
                  </option>
                </select>
                <div class="invalid-feedback" v-if="addFormErrors.role">{{ addFormErrors.role }}</div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="createMutation.isPending.value">
                <span v-if="createMutation.isPending.value" class="spinner-border spinner-border-sm me-2"></span>
                Add User
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Edit User Dialog -->
    <div class="modal fade" id="editUserModal" tabindex="-1" aria-labelledby="editUserModalLabel" aria-hidden="true" ref="editModalEl">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editUserModalLabel">Edit User</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form @submit.prevent="handleEdit" class="needs-validation" :class="{ 'was-validated': editFormSubmitted }" novalidate>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label" for="editName">Name</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="editName"
                  v-model="editForm.name"
                  :class="editFormErrors.name ? 'is-invalid' : ''"
                  required
                />
                <div class="invalid-feedback" v-if="editFormErrors.name">{{ editFormErrors.name }}</div>
              </div>
              
              <div class="mb-3">
                <label class="form-label" for="editEmail">Email</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="editEmail"
                  v-model="editForm.email"
                  :class="editFormErrors.email ? 'is-invalid' : ''"
                  required
                />
                <div class="invalid-feedback" v-if="editFormErrors.email">{{ editFormErrors.email }}</div>
              </div>
              
              <div class="mb-3">
                <label class="form-label" for="editPassword">Password</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="editPassword"
                  v-model="editForm.password"
                  :class="editFormErrors.password ? 'is-invalid' : ''"
                  placeholder="Leave blank to keep current"
                />
                <div class="small text-muted">Leave blank to keep current password</div>
                <div class="invalid-feedback" v-if="editFormErrors.password">{{ editFormErrors.password }}</div>
              </div>
              
              <div class="mb-3">
                <label class="form-label" for="editRole">Role</label>
                <select 
                  class="form-select" 
                  id="editRole"
                  v-model="editForm.role"
                  :class="editFormErrors.role ? 'is-invalid' : ''"
                  required
                >
                  <option v-for="role in roleOptions" :key="role.value" :value="role.value">
                    {{ role.title }}
                  </option>
                </select>
                <div class="invalid-feedback" v-if="editFormErrors.role">{{ editFormErrors.role }}</div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="updateMutation.isPending.value">
                <span v-if="updateMutation.isPending.value" class="spinner-border spinner-border-sm me-2"></span>
                Update User
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User, UserCreateInput, UserUpdateInput, UsersListParams } from '../../types/user'
import BreadCrumbs from '~/components/breadCrumbs.vue'
import UserFilters from '~/components/filters/UserFilters.vue'
import DataTable from '~/components/tables/DataTable.vue'
import { Modal } from 'bootstrap'

definePageMeta({
  name: 'users',
  path: '/users',
  layout: 'default',
  middleware: 'auth',
  requiresAuth: true,
  public: false,
})

const { setBreadcrumbs } = useBreadcrumbs()
const usersStore = useUsersStore()
const { 
  useFetchUsersQuery, 
  useCreateUserMutation, 
  useUpdateUserMutation, 
  useDeleteUserMutation 
} = useUsers()

// Modal refs
const addModalEl = ref<HTMLElement | null>(null)
const editModalEl = ref<HTMLElement | null>(null)
let addModalInstance: Modal | null = null
let editModalInstance: Modal | null = null

// Set breadcrumbs
setBreadcrumbs([
  { title: 'Home', url: '/dashboard' },
  { title: 'Users', active: true },
])

// Filters
const filters = ref<UsersListParams>({
  page: 1,
  per_page: 10,
  search: '',
  role: '',
})

// Fetch users
const { data: usersData, isLoading, refetch } = useFetchUsersQuery(filters)

const users = computed(() => usersStore.users)
const currentPage = computed(() => filters.value.page)

// Table headers
const headers = [
  { title: 'ID', key: 'id', sortable: false, width: 80 },
  { title: 'NAME', key: 'name', sortable: false },
  { title: 'EMAIL', key: 'email', sortable: false },
  { title: 'ROLE', key: 'role', sortable: false, width: 120 },
  { title: 'ACTIONS', key: 'actions', sortable: false, align: 'end', width: 120 },
]

// Role options
const roleOptions = [
  { title: 'Admin', value: 'admin' },
  { title: 'User', value: 'user' },
  { title: 'Manager', value: 'manager' },
]

// Add dialog
const addFormSubmitted = ref(false)
const addForm = ref<UserCreateInput>({
  name: '',
  email: '',
  password: '',
  role: '',
})
const addFormErrors = ref<Record<string, string>>({})

// Edit dialog
const editFormSubmitted = ref(false)
const editForm = ref<UserUpdateInput & { id?: number }>({
  name: '',
  email: '',
  password: '',
  role: '',
})
const editFormErrors = ref<Record<string, string>>({})

// Initialize Bootstrap modals
onMounted(() => {
  if (addModalEl.value) {
    addModalInstance = new Modal(addModalEl.value)
  }
  if (editModalEl.value) {
    editModalInstance = new Modal(editModalEl.value)
  }
})

onBeforeUnmount(() => {
  addModalInstance?.dispose()
  editModalInstance?.dispose()
})

// Mutations
const createMutation = useCreateUserMutation()
const updateMutation = useUpdateUserMutation()
const deleteMutation = useDeleteUserMutation()

// Handlers
const handleFiltersUpdate = (newFilters: UsersListParams) => {
  filters.value = { ...newFilters, page: 1 }
}

const handlePageChange = (page: number) => {
  filters.value.page = page
}

const openAddDialog = () => {
  addForm.value = {
    name: '',
    email: '',
    password: '',
    role: '',
  }
  addFormErrors.value = {}
  addFormSubmitted.value = false
  addModalInstance?.show()
}

const handleAdd = async () => {
  addFormErrors.value = {}
  addFormSubmitted.value = true
  
  const result = await createMutation.mutateAsync(addForm.value)
  
  if (result.success) {
    addModalInstance?.hide()
    addFormSubmitted.value = false
  } else if (result.errors) {
    Object.keys(result.errors).forEach(key => {
      addFormErrors.value[key] = result.errors![key][0]
    })
  }
}

const openEditDialog = (user: User) => {
  editForm.value = {
    id: user.id,
    name: user.name,
    email: user.email,
    password: '',
    role: user.role,
  }
  editFormErrors.value = {}
  editFormSubmitted.value = false
  editModalInstance?.show()
}

const handleEdit = async () => {
  editFormErrors.value = {}
  editFormSubmitted.value = true
  
  const { id, ...userData } = editForm.value
  
  // Remove password if empty
  if (!userData.password) {
    delete userData.password
  }
  
  const result = await updateMutation.mutateAsync({ 
    id: id!, 
    userData 
  })
  
  if (result.success) {
    editModalInstance?.hide()
    editFormSubmitted.value = false
  } else if (result.errors) {
    Object.keys(result.errors).forEach(key => {
      editFormErrors.value[key] = result.errors![key][0]
    })
  }
}

const handleDelete = async (user: User) => {
  if (confirm(`Are you sure you want to delete ${user.name}?`)) {
    await deleteMutation.mutateAsync(user.id)
  }
}

const getRoleBadgeClass = (role: string) => {
  const classes: Record<string, string> = {
    admin: 'badge-danger',
    manager: 'badge-warning',
    user: 'badge-success',
  }
  return classes[role] || 'badge-secondary'
}
</script>
