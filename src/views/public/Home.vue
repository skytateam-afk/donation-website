<template>
  <PublicLayout>
    <!-- Hero Section -->
    <section class="relative bg-primary text-primary-foreground py-40 overflow-hidden">
  <!-- Background Image -->
  <div class="absolute inset-0 z-0">
    <img src="/hero-section.webp" alt="Hero background" class="w-full h-full object-cover" />
    <!-- Overlay -->
    <div class="absolute inset-0 bg-primary/70"></div>
  </div>

  <!-- Content -->
  <div
    class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
  >
    <h1 class="text-4xl md:text-6xl font-bold mb-6">
      Make a Difference Today
    </h1>
    <p class="text-xl md:text-2xl mb-8 opacity-90">
      Support meaningful causes and help communities thrive
    </p>
  </div>
</section>

    <!-- Search Section -->
    <section class="bg-gray-50 py-12">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Find a Campaign</h2>
          <p class="text-gray-600">Search through our active campaigns to find a cause you care about</p>
        </div>
        
        <!-- Enhanced Search Bar -->
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <Input
            v-model="searchQuery"
            type="text"
            :placeholder="isMobile ? 'Search campaigns...' : 'Search by campaign title or description...'"
            class="w-full pl-10 sm:pl-12 pr-12 sm:pr-24 py-4 sm:py-6 text-base sm:text-lg rounded-lg shadow-sm border-gray-300 focus:border-primary focus:ring-primary"
          />
          <div class="absolute inset-y-0 right-0 pr-2 flex items-center gap-2">
            <Button
              v-if="searchQuery"
              variant="ghost"
              size="sm"
              @click="clearSearch"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>

        <!-- Search Stats -->
        <div v-if="searchQuery" class="mt-4 text-center">
          <p class="text-sm text-gray-600">
            Found <span class="font-semibold text-gray-900">{{ pagination.total }}</span> 
            {{ pagination.total === 1 ? 'campaign' : 'campaigns' }} matching "{{ searchQuery }}"
          </p>
        </div>
      </div>
    </section>

    <!-- Campaigns Grid -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-3xl font-bold">
          {{ searchQuery ? 'Search Results' : 'Active Campaigns' }}
        </h2>
        <div class="text-sm text-gray-600">
          Showing {{ campaigns.length }} of {{ pagination.total }} campaigns
        </div>
      </div>

      <div v-if="loading && campaigns.length === 0" class="text-center py-12">
        <div
          class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          role="status"
        >
          <span
            class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
            >Loading...</span
          >
        </div>
        <p class="mt-4 text-muted-foreground">Loading campaigns...</p>
      </div>

      <div v-else-if="campaigns.length === 0" class="text-center py-12">
        <p class="text-muted-foreground">
          No campaigns available at the moment.
        </p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card
          v-for="campaign in campaigns"
          :key="campaign.id"
          class="overflow-hidden border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all cursor-pointer"
          @click="goToCampaign(campaign.slug)"
        >
          <!-- Video Player or Thumbnail -->
          <div class="h-56 bg-gray-900 relative group">
            <!-- Embedded Video Player (YouTube/Vimeo) -->
            <div
              v-if="playingVideo === campaign.id && getYouTubeEmbedUrl(campaign.main_video_url)"
              class="w-full h-full"
              @click.stop
            >
              <iframe
                :src="getYouTubeEmbedUrl(campaign.main_video_url)"
                class="w-full h-full"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>

            <!-- Uploaded Video Player -->
            <div
              v-else-if="playingVideo === campaign.id && isUploadedVideo(campaign.main_video_url)"
              class="w-full h-full"
              @click.stop
            >
              <video
                :src="campaign.main_video_url"
                controls
                autoplay
                class="w-full h-full object-cover"
              >
                Your browser does not support the video tag.
              </video>
            </div>

            <!-- Video Thumbnail with Play Button -->
            <div v-else class="w-full h-full">
              <!-- Use campaign thumbnail if available, otherwise fallback to YouTube thumbnail -->
              <img
                v-if="campaign.thumbnail_url"
                :src="campaign.thumbnail_url"
                :alt="campaign.title"
                class="w-full h-full object-cover"
              />
              <img
                v-else-if="getYouTubeThumbnail(campaign.main_video_url)"
                :src="getYouTubeThumbnail(campaign.main_video_url)"
                :alt="campaign.title"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center bg-gray-800"
              >
                <ImageIcon class="w-16 h-16 text-gray-400" />
              </div>
              <!-- Play Button Overlay -->
              <div
                v-if="campaign.main_video_url"
                class="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors"
                @click.stop="playVideo(campaign.id)"
              >
                <div
                  class="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform"
                >
                  <svg
                    class="w-8 h-8 text-gray-900 ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <CardHeader>
            <CardTitle class="text-xl">{{ campaign.title }}</CardTitle>
            <CardDescription
              class="line-clamp-2"
              v-html="stripHtml(campaign.description)"
            ></CardDescription>
          </CardHeader>

          <CardContent class="space-y-4">
            <!-- Fundraising Stats - More Prominent -->
            <div class="bg-gray-50 rounded-lg p-4 space-y-3">
              <div class="flex justify-between items-baseline">
                <div>
                  <p class="text-2xl font-bold text-gray-900">
                    ${{ formatAmount(campaign.current_amount || 0) }}
                  </p>
                  <p class="text-xs text-gray-600">raised</p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-semibold text-gray-700">
                    ${{ formatAmount(campaign.goal_amount || 0) }}
                  </p>
                  <p class="text-xs text-gray-600">goal</p>
                </div>
              </div>

              <!-- Progress Bar -->
              <div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div
                    class="bg-green-600 h-3 rounded-full transition-all"
                    :style="{ width: `${getProgress(campaign)}%` }"
                  ></div>
                </div>
                <p class="text-xs text-gray-600 mt-1 text-center">
                  {{ getProgress(campaign) }}% funded
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button class="w-full" @click.stop="goToCampaign(campaign.slug)">
              Donate Now
            </Button>
          </CardFooter>
        </Card>
      </div>

      <!-- Loading More Indicator -->
      <div v-if="loadingMore" class="text-center py-8">
        <div
          class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          role="status"
        >
          <span
            class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
            >Loading...</span
          >
        </div>
        <p class="mt-2 text-sm text-muted-foreground">
          Loading more campaigns...
        </p>
      </div>

      <!-- Load More Button (fallback for browsers without intersection observer) -->
      <div v-if="hasMore && !loadingMore" class="mt-8 text-center">
        <Button variant="outline" @click="loadMore" class="px-8">
          Load More Campaigns
        </Button>
      </div>

      <!-- Scroll Sentinel for Infinite Scroll -->
      <div ref="scrollSentinel" class="h-4"></div>
    </section>
  </PublicLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { ImageIcon } from "lucide-vue-next";
