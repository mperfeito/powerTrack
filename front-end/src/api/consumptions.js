import api from '@/api/api'

export default {

  // GET //api/consumptions?type=latest
  getLatestReading() {
    return api.get('/consumptions?type=latest');
  },

  // GET /api/consumptions/compare-period?period=day|week|month
  getPeriodComparison(period) {
    return api.get('/consumptions?type=period', {
      params: { period }
    });
  },
  
  // GET /api/consumptions?type=similar
  getSimilarHouses() {
    return api.get('/consumptions?type=similar');
  },

  // GET /api/consumptions?type=devices
  getDevicesComparison() {
    return api.get('/consumptions?type=devices');
  },

  // GET /api/consumptions?type=history&limit=5
  getConsumptionHistory(limit) {
    return api.get('/consumptions?type=history&limit=5', {
      params: { limit }
    });
  }
}