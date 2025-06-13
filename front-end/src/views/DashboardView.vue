<template>
  <div class="d-flex">
    <Sidebar />
    <div class="dashboard-container flex-grow-1 p-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-dark fw-bold">
          <i class="fas fa-tachometer-alt me-2" style="color: #467054;"></i> Energy Dashboard
        </h2>
        <div class="d-flex gap-2">
        </div>
      </div>
      <div class="widgets-grid">
        <!-- CURRENT CONSUMPTION -->
        <div class="widget-card current-consumption main-widget">
          <div class="widget-header">
            <h5 class="text-dark">
              <i class="fas fa-bolt me-2" style="color: #467054;"></i> Current Consumption
            </h5>
            <span class="badge" style="background-color: #dfb046; color: white;">Live</span>
          </div>

          <div class="widget-content" v-if="!consumptionsStore.isLoading">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h1 class="display-4" style="color: #467054;">
                  {{ currentConsumption }}
                  <small style="color: #dfb046;">kW</small>
                </h1>
              </div>

            </div>
            <div id="chart-container" style="display: flex; justify-content: center; align-items: center;">
              <apexchart type="line" width="600" height= "200" :options="chartOptions" :series="series"></apexchart>
            </div>
          </div>

          <div v-else class="text-muted py-3">
            Loading current consumption...
          </div>
        </div>

        <!-- NEIGHBORHOOD COMPARISON -->
        <div class="widget-card neighborhood-widget small-widget">  
          <header class="neighborhood-header">
            <h5 class="text-dark">
              <i class="fas fa-map-marker-alt icon" style="color: #467054; margin-right: 0.6rem;"></i> Neighborhood
            </h5>
          </header>

          <div v-if="consumptionsStore.isLoadingSimilarHouses" class="loading-state">
            <i class="fas fa-spinner fa-spin me-2"></i>
            Loading neighborhood data...
          </div>

          <div v-else-if="consumptionsStore.hasErrorSimilarHouses" class="error-state">
            <i class="fas fa-exclamation-triangle me-2"></i>
            {{ consumptionsStore.errorSimilarHouses }}
          </div>

          <div v-else-if="consumptionsStore.similarHouses" class="neighborhood-content">
            <div class="my-house-card">
              <div class="house-icon">
                <i class="fas fa-home"></i>
              </div>
              <div class="house-info">
                <h6 class="house-title">My Home</h6>
                <p class="house-address">{{ myHouseAddress }}</p>
              </div>
            </div>

            <div class="comparison-result">
              <div class="comparison-icon" :class="{ positive: isPositiveComparison, negative: !isPositiveComparison }">
                <i :class="isPositiveComparison ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
              </div>
              <div class="comparison-details">
                <span class="comparison-label">Consumption difference:</span>
                <span class="comparison-value" :class="{ positive: isPositiveComparison, negative: !isPositiveComparison }">
                  {{ comparisonValue }}
                </span>
              </div>
            </div>

            <div class="comparison-context">
              <span class="context-text">
                <i class="fas fa-users me-1"></i>
                Comparing with <strong>{{ comparedHousesCount }}</strong> nearby houses
              </span>
            </div>
          </div>

          <div v-else class="no-data-state">
            <i class="fas fa-info-circle me-2"></i>
            No neighborhood data available
          </div>
        </div>

        <!-- TOP CONSUMING DEVICE -->
        <div class="widget-card top-device medium-widget" v-if="topDevice">
          <div class="widget-header">
            <h5 class="text-dark">
              <i class="fas fa-fire" style="color: #467054; margin-right: 0.4rem;"></i> Top Consuming Device
            </h5>
          </div>
          <div class="widget-content">
            <!-- Main Device -->
            <div class="champion-device">
              <div class="device-medal">
                <div class="medal-circle" style="background: linear-gradient(135deg, #dfb046, #f8d37a);">
                  <i class="fas fa-bolt"></i>
                </div>
                <div class="medal-ribbon"></div>
              </div>
              <div class="device-info">
                <h5 class="device-name">{{ topDevice.type }}</h5>
                <div class="device-stats-row">
                  <div class="stat-box">
                    <span class="stat-value">{{ topDeviceConsumptionKW }} kW</span>
                  </div>
                </div>
              </div>
            </div>
            <!-- Progress -->
            <div class="energy-meter">
              <div class="meter-track">
                <div class="meter-progress" :style="{ width: topDevicePercentage + '%' }"></div>
              </div>
              <div class="meter-labels">
                <span>{{ topDevicePercentage }}%</span>
                <span>100%</span>
              </div>
            </div>
            <!-- Other Devices -->
            <div class="contenders-title">
              <i class="fas fa-trophy" style="color: #467054;"></i>
              Other Devices
            </div>          
            <div class="device-list">
              <div v-for="device in otherDevices" :key="device.id" class="contender-device">
                <div class="contender-icon">
                  <i class="fas fa-plug"></i>
                </div>
                <span class="contender-name">{{ device.type }}</span>
                <span class="contender-value">{{ (device.dailyConsumption / 1000).toFixed(1) }} kW</span>
              </div>
            </div>
          </div>
        </div>

        <!-- GOAL PROGRESS -->
        <div class="widget-card goal-progress main-widget">
          <div class="widget-header">
            <h5 class="text-dark">
              <i class="fas fa-bullseye me-2" style="color: #467054;"></i> Goal Progress
            </h5>
          </div>
          <div class="widget-content" v-if="!goalsStore.isLoading">
            <div v-if="activeGoal" class="optimized-goal-container">
              <div class="left-section">
                <div class="chart-wrapper">
                  <apexchart 
                    type="radialBar" 
                    height="180"
                    :options="goalsChartOptions" 
                    :series="goalsSeries"
                  ></apexchart>
                  <div class="chart-label">
                    <div class="days-remaining">{{ daysRemaining }}</div>
                    <div class="days-text">days remaining</div>
                  </div>
                </div>
                <div class="date-container">
                  <div class="date-item">
                    <i class="fas fa-play"></i>
                    <span>{{ formatDate(activeGoal.start_date) }}</span>
                  </div>
                  <div class="date-item">
                    <i class="fas fa-flag"></i>
                    <span>{{ formatDate(activeGoal.end_date) }}</span>
                  </div>
                </div>
              </div>
              <div class="right-section">
                <div class="info-card" :class="{ completed: isGoalCompleted }">
                  <div class="info-icon">
                    <i class="fas fa-bolt"></i>
                  </div>
                  <div class="info-content">
                    <div class="info-label">Current</div>
                    <div class="info-value">{{ goalProgressAchieved }} kWh</div>
                  </div>
                </div>
                <div class="info-card">
                  <div class="info-icon" style="color: #467054;">
                    <i class="fas fa-bullseye"></i>
                  </div>
                  <div class="info-content">
                    <div class="info-label">Target</div>
                    <div class="info-value">{{ activeGoal.target_value }} kWh</div>
                  </div>
                </div>
                <div class="info-card">
                  <div class="info-icon" style="color: #467054;">
                    <i class="fas fa-hourglass-half"></i>
                  </div>
                  <div class="info-content">
                    <div class="info-label">Remaining</div>
                    <div class="info-value">{{ goalProgressRemaining }} kWh</div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="no-goal">
              <i class="fas fa-bullseye"></i>
              <p>No active goal set</p>
            </div>
          </div>
          <div v-else class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            Loading...
          </div>
        </div>

        <!-- PERIOD AVERAGE -->
        <div class="widget-card time-comparison main-widget position-relative"> 
          <div class="widget-header d-flex justify-content-between align-items-center">
            <h5 class="text-dark">
              <i class="fas fa-chart-line me-2" style="color: #467054;"></i> Period Average
            </h5>
          </div>
          <div class="widget-content" v-if="periodSeries.length > 0">
            <apexchart 
              type="line" 
              width="100%"
              height="250" 
              :options="periodChartOptions" 
              :series="periodSeries"
            ></apexchart>
          </div>
          <div v-else class="text-center py-3">
            Loading period data...
          </div>
        </div>
  
      </div>
    </div>
  </div>
