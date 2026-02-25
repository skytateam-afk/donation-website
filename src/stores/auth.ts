import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authAPI, type LoginCredentials, type User } from '@/api/auth';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  
  // State
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<User | null>(
    localStorage.getItem('user') 
      ? JSON.parse(localStorage.getItem('user')!) 
      : null
  );
  const loading = ref(false);

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

  // Actions
  async function login(credentials: LoginCredentials) {
    loading.value = true;
    try {
      const { data } = await authAPI.login(credentials);
      token.value = data.data.token;
      user.value = data.data.user;
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      router.push('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function register(data: any) {
    loading.value = true;
    try {
      const response = await authAPI.register(data);
      token.value = response.data.data.token;
      user.value = response.data.data.user;
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      router.push('/admin/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/admin/login');
  }

  async function fetchProfile() {
    loading.value = true;
    try {
      const { data } = await authAPI.getProfile();
      user.value = data.data;
      localStorage.setItem('user', JSON.stringify(data.data));
    } catch (error) {
      console.error('Fetch profile error:', error);
      // If profile fetch fails, user might be logged out
      logout();
    } finally {
      loading.value = false;
    }
  }

  async function updateProfile(data: Partial<User>) {
    loading.value = true;
    try {
      const response = await authAPI.updateProfile(data);
      user.value = response.data.data;
      localStorage.setItem('user', JSON.stringify(response.data.data));
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    loading.value = true;
    try {
      await authAPI.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function forgotPassword(email: string) {
    loading.value = true;
    try {
      await authAPI.forgotPassword(email);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function resetPassword(token: string, newPassword: string) {
    loading.value = true;
    try {
      await authAPI.resetPassword(token, newPassword);
      router.push('/admin/login');
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    token,
    user,
    loading,
    // Getters
    isAuthenticated,
    isAdmin,
    // Actions
    login,
    register,
    logout,
    fetchProfile,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
  };
});
