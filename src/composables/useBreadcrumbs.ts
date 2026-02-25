import { computed } from 'vue'
import { useRoute } from 'vue-router'

export interface BreadcrumbItem {
  label: string
  to?: string
}

export function useBreadcrumbs() {
  const route = useRoute()

  const breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', to: '/dashboard' }
    ]

    // Add breadcrumbs based on route meta or path
    if (route.meta.breadcrumbs) {
      items.push(...(route.meta.breadcrumbs as BreadcrumbItem[]))
    } else {
      // Generate breadcrumbs from path
      const pathSegments = route.path.split('/').filter(Boolean)
      
      pathSegments.forEach((segment, index) => {
        const path = '/' + pathSegments.slice(0, index + 1).join('/')
        const label = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
        
        // Don't add link for the current page (last item)
        if (index === pathSegments.length - 1) {
          items.push({ label })
        } else {
          items.push({ label, to: path })
        }
      })
    }

    return items
  })

  return {
    breadcrumbs
  }
}
