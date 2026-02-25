import { ref } from 'vue'

export type ToastVariant = 'default' | 'destructive'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

const toasts = ref<Toast[]>([])
let toastIdCounter = 0

export function useToast() {
  const toast = (props: Omit<Toast, 'id'> | string) => {
    const id = `toast-${++toastIdCounter}`
    
    // Handle string input for simple messages
    const toastProps = typeof props === 'string' 
      ? { description: props }
      : props
    
    const duration = toastProps.duration ?? 3000

    const newToast: Toast = {
      id,
      ...toastProps,
    }

    toasts.value.push(newToast)

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        dismiss(id)
      }, duration)
    }

    return id
  }

  const success = (message: string, title?: string) => {
    return toast({
      title: title || 'Success',
      description: message,
      variant: 'default',
    })
  }

  const error = (message: string, title?: string) => {
    return toast({
      title: title || 'Error',
      description: message,
      variant: 'destructive',
    })
  }

  const info = (message: string, title?: string) => {
    return toast({
      title: title || 'Info',
      description: message,
      variant: 'default',
    })
  }

  const warning = (message: string, title?: string) => {
    return toast({
      title: title || 'Warning',
      description: message,
      variant: 'default',
    })
  }

  const dismiss = (id: string) => {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  return {
    toast,
    success,
    error,
    info,
    warning,
    toasts,
    dismiss,
  }
}
