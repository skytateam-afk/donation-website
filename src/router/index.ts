import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }
    return { top: 0, behavior: 'smooth' }
  },
  routes: [
    // Public routes
    {
      path: '/',
      name: 'home',
      component: () => import('../views/public/Home.vue'),
      meta: {
        title: 'Home - CRRNetwork Donation Platform'
      }
    },
    {
      path: '/campaigns/:slug',
      name: 'campaign-detail',
      component: () => import('../views/public/CampaignDetail.vue'),
      meta: {
        title: 'Campaign Details'
      }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/public/About.vue'),
      meta: {
        title: 'About Us - CRRNetwork'
      }
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('../views/public/Privacy.vue'),
      meta: {
        title: 'Privacy Policy - CRRNetwork'
      }
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('../views/public/Terms.vue'),
      meta: {
        title: 'Terms of Service - CRRNetwork'
      }
    },
    {
      path: '/donation/success',
      name: 'donation-success',
      component: () => import('../views/public/DonationSuccess.vue'),
      meta: {
        title: 'Thank You - Donation Successful'
      }
    },
    {
      path: '/donation/cancel',
      name: 'donation-cancel',
      component: () => import('../views/public/DonationCancel.vue'),
      meta: {
        title: 'Donation Cancelled'
      }
    },
    
    // Admin routes
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('../views/admin/Login.vue'),
      meta: {
        title: 'Admin Login',
        guestOnly: true
      }
    },
    {
      path: '/admin',
      redirect: '/admin/dashboard',
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: () => import('../views/admin/Dashboard.vue'),
      meta: {
        requiresAuth: true,
        title: 'Dashboard',
        breadcrumbs: [{ label: 'Dashboard' }]
      }
    },
    {
      path: '/admin/campaigns',
      name: 'admin-campaigns',
      component: () => import('../views/admin/Campaigns.vue'),
      meta: {
        requiresAuth: true,
        title: 'Campaigns',
        breadcrumbs: [{ label: 'Campaigns' }]
      }
    },
    {
      path: '/admin/campaigns/new',
      name: 'admin-campaign-new',
      component: () => import('../views/admin/CampaignForm.vue'),
      meta: {
        requiresAuth: true,
        title: 'Create Campaign',
        breadcrumbs: [
          { label: 'Campaigns', to: '/admin/campaigns' },
          { label: 'New Campaign' }
        ]
      }
    },
    {
      path: '/admin/campaigns/:id/edit',
      name: 'admin-campaign-edit',
      component: () => import('../views/admin/CampaignForm.vue'),
      meta: {
        requiresAuth: true,
        title: 'Edit Campaign',
        breadcrumbs: [
          { label: 'Campaigns', to: '/admin/campaigns' },
          { label: 'Edit Campaign' }
        ]
      }
    },
    {
      path: '/admin/donations',
      name: 'admin-donations',
      component: () => import('../views/admin/Donations.vue'),
      meta: {
        requiresAuth: true,
        title: 'Donations',
        breadcrumbs: [{ label: 'Donations' }]
      }
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('../views/admin/Users.vue'),
      meta: {
        requiresAuth: true,
        title: 'Users',
        breadcrumbs: [{ label: 'Users' }]
      }
    },
    {
      path: '/admin/profile',
      name: 'admin-profile',
      component: () => import('../views/admin/Profile.vue'),
      meta: {
        requiresAuth: true,
        title: 'Profile',
        breadcrumbs: [{ label: 'Profile' }]
      }
    },
    {
      path: '/admin/notifications',
      name: 'admin-notifications',
      component: () => import('../views/admin/Notifications.vue'),
      meta: {
        requiresAuth: true,
        title: 'Notifications',
        breadcrumbs: [{ label: 'Notifications' }]
      }
    },
    
    // 404 Not Found
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFound.vue'),
      meta: {
        title: 'Page Not Found'
      }
    }
  ]
})

// Navigation guard for protected routes
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Set page title
  document.title = to.meta.title 
    ? `${to.meta.title} - CRRNetwork` 
    : 'CRRNetwork Donation Platform'
  
  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      console.log('Router guard: Authentication required, redirecting to login')
      next({
        name: 'admin-login',
        query: { redirect: to.fullPath }
      })
      return
    }
    
    // Verify token is still valid by checking user data
    if (!authStore.user) {
      try {
        await authStore.fetchProfile()
      } catch (error) {
        console.error('Router guard: Failed to fetch profile, logging out')
        authStore.logout()
        next({
          name: 'admin-login',
          query: { redirect: to.fullPath }
        })
        return
      }
    }
  }
  
  // Redirect authenticated users away from login page
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    console.log('Router guard: Already authenticated, redirecting to dashboard')
    next('/admin/dashboard')
    return
  }
  
  console.log('Router guard: Allowing navigation to', to.path)
  next()
})

export default router
