<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        :class="['toast', `toast-${toast.type}`, { 'toast-visible': toast.visible }]"
        @click="toastStore.closeToast(toast.id)"
      >
        <div class="toast-icon">
          <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-if="toast.type === 'error'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <svg v-if="toast.type === 'info'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-if="toast.type === 'warning'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div class="toast-content">{{ toast.message }}</div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToastStore } from '@/store/toast'

const toastStore = useToastStore()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 350px;
}

.toast {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  margin-bottom: 8px;
  transform: translateX(120%);
  opacity: 0;
  transition: all 0.3s ease;
}

.toast-visible {
  transform: translateX(0);
  opacity: 1;
}

.toast-success {
  background-color: #edfdf5;
  color: #0d9f6e;
  border-left: 4px solid #0d9f6e;
}

.toast-error {
  background-color: #fdf2f2;
  color: #f05252;
  border-left: 4px solid #f05252;
}

.toast-info {
  background-color: #ebf5ff;
  color: #3f83f8;
  border-left: 4px solid #3f83f8;
}

.toast-warning {
  background-color: #fdfdea;
  color: #c27803;
  border-left: 4px solid #c27803;
}

.toast-icon {
  margin-right: 8px;
  display: flex;
  align-items: center;
}

.toast-content {
  flex: 1;
}

/* Анимации для transition-group */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@media (prefers-color-scheme: dark) {
  .toast-success {
    background-color: rgba(13, 159, 110, 0.2);
    color: #34d399;
  }
  
  .toast-error {
    background-color: rgba(240, 82, 82, 0.2);
    color: #f87171;
  }
  
  .toast-info {
    background-color: rgba(63, 131, 248, 0.2);
    color: #60a5fa;
  }
  
  .toast-warning {
    background-color: rgba(194, 120, 3, 0.2);
    color: #fbbf24;
  }
}
</style> 