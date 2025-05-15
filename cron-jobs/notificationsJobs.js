import cron from 'node-cron';
import {
  checkHighConsumption,
  checkLowConsumption,
  checkPeakHours
} from '../controllers/notifications.controller.js';

// correm diáriamente às 8 da manhã
cron.schedule('0 8 * * *', checkHighConsumption);

cron.schedule('0 8 * * *', checkLowConsumption);

cron.schedule('0 8 * * *', checkPeakHours);

console.log('Scheduledddddddd.....');