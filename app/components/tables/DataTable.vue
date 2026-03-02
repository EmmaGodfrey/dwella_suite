<template>
  <div class="card">
    <div class="card-header pb-0" v-if="title || $slots.header">
      <slot name="header">
        <h4>{{ title }}</h4>
        <span v-if="description">{{ description }}</span>
      </slot>
    </div>
    <div class="card-body">
      <div class="table-responsive data-table custom-scrollbar">
        <!-- Top Actions Section -->
        <div class="mb-3 row">
          <!-- Left side actions slot -->
          <div class="col-md-6 d-flex align-items-center gap-2">
            <slot name="actions-left"></slot>
          </div>
          
          <!-- Right side actions + search -->
          <div class="col-md-6 d-flex justify-content-end align-items-center gap-2">
            <slot name="actions-right"></slot>
            
            <div class="d-flex align-items-center" v-if="searchable">
              <label for="table-search" class="col-form-label me-2 mb-0">Search:</label>
              <input 
                id="table-search" 
                type="text" 
                class="form-control form-control-sm" 
                v-model="localSearch"
                :placeholder="searchPlaceholder"
                style="min-width: 200px;"
              />
            </div>
          </div>
        </div>

        <!-- Bootstrap Table -->
        <div class="table-responsive">
          <table class="table table-striped table-bordered">
            <thead>
              <tr>
                <th v-for="header in headers" :key="header.key" :style="header.width ? `width: ${header.width}px` : ''">
                  {{ header.title }}
                </th>
              </tr>
            </thead>
            <tbody v-if="loading">
              <tr>
                <td :colspan="headers.length" class="text-center py-4">
                  <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                  Loading...
                </td>
              </tr>
            </tbody>
            <tbody v-else-if="!displayItems.length">
              <tr>
                <td :colspan="headers.length" class="text-center text-muted py-4">
                  No data available
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr v-for="(item, index) in displayItems" :key="item.id || index">
                <td v-for="header in headers" :key="header.key">
                  <!-- Check if there's a custom slot for this column -->
                  <slot 
                    v-if="$slots[`item.${header.key}`]" 
                    :name="`item.${header.key}`" 
                    :item="item"
                  />
                  <!-- Otherwise show the value -->
                  <template v-else>
                    {{ getNestedValue(item, header.key) }}
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Custom Pagination -->
        <div class="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
          <div class="text-muted" v-if="showPaginationInfo">
            Showing {{ paginationFrom }} to {{ paginationTo }} of {{ totalItems }} entries
          </div>
          
          <ul class="pagination pagination-primary mb-0" v-if="totalPages > 1">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" @click.prevent="goToPage(currentPage - 1)" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
              </a>
            </li>
            
            <template v-for="page in displayedPages" :key="page">
              <li 
                v-if="page !== '...'" 
                class="page-item" 
                :class="{ active: page === currentPage }"
              >
                <a class="page-link" @click.prevent="goToPage(page as number)">{{ page }}</a>
              </li>
              <li v-else class="page-item disabled">
                <span class="page-link">...</span>
              </li>
            </template>
            
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" @click.prevent="goToPage(currentPage + 1)" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  description?: string
  headers: any[]
  items: any[]
  loading?: boolean
  itemsPerPage?: number
  totalItems?: number
  currentPage?: number
  searchable?: boolean
  searchPlaceholder?: string
  showPaginationInfo?: boolean
  tableClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  itemsPerPage: 10,
  currentPage: 1,
  searchable: true,
  searchPlaceholder: 'Search...',
  showPaginationInfo: true,
  tableClass: '',
})

const emit = defineEmits<{
  'update:currentPage': [page: number]
  'update:search': [search: string]
}>()

const localSearch = ref('')

// Display items for VDataTable
const displayItems = computed(() => {
  // For server-side pagination, return items as is
  if (props.totalItems) {
    return props.items
  }
  
  // For client-side, VDataTable handles pagination
  return props.items
})

const totalPages = computed(() => {
  const total = props.totalItems || props.items.length
  if (total === 0) return 1
  return Math.ceil(total / props.itemsPerPage)
})

const paginationFrom = computed(() => {
  if (!props.items.length) return 0
  return (props.currentPage - 1) * props.itemsPerPage + 1
})

const paginationTo = computed(() => {
  const to = props.currentPage * props.itemsPerPage
  const total = props.totalItems || props.items.length
  return to > total ? total : to
})

const displayedPages = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = props.currentPage
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    
    if (current > 3) {
      pages.push('...')
    }
    
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    if (current < total - 2) {
      pages.push('...')
    }
    
    pages.push(total)
  }
  
  return pages
})

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    emit('update:currentPage', page)
  }
}

watch(localSearch, (value) => {
  emit('update:search', value)
})

// Helper to get nested values (e.g., "user.name")
function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
}

.pagination {
  margin-bottom: 0;
}

.page-link {
  cursor: pointer;
}

.page-item.disabled .page-link {
  cursor: not-allowed;
}

/* Make VDataTable work with Bootstrap styles */
:deep(.v-table) {
  background: transparent !important;
}

:deep(.v-table > .v-table__wrapper > table) {
  width: 100%;
}

:deep(.v-table > .v-table__.wrapper > table > thead > tr > th) {
  background-color: #f8f9fa !important;
  font-weight: 600 !important;
  text-transform: uppercase;
  font-size: 12px !important;
  padding: 12px 8px !important;
  border: 1px solid #dee2e6 !important;
  color: #212529 !important;
}

:deep(.v-table > .v-table__wrapper > table > tbody > tr > td) {
  padding: 12px 8px !important;
  border: 1px solid #dee2e6 !important;
}

:deep(.v-table > .v-table__wrapper > table > tbody > tr:nth-child(odd)) {
  background-color: #f8f9fa;
}

:deep(.v-table > .v-table__wrapper > table > tbody > tr:hover) {
  background-color: #e9ecef !important;
}

:deep(.v-data-table-footer) {
  display: none;
}
</style>
