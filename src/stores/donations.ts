import { defineStore } from 'pinia';
import { ref } from 'vue';
import { donationsAPI, type Donation, type DonationData, type SubscriptionData } from '@/api/donations';
import { toast } from 'vue-sonner';

export const useDonationsStore = defineStore('donations', () => {
  // State
  const donations = ref<Donation[]>([]);
  const currentDonation = ref<Donation | null>(null);
  const loading = ref(false);
  const pagination = ref({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  });
  const stats = ref({
    total_donations: 0,
    total_amount: 0,
  });

  // Actions
  async function fetchDonations(params?: any) {
    loading.value = true;
    try {
      const { data } = await donationsAPI.getAll(params);
      donations.value = data.data.donations;
      pagination.value = data.data.pagination;
      if (data.data.stats) {
        stats.value = data.data.stats;
      }
    } catch (error) {
      console.error('Fetch donations error:', error);
      toast.error('Failed to load donations');
    } finally {
      loading.value = false;
    }
  }

  async function fetchCampaignDonations(campaignId: number, params?: any) {
    loading.value = true;
    try {
      const { data } = await donationsAPI.getCampaignDonations(campaignId, params);
      donations.value = data.data.donations;
      pagination.value = data.data.pagination;
      if (data.data.stats) {
        stats.value = data.data.stats;
      }
    } catch (error) {
      console.error('Fetch campaign donations error:', error);
      toast.error('Failed to load donations');
    } finally {
      loading.value = false;
    }
  }

  async function fetchDonation(id: number) {
    loading.value = true;
    try {
      const { data } = await donationsAPI.getById(id);
      currentDonation.value = data.data;
    } catch (error) {
      console.error('Fetch donation error:', error);
      toast.error('Failed to load donation');
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function createDonation(donationData: DonationData) {
    loading.value = true;
    try {
      const { data } = await donationsAPI.createDonation(donationData);
      
      // Redirect to Stripe checkout
      if (data.data.checkout_url) {
        window.location.href = data.data.checkout_url;
      }
      
      return data.data;
    } catch (error) {
      console.error('Create donation error:', error);
      toast.error('Failed to initiate donation');
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function createSubscription(subscriptionData: SubscriptionData) {
    loading.value = true;
    try {
      const { data } = await donationsAPI.createSubscription(subscriptionData);
      
      // Redirect to Stripe checkout
      if (data.data.checkout_url) {
        window.location.href = data.data.checkout_url;
      }
      
      return data.data;
    } catch (error) {
      console.error('Create subscription error:', error);
      toast.error('Failed to initiate subscription');
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function cancelSubscription(id: number) {
    loading.value = true;
    try {
      await donationsAPI.cancelSubscription(id);
      toast.success('Subscription cancelled successfully');
      
      // Refresh donations list
      await fetchDonations();
    } catch (error) {
      console.error('Cancel subscription error:', error);
      toast.error('Failed to cancel subscription');
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function clearCurrentDonation() {
    currentDonation.value = null;
  }

  return {
    // State
    donations,
    currentDonation,
    loading,
    pagination,
    stats,
    // Actions
    fetchDonations,
    fetchCampaignDonations,
    fetchDonation,
    createDonation,
    createSubscription,
    cancelSubscription,
    clearCurrentDonation,
  };
});
