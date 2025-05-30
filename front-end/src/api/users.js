import api from '@/api/api'

export default {
    // POST /api/login 
    login(credentials) {
        return api().post("/login", credentials);
    },

    // GET /api/users/me 
    getAuthUser() {
        return api().get("users/me");
    },

    // PATCH /api/users/me 
    updateAuthUser(data) {
        return api().patch("users/me", data);
    },

    // POST /api/register 
    register(userData) {
        return api().post("/register", userData);
    }
}