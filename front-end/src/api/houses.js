import api from '@/api/api';

export default {
  // GET /api/users/me/houses
  getAllHouses() {
    return api.get('/users/me/houses');
  },

  // GET /api/users/me/houses/active
  getActiveHouse() {
    return api.get('/users/me/houses/active');
  },

  // POST /api/users/me/houses
  createHouse(houseData) {
    return api.post('/users/me/houses', houseData);
  },

  // Patch /api/users/me/houses/{id}
  updateHouse(id, houseData) {
    return api.patch(`/users/me/houses/${id}`, houseData);
  },

  // DELETE /api/users/me/houses/{id}
  deleteHouse(id) {
    return api.delete(`/users/me/houses/${id}`);
  },

  // PATCH /api/users/me/houses/active/{id} 
  setActiveHouse(id) {
    return api.patch(`/users/me/houses/active/${id}`);
  }
};