</template>

<script setup>
import Sidebar from "@/components/Sidebar.vue";
import { useAppliancesStore } from "@/stores/appliancesStore";
import { useConsumptionsStore } from "@/stores/consumptionsStore";
import { ref, onMounted, computed, onBeforeUnmount } from "vue"; 
import { useGoalsStore } from "../stores/goalsStore";
import VueApexCharts from "vue3-apexcharts";


const appliancesStore = useAppliancesStore();
const consumptionsStore = useConsumptionsStore(); 
const goalsStore = useGoalsStore();
const activeGoal = computed(() => goalsStore.activeGoal);

onMounted(async () => {  
  appliancesStore.fetchAppliances();  
  consumptionsStore.fetchAllPeriodComparisons();
  consumptionsStore.fetchLatestReading();
  consumptionsStore.fetchSimilarHouses(); 
  consumptionsStore.fetchConsumptionHistory();

    onBeforeUnmount(() => clearInterval(interval));

  await goalsStore.fetchGoals();
  if (goalsStore.activeGoal) {
    await goalsStore.calculateGoalProgress(goalsStore.activeGoal.id);
  }  

  const interval = setInterval(() => {
    consumptionsStore.fetchLatestReading();
  }, 2 * 60 * 1000); 
});

////////// GOALS ////////// 
// Days Remaining in the Goal
const daysRemaining = computed(() => {
  if (!activeGoal.value) return 0;
  const today = new Date();
  const endDate = new Date(activeGoal.value.end_date);
  if (today > endDate) return 0;
  const diffTime = endDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// For the Apex Chart: Percentage of the Goal(depending on the days left)
// const daysPercentage = computed(() => {
//   if (!activeGoal.value) return 0;
//   const totalDays = Math.ceil(
//     (new Date(activeGoal.value.end_date) - new Date(activeGoal.value.start_date)) / 
//     (1000 * 60 * 60 * 24)
//   );
//   return Math.round((daysRemaining.value / totalDays) * 100);
// });

// Current Consumption since the startDate goal date
const goalProgressAchieved = computed(() => {
  if (!activeGoal.value) return 0;
  const progress = goalsStore.goalProgress[activeGoal.value.id];
  return progress ? parseFloat(progress.achieved).toFixed(1) : 0;
});

// Remaining Consumption
const goalProgressRemaining = computed(() => {
  if (!activeGoal.value) return 0;
  const progress = goalsStore.goalProgress[activeGoal.value.id];
  return progress ? Math.max(0, parseFloat(progress.remaining)).toFixed(1) : 0;
});

const isGoalCompleted = computed(() => {
  if (!activeGoal.value) return false;
  const progress = goalsStore.goalProgress[activeGoal.value.id];
  return progress ? progress.isCompleted : false;
});

// GOALS CHART
const goalsSeries = computed(() => {
  if (!activeGoal.value) return [0];
  const today = new Date();
  const startDate = new Date(activeGoal.value.start_date);
  const endDate = new Date(activeGoal.value.end_date);
  
  if (today >= endDate) return [100];
  if (today <= startDate) return [0];
  
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
  return [(elapsedDays / totalDays) * 100];
});

const goalsChartOptions = ref({
  chart: {
    type: 'radialBar',
    height: 180,
    sparkline: {
      enabled: false
    }
  },
  plotOptions: {
    radialBar: {
      startAngle: -90,
      endAngle: 90,
      hollow: {
        margin: 0,
        size: '70%',
      },
      track: {
        background: '#e0e0e0',
        strokeWidth: '97%',
        margin: 5,
      },
      dataLabels: {
        show: false
      },
    }
  },
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'light',
      shadeIntensity: 0.4,
      inverseColors: false,
      opacityFrom: 1,
      opacityTo: 0.6,
      stops: [0, 100],
      colorStops: [
        {
          offset: 0,
          color: '#dfb046',
          opacity: 1
        },
        {
          offset: 100,
          color: '#467054',
          opacity: 1
        }
      ]
    }
  },
  stroke: {
    lineCap: 'round'
  },
  labels: ['Progress'],
});

