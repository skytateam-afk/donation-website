import { toast } from 'vue-sonner'

export function useSonner() {
  const success = (message: string, description?: string) => {
    return toast.success(message, {
      description,
    })
  }

  const error = (message: string, description?: string) => {
    return toast.error(message, {
      description,
    })
  }

  const info = (message: string, description?: string) => {
    return toast.info(message, {
      description,
    })
  }

  const warning = (message: string, description?: string) => {
    return toast.warning(message, {
      description,
    })
  }

  const loading = (message: string, description?: string) => {
    return toast.loading(message, {
      description,
    })
  }

  const promise = toast.promise

  return {
    toast,
    success,
    error,
    info,
    warning,
    loading,
    promise,
  }
}
