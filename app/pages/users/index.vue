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
            :searchable="true"
            @update:current-page="handlePageChange"
            @update:items-per-page="handleItemsPerPageChange"
            @update:search="handleSearch"
            @update:column-filters="handleColumnFilters"
          >
            <!-- Header actions -->
            <template #header-actions>
              <button 
                type="button"
                class="btn btn-primary"
                @click="openAddDialog"
              >
                <i class="fa fa-plus me-1"></i>
                Add User
              </button>
            </template>

            <!-- Role column -->
            <template #cell-role="{ row }">
              <span class="badge" :class="getRoleBadgeClass(row.original)">
                {{ getUserRoleDisplay(row.original) }}
              </span>
            </template>

            <!-- Status column -->
            <template #cell-is_active="{ row }">
              <span class="badge" :class="row.original.is_active ? 'badge-success' : 'badge-secondary'">
                {{ row.original.is_active ? 'Active' : 'Inactive' }}
              </span>
            </template>

            <!-- Actions column -->
            <template #cell-actions="{ row }">
              <div class="dropstart">
                <button 
                  class="btn btn-sm btn-light border-0 p-1" 
                  type="button" 
                  :id="`dropdown-${row.original.id}`"
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                  style="width: 30px; height: 30px; line-height: 1;"
                >
                  <i class="fa fa-ellipsis-v"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-sm" :aria-labelledby="`dropdown-${row.original.id}`">
                  <li>
                    <a class="dropdown-item dropdown-item-sm" href="#" @click.prevent="openEditDialog(row.original)">
                      <i class="fa fa-pencil me-2"></i>Edit
                    </a>
                  </li>
                  <li><hr class="dropdown-divider my-1"></li>
                  <li>
                    <a class="dropdown-item dropdown-item-sm text-danger" href="#" @click.prevent="handleDelete(row.original)">
                      <i class="fa fa-trash me-2"></i>Delete
                    </a>
                  </li>
                </ul>
              </div>
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
                <label class="form-label" for="addName">Full Name</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="addName"
                  v-model="addForm.full_name"
                  :class="createMutation.getFieldError('full_name') ? 'is-invalid' : ''"
                  required
                />
                <div class="invalid-feedback" v-if="createMutation.getFieldError('full_name')">{{ createMutation.getFieldError('full_name') }}</div>
              </div>
              
              <div class="mb-3">
                <label class="form-label" for="addEmail">Email</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="addEmail"
                  v-model="addForm.email"
                  :class="createMutation.getFieldError('email') ? 'is-invalid' : ''"
                  required
                />
                <div class="invalid-feedback" v-if="createMutation.getFieldError('email')">{{ createMutation.getFieldError('email') }}</div>
              </div>
              
              <div class="mb-3">
                <label class="form-label" for="addPassword">Password</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="addPassword"
                  v-model="addForm.password"
                  :class="createMutation.getFieldError('password') ? 'is-invalid' : ''"
                  required
                />
                <div class="invalid-feedback" v-if="createMutation.getFieldError('password')">{{ createMutation.getFieldError('password') }}</div>
              </div>
              
              <div class="mb-3">
                <label class="form-label" for="addRole">Role</label>
                <select 
                  class="form-select" 
                  id="addRole"
                  v-model="selectedAddRole"
                  :class="createMutation.getFieldError('role_ids') ? 'is-invalid' : ''"
                  required
                >
                  <option :value="undefined" disabled>Choose...</option>
                  <option v-for="role in roleOptions" :key="role.value" :value="role.value">
                    {{ role.title }}
                  </option>
                </select>
                <div class="invalid-feedback" v-if="createMutation.getFieldError('role_ids')">{{ createMutation.getFieldError('role_ids') }}</div>
              </div>
              
              <div class="mb-3">
                <label class="form-label" for="addActive">Status</label>
                <select 
                  class="form-select" 
                  id="addActive"
                  v-model="addForm.is_active"
                  :class="createMutation.getFieldError('is_active') ? 'is-invalid' : ''"
                  required
                >
                  <option :value="1">Active</option>
                  <option :value="0">Inactive</option>
                </select>
                <div class="invalid-feedback" v-if="createMutation.getFieldError('is_active')">{{ createMutation.getFieldError('is_active') }}</div>
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
                <label class="form-label" for="editName">Full Name</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="editName"
                  v-model="editForm.full_name"
                  :class="updateMutation.getFieldError('full_name') ? 'is-invalid' : ''"
                  required
                />
                <div class="invalid-feedback" v-if="updateMutation.getFieldError('full_name')">{{ updateMutation.getFieldError('full_name') }}</div>
              </div>
              
              <div class="mb-3">
                <label class="form-label" for="editEmail">Email</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="editEmail"
                  v-model="editForm.email"
                  :class="updateMutation.getFieldError('email') ? 'is-invalid' : ''"
                  required
                />
                <div class="invalid-feedback" v-if="updateMutation.getFieldError('email')">{{ updateMutation.getFieldError('email') }}</div>
              </div>
              
              <div class="mb-3">
                <label class="form-label" for="editPassword">Password</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="editPassword"
                  v-model="editForm.password"
                  :class="updateMutation.getFieldError('password') ? 'is-invalid' : ''"
                  placeholder="Leave blank to keep current"
                />
                <div class="small text-muted">Leave blank to keep current password</div>
                <div class="invalid-feedback" v-if="updateMutation.getFieldError('password')">{{ updateMutation.getFieldError('password') }}</div>
              </div>
              
              <div class="mb-3">
                <label class="form-label" for="editRole">Role</label>
                <select 
                  class="form-select" 
                  id="editRole"
                  v-model="selectedEditRole"
                  :class="updateMutation.getFieldError('role_ids') ? 'is-invalid' : ''"
                  required
                >
                  <option v-for="role in roleOptions" :key="role.value" :value="role.value">
                    {{ role.title }}
                  </option>
                </select>
                <div class="invalid-feedback" v-if="updateMutation.getFieldError('role_ids')">{{ updateMutation.getFieldError('role_ids') }}</div>
              </div>
              
              <div class="mb-3">
                <label class="form-label" for="editActive">Status</label>
                <select 
                  class="form-select" 
                  id="editActive"
                  v-model="editForm.is_active"
                  :class="updateMutation.getFieldError('is_active') ? 'is-invalid' : ''"
                  required
                >
                  <option :value="1">Active</option>
                  <option :value="0">Inactive</option>
                </select>
                <div class="invalid-feedback" v-if="updateMutation.getFieldError('is_active')">{{ updateMutation.getFieldError('is_active') }}</div>
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
  { title: 'NAME', key: 'full_name', sortable: false, filterable: true },
  { title: 'EMAIL', key: 'email', sortable: false, filterable: true },
  { title: 'ROLE', key: 'role', sortable: false, width: 120 },
  { title: 'STATUS', key: 'is_active', sortable: false, width: 100 },
  { title: 'ACTIONS', key: 'actions', sortable: false, align: 'center', width: 60 },
]