// Date Format
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-GB', options);
};


/////// GOALS CHART ANTIGO///////
// const radialChartOptions = ref({
//   series: [0],
//   chart: {
//     height: 250,
//     type: 'radialBar',
//     toolbar: {
//       show: false
//     }
//   },
//   plotOptions: {
//     radialBar: {
//       startAngle: -135,
//       endAngle: 225,
//       hollow: {
//         margin: 0,
//         size: '70%',
//         background: '#fff',
//         dropShadow: {
//           enabled: true,
//           top: 3,
//           left: 0,
//           blur: 4,
//           opacity: 0.5
//         }
//       },
//       track: {
//         background: '#fff',
//         strokeWidth: '67%',
//         margin: 0,
//         dropShadow: {
//           enabled: true,
//           top: -3,
//           left: 0,
//           blur: 4,
//           opacity: 0.7
//         }
//       },
//       dataLabels: {
//         show: true,
//         name: {
//           offsetY: -10,
//           show: true,
//           color: '#888',
//           fontSize: '17px'
//         },
//         value: {
//           formatter: function(val) {
//             return parseInt(val);
//           },
//           color: '#111',
//           fontSize: '36px',
//           show: true,
//         }
//       }
//     }
//   },
// fill: {
//   type: 'gradient',
//   gradient: {
//     shade: 'dark',
//     type: 'horizontal',
//     shadeIntensity: 0.5,
//     gradientToColors: ['#dfb046'],
//     inverseColors: false,
//     opacityFrom: 1,
//     opacityTo: 1,
//     stops: [0, 100],
//     colorStops: [
//       {
//         offset: 0,
//         color: '#467054',
//         opacity: 1
//       },
//       {
//         offset: 100,
//         color: '#dfb046',
//         opacity: 1
//       }
//     ]
//   }
// },
//   stroke: {
//     lineCap: 'round'
//   },
//   labels: ['Progress'],
// });

