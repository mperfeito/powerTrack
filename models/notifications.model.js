import { DataTypes, Op } from 'sequelize';
import sequelize from './db.js';
import moment from 'moment';

// ======================
// MODEL DEFINITIONS
// ======================
const ConsumptionReading = sequelize.define('consumption_reading', {
  id_reading: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_house: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  consumption_value: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  reading_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'consumption_readings',
  timestamps: false
});

// ======================
// QUERY FUNCTIONS
// ======================
export async function getConsumptionByPeriod(houseId, period, date) {
  const dateStr = date.format('YYYY-MM-DD');
  const whereClause = { 
    id_house: houseId 
  };

  switch (period) {
    case 'day':
      whereClause.reading_date = {
        [Op.between]: [
          moment(dateStr).startOf('day').toDate(),
          moment(dateStr).endOf('day').toDate()
        ]
      };
      break;
    case 'week':
      whereClause[Op.and] = [
        sequelize.where(
          sequelize.fn('WEEK', sequelize.col('reading_date')),
          sequelize.fn('WEEK', dateStr)
        )
      ];
      break;
    case 'month':
      whereClause[Op.and] = [
        sequelize.where(
          sequelize.fn('MONTH', sequelize.col('reading_date')),
          sequelize.fn('MONTH', dateStr)
        )
      ];
      break;
  }

  const result = await ConsumptionReading.findOne({
    attributes: [
      [sequelize.fn('SUM', sequelize.col('consumption_value')), 'total']
    ],
    where: whereClause,
    raw: true
  });

  return result?.total || 0;
}

export async function checkConsumptionChanges(houseId) {
  const now = moment();
  const results = {};

  const periods = ['day', 'week', 'month'];
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
  const date = moment().subtract(1, 'day').format('YYYY-MM-DD');
  
  const result = await ConsumptionReading.findOne({
    attributes: [
      [sequelize.fn('HOUR', sequelize.col('reading_date')), 'hour'],
      [sequelize.fn('SUM', sequelize.col('consumption_value')), 'total']
    ],
    where: {
      id_house: houseId,
      reading_date: {
        [Op.between]: [
          moment(date).startOf('day').toDate(),
          moment(date).endOf('day').toDate()
        ]
      }
    },
    group: ['hour'],
    order: [[sequelize.literal('total'), 'DESC']],
    raw: true
  });

  return {
    hour: result?.hour || null,
    value: result?.total || 0
  };
}

// Exporta o modelo para uso em outras partes do app
export { ConsumptionReading };