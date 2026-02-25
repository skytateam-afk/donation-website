<template>
  <PublicLayout>
    <!-- Back Button -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <Button variant="ghost" as-child>
        <router-link to="/" class="flex items-center">
          <ArrowLeft class="w-5 h-5 mr-2" />
          Back to Campaigns
        </router-link>
      </Button>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center"
    >
      <Spinner class="h-12 w-12 mx-auto" />
      <p class="mt-4 text-muted-foreground">Loading campaign...</p>
    </div>

    <!-- Campaign Content -->
    <main
      v-else-if="campaign"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Video Player -->
          <Card v-if="campaign.main_video_url" class="overflow-hidden">
            <div class="aspect-video bg-black relative group">
              <!-- Playing State: YouTube/Vimeo Embed -->
              <iframe
                v-if="isPlaying && getVideoEmbedUrl(campaign.main_video_url)"
                :src="getVideoEmbedUrl(campaign.main_video_url) + '?autoplay=1'"
                class="w-full h-full"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
              <!-- Playing State: Uploaded Video -->
              <video
                v-else-if="isPlaying && isUploadedVideo(campaign.main_video_url)"
                :src="campaign.main_video_url"
                controls
                autoplay
                class="w-full h-full"
              >
                Your browser does not support the video tag.
              </video>
              <!-- Thumbnail State: Show thumbnail with play button -->
              <div v-else class="w-full h-full relative">
                <!-- Campaign Thumbnail -->
                <img
                  v-if="campaign.thumbnail_url"
                  :src="campaign.thumbnail_url"
                  :alt="campaign.title"
                  class="w-full h-full object-cover"
                />
                <!-- Fallback to YouTube thumbnail -->
                <img
                  v-else-if="getYouTubeThumbnail(campaign.main_video_url)"
                  :src="getYouTubeThumbnail(campaign.main_video_url)"
                  :alt="campaign.title"
                  class="w-full h-full object-cover"
                />
                <!-- No thumbnail available -->
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center bg-gray-800"
                >
                  <p class="text-gray-400">No thumbnail available</p>
                </div>
                <!-- Play Button Overlay -->
                <div
                  class="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors cursor-pointer"
                  @click="playVideo"
                >
                  <div
                    class="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform"
                  >
                    <svg
                      class="w-10 h-10 text-gray-900 ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <!-- Image Gallery -->
          <Card v-if="campaignImages.length > 0">
            <CardHeader>
              <CardTitle>Campaign Images</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageGallery :images="campaignImages" />
            </CardContent>
          </Card>

          <!-- Campaign Info -->
          <Card>
            <CardHeader>
              <CardTitle class="text-3xl">{{ campaign.title }}</CardTitle>
            </CardHeader>
            <CardContent class="space-y-6">
              <!-- Progress Bar -->
              <div>
                <div
                  class="flex justify-between text-sm text-muted-foreground mb-2"
                >
                  <span class="font-semibold text-lg text-foreground"
                    >${{ formatAmount(campaign.current_amount) }} raised</span
                  >
                  <Badge variant="secondary"
                    >{{ getProgress(campaign) }}%</Badge
                  >
                </div>
                <div class="w-full bg-secondary rounded-full h-3">
                  <div
                    class="bg-primary h-3 rounded-full transition-all duration-500"
                    :style="{ width: `${getProgress(campaign)}%` }"
                  ></div>
                </div>
                <div
                  class="flex justify-between text-sm text-muted-foreground mt-2"
                >
                  <span>Goal: ${{ formatAmount(campaign.goal_amount) }}</span>
                  <span
                    >{{ parseInt(campaign.donation_count) || 0 }} donation{{
                      parseInt(campaign.donation_count) === 1 ? "" : "s"
                    }}</span
                  >
                </div>
              </div>

              <!-- Description -->
              <div>
                <h3 class="text-xl font-semibold text-gray-900 mb-4">
                  About This Campaign
                </h3>

                <div
                  class="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8 prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4 prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2 prose-li:text-gray-700 prose-li:leading-relaxed prose-strong:text-gray-900 prose-strong:font-semibold prose-em:text-gray-700 prose-em:italic [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mb-4 [&>h2]:mt-8 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mb-3 [&>h3]:mt-6 [&>p]:mb-4 [&>p]:text-gray-700 [&>ul]:my-6 [&>ul]:list-disc [&>ul]:pl-6 [&>ul>li]:mb-2 [&>ul>li]:text-gray-700"
                  v-html="campaign.description"
                ></div>
              </div>
            </CardContent>
          </Card>

          <!-- Recent Donations -->
          <Card v-if="recentDonations.length > 0">
            <CardHeader>
              <CardTitle>Recent Donations</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div
                  v-for="donation in recentDonations"
                  :key="donation.id"
                  class="flex items-start space-x-3 pb-4 border-b last:border-b-0"
                >
                  <div
                    class="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"
                  >
                    <User class="w-5 h-5 text-primary" />
                  </div>
                  <div class="flex-1">
                    <p class="font-medium">
                      {{
                        donation.anonymous ? "Anonymous" : donation.donor_name
                      }}
                    </p>
                    <p class="text-sm text-muted-foreground">
                      Donated ${{ formatAmount(donation.amount) }}
                    </p>
                    <p
                      v-if="donation.message"
                      class="text-sm text-muted-foreground mt-1"
                    >
                      {{ donation.message }}
                    </p>
                    <p class="text-xs text-muted-foreground mt-1">
                      {{ formatDate(donation.created_at) }}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Donation Sidebar -->
        <div class="lg:col-span-1">
          <Card class="sticky top-4">
            <CardHeader>
              <CardTitle>Support This Campaign</CardTitle>
            </CardHeader>
            <CardContent>
              <!-- Donation Form -->
              <form @submit.prevent="handleDonate" class="space-y-4">
                <!-- Preset Amounts -->
                <div class="grid grid-cols-2 gap-2">
                  <Button
                    v-for="amount in presetAmounts"
                    :key="amount"
                    type="button"
                    :variant="
                      donationForm.amount === amount ? 'default' : 'outline'
                    "
                    @click="donationForm.amount = amount"
                  >
                    ${{ amount }}
                  </Button>
                </div>

                <!-- Custom Amount -->
                <div>
                  <Label for="custom-amount">Or enter custom amount</Label>
                  <div class="relative mt-1">
                    <span class="absolute left-3 top-3 text-muted-foreground"
                      >$</span
                    >
                    <Input
                      id="custom-amount"
                      v-model.number="donationForm.amount"
                      type="number"
                      step="0.01"
                      min="1"
                      class="pl-8"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <!-- Donation Type -->
                <div>
                  <Label class="mb-2">Donation Type</Label>
                  <div class="space-y-2">
                    <label class="flex items-center">
                      <input
                        v-model="donationForm.type"
                        type="radio"
                        value="one-time"
                        class="mr-2"
                      />
                      <span class="text-sm">One-time donation</span>
                    </label>
                    <label class="flex items-center">
                      <input
                        v-model="donationForm.type"
                        type="radio"
                        value="monthly"
                        class="mr-2"
                      />
                      <span class="text-sm">Monthly subscription</span>
                    </label>
                  </div>
                </div>

                <!-- Donor Information -->
                <div>
                  <Label for="donor-name">
                    Your Name
                    <span
                      v-if="!donationForm.anonymous"
                      class="text-destructive"
                      >*</span
                    >
                    <span v-else class="text-gray-500">(Optional)</span>
                  </Label>
                  <Input
                    id="donor-name"
                    v-model="donationForm.donor_name"
                    type="text"
                    :required="!donationForm.anonymous"
                    placeholder="John Doe"
                    class="mt-1"
                    :disabled="donationForm.anonymous"
                  />
                </div>

                <div>
                  <Label for="donor-email">
                    Your Email
                    <span
                      v-if="!donationForm.anonymous"
                      class="text-destructive"
                      >*</span
                    >
                    <span v-else class="text-gray-500">(Optional)</span>
                  </Label>
                  <Input
                    id="donor-email"
                    v-model="donationForm.donor_email"
                    type="email"
                    :required="!donationForm.anonymous"
                    placeholder="john@example.com"
                    class="mt-1"
                    :disabled="donationForm.anonymous"
                  />
                </div>

                <!-- Message -->
                <div>
                  <Label for="message">Message (Optional)</Label>
                  <textarea
                    id="message"
                    v-model="donationForm.message"
                    rows="3"
                    class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                    placeholder="Leave a message of support..."
                  ></textarea>
                </div>

                <!-- Anonymous -->
                <label class="flex items-center">
                  <input
                    v-model="donationForm.anonymous"
                    type="checkbox"
                    class="mr-2"
                  />
                  <span class="text-sm">Donate anonymously</span>
                </label>

                <!-- Submit Button -->
                <Button
                  type="submit"
                  :disabled="
                    submitting ||
                    !donationForm.amount ||
                    donationForm.amount < 1
                  "
                  class="w-full"
                >
                  {{
                    submitting
                      ? "Processing..."
                      : `Donate $${donationForm.amount || 0}`
                  }}
                </Button>

                <p class="text-xs text-muted-foreground text-center">
                  Secure payment powered by Stripe
                </p>
              </form>

              <!-- Share Buttons -->
              <div class="mt-6 pt-6 border-t">
                <p class="text-sm font-medium mb-3">Share this campaign</p>
                <div class="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    class="flex-1"
                    @click="shareOnFacebook"
                  >
                    <Share2 class="w-4 h-4 mr-1" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    class="flex-1"
                    @click="shareOnTwitter"
                  >
                    <Share2 class="w-4 h-4 mr-1" />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    class="flex-1"
                    @click="copyLink"
                  >
                    <Copy class="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>

    <!-- Not Found -->
    <div
      v-else
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center"
    >
      <h2 class="text-2xl font-bold mb-4">Campaign Not Found</h2>
      <p class="text-muted-foreground mb-8">
        The campaign you're looking for doesn't exist or has been removed.
      </p>
      <Button as-child>
        <router-link to="/"> Browse Campaigns </router-link>
      </Button>
    </div>
  </PublicLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { ArrowLeft, User, Share2, Copy } from "lucide-vue-next";
