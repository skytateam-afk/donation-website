import api from './axios';

export interface Donation {
  id: number;
  campaign_id: number;
  donor_name: string;
  donor_email: string;
  amount: string;
  currency: string;
  donation_type: 'one_time' | 'subscription';
  stripe_payment_id: string | null;
  stripe_subscription_id: string | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  message: string | null;
  anonymous: boolean;
  created_at: string;
  campaign_title?: string;
  campaign_slug?: string;
}

export interface DonationData {
  campaign_id: number;
  donor_name: string;
  donor_email: string;
  amount: number;
  message?: string;
  anonymous?: boolean;
}

export interface SubscriptionData extends DonationData {
  interval?: 'month' | 'year';
}

export interface DonationsResponse {
  success: boolean;
  data: {
    donations: Donation[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    stats?: {
      total_donations: number;
      total_amount: number;
    };
  };
}

export interface DonationResponse {
  success: boolean;
  data: Donation;
}

export interface DonationInitiateResponse {
  success: boolean;
  message: string;
  data: {
    donation_id: number;
    checkout_url: string;
    session_id: string;
  };
}

export const donationsAPI = {
  // Admin endpoints
  getAll: (params?: any) => 
    api.get<DonationsResponse>('/admin/donations', { params }),
  
  getCampaignDonations: (campaignId: number, params?: any) => 
    api.get<DonationsResponse>(`/admin/campaigns/${campaignId}/donations`, { params }),
  
  getById: (id: number) => 
    api.get<DonationResponse>(`/admin/donations/${id}`),
  
  cancelSubscription: (id: number) => 
    api.delete<{ success: boolean; message: string }>(`/admin/subscriptions/${id}`),
  
  // Public endpoints
  createDonation: (data: DonationData) => 
    api.post<DonationInitiateResponse>('/public/donate', data),
  
  createSubscription: (data: SubscriptionData) => 
    api.post<DonationInitiateResponse>('/public/subscribe', data),
  
  getDonation: (id: number) => 
    api.get<DonationResponse>(`/public/donations/${id}`),
};