// const radialSeries = computed(() => {
//   return [goalProgressPercentage.value];
// });

// const goalProgressPercentage = computed(() => {
//   if (!activeGoal.value) return 0;
//   const progress = goalsStore.goalProgress[activeGoal.value.id];
//   return progress ? Math.round(progress.percentage) : 0;
// });


////////// CURRENT CONSUMPTION //////////
const currentConsumption = computed(() => {
  const value = consumptionsStore.latestReading?.consumption_value;
  return value !== undefined && value !== null ? parseFloat(value).toFixed(2) : 'N/A';
});
/////// Current Consumption CHART ///////
const apexchart = VueApexCharts;

const series = computed(() => {
  // Get all the consumption values
  const history = consumptionsStore.consumptionHistory || [];

  const numericHistory = history
    .map(h => parseFloat(h))
    .filter(h => !isNaN(h));

  // GET current consumption
  const currentValue = consumptionsStore.latestReading?.consumption_value;
  const currentNumber = currentValue !== undefined && currentValue !== null
    ? parseFloat(currentValue)
    : null;

  const finalData = currentNumber !== null && !isNaN(currentNumber)
    ? [...numericHistory, currentNumber]
    : [...numericHistory];

  return [{
    name: "Consumption",
    data: finalData
  }];
});

const chartOptions = ref({
  chart: {
    type: 'line',
    animations: {
      enabled: true,
      easing: 'linear',
      speed: 300
    },
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false
    }
  },
  stroke: {
    curve: 'smooth',
    width: 3
  },
  colors: ['#467054'],
  xaxis: {
    categories: ['1', '2', '3', '4', '5', '6', '7', '8', 'Current'],
    labels: {
      style: {
        colors: '#467054'
      }
    }
  },
  yaxis: {
    labels: {
      formatter: function(val) {
        return val ? val.toFixed(2) + ' kW' : '';
      }
    }
  },
  tooltip: {
    enabled: true,
    y: {
      formatter: function(val) {
        return val ? val.toFixed(2) + ' kW' : 'No data';
      }
    }
  },
  markers: {
    size: 5,
    hover: {
      size: 7
    }
  },
  noData: {
    text: 'Loading data...'
  }
});

