import { useToast as useToastPrimitive } from '@/components/ui/toast/use-toast'

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export function useToast() {
  const { toast } = useToastPrimitive()

  return {
    success: (message: string, duration = 3000) => {
      toast({
        title: 'Success',
        description: message,
        duration,
      })
    },
    error: (message: string, duration = 4000) => {
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
        duration,
      })
    },
    info: (message: string, duration = 3000) => {
      toast({
        title: 'Info',
        description: message,
        duration,
      })
    },
    warning: (message: string, duration = 3500) => {
      toast({
        title: 'Warning',
        description: message,
        duration,
      })
    },
  };
}
