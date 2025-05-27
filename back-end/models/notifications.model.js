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

export async function checkConsumptionChanges(houseId) {
  const now = moment();
  const results = {};

  const periods = ["day", "week", "month"];
  for (const period of periods) {
    const previous = moment(now).subtract(1, period);
    const current = await getConsumptionByPeriod(houseId, period, now);
    const prev = await getConsumptionByPeriod(houseId, period, previous);

    const difference = current - prev;
    const percentage_change = prev !== 0 ? (difference / prev) * 100 : 0;

    results[period] = {
      current,
      previous: prev,
      difference,
      percentage_change,
    };
  }

  return results;  
}


export async function getPeakHourConsumption(houseId) {
  const date = moment().subtract(1, "day").format("YYYY-MM-DD");
  const query = `
    SELECT HOUR(reading_date) as hour, SUM(consumption_value) as total 
    FROM consumption_readings
    WHERE id_house = ? 
    AND DATE(reading_date) = ? 
    GROUP BY hour 
    ORDER BY total DESC 
    LIMIT 1
  `;

  const [result] = await db.query(query, [houseId, date]);
  return {
    hour: result[0]?.hour || null,
    value: result[0]?.total || 0,
  };
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
