import db from "../config/connect.js";
import moment from "moment";

export async function getConsumptionByPeriod(houseId, period, date) {
  let query;
  const dateStr = date.format("YYYY-MM-DD");

  switch (period) {
    case "day":
      query = `
        SELECT SUM(consumption_value) AS total 
        FROM consumption_readings
        WHERE id_house = ? 
        AND DATE(reading_date) = ?
      `;
      break;
    case "week":
      query = `
        SELECT SUM(consumption_value) AS total 
        FROM consumption_readings
        WHERE id_house = ? 
        AND WEEK(reading_date) = WEEK(?) 
        AND YEAR(reading_date) = YEAR(?)
      `;
      break;
    case "month":
    default:
      query = `
        SELECT SUM(consumption_value) AS total 
        FROM consumption_readings
        WHERE id_house = ? 
        AND MONTH(reading_date) = MONTH(?) 
        AND YEAR(reading_date) = YEAR(?)
      `;
  }

  const [result] = await db.query(query, [houseId, dateStr, dateStr]);
  return result[0].total || 0;
}

export async function getPeakHourConsumption(houseId) {
  try {
    const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');
    console.log(`Checking peak hour for house ${houseId} on ${yesterday}`);
    
    // First check if we have any data for yesterday
    const dataCheckQuery = `
      SELECT COUNT(*) as count 
      FROM consumption_readings 
      WHERE id_house = ? 
      AND DATE(reading_date) = ?
    `;
    const [dataCheck] = await db.query(dataCheckQuery, [houseId, yesterday]);
    
    if (dataCheck[0].count === 0) {
      console.log(`No consumption data found for house ${houseId} on ${yesterday}`);
      return { hour: null, value: 0 };
    }

    const peakQuery = `
      SELECT HOUR(reading_date) as hour, 
             SUM(consumption_value) as total 
      FROM consumption_readings
      WHERE id_house = ? 
      AND DATE(reading_date) = ? 
      GROUP BY hour 
      ORDER BY total DESC 
      LIMIT 1
    `;

    const [result] = await db.query(peakQuery, [houseId, yesterday]);
    console.log('Peak hour query result:', result);
    
    if (result.length > 0) {
      return {
        hour: result[0].hour,
        value: result[0].total || 0
      };
    }
    return { hour: null, value: 0 };
  } catch (error) {
    console.error('Error in getPeakHourConsumption:', error);
    return { hour: null, value: 0 };
  }
}


export async function createNotification(houseId, type, message, data = {}) {
  const query = `
    INSERT INTO notifications (id_house, type, message)
    VALUES (?, ?, ?)
  `;

  await db.query(query, [houseId, type, message]);
}

export async function getNotifications(houseId) {
  try {
    const [notifications] = await db.query(
      "SELECT * FROM notifications WHERE id_house = ? ORDER BY created_at DESC",
      [houseId]
    );
    return notifications;
  } catch (err) {
    console.log("Error fetching notifications:", err);
    throw err;
  }
}

export async function deleteNotificationById(notificationId) {
  const query = "DELETE FROM notifications WHERE id = ?";
  await db.query(query, [notificationId]);
} 

export async function getLastNotificationDate(houseId) {
  const query = `
    SELECT MAX(created_at) as last_date 
    FROM notifications 
    WHERE id_house = ?
  `;
  const [result] = await db.query(query, [houseId]);
  return result[0]?.last_date || null;
}

export async function wasNotifiedToday(houseId) {
  const lastDate = await getLastNotificationDate(houseId);
  if (!lastDate) return false;
  
  const lastNotificationDate = moment(lastDate).startOf('day');
  const today = moment().startOf('day');
  
  return lastNotificationDate.isSame(today);
}
