import api from '@/api/api'

export default {

  // GET /api/consumptions/latest
  getLatestReading() {
    return api.get('/consumptions/latest');
  },

  // GET /api/consumptions/compare-period?period=day|week|month
  getPeriodComparison(period) {
    return api.get('/consumptions/compare-period', {
      params: { period }
    });
  },

  // GET /api/consumptions/compare-similar
  getSimilarHouses() {
    return api.get('/consumptions/compare-similar');
  },

  // GET /api/consumptions/compare-devices
  getDevicesComparison() {
    return api.get('/consumptions/compare-devices');
  }
}
