import { ref, onMounted, onUnmounted } from 'vue'

const toasts = ref([])
let toastIdCounter = 0

export function useToast() {
  function createToast(message, type, timeout = 3000) {
    const id = toastIdCounter++
    
    const toast = {
      id,
      message,
      type,
      visible: true
    }
    
    toasts.value.push(toast)
    
    setTimeout(() => {
      closeToast(id)
    }, timeout)
    
    return id
  }
  
  function closeToast(id) {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index !== -1) {
      const toast = toasts.value[index]
      toast.visible = false
      
      // Удаляем toast после окончания анимации скрытия
      setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id)
      }, 300)
    }
  }
  
  function success(message, timeout) {
    return createToast(message, 'success', timeout)
  }
  
  function error(message, timeout) {
    return createToast(message, 'error', timeout)
  }
  
  function info(message, timeout) {
    return createToast(message, 'info', timeout)
  }
  
  function warning(message, timeout) {
    return createToast(message, 'warning', timeout)
  }
  
  return {
    toasts,
    success,
    error,
    info,
    warning,
    closeToast
  }
}

// Глобальный singleton для уведомлений
let globalToast

export function useGlobalToast() {
  if (!globalToast) {
    globalToast = useToast()
  }
  return globalToast
} 