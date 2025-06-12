import api from '@/api/api';

export default {
  login(credentials) {
    return api.post("/login", credentials);
  },

  getAuthUser() {
    return api.get("/users/me");
  },

  updateAuthUser(data) {
    return api.patch("/users/me", data);
  },

  register(userData) {
    return api.post("/users", userData);
  }, 

  getUsersAdmin() {
    return api.get("/users"); 
  },  

  deleteUser(id) {
    return api.delete(`users/${id}`);
  },
};
