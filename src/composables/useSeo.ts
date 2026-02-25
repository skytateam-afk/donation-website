import { watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'

export interface SeoMeta {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: string
  author?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
  canonical?: string
  noindex?: boolean
  nofollow?: boolean
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  twitterSite?: string
  twitterCreator?: string
  structuredData?: Record<string, any>
}

const defaultMeta: SeoMeta = {
  title: 'ReferralAI - Powerful Referral Management & Tracking Platform',
  description: 'Track and manage referral codes with ease. Real-time analytics, multi-platform support, fraud detection, and comprehensive dashboards for your referral program.',
  keywords: 'referral management, referral tracking, referral codes, analytics, fraud detection, referral program, affiliate tracking, conversion tracking',
  image: 'https://referralai.com/og-image.png',
  url: 'https://referralai.com/',
  type: 'website',
  author: 'ReferralAI Inc.',
  twitterCard: 'summary_large_image',
  twitterSite: '@referralai',
  twitterCreator: '@referralai'
}

export function useSeo(meta?: SeoMeta) {
  const route = useRoute()

  const updateMeta = (newMeta?: SeoMeta) => {
    const finalMeta = { ...defaultMeta, ...newMeta }
    
    // Update title
    if (finalMeta.title) {
      document.title = finalMeta.title
      updateMetaTag('name', 'title', finalMeta.title)
      updateMetaTag('property', 'og:title', finalMeta.title)
      updateMetaTag('property', 'twitter:title', finalMeta.title)
    }

    // Update description
    if (finalMeta.description) {
      updateMetaTag('name', 'description', finalMeta.description)
      updateMetaTag('property', 'og:description', finalMeta.description)
      updateMetaTag('property', 'twitter:description', finalMeta.description)
    }

    // Update keywords
    if (finalMeta.keywords) {
      updateMetaTag('name', 'keywords', finalMeta.keywords)
    }

    // Update author
    if (finalMeta.author) {
      updateMetaTag('name', 'author', finalMeta.author)
    }

    // Update image
    if (finalMeta.image) {
      updateMetaTag('property', 'og:image', finalMeta.image)
      updateMetaTag('property', 'twitter:image', finalMeta.image)
    }

    // Update URL
    const currentUrl = finalMeta.url || `https://referralai.com${route.path}`
    updateMetaTag('property', 'og:url', currentUrl)
    updateMetaTag('property', 'twitter:url', currentUrl)

    // Update canonical
    updateCanonical(finalMeta.canonical || currentUrl)

    // Update type
    if (finalMeta.type) {
      updateMetaTag('property', 'og:type', finalMeta.type)
    }

    // Update Twitter card type
    if (finalMeta.twitterCard) {
      updateMetaTag('property', 'twitter:card', finalMeta.twitterCard)
    }

    // Update Twitter site
    if (finalMeta.twitterSite) {
      updateMetaTag('property', 'twitter:site', finalMeta.twitterSite)
    }

    // Update Twitter creator
    if (finalMeta.twitterCreator) {
      updateMetaTag('property', 'twitter:creator', finalMeta.twitterCreator)
    }

    // Update published time
    if (finalMeta.publishedTime) {
      updateMetaTag('property', 'article:published_time', finalMeta.publishedTime)
    }

    // Update modified time
    if (finalMeta.modifiedTime) {
      updateMetaTag('property', 'article:modified_time', finalMeta.modifiedTime)
    }

    // Update section
    if (finalMeta.section) {
      updateMetaTag('property', 'article:section', finalMeta.section)
    }

    // Update tags
    if (finalMeta.tags && finalMeta.tags.length > 0) {
      // Remove existing article:tag meta tags
      const existingTags = document.querySelectorAll('meta[property="article:tag"]')
      existingTags.forEach(tag => tag.remove())
      
      // Add new tags
      finalMeta.tags.forEach(tag => {
        const metaTag = document.createElement('meta')
        metaTag.setAttribute('property', 'article:tag')
        metaTag.setAttribute('content', tag)
        document.head.appendChild(metaTag)
      })
    }

    // Update robots
    const robotsContent = []
    if (finalMeta.noindex) robotsContent.push('noindex')
    else robotsContent.push('index')
    
    if (finalMeta.nofollow) robotsContent.push('nofollow')
    else robotsContent.push('follow')
    
    updateMetaTag('name', 'robots', robotsContent.join(', '))

    // Update structured data
    if (finalMeta.structuredData) {
      updateStructuredData(finalMeta.structuredData)
    }
  }

  const updateMetaTag = (attribute: string, key: string, content: string) => {
    let element = document.querySelector(`meta[${attribute}="${key}"]`)
    
    if (!element) {
      element = document.createElement('meta')
      element.setAttribute(attribute, key)
      document.head.appendChild(element)
    }
    
    element.setAttribute('content', content)
  }

  const updateCanonical = (url: string) => {
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
    
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      document.head.appendChild(link)
    }
    
    link.setAttribute('href', url)
  }

  const updateStructuredData = (data: Record<string, any>) => {
    // Remove existing structured data script for this page
    const existingScript = document.querySelector('script[data-vue-seo]')
    if (existingScript) {
      existingScript.remove()
    }

    // Add new structured data
    const script = document.createElement('script')
    script.setAttribute('type', 'application/ld+json')
    script.setAttribute('data-vue-seo', 'true')
    script.textContent = JSON.stringify(data)
    document.head.appendChild(script)
  }

  // Update meta on mount
  onMounted(() => {
    updateMeta(meta)
  })

  // Watch for route changes
  watch(() => route.path, () => {
    updateMeta(meta)
  })

  return {
    updateMeta
  }
}

