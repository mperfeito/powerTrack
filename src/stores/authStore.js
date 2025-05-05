import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { useRouter } from "vue-router";

export const useAuthStore = defineStore("auth", () => {
  const router = useRouter();
  const user = ref(null);
  const token = ref(localStorage.getItem("token") || null);
  const errors = ref([]);

  const setToken = (newToken) => {
    token.value = newToken;
    localStorage.setItem("token", newToken);
    axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
  };

  const setUser = (userData) => {
    user.value = userData;
  };

  const login = async (credentials) => {
    try {
      errors.value = [];
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        credentials
      );
      setToken(response.data.token);
      await fetchUser();
      router.push("/");
    } catch (error) {
      if (error.response && error.response.data) {
        errors.value = error.response.data.error;
      } else {
        errors.value = ["An unexpected error occurred"];
      }
    }
  };

  const register = async (userData) => {
    try {
      errors.value = [];
      const response = await axios.post(
        "http://localhost:3000/api/auth/register",
        userData
      );
      setToken(response.data.token);
      await fetchUser();
      router.push("/");
    } catch (error) {
      if (error.response && error.response.data) {
        errors.value = error.response.data.error;
      } else {
        errors.value = ["An unexpected error occurred"];
      }
    }
  };

  const fetchUser = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/auth/me");
      setUser(response.data);
    } catch (error) {
      logout();
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    router.push("/login");
  };

  return {
    user,
    token,
    errors,
    login,
    register,
    fetchUser,
    logout,
  };
});
