<template>
  <button
    :class="classes"
    :disabled="disabled || loading"
    :type="type"
    @click="$emit('click')"
  >
    <span v-if="loading" class="mr-2">
      <svg class="animate-spin -ml-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </span>
    <slot></slot>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  primary: Boolean,
  secondary: Boolean,
  success: Boolean,
  danger: Boolean,
  warning: Boolean,
  disabled: Boolean,
  loading: Boolean,
  outline: Boolean,
  small: Boolean,
  large: Boolean,
  block: Boolean,
  type: {
    type: String,
    default: 'button'
  }
})

defineEmits(['click'])

const classes = computed(() => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md border font-medium focus:outline-none transition-all duration-200'
  
  const sizeClasses = props.small
    ? 'px-3 py-1 text-sm'
    : props.large
      ? 'px-6 py-3 text-lg'
      : 'px-4 py-2 text-base'
  
  const blockClass = props.block ? 'w-full' : ''
  
  const variantClasses = props.outline
    ? getOutlineClasses()
    : getSolidClasses()
  
  const disabledClasses = props.disabled || props.loading
    ? 'opacity-70 cursor-not-allowed'
    : 'hover:brightness-110 active:brightness-90'
  
  return [baseClasses, sizeClasses, blockClass, variantClasses, disabledClasses].join(' ')
})

function getSolidClasses() {
  if (props.primary) return 'bg-primary border-primary text-white'
  if (props.secondary) return 'bg-secondary border-secondary text-white'
  if (props.success) return 'bg-success border-success text-white'
  if (props.danger) return 'bg-error border-error text-white'
  if (props.warning) return 'bg-warning border-warning text-white'
  return 'bg-gray-200 border-gray-200 text-gray-800 dark:bg-gray-700 dark:border-gray-700 dark:text-white'
}

function getOutlineClasses() {
  if (props.primary) return 'bg-transparent border-primary text-primary hover:bg-primary/10'
  if (props.secondary) return 'bg-transparent border-secondary text-secondary hover:bg-secondary/10'
  if (props.success) return 'bg-transparent border-success text-success hover:bg-success/10'
  if (props.danger) return 'bg-transparent border-error text-error hover:bg-error/10'
  if (props.warning) return 'bg-transparent border-warning text-warning hover:bg-warning/10'
  return 'bg-transparent border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
}
</script> 