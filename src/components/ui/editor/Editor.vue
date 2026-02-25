<template>
  <div class="border rounded-md" :class="[borderClass]">
    <!-- Toolbar -->
    <div class="border-b bg-muted/50 p-2 flex flex-wrap gap-1">
      <Button
        v-for="action in toolbarActions"
        :key="action.name"
        type="button"
        variant="ghost"
        size="sm"
        @click="action.command"
        :class="{ 'bg-accent': action.isActive?.() }"
        :title="action.title"
      >
        <component :is="action.icon" class="h-4 w-4" />
      </Button>
    </div>
    
    <!-- Editor Content -->
    <EditorContent 
      :editor="editor" 
      class="prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Heading2,
  Quote,
  Undo,
  Redo
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

interface Props {
  modelValue: string
  placeholder?: string
  error?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Write something...',
  error: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const borderClass = computed(() => 
  props.error ? 'border-destructive' : 'border-input'
)

const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: props.placeholder
    })
  ],
  content: props.modelValue,
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
  editorProps: {
    attributes: {
      class: 'focus:outline-none'
    }
  }
})

const toolbarActions = computed(() => [
  {
    name: 'bold',
    icon: Bold,
    title: 'Bold',
    command: () => editor.value?.chain().focus().toggleBold().run(),
    isActive: () => editor.value?.isActive('bold')
  },
  {
    name: 'italic',
    icon: Italic,
    title: 'Italic',
    command: () => editor.value?.chain().focus().toggleItalic().run(),
    isActive: () => editor.value?.isActive('italic')
  },
  {
    name: 'heading',
    icon: Heading2,
    title: 'Heading',
    command: () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: () => editor.value?.isActive('heading', { level: 2 })
  },
  {
    name: 'bulletList',
    icon: List,
    title: 'Bullet List',
    command: () => editor.value?.chain().focus().toggleBulletList().run(),
    isActive: () => editor.value?.isActive('bulletList')
  },
  {
    name: 'orderedList',
    icon: ListOrdered,
    title: 'Numbered List',
    command: () => editor.value?.chain().focus().toggleOrderedList().run(),
    isActive: () => editor.value?.isActive('orderedList')
  },
  {
    name: 'blockquote',
    icon: Quote,
    title: 'Quote',
    command: () => editor.value?.chain().focus().toggleBlockquote().run(),
    isActive: () => editor.value?.isActive('blockquote')
  },
  {
    name: 'undo',
    icon: Undo,
    title: 'Undo',
    command: () => editor.value?.chain().focus().undo().run(),
    isActive: () => false
  },
  {
    name: 'redo',
    icon: Redo,
    title: 'Redo',
    command: () => editor.value?.chain().focus().redo().run(),
    isActive: () => false
  }
])

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  const isSame = editor.value?.getHTML() === newValue
  if (!isSame && newValue !== editor.value?.getHTML()) {
    editor.value?.commands.setContent(newValue)
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style>
/* TipTap Editor Styles */
.ProseMirror {
  outline: none;
}

.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: hsl(var(--muted-foreground));
  pointer-events: none;
  height: 0;
}

.ProseMirror ul,
.ProseMirror ol {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.ProseMirror ul {
  list-style-type: disc;
}

.ProseMirror ol {
  list-style-type: decimal;
}

.ProseMirror h2 {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0.75rem 0;
}

.ProseMirror blockquote {
  border-left: 3px solid hsl(var(--border));
  padding-left: 1rem;
  margin: 0.5rem 0;
  color: hsl(var(--muted-foreground));
}

.ProseMirror strong {
  font-weight: bold;
}

.ProseMirror em {
  font-style: italic;
}

.ProseMirror p {
  margin: 0.5rem 0;
}
</style>
