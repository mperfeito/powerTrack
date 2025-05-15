import db from "../config/connect.js";


export async function insertConsumptions(houseId, value) {
  try {
    await db.query(
      "INSERT INTO consumption_readings (id_house, consumption_value) VALUES (?, ?)",
      [houseId, value]
    );
    console.log(`Inserted consumption for house ${houseId}: ${value} kWh`);
  } catch (err) {
    console.error(`Insert failed for house ${houseId}:`, err);
  }
}

export async function getHouses() {
  const [rows] = await db.query("SELECT id_house FROM houses");
  return rows;
}

export async function getLatest(houseId) {
   console.log("Procurando latest para houseId:", houseId);
  const query = `
    SELECT consumption_value, reading_date
    FROM consumption_readings
    WHERE id_house = ?
    ORDER BY reading_date DESC
    LIMIT 1
  `;
  const [rows] = await db.query(query, [houseId]);
  return rows;
}

export async function comparePeriod(houseId, period) {
  try {
    let query;
    const currentDate = new Date();

    if (period === "day") {
      const startDate = new Date(currentDate);
      startDate.setDate(startDate.getDate() - 1);

      query = `
        SELECT AVG(consumption_value) as avg_consumption
        FROM consumption_readings
        WHERE id_house = ? 
        AND reading_date BETWEEN ? AND ?
      `;

      const [rows] = await db.query(query, [houseId, startDate, currentDate]);
      return rows[0];
    } else if (period === "week") {
      const startDate = new Date(currentDate);
      startDate.setDate(startDate.getDate() - 7);

      query = `
        SELECT AVG(consumption_value) as avg_consumption
        FROM consumption_readings
        WHERE id_house = ? 
        AND reading_date BETWEEN ? AND ?
      `;

      const [rows] = await db.query(query, [houseId, startDate, currentDate]);
      return rows[0];
    } else if (period === "month") {
      const startDate = new Date(currentDate);
      startDate.setMonth(startDate.getMonth() - 1);

      query = `
        SELECT AVG(consumption_value) as avg_consumption
        FROM consumption_readings
        WHERE id_house = ? 
        AND reading_date BETWEEN ? AND ?
      `;

      const [rows] = await db.query(query, [houseId, startDate, currentDate]);
      return rows[0];
    }

    throw new Error("Invalid period specified");
  } catch (error) {
    console.error("Error in comparePeriod:", error);
    throw error;
  }
}

export async function getAverageConsumption(houseId, period, date) {
  const query = `
    SELECT AVG(consumption_value) AS avg 
    FROM consumption_readings
    WHERE id_house = ? 
    AND MONTH(reading_date) = MONTH(?)
    AND YEAR(reading_date) = YEAR(?)
  `;
  const [result] = await db.query(query, [
    houseId,
    date.format("YYYY-MM-DD"),
    date.format("YYYY-MM-DD"),
  ]);
  return result[0].avg || 0;
}

export async function compareWithSimilarHouses(houseId) {
  try {
    const [houseData] = await db.query(
      `
      SELECT address 
      FROM houses 
      WHERE id_house = ?
    `,
      [houseId]
    );

    const [currentHouse] = await db.query(
      `
      SELECT AVG(consumption_value) as avg
      FROM consumption_readings
      WHERE id_house = ?
    `,
      [houseId]
    );

    const currentAvg = Number(currentHouse[0]?.avg) || 0;

    const [similarHouses] = await db.query(
      `
      SELECT 
        h.id_house,
        AVG(cr.consumption_value) as avg
      FROM houses h
      JOIN consumption_readings cr ON h.id_house = cr.id_house
      WHERE h.city = (SELECT city FROM houses WHERE id_house = ?)
      AND h.id_house != ?
      GROUP BY h.id_house
    `,
      [houseId, houseId]
    );

    let similarAvg = 0;
    const comparedHouses = [];

    if (similarHouses.length > 0) {
      similarAvg =
        similarHouses.reduce((sum, house) => {
          comparedHouses.push(house.id_house);
          return sum + Number(house.avg);
        }, 0) / similarHouses.length;
    }

    let difference = "0%";
    if (similarAvg > 0) {
      const diff = ((currentAvg - similarAvg) / similarAvg) * 100;
      difference = (diff >= 0 ? "+" : "") + diff.toFixed(2) + "%";
    } else if (currentAvg > 0) {
      difference = "+∞%";
    }

    return {
      selectedHouse: {
        id: houseId,
        address: houseData[0]?.address || "Endereço não encontrado",
      },
      comparedHouses,
      comparison: difference,
    };
  } catch (error) {
    console.error("Error in compareWithSimilarHouses:", error);
    throw error;
  }
}
export async function compareDevices(houseId) {
  try {
    const [totalResult] = await db.query(
      `
      SELECT IFNULL(SUM(consumption_value), 0) as total 
      FROM consumption_readings 
      WHERE id_house = ?
    `,
      [houseId]
    );

    const totalConsumption = Number(totalResult[0].total);

    const [devices] = await db.query(
      `
      SELECT 
        type,
        SUM(nominal_power_watts * operating_hours / 1000) as estimated_kwh
      FROM appliances
      WHERE id_house = ?
      GROUP BY type
      ORDER BY estimated_kwh DESC
      LIMIT 1
    `,
      [houseId]
    );

    if (!devices || devices.length === 0) {
      return { maxConsumer: null };
    }

    const deviceConsumption = Number(devices[0].estimated_kwh);
    const percentage =
      totalConsumption > 0
        ? ((deviceConsumption / totalConsumption) * 100).toFixed(2)
        : "0.00";

    return {
      maxConsumer: {
        type: devices[0].type,
        consumption: `${deviceConsumption.toFixed(2)} kWh`,
        percentage: `${percentage}%`,
      },
    };
  } catch (error) {
    console.error("Error in compareDevices:", error);
    throw error;
  }
}
