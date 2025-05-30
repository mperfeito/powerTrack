import api from '@/api/api'

export default {
    // GET /api/appliances
    getAppliances(){
        return api().get("/appliances");
    },

    // GET /api/appliances/{id}
    getAppliancesById(id){
        return api().get(`/appliances/${id}`);
    },

    // POST /api/appliances
    createAppliance(appliancesData){
        return api().post("/appliances", appliancesData)
    },

    // DELETE /api/appliances/{id}
    deleteAppliance(id){
        return api().delete(`/appliances/${id}`)
    },

    // PATCH /api/appliances/{id}
updateAppliance(id, appliancesData){
  return api().patch(`/appliances/${id}`, appliancesData);
},

}