////////// NEIGHBORHOOD //////////
// Computed property to determine if the consumption comparison is positive
const isPositiveComparison = computed(() => {
  const comparison = consumptionsStore.similarHouses?.comparison || ''
  return comparison.startsWith('+')
})

// Computed property to get the address of the selected house
const myHouseAddress = computed(() =>
  consumptionsStore.similarHouses?.selectedHouse?.address || 'N/A'
)

// Computed property to get the number of houses being compared
const comparedHousesCount = computed(() =>
  consumptionsStore.similarHouses?.comparedHouses?.length || 0
)

// Computed property to get the comparison value (e.g., "+10.5%")
const comparisonValue = computed(() =>
  consumptionsStore.similarHouses?.comparison || 'N/A'
)

///////// TOP APPLIANCE ////////
// Sort appliances by consumption
const sortedAppliances = computed(() => {
  return appliancesStore.appliances
    .map(appliance => ({
      ...appliance,
      dailyConsumption: (appliance.nominal_power_watts || 0) * (appliance.avg_operating_hours || appliance.operating_hours || 0)
    }))
    .sort((a, b) => b.dailyConsumption - a.dailyConsumption);
});

// Top consuming appliance
const topDevice = computed(() => sortedAppliances.value[0]);

// Other appliances (excluding the top one)
const otherDevices = computed(() => sortedAppliances.value.slice(1, 5));

// Total daily consumption
const totalConsumption = computed(() =>
  sortedAppliances.value.reduce((acc, device) => acc + device.dailyConsumption, 0)
);

// Daily consumption of the top device in kW
const topDeviceConsumptionKW = computed(() => (topDevice.value?.dailyConsumption || 0) / 1000);

// Percentage of total consumption for the top device
const topDevicePercentage = computed(() => {
  if (!totalConsumption.value || !topDevice.value) return 0;
  return ((topDevice.value.dailyConsumption / totalConsumption.value) * 100).toFixed(0);
});

/////////  PERIOD AVERAGE ////////
// PERIOD COMPARISON CHART //
const periodChartOptions = ref({
  chart: {
    type: 'line', 
    toolbar: { show: false },
  },
  colors: ['#467054', '#dfb046', '#3a7bd5'],
  xaxis: {
    categories: ['Daily', 'Weekly', 'Monthly'],
    labels: { style: { colors: '#467054' } }
  },
  yaxis: {
    title: { text: 'Consumption (kW)' },
    labels: { formatter: (val) => val.toFixed(2) }
  },
  stroke: {
    width: 3,
    curve: 'smooth'
  },
  markers: {
    size: 4
  },
  legend: {
    position: 'top'
  }
});

const periodSeries = computed(() => {
  if (!consumptionsStore.periodComparison) return [];
  const { daily, weekly, monthly } = consumptionsStore.periodComparison;

  return [
    {
      name: 'Daily',
      data: [1, 2, 3, 4, 5].map((day) => ({ x: `Day ${day}`, y: daily }))
    },
    {
      name: 'Weekly',
      data: [1, 2, 3, 4, 5].map((week) => ({ x: `Week ${week}`, y: weekly }))
    },
    {
      name: 'Monthly',
      data: [1, 2, 3, 4, 5].map((month) => ({ x: `Month ${month}`, y: monthly }))
    }
  ];
});

</script>

<style scoped lang="scss">
.dashboard-container {
  background: white;
  margin-left: 250px;
  min-height: 100vh;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23467054' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
}

.widgets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  grid-auto-rows: minmax(180px, auto);
}