import { useCampaignsStore } from "@/stores/campaigns";
import { useDonationsStore } from "@/stores/donations";
import { useSonner } from "@/composables/useSonner";
import PublicLayout from "@/layouts/PublicLayout.vue";
import ImageGallery from "@/components/ImageGallery.vue";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

const route = useRoute();
const campaignsStore = useCampaignsStore();
const donationsStore = useDonationsStore();
const { success, error } = useSonner();

const loading = ref(false);
const submitting = ref(false);
const isPlaying = ref(false);
const campaign = ref<any>(null);
const recentDonations = ref<any[]>([]);

const presetAmounts = [25, 50, 100, 250];

const donationForm = ref({
  amount: 50,
  type: "one-time" as "one-time" | "monthly",
  donor_name: "",
  donor_email: "",
  message: "",
  anonymous: false,
});

const formatAmount = (amount: number) => {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const getProgress = (campaign: any) => {
  if (!campaign.goal_amount) return 0;
  return Math.min(
    100,
    Math.round((campaign.current_amount / campaign.goal_amount) * 100)
  );
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const campaignImages = computed(() => {
  if (!campaign.value?.media) return []
  return campaign.value.media
    .filter((m: any) => m.media_type === 'image')
    .map((m: any) => m.media_url)
})

const getVideoEmbedUrl = (url: string) => {
  if (!url) return null;

  // YouTube
  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/
  );
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return null;
};

const isUploadedVideo = (url: string) => {
  if (!url) return false
  // Check if it's an R2 URL or uploaded video file
  return url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg') || url.includes('r2.dev')
};

const getYouTubeThumbnail = (url: string): string | null => {
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

const playVideo = () => {
  isPlaying.value = true;
};

const handleDonate = async () => {
  if (!donationForm.value.amount || donationForm.value.amount < 1) {
    error("Please enter a valid donation amount");
    return;
  }

  // Only require name/email if not anonymous
  if (!donationForm.value.anonymous) {
    if (!donationForm.value.donor_name || !donationForm.value.donor_email) {
      error("Please fill in your name and email");
      return;
    }
  }

  submitting.value = true;

  try {
    const donationData: any = {
      campaign_id: campaign.value.id,
      donor_name: donationForm.value.anonymous
        ? "Anonymous"
        : donationForm.value.donor_name,
      donor_email: donationForm.value.anonymous
        ? "anonymous@crrnetwork.org"
        : donationForm.value.donor_email,
      amount: Math.round(donationForm.value.amount * 100), // Convert dollars to cents
      message: donationForm.value.message,
      anonymous: donationForm.value.anonymous,
    };

    if (donationForm.value.type === "monthly") {
      donationData.interval = "month";
      await donationsStore.createSubscription(donationData);
    } else {
      await donationsStore.createDonation(donationData);
    }

    // Stripe will redirect to checkout, so we don't need to do anything else
  } catch (error: any) {
    console.error("Donation error:", error);
    error(error.response?.data?.message || "Failed to process donation");
    submitting.value = false;
  }
};

const shareOnFacebook = () => {
  const url = encodeURIComponent(window.location.href);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
};

const shareOnTwitter = () => {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(
    `Support ${campaign.value?.title} on CRRNetwork`
  );
  window.open(
    `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
    "_blank"
  );
};

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    success("Link copied to clipboard!");
  } catch (error) {
    error("Failed to copy link");
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    const slug = route.params.slug as string;
    await campaignsStore.fetchCampaignBySlug(slug);
    campaign.value = campaignsStore.currentCampaign;

    // Mock recent donations (would come from API in production)
    if (campaign.value?.recent_donations) {
      recentDonations.value = campaign.value.recent_donations;
    }
  } catch (error) {
    console.error("Error loading campaign:", error);
    error("Failed to load campaign");
  } finally {
    loading.value = false;
  }
});
</script>