// Route-specific SEO configurations
export const routeSeoConfig: Record<string, SeoMeta> = {
  '/': {
    title: 'ReferralAI - Powerful Referral Management & Tracking Platform',
    description: 'Track and manage referral codes with ease. Real-time analytics, multi-platform support, fraud detection, and comprehensive dashboards for your referral program.',
    keywords: 'referral management, referral tracking, referral codes, analytics, fraud detection, referral program, affiliate tracking, conversion tracking',
    type: 'website'
  },
  '/pricing': {
    title: 'Pricing Plans - ReferralAI',
    description: 'Choose the perfect plan for your referral program. Flexible pricing options for businesses of all sizes with powerful features and analytics.',
    keywords: 'referral pricing, referral plans, referral program cost, affiliate program pricing, referral software pricing',
    type: 'website'
  },
  '/about': {
    title: 'About Us - ReferralAI',
    description: 'Learn about ReferralAI and our mission to help businesses grow through powerful referral management and tracking solutions.',
    keywords: 'about referralai, referral platform, referral management company, about us',
    type: 'website'
  },
  '/docs': {
    title: 'Documentation - ReferralAI',
    description: 'Complete documentation for integrating and using ReferralAI. API references, guides, and tutorials for developers.',
    keywords: 'referral api documentation, referral integration guide, referral api reference, developer docs',
    type: 'website'
  },
  '/demo': {
    title: 'Live Demo - ReferralAI',
    description: 'Try ReferralAI with our interactive demo. Experience the power of our referral management platform firsthand.',
    keywords: 'referral demo, referral platform demo, try referralai, referral software demo',
    type: 'website'
  },
  '/careers': {
    title: 'Careers - Join Our Team at ReferralAI',
    description: 'Join the ReferralAI team and help us build the future of referral management. View open positions and apply today.',
    keywords: 'referralai careers, referral platform jobs, tech jobs, startup careers',
    type: 'website'
  },
  '/changelog': {
    title: 'Changelog - ReferralAI Product Updates',
    description: 'Stay updated with the latest features, improvements, and bug fixes in ReferralAI. View our complete product changelog.',
    keywords: 'referralai updates, product changelog, new features, release notes',
    type: 'website'
  },
  '/roadmap': {
    title: 'Product Roadmap - ReferralAI',
    description: 'See what we are building next at ReferralAI. View our product roadmap and upcoming features.',
    keywords: 'referralai roadmap, upcoming features, product plans, future updates',
    type: 'website'
  },
  '/feedback': {
    title: 'Feedback - Share Your Ideas with ReferralAI',
    description: 'Help us improve ReferralAI by sharing your feedback and feature requests. Your input shapes our product.',
    keywords: 'referralai feedback, feature requests, product feedback, user suggestions',
    type: 'website'
  },
  '/terms': {
    title: 'Terms of Service - ReferralAI',
    description: 'Read the ReferralAI Terms of Service. Understand the terms and conditions for using our referral management platform.',
    keywords: 'terms of service, terms and conditions, legal terms, user agreement',
    type: 'website',
    noindex: false
  },
  '/privacy': {
    title: 'Privacy Policy - ReferralAI',
    description: 'Learn how ReferralAI protects your privacy and handles your data. Read our comprehensive privacy policy.',
    keywords: 'privacy policy, data protection, privacy practices, data security',
    type: 'website',
    noindex: false
  },
  '/security': {
    title: 'Security - ReferralAI',
    description: 'Learn about ReferralAI security practices, data protection measures, and compliance standards.',
    keywords: 'security, data protection, compliance, security practices, data security',
    type: 'website'
  },
  '/data-policy': {
    title: 'Data Policy - ReferralAI',
    description: 'Understand how ReferralAI collects, uses, and protects your data. Read our comprehensive data policy.',
    keywords: 'data policy, data handling, data collection, data usage',
    type: 'website',
    noindex: false
  },
  '/login': {
    title: 'Login - ReferralAI',
    description: 'Sign in to your ReferralAI account to access your referral dashboard and analytics.',
    keywords: 'login, sign in, user login, account access',
    type: 'website',
    noindex: true
  },
  '/signup': {
    title: 'Sign Up - Create Your ReferralAI Account',
    description: 'Create your free ReferralAI account and start managing your referral program today.',
    keywords: 'sign up, create account, register, get started',
    type: 'website'
  },
  '/admin': {
    title: 'Admin Login - ReferralAI',
    description: 'Administrator login for ReferralAI platform management.',
    type: 'website',
    noindex: true,
    nofollow: true
  },
  '/referrer/login': {
    title: 'Referrer Login - ReferralAI',
    description: 'Sign in to your referrer account to track your earnings and referral performance.',
    keywords: 'referrer login, affiliate login, partner login',
    type: 'website',
    noindex: true
  },
  '/dashboard': {
    title: 'Dashboard - ReferralAI',
    description: 'Access your ReferralAI dashboard to manage referral codes, view analytics, and track performance.',
    type: 'website',
    noindex: true,
    nofollow: true
  },
  '/forgot-password': {
    title: 'Forgot Password - ReferralAI',
    description: 'Reset your ReferralAI account password.',
    type: 'website',
    noindex: true,
    nofollow: true
  }
}
