import api from './axios'

export interface Notification {
  id: number
  user_id: number
  type: 'campaign' | 'donation' | 'user' | 'system' | 'success' | 'warning' | 'error'
  title: string
  message: string
  read: boolean
  metadata: any
  created_at: string
  updated_at: string
}

export interface NotificationsResponse {
  success: boolean
  data: Notification[]
  pagination: {
    total: number
    unread: number
    limit: number
    offset: number
  }
}

export interface UnreadCountResponse {
  success: boolean
  data: {
    count: number
  }
}

export const notificationsAPI = {
  // Get all notifications
  getNotifications: (params?: { limit?: number; offset?: number; unread_only?: boolean }) =>
    api.get<NotificationsResponse>('/notifications', { params }),

  // Get unread count
  getUnreadCount: () =>
    api.get<UnreadCountResponse>('/notifications/unread-count'),

  // Mark notification as read
  markAsRead: (id: number) =>
    api.put<{ success: boolean; message: string }>(`/notifications/${id}/read`),

  // Mark notification as unread
  markAsUnread: (id: number) =>
    api.put<{ success: boolean; message: string }>(`/notifications/${id}/unread`),

  // Mark all as read
  markAllAsRead: () =>
    api.put<{ success: boolean; message: string }>('/notifications/mark-all-read'),

  // Delete notification
  deleteNotification: (id: number) =>
    api.delete<{ success: boolean; message: string }>(`/notifications/${id}`),

  // Delete all read notifications
  deleteAllRead: () =>
    api.delete<{ success: boolean; message: string }>('/notifications/read/all')
}
