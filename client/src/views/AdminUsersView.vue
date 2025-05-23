<template>
  <div class="admin-users">
    <h1 class="text-2xl font-bold mb-4">{{ t('admin.users.title') }}</h1>
    
    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-6">
      <div class="flex justify-between items-center mb-4">
        <div class="relative">
          <input
            type="text"
            v-model="searchTerm"
            class="block w-64 p-2 pl-10 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            :placeholder="t('admin.searchPlaceholder')"
          />
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{{ t('admin.users.table.id') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{{ t('admin.users.table.name') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{{ t('admin.users.table.email') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{{ t('admin.users.table.role') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{{ t('admin.users.table.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="user in filteredUsers" :key="user._id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ user._id.slice(-6) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ user.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span 
                  :class="user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'" 
                  class="px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex space-x-2">
                  <button 
                    v-if="user.role !== 'admin'"
                    @click="changeRole(user._id, 'admin')" 
                    class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    :title="t('admin.users.actions.makeAdmin')"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </button>
                  <button 
                    v-if="user.role === 'admin' && user._id !== currentUserId" 
                    @click="changeRole(user._id, 'user')" 
                    class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                    :title="t('admin.users.actions.makeUser')"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                  <button 
                    v-if="user._id !== currentUserId"
                    @click="confirmDeleteUser(user)" 
                    class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    :title="t('admin.users.actions.delete')"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                {{ t('admin.noUsersFound') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex justify-center mt-4" v-if="totalPages > 1">
        <nav class="flex space-x-2">
          <button 
            @click="page = page - 1" 
            :disabled="page === 1"
            class="px-3 py-1 rounded-md bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 disabled:opacity-50"
          >
            &laquo;
          </button>
          <button 
            v-for="p in totalPages" 
            :key="p" 
            @click="page = p"
            :class="page === p ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'"
            class="px-3 py-1 rounded-md"
          >
            {{ p }}
          </button>
          <button 
            @click="page = page + 1" 
            :disabled="page === totalPages || totalPages === 0"
            class="px-3 py-1 rounded-md bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 disabled:opacity-50"
          >
            &raquo;
          </button>
        </nav>
      </div>
    </div>

    <!-- Модальное окно подтверждения удаления -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">{{ t('admin.users.confirmDelete') }}</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-4">{{ userToDelete?.name }} ({{ userToDelete?.email }})</p>
        <div class="flex justify-end space-x-3">
          <button 
            @click="showDeleteModal = false" 
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            {{ t('common.cancel') }}
          </button>
          <button 
            @click="deleteUser" 
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            {{ t('common.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from '@/composables/toast'
import { useAuthStore } from '@/store/auth'
import { useLanguageStore } from '@/store/language'
import axios from 'axios'

const toast = useToast()
const authStore = useAuthStore()
const languageStore = useLanguageStore()
const t = (key) => languageStore.t(key)
const currentUserId = ref('')

const users = ref([])
const searchTerm = ref('')
const page = ref(1)
const limit = ref(10)
const totalUsers = ref(0)
const totalPages = computed(() => Math.ceil(totalUsers.value / limit.value))

const showDeleteModal = ref(false)
const userToDelete = ref(null)

const filteredUsers = computed(() => {
  if (!searchTerm.value) return users.value
  
  const term = searchTerm.value.toLowerCase()
  return users.value.filter(user => 
    user.name.toLowerCase().includes(term) || 
    user.email.toLowerCase().includes(term) ||
    user._id.toLowerCase().includes(term) ||
    user.role.toLowerCase().includes(term)
  )
})

onMounted(async () => {
  currentUserId.value = authStore.user?._id || ''
  await loadUsers()
})

async function loadUsers() {
  try {
    const response = await axios.get(`/api/users?page=${page.value}&limit=${limit.value}`)
    users.value = response.data.users
    totalUsers.value = response.data.total
  } catch (error) {
    toast.error(t('notifications.error'))
    console.error('Failed to load users:', error)
  }
}

async function changeRole(userId, newRole) {
  try {
    await axios.put(`/api/users/${userId}/role`, { role: newRole })
    toast.success(newRole === 'admin' 
      ? t('admin.users.userUpdated') 
      : t('admin.users.userUpdated'))
    await loadUsers()
  } catch (error) {
    toast.error(t('notifications.error'))
    console.error('Failed to change user role:', error)
  }
}

function confirmDeleteUser(user) {
  userToDelete.value = user
  showDeleteModal.value = true
}

async function deleteUser() {
  if (!userToDelete.value) return
  
  try {
    await axios.delete(`/api/users/${userToDelete.value._id}`)
    toast.success(t('admin.users.userDeleted'))
    showDeleteModal.value = false
    userToDelete.value = null
    await loadUsers()
  } catch (error) {
    toast.error(t('notifications.error'))
    console.error('Failed to delete user:', error)
  }
}
</script> 