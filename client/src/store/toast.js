import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: ref([]),
    idCounter: 0
  }),

  actions: {
    /**
     * Добавляет новое уведомление
     * @param {string} message Текст уведомления
     * @param {string} type Тип уведомления (success, error, info, warning)
     * @param {number} timeout Время в миллисекундах, через которое уведомление скроется
     * @returns {number} ID уведомления
     */
    addToast(message, type = 'info', timeout = 3000) {
      const id = this.idCounter++
      
      const toast = {
        id,
        message,
        type,
        visible: true
      }
      
      this.toasts.push(toast)
      
      if (timeout > 0) {
        setTimeout(() => {
          this.closeToast(id)
        }, timeout)
      }
      
      return id
    },
    
    /**
     * Закрывает уведомление по ID
     * @param {number} id ID уведомления
     */
    closeToast(id) {
      const index = this.toasts.findIndex(toast => toast.id === id)
      if (index !== -1) {
        this.toasts[index].visible = false
        
        // Удаляем toast после окончания анимации скрытия
        setTimeout(() => {
          this.toasts = this.toasts.filter(t => t.id !== id)
        }, 300)
      }
    },
    
    /**
     * Добавляет уведомление об успехе
     * @param {string} message Текст уведомления
     * @param {number} timeout Время в миллисекундах
     * @returns {number} ID уведомления
     */
    success(message, timeout) {
      return this.addToast(message, 'success', timeout)
    },
    
    /**
     * Добавляет уведомление об ошибке
     * @param {string} message Текст уведомления
     * @param {number} timeout Время в миллисекундах
     * @returns {number} ID уведомления
     */
    error(message, timeout) {
      return this.addToast(message, 'error', timeout)
    },
    
    /**
     * Добавляет информационное уведомление
     * @param {string} message Текст уведомления
     * @param {number} timeout Время в миллисекундах
     * @returns {number} ID уведомления
     */
    info(message, timeout) {
      return this.addToast(message, 'info', timeout)
    },
    
    /**
     * Добавляет предупреждающее уведомление
     * @param {string} message Текст уведомления
     * @param {number} timeout Время в миллисекундах
     * @returns {number} ID уведомления
     */
    warning(message, timeout) {
      return this.addToast(message, 'warning', timeout)
    }
  }
}) 