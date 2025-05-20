// import cron from 'node-cron';
// import db from '../config/connect.js';
// import moment from 'moment';

// // Configuração de valores para simulação
// const CONSUMPTION_PROFILES = {
//   low: { min: 10, max: 30 },   
//   normal: {min:200, max:400} ,     // Consumo baixo (para trigger de redução)
//   high: { min: 800, max: 1200 },       // Consumo alto (para trigger de aumento)
//   peak: { min: 1500, max: 2000 }      // Pico de consumo
// };



// // Busca todas as casas ativas
// async function getActiveHouses() {
//   try {
//     const [houses] = await db.query(
//       `SELECT id_house FROM houses WHERE active = TRUE`
//     );
//     return houses.map(house => house.id_house);
//   } catch (error) {
//     console.error("Erro ao buscar casas ativas:", error);
//     return [];
//   }
// }

// // Gera dados de consumo variados
// async function simulateConsumption() {
//   const activeHouses = await getActiveHouses();
  
//   if (activeHouses.length === 0) {
//     console.log("Nenhuma casa ativa encontrada.");
//     return;
//   }

//   for (const houseId of activeHouses) {
//     try {
//       // Gera 4 leituras com perfis diferentes
//       const readings = [
//         { type: "low", value: getRandomInRange(CONSUMPTION_PROFILES.low) },
//         { type: "normal", value: getRandomInRange(CONSUMPTION_PROFILES.normal) },
//         { type: "high", value: getRandomInRange(CONSUMPTION_PROFILES.high) },
//         { type: "peak", value: getRandomInRange(CONSUMPTION_PROFILES.peak) }
//       ];

//       for (const reading of readings) {
//         // Usa timestamps variados nas últimas 24 horas
//         const randomDate = moment()
//           .subtract(Math.floor(Math.random() * 24), 'hours')
//           .subtract(Math.floor(Math.random() * 60), 'minutes')
//           .format('YYYY-MM-DD HH:mm:ss');

//         await db.query(
//           `INSERT INTO consumption_readings 
//            (id_house, consumption_value, reading_date) 
//            VALUES (?, ?, ?)`,
//           [houseId, reading.value, randomDate]
//         );
        
//         console.log(`Casa ${houseId}: ${reading.type} (${reading.value}W) em ${randomDate}`);
//       }

//       // Atualiza a média diária para a casa
//       await updateDailyAverage(houseId);

//     } catch (error) {
//       console.error(`Erro ao gerar dados para casa ${houseId}:`, error);
//     }
//   }
// }

// // Atualiza a média diária para uma casa específica
// async function updateDailyAverage(houseId) {
//   try {
//     const [result] = await db.query(
//       `UPDATE consumption_readings cr
//        JOIN (
//          SELECT id_house, AVG(consumption_value) as avg_value
//          FROM consumption_readings
//          WHERE id_house = ? AND DATE(reading_date) = CURDATE()
//          GROUP BY id_house
//        ) as daily ON cr.id_house = daily.id_house
//        SET cr.daily_average = daily.avg_value
//        WHERE cr.id_house = ? AND DATE(cr.reading_date) = CURDATE()`,
//       [houseId, houseId]
//     );
//     console.log(`Média diária atualizada para casa ${houseId}`);
//   } catch (error) {
//     console.error(`Erro ao atualizar média para casa ${houseId}:`, error);
//   }
// }

// // Função auxiliar para gerar valores aleatórios
// function getRandomInRange(range) {
//   return (Math.random() * (range.max - range.min) + range.min).toFixed(2);
// }

// // Agenda a simulação para rodar a cada 15 minutos
// cron.schedule('*/1 * * * *', simulateConsumption);
// console.log('Simulação de consumo agendada para rodar a cada 15 minutos.');