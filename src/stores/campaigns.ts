import { defineStore } from 'pinia';
import { ref } from 'vue';
import { campaignsAPI, type Campaign } from '@/api/campaigns';
import { toast } from 'vue-sonner';

export const useCampaignsStore = defineStore('campaigns', () => {
  // State
  const campaigns = ref<Campaign[]>([]);
  const currentCampaign = ref<Campaign | null>(null);
  const loading = ref(false);
  const pagination = ref({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  // Actions
  async function fetchCampaigns(params?: any) {
    loading.value = true;
    try {
      const { data } = await campaignsAPI.getAll(params);
      campaigns.value = data.data.campaigns;
      pagination.value = data.data.pagination;
    } catch (error) {
      console.error('Fetch campaigns error:', error);
      toast.error('Failed to load campaigns');
    } finally {
      loading.value = false;
    }
  }

  async function fetchPublicCampaigns(params?: any) {
    loading.value = true;
    try {
      const { data } = await campaignsAPI.getPublic(params);
      campaigns.value = data.data.campaigns;
      pagination.value = data.data.pagination;
    } catch (error) {
      console.error('Fetch public campaigns error:', error);
      toast.error('Failed to load campaigns');
    } finally {
      loading.value = false;
    }
  }

  async function fetchCampaign(id: number) {
    loading.value = true;
    try {
      const { data } = await campaignsAPI.getById(id);
      currentCampaign.value = data.data;
    } catch (error) {
      console.error('Fetch campaign error:', error);
      toast.error('Failed to load campaign');
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function fetchCampaignBySlug(slug: string) {
    loading.value = true;
    try {
      const { data } = await campaignsAPI.getBySlug(slug);
      currentCampaign.value = data.data;
    } catch (error) {
      console.error('Fetch campaign by slug error:', error);
      toast.error('Campaign not found');
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function createCampaign(formData: FormData) {
    loading.value = true;
    try {
      const { data } = await campaignsAPI.create(formData);
      toast.success('Campaign created successfully!');
      return data.data;
    } catch (error) {
      console.error('Create campaign error:', error);
      toast.error('Failed to create campaign');
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updateCampaign(id: number, formData: FormData) {
    loading.value = true;
    try {
      const { data } = await campaignsAPI.update(id, formData);
      // Don't show toast here - let the component handle it to avoid duplicates
      
      // Update in list if exists
      const index = campaigns.value.findIndex(c => c.id === id);
      if (index !== -1) {
        campaigns.value[index] = data.data;
      }
      
      // Update current campaign if it's the same
      if (currentCampaign.value?.id === id) {
        currentCampaign.value = data.data;
      }
      
      return data.data;
    } catch (error) {
      console.error('Update campaign error:', error);
      // Don't show toast here either - let component handle errors
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteCampaign(id: number) {
    loading.value = true;
    try {
      await campaignsAPI.delete(id);
      campaigns.value = campaigns.value.filter(c => c.id !== id);
      toast.success('Campaign deleted successfully');
    } catch (error) {
      console.error('Delete campaign error:', error);
      toast.error('Failed to delete campaign');
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function uploadMedia(id: number, formData: FormData) {
    loading.value = true;
    try {
      const { data } = await campaignsAPI.uploadMedia(id, formData);
      toast.success('Media uploaded successfully!');
      
      // Refresh current campaign to show new media
      if (currentCampaign.value?.id === id) {
        await fetchCampaign(id);
      }
      
      return data.data;
    } catch (error) {
      console.error('Upload media error:', error);
      toast.error('Failed to upload media');
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteMedia(campaignId: number, mediaId: number) {
    loading.value = true;
    try {
      await campaignsAPI.deleteMedia(campaignId, mediaId);
      toast.success('Media deleted successfully');
      
      // Remove from current campaign if loaded
      if (currentCampaign.value?.id === campaignId && currentCampaign.value.media) {
        currentCampaign.value.media = currentCampaign.value.media.filter(
          m => m.id !== mediaId
        );
      }
    } catch (error) {
      console.error('Delete media error:', error);
      toast.error('Failed to delete media');
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function clearCurrentCampaign() {
    currentCampaign.value = null;
  }

  return {
    // State
    campaigns,
    currentCampaign,
    loading,
    pagination,
    // Actions
    fetchCampaigns,
    fetchPublicCampaigns,
    fetchCampaign,
    fetchCampaignBySlug,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    uploadMedia,
    deleteMedia,
    clearCurrentCampaign,
  };
});
