<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">{{ title }}</h3>
      <p class="text-gray-500 dark:text-gray-400 mb-4">{{ message }}</p>
      <div class="flex justify-end space-x-3">
        <button 
          @click="cancel" 
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          {{ cancelText }}
        </button>
        <button 
          @click="confirm" 
          :class="[
            'px-4 py-2 text-sm font-medium text-white rounded-md',
            confirmType === 'danger' 
              ? 'bg-red-600 hover:bg-red-700' 
              : confirmType === 'primary' 
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-green-600 hover:bg-green-700'
          ]"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Подтвердить'
  },
  cancelText: {
    type: String,
    default: 'Отмена'
  },
  confirmType: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'success', 'danger'].includes(value)
  }
});

const emit = defineEmits(['confirm', 'cancel']);

const confirm = () => {
  emit('confirm');
};

const cancel = () => {
  emit('cancel');
};
</script> 