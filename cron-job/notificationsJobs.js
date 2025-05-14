import cron from 'node-cron';
import {
  checkHighConsumptionJob,
  checkLowConsumptionJob,
  checkPeakHoursJob
} from '../controllers/notifications.controller.js';

// correm diáriamente às 8 da manhã
cron.schedule('0 8 * * *', checkHighConsumptionJob);

cron.schedule('0 8 * * *', checkLowConsumptionJob);

cron.schedule('0 8 * * *', checkPeakHoursJob);

console.log('Scheduledddddddd.....');