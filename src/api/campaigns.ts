import api from './axios';

export interface Campaign {
  id: number;
  title: string;
  slug: string;
  description: string;
  goal_amount: string;
  current_amount: string;
  currency: string;
  main_video_url: string | null;
  thumbnail_url?: string | null;
  status: 'active' | 'inactive' | 'completed';
  created_by: number;
  created_at: string;
  updated_at: string;
  creator_name?: string;
  donation_count?: string;
  media?: CampaignMedia[];
  recent_donations?: any[];
}

export interface CampaignMedia {
  id: number;
  campaign_id: number;
  media_type: 'image' | 'video';
  media_url: string;
  display_order: number;
  created_at: string;
}

export interface CampaignsResponse {
  success: boolean;
  data: {
    campaigns: Campaign[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface CampaignResponse {
  success: boolean;
  data: Campaign;
}

export const campaignsAPI = {
  // Admin endpoints
  getAll: (params?: any) => 
    api.get<CampaignsResponse>('/admin/campaigns', { params }),
  
  getById: (id: number) => 
    api.get<CampaignResponse>(`/admin/campaigns/${id}`),
  
  create: (formData: FormData) => 
    api.post<CampaignResponse>('/admin/campaigns', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  update: (id: number, formData: FormData) => 
    api.put<CampaignResponse>(`/admin/campaigns/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  delete: (id: number) => 
    api.delete<{ success: boolean; message: string }>(`/admin/campaigns/${id}`),
  
  uploadMedia: (id: number, formData: FormData) => 
    api.post<{ success: boolean; data: CampaignMedia[] }>(`/admin/campaigns/${id}/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  deleteMedia: (id: number, mediaId: number) => 
    api.delete<{ success: boolean; message: string }>(`/admin/campaigns/${id}/media/${mediaId}`),
  
  // Public endpoints
  getPublic: (params?: any) => 
    api.get<CampaignsResponse>('/public/campaigns', { params }),
  
  getBySlug: (slug: string) => 
    api.get<CampaignResponse>(`/public/campaigns/${slug}`),
};
