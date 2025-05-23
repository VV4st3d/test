<template>
  <div class="code-editor-container">
    <div class="flex justify-between items-center mb-2">
      <h3 v-if="title" class="text-lg font-semibold">{{ title }}</h3>
      <div class="flex gap-2">
        <button
          v-if="showReset"
          @click="resetCode"
          class="text-gray-500 hover:text-gray-700 focus:outline-none"
          :title="t('editor.reset')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button
          v-if="showCopy"
          @click="copyCode"
          class="text-gray-500 hover:text-gray-700 focus:outline-none"
          :title="t('editor.copy')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
        </button>
      </div>
    </div>
    <div class="border rounded-md overflow-hidden">
      <div ref="editor" class="w-full h-full"></div>
    </div>
    <div v-if="copied" class="text-green-500 text-sm mt-1 transition-opacity duration-300">
      {{ t('editor.copied') }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { indentOnInput, bracketMatching, foldGutter, indentUnit } from '@codemirror/language'
import { javascript } from '@codemirror/lang-javascript'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { autocompletion, completionKeymap } from '@codemirror/autocomplete'
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'
import { oneDark } from '@codemirror/theme-one-dark'
import { useThemeStore } from '../store/theme'
import { useLanguageStore } from '../store/language'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  initialValue: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  mode: {
    type: String,
    default: 'javascript'
  },
  readOnly: {
    type: Boolean,
    default: false
  },
  showLineNumbers: {
    type: Boolean,
    default: true
  },
  showReset: {
    type: Boolean,
    default: true
  },
  showCopy: {
    type: Boolean,
    default: true
  },
  height: {
    type: String,
    default: '300px'
  },
  placeholder: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const { t } = useLanguageStore()
const { isDark } = useThemeStore()

const editor = ref(null)
const internalValue = ref(props.modelValue || props.initialValue || '')
const copied = ref(false)
let editorView = null

const getLanguageExtension = () => {
  switch (props.mode) {
    case 'html':
    case 'htmlmixed':
      return html()
    case 'css':
      return css()
    case 'javascript':
    default:
      return javascript()
  }
}

onMounted(() => {
  const contentToUse = props.modelValue || props.initialValue || ''
  internalValue.value = contentToUse

  console.log('[CodeEditor] Инициализация редактора с содержимым:', {
    content: contentToUse ? contentToUse.substring(0, 50) + '...' : 'пусто',
    length: contentToUse.length
  })

  const extensions = [
    history(),
    syntaxHighlighting(defaultHighlightStyle),
    indentOnInput(),
    bracketMatching(),
    autocompletion(),
    keymap.of([...defaultKeymap, ...historyKeymap, ...completionKeymap]),
    indentUnit.of('  '),
    EditorState.readOnly.of(props.readOnly),
    getLanguageExtension()
  ]

  if (props.showLineNumbers) {
    extensions.push(lineNumbers(), highlightActiveLineGutter(), foldGutter())
  }

  if (isDark.value) {
    extensions.push(oneDark)
  }

  const state = EditorState.create({
    doc: contentToUse,
    extensions
  })

  editorView = new EditorView({
    state,
    parent: editor.value,
    dispatch: (tr) => {
      editorView.update([tr])
      if (tr.docChanged) {
        const newValue = tr.state.doc.toString()
        internalValue.value = newValue
        emit('update:modelValue', newValue)
        emit('change', newValue)
      }
    }
  })

  nextTick(() => {
    if (editorView && contentToUse && !editorView.state.doc.toString()) {
      console.log('[CodeEditor] Принудительное обновление при монтировании')
      editorView.dispatch({
        changes: { from: 0, to: editorView.state.doc.length, insert: contentToUse }
      })
    }
  })
})

onUnmounted(() => {
  if (editorView) {
    editorView.destroy()
  }
})

watch(() => props.modelValue, (newValue) => {
  if (newValue !== internalValue.value && editorView) {
    const currentValue = editorView.state.doc.toString()
    if (currentValue !== newValue) {
      console.log('[CodeEditor] Обновление содержимого:', {
        newValue: newValue ? newValue.substring(0, 50) + '...' : 'пусто',
        currentValue: currentValue ? currentValue.substring(0, 50) + '...' : 'пусто'
      })
      editorView.dispatch({
        changes: { from: 0, to: currentValue.length, insert: newValue || '' }
      })
      internalValue.value = newValue || ''
    }
  }
})

watch(() => isDark.value, (newValue) => {
  if (editorView) {
    editorView.dispatch({
      effects: newValue ? [oneDark.reconfigure()] : []
    })
  }
})

const forceRefreshContent = () => {
  if (editorView) {
    const currentContent = editorView.state.doc.toString()
    const newContent = props.modelValue || props.initialValue || ''
    
    if (currentContent !== newContent) {
      console.log('[CodeEditor] Принудительное обновление содержимого')
      editorView.dispatch({
        changes: { from: 0, to: currentContent.length, insert: newContent }
      })
      internalValue.value = newContent
    }
  }
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(internalValue.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.error('Ошибка при копировании:', error)
  }
}

const resetCode = () => {
  if (props.initialValue && editorView) {
    editorView.dispatch({
      changes: { from: 0, to: editorView.state.doc.length, insert: props.initialValue }
    })
    internalValue.value = props.initialValue
    emit('update:modelValue', props.initialValue)
    emit('change', props.initialValue)
  }
}

defineExpose({
  forceRefreshContent
})
</script>

<style>
.cm-editor {
  height: v-bind('props.height');
  font-family: 'Fira Code', monospace;
  font-size: 14px;
}
</style>