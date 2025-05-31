import api from '@/api/api'

export default {
    // GET /api/appliances
    getAllAppliances(){
        return api.get(`/appliances`);
    },

    // GET /api/appliances/{id}
    getApplianceById(id){
        return api.get(`/appliances/${id}`);
    },

    // POST /api/appliances
    createAppliance(appliancesData) {
        return api.post('/appliances', appliancesData)
    },

    // DELETE /api/appliances/{id}
    deleteAppliance(id){
        return api.delete(`/appliances/${id}`)
    },

    // PATCH /api/appliances/{id}
updateAppliance(id, appliancesData){
  return api.patch(`/appliances/${id}`, appliancesData);
},
}