.widget-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    border-color: #dfb046;
  }
}
.main-widget {
  grid-column: span 2;
  grid-row: span 1;
  display: flex;
  flex-direction: column;
  
  .widget-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    
    h1 {
      font-size: 3.5rem;
      margin-bottom: 1rem;
    }
  }
}
.medium-widget {
  grid-row: span 1;
}

.small-widget {
  grid-row: span 1;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  h5 {
    margin: 0;
    font-weight: 600;
    color: #212529;
  }
}

.widget-header select.form-select {
  border: 1px solid #467054;
  border-radius: 0.4rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.9rem;
  color: #467054;
  background-color: white;
  cursor: pointer;
}

.trend-indicator {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  background-color: rgba(223, 176, 70, 0.1);
}

// PERIOD AVERAGE CARD
.time-comparison-chart {
  display: flex;
  gap: 1rem;
  height: 8rem;
  align-items: center;
  justify-content: center;
  margin-top: 3rem;

  .chart-bar {
    width: 10rem; 
    border-radius: 0.5rem 0.5rem 0 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 0.2rem;
    text-align: center;
    font-size: 1rem;
    font-weight: 600;
    color: #467054;

    .value {
      font-weight: 600;
      margin-top: 2.5rem;
      font-size: 1rem;
    }
  }
}

// NEIGHBORHOOD CARD
.neighborhood-widget {
  display: flex;
  flex-direction: column;
  height: 100%;

.comparison-context {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  position: relative;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 25%;
    right: 25%;
    height: 1px;
    background: rgba(70, 112, 84, 0.2);
  }

    .context-text {
    font-size: 0.85rem;
    color: #6c757d;
    display: inline-flex;
    align-items: center; 
    .fa-users {
      color: #467054;
      font-size: 0.9rem;
      margin-right: 0.4rem;
    }
    strong {
      color: #467054;
      font-weight: 600;
      margin: 0 0.2rem;
    }
  }
    .fa-neighborhood {
      color: #dfb046;
      font-size: 1rem;
    }

    strong {
      font-weight: 600;
      color: #467054;
    }
  }

  .neighborhood-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
    position: relative;

    .icon {
      font-size: 1.25rem;
    }

    .title {
      margin: 0;
      font-weight: 600;
      color: #467054;
      font-size: 1.1rem;
    }

    .house-count-badge {
      background-color: rgba(70, 112, 84, 0.1);
      color: #467054;
      padding: 0.25rem 0.5rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      margin-left: auto;
    }
  }

  .loading-state,
  .error-state,
  .no-data-state {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
    padding: 1.5rem;
    text-align: center;
    color: #6c757d;
  }

  .error-state {
    color: #dc3545;
  }

  .my-house-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    background-color: rgba(70, 112, 84, 0.05);
    border-radius: 0.75rem;
    padding: 1rem;
    margin-bottom: 1.5rem;

    .house-icon {
      width: 2.5rem;
      height: 2.5rem;
      background-color: #467054;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .house-info {
      .house-title {
        margin: 0;
        font-size: 1rem;
        color: #467054;
        font-weight: 600;
      }

      .house-address {
        margin: 0;
        font-size: 0.85rem;
        color: #6c757d;
      }
    }
  }
  .comparison-result {
    display: flex;
    align-items: center;
    gap: 1rem;
    background-color: white;
    border-radius: 0.75rem;
    padding: 1rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    margin-top: auto;

    .comparison-icon {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;

      &.positive {
        background-color: rgba(223, 176, 70, 0.2);
        color: #dfb046;
      }

      &.negative {
        background-color: rgba(70, 112, 84, 0.2);
        color: #467054;
      }
    }

    .comparison-details {
      display: flex;
      flex-direction: column;

      .comparison-label {
        font-size: 0.85rem;
        color: #6c757d;
      }

      .comparison-value {
        font-weight: 700;
        font-size: 1.1rem;

        &.positive {
          color: #dfb046;
        }

        &.negative {
          color: #467054;
        }
      }
    }
  }
}