// Role options
const roleOptions = [
  { title: 'Admin', value: 1 },
  { title: 'User', value: 2 },
  { title: 'Manager', value: 3 },
]

// Add dialog
const addFormSubmitted = ref(false)
const addForm = ref<UserCreateInput>({
  full_name: '',
  email: '',
  password: '',
  is_active: 1,
  role_ids: [],
})

// Edit dialog
const editFormSubmitted = ref(false)
const editForm = ref<UserUpdateInput & { id?: number }>({
  full_name: '',
  email: '',
  password: '',
  is_active: 1,
  role_ids: [],
})

// Computed properties for role selection
const selectedAddRole = computed({
  get: () => addForm.value.role_ids[0],
  set: (value) => {
    if (value !== undefined) {
      addForm.value.role_ids = [value]
    }
  },
})

const selectedEditRole = computed({
  get: () => editForm.value.role_ids?.[0],
  set: (value) => {
    if (value !== undefined) {
      editForm.value.role_ids = [value]
    }
  },
})

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
const handlePageChange = (page: number) => {
  filters.value.page = page
}

const handleItemsPerPageChange = (perPage: number) => {
  filters.value.per_page = perPage
  filters.value.page = 1
}

const handleSearch = (search: string) => {
  filters.value.search = search
  filters.value.page = 1
}

const handleColumnFilters = (columnFilters: Record<string, string>) => {
  // Handle column-specific filters if needed
  // For now, we can merge them into the search or handle separately
  console.log('Column filters:', columnFilters)
  filters.value.page = 1
}

const openAddDialog = () => {
  addForm.value = {
    full_name: '',
    email: '',
    password: '',
    is_active: 1,
    role_ids: [],
  }
  addFormSubmitted.value = false
  createMutation.reset()
  addModalInstance?.show()
}

const handleAdd = async () => {
  addFormSubmitted.value = true
  
  try {
    await createMutation.mutateAsync(addForm.value)
    addModalInstance?.hide()
    addFormSubmitted.value = false
  } catch (error: any) {
    // Error handling is done in composable
    addFormSubmitted.value = false
  }
}

const openEditDialog = (user: User) => {
  editForm.value = {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    password: '',
    is_active: user.is_active,
    role_ids: user.role_ids || [],
  }
  editFormSubmitted.value = false
  updateMutation.reset()
  editModalInstance?.show()
}

const handleEdit = async () => {
  editFormSubmitted.value = true
  
  const { id, ...userData } = editForm.value
  
  // Remove password if empty
  if (!userData.password) {
    delete userData.password
  }
  
  try {
    await updateMutation.mutateAsync({ 
      id: id!, 
      userData 
    })
    editModalInstance?.hide()
    editFormSubmitted.value = false
  } catch (error: any) {
    // Error handling is done in composable
    editFormSubmitted.value = false
  }
}

const handleDelete = async (user: User) => {
  if (confirm(`Are you sure you want to delete ${user.full_name}?`)) {
    await deleteMutation.mutateAsync(user.id)
  }
}

const getRoleBadgeClass = (user: User) => {
  const firstRole = user.roles?.[0]?.name || 'user'
  const classes: Record<string, string> = {
    admin: 'badge-danger',
    manager: 'badge-warning',
    user: 'badge-success',
  }
  return classes[firstRole.toLowerCase()] || 'badge-secondary'
}

const getUserRoleDisplay = (user: User) => {
  return user.roles?.map(r => r.name).join(', ') || 'N/A'
}
</script>

<style scoped>
/* Compact dropdown styling */
.dropdown-menu-sm {
  min-width: 8rem;
  font-size: 0.875rem;
}

.dropdown-item-sm {
  padding: 0.4rem 1rem;
  font-size: 0.875rem;
}

.dropdown-item-sm i {
  font-size: 0.875rem;
  width: 16px;
}

/* Make sure dropdown button doesn't overflow */
.dropstart .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.dropstart .btn:focus {
  box-shadow: none;
}

.dropstart .btn:hover {
  background-color: #e9ecef;
}
</style>