import { useCampaignsStore } from "@/stores/campaigns";
import PublicLayout from "@/layouts/PublicLayout.vue";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

const router = useRouter();
const campaignsStore = useCampaignsStore();

const loading = ref(false);
const loadingMore = ref(false);
const searchQuery = ref("");
const playingVideo = ref<number | null>(null);
const scrollSentinel = ref<HTMLElement | null>(null);
const allCampaigns = ref<any[]>([]);
const currentPage = ref(1);

const campaigns = computed(() => allCampaigns.value);
const pagination = computed(() => campaignsStore.pagination);

const hasMore = computed(() => {
  return currentPage.value < pagination.value.pages;
});

// Detect mobile devices
const isMobile = computed(() => {
  return window.innerWidth < 640; // Tailwind's sm breakpoint
});

const formatAmount = (amount: string | number) => {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return numAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const getProgress = (campaign: any) => {
  if (!campaign.goal_amount) return 0;
  const goal =
    typeof campaign.goal_amount === "string"
      ? parseFloat(campaign.goal_amount)
      : campaign.goal_amount;
  const current =
    typeof campaign.current_amount === "string"
      ? parseFloat(campaign.current_amount)
      : campaign.current_amount;
  return Math.min(100, Math.round((current / goal) * 100));
};

const getYouTubeThumbnail = (url: string | null): string | null => {
  if (!url) return null;

  // Extract YouTube video ID from various URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    // Return high quality thumbnail
    return `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
  }

  return null;
};

const isUploadedVideo = (url: string | null): boolean => {
  if (!url) return false
  // Check if it's an R2 URL or uploaded video file
  return url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg') || url.includes('r2.dev')
}

const getYouTubeEmbedUrl = (url: string | null): string | null => {
  if (!url) return null;

  // Extract YouTube video ID from various URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    // Return embed URL with autoplay
    return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
  }

  // Check for Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }

  return null;
};

const playVideo = (campaignId: number) => {
  playingVideo.value = campaignId;
};

const stripHtml = (html: string): string => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

let searchTimeout: any = null;

// Watch for search query changes
watch(searchQuery, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    resetAndFetch();
  }, 500);
});

const resetAndFetch = async () => {
  currentPage.value = 1;
  allCampaigns.value = [];
  await fetchCampaigns();
};

const fetchCampaigns = async (append = false) => {
  if (append) {
    loadingMore.value = true;
  } else {
    loading.value = true;
  }

  try {
    await campaignsStore.fetchPublicCampaigns({
      search: searchQuery.value || undefined,
      status: "active",
      page: currentPage.value,
      limit: 9,
    });

    if (append) {
      allCampaigns.value = [...allCampaigns.value, ...campaignsStore.campaigns];
    } else {
      allCampaigns.value = campaignsStore.campaigns;
    }
  } catch (error) {
    console.error("Error fetching campaigns:", error);
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return;
  currentPage.value++;
  await fetchCampaigns(true);
};

// Intersection Observer for infinite scroll
let observer: IntersectionObserver | null = null;

const setupIntersectionObserver = () => {
  if (!scrollSentinel.value) return;

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && hasMore.value && !loadingMore.value) {
        loadMore();
      }
    },
    {
      rootMargin: "100px",
    }
  );

  observer.observe(scrollSentinel.value);
};

const clearSearch = () => {
  searchQuery.value = '';
};

const goToCampaign = (slug: string) => {
  router.push(`/campaigns/${slug}`);
};

onMounted(() => {
  fetchCampaigns();
  setTimeout(() => {
    setupIntersectionObserver();
  }, 100);
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>