// GOAL PROGRESS CARD
.goal-progress {
  .optimized-goal-container {
    display: flex;
    height: 100%;
    padding: 1rem;
    gap: 1.5rem;
  }
  .left-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 40%;
  }

  .chart-wrapper {
    position: relative;
    width: 180px;
    height: 180px;
    
    .chart-label {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      
      .days-remaining {
        font-size: 2.2rem;
        font-weight: 700;
        color: #467054;
        line-height: 1;
      }
      
      .days-text {
        font-size: 0.8rem;
        color: #6c757d;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-top: 0.3rem;
      }
    }
  }

  .date-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
    max-width: 200px;
    margin-top: -1rem;
    
    .date-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.8rem;
      background: rgba(70, 112, 84, 0.05);
      border-radius: 0.5rem;
      font-size: 0.85rem;
      color: #467054;
      
      i {
        font-size: 0.8rem;
        width: 20px;
        text-align: center;
      }
    }
  }
  .right-section {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1rem;
    padding: 0.5rem 0;
  }

  .info-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.8rem 1rem;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    transition: all 0.3s ease;
    
    &.completed {
      background: rgba(70, 112, 84, 0.05);
    }
    
    .info-icon {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(223, 176, 70, 0.1);
      color: #dfb046;
      flex-shrink: 0;
      
      i {
        font-size: 0.9rem;
      }
    }
    
    .info-content {
      .info-label {
        font-size: 0.75rem;
        color: #6c757d;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .info-value {
        font-size: 1.1rem;
        font-weight: 700;
        color: #467054;
        margin-top: 0.2rem;
      }
    }
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
  }

  /* Estados */
  .no-goal {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #6c757d;
    padding: 2rem;
    
    i {
      font-size: 2rem;
      margin-bottom: 1rem;
      opacity: 0.3;
    }
    
    p {
      margin: 0;
    }
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #6c757d;
    padding: 2rem;
    
    i {
      margin-right: 0.5rem;
    }
  }
}

// TOP CONSUMING DEVICE
.top-device {
  .champion-device {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.8rem;
    background: rgba(223, 176, 70, 0.05);
    border-radius: 10px;
    margin-bottom: 1rem;
    border: 1px solid rgba(70, 112, 84, 0.1);
  }

  .device-medal {
    .medal-circle {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
      background: linear-gradient(135deg, #dfb046, #f8d37a);
    }
  }

.device-info {
  display: flex;
  flex-direction: column;
}
.device-name {
  font-size: 1.1rem;
}
.device-stats-row {
  display: flex;
  width: 100%;
}
.energy-meter {
    margin: 0.8rem 0;
    
    .meter-track {
      height: 0.5rem;
      background: rgba(70, 112, 84, 0.1);
      border-radius: 3px;
    }
    
    .meter-progress {
      height: 100%;
      background: linear-gradient(to right, #dfb046, #467054);
      border-radius: 0.5rem;
    }
    
    .meter-labels {
      font-size: 0.65rem;
      margin-top: 0.25rem;
      display: flex;
      justify-content: space-between;
      font-weight: 500;
    }
  }

  .contenders-title {
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
    color: #467054;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .device-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .contender-device {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0.5rem;
    font-size: 0.85rem;
    
    &:not(:last-child) {
      border-bottom: 1px solid rgba(0,0,0,0.05);
    }
  }

  .contender-icon {
    width: 26px;
    height: 26px;
    background: rgba(70, 112, 84, 0.1);
    color: #467054;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    flex-shrink: 0;
  }

  .contender-name {
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .contender-value {
    font-weight: 600;
    color: #467054;
    flex-shrink: 0;
  }
}

.text-secondary {
  color: #6c757d !important;
}

@media (max-width: 1200px) {
  .main-widget {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .widgets-grid {
    grid-template-columns: 1fr;
  }
  
  .main-widget, .medium-widget, .small-widget {
    grid-column: span 1;
    grid-row: span 1;
  }
}
</style>