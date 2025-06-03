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

  // PUT /api/users/me/houses/{id}
  updateHouse(id, houseData) {
    return api.put(`/users/me/houses/${id}`, houseData);
  },

  // DELETE /api/users/me/houses/{id}
  deleteHouse(id) {
    return api.delete(`/users/me/houses/${id}`);
  },

  // PUT /api/users/me/houses/active/{id} - ativar casa
  setActiveHouse(id) {
    return api.put(`/users/me/houses/active/${id}`);
  }
};