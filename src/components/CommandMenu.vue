<template>
  <CommandDialog v-model:open="open">
    <CommandInput placeholder="Type a command or search..." />
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
      
      <!-- Admin Commands -->
      <CommandGroup v-if="userRole === 'admin'" heading="Admin">
        <CommandItem value="admin-dashboard" @select="navigateTo('/admin/dashboard')">
          <LayoutDashboard class="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </CommandItem>
        <CommandItem value="admin-codes" @select="navigateTo('/admin/codes')">
          <Tag class="mr-2 h-4 w-4" />
          <span>Referral Codes</span>
        </CommandItem>
        <CommandItem value="admin-forms" @select="navigateTo('/admin/forms')">
          <FileText class="mr-2 h-4 w-4" />
          <span>Forms</span>
        </CommandItem>
        <CommandItem value="admin-referrers" @select="navigateTo('/admin/referrers')">
          <Users class="mr-2 h-4 w-4" />
          <span>Referrers</span>
        </CommandItem>
        <CommandItem value="admin-organizations" @select="navigateTo('/admin/organizations')">
          <Building2 class="mr-2 h-4 w-4" />
          <span>Organizations</span>
        </CommandItem>
        <CommandItem value="admin-users" @select="navigateTo('/admin/users')">
          <UserCog class="mr-2 h-4 w-4" />
          <span>Users</span>
        </CommandItem>
        <CommandItem value="admin-analytics" @select="navigateTo('/admin/analytics')">
          <BarChart3 class="mr-2 h-4 w-4" />
          <span>Analytics</span>
        </CommandItem>
      </CommandGroup>

      <!-- User Commands -->
      <CommandGroup v-if="userRole === 'manager'" heading="Navigation">
        <CommandItem value="dashboard" @select="navigateTo('/dashboard')">
          <LayoutDashboard class="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </CommandItem>
        <CommandItem value="codes" @select="navigateTo('/codes')">
          <Tag class="mr-2 h-4 w-4" />
          <span>Referral Codes</span>
        </CommandItem>
        <CommandItem value="forms" @select="navigateTo('/forms')">
          <FileText class="mr-2 h-4 w-4" />
          <span>Forms</span>
        </CommandItem>
        <CommandItem value="links" @select="navigateTo('/links')">
          <Link class="mr-2 h-4 w-4" />
          <span>Short Links</span>
        </CommandItem>
        <CommandItem value="organizations" @select="navigateTo('/organizations')">
          <Building2 class="mr-2 h-4 w-4" />
          <span>Organizations</span>
        </CommandItem>
        <CommandItem value="analytics" @select="navigateTo('/analytics')">
          <BarChart3 class="mr-2 h-4 w-4" />
          <span>Analytics</span>
        </CommandItem>
      </CommandGroup>

      <CommandSeparator />

      <!-- Settings & Account -->
      <CommandGroup heading="Settings">
        <CommandItem value="profile" @select="navigateTo(userRole === 'admin' ? '/admin/profile' : '/profile')">
          <User class="mr-2 h-4 w-4" />
          <span>Profile</span>
        </CommandItem>
        <CommandItem value="security" @select="navigateTo(userRole === 'admin' ? '/admin/security' : '/user/security')">
          <Shield class="mr-2 h-4 w-4" />
          <span>Security</span>
        </CommandItem>
        <CommandItem value="billing" @select="navigateTo(userRole === 'admin' ? '/admin/billing' : '/billing')">
          <CreditCard class="mr-2 h-4 w-4" />
          <span>Billing</span>
        </CommandItem>
      </CommandGroup>

      <CommandSeparator />

      <!-- Actions -->
      <CommandGroup heading="Actions">
        <CommandItem value="logout" @select="handleLogout">
          <LogOut class="mr-2 h-4 w-4" />
          <span>Logout</span>
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </CommandDialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  Tag,
  Users,
  Building2,
  UserCog,
  BarChart3,
  Link,
  User,
  Shield,
  CreditCard,
  LogOut,
  FileText,
} from 'lucide-vue-next';

interface Props {
  userRole?: string;
}

const props = defineProps<Props>();
const router = useRouter();
const open = ref(false);

// Expose method to open menu from parent
defineExpose({
  openMenu: () => {
    open.value = true;
  }
});

const navigateTo = (path: string) => {
  open.value = false;
  router.push(path);
};

const handleLogout = () => {
  open.value = false;
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  router.push('/login');
};

const handleKeyDown = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    open.value = !open.value;
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});
</script>
