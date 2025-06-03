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
              <apexchart type="line" width="600" height= "220" :options="chartOptions" :series="series"></apexchart>
            </div>
          </div>

          <div v-else class="text-muted py-3">
            Loading current consumption...
          </div>
        </div>

        <!-- TOP CONSUMING DEVICE -->
        <div class="widget-card top-device medium-widget" v-if="topDevice">
            <div class="widget-header">
              <h5 class="text-dark">
                <i class="fas fa-plug me-2" style="color: #467054;"></i> Top Consuming Device
              </h5>
            </div>
            <div class="widget-content">
              <div class="device-info">
                <div class="device-icon" style="background-color: #dfb046; color: white;">
                  <i class="fas fa-plug"></i>
                </div>
                <div>
                  <h6 class="text-dark mb-1">{{ topDevice.type }}</h6>
                  <p class="text-secondary mb-0">
                    <span style="color: #467054;">{{ topDeviceConsumptionKW }} kW</span>
                    ({{ topDevicePercentage }}% of total)
                  </p>
                </div>
              </div>

              <div class="progress mt-3">
                <div
                  class="progress-bar"
                  :style="{ width: topDevicePercentage + '%', backgroundColor: '#467054' }"
                ></div>
              </div>

              <div class="device-list mt-3">
                <div
                  v-for="device in otherDevices"
                  :key="device.id"
                  class="d-flex justify-content-between py-2 border-bottom"
                >
                  <span>{{ device.type }}</span>
                  <span style="color: #467054;">{{ (device.dailyConsumption / 1000).toFixed(1) }} kW</span>
                </div>
              </div>
            </div>
        </div>

        <div class="widget-card goal-comparison medium-widget">
          <div class="widget-header">
            <h5 class="text-dark">
              <i class="fas fa-bullseye me-2" style="color: #467054;"></i> Goal Progress
            </h5>
          </div>
          <div class="widget-content">
            <div class="d-flex align-items-center justify-content-around">
              <div class="circular-progress">
                <div class="circle-progress" :style="{ '--progress': '65' }">
                  <span style="color: #467054; font-size: 1.8rem; font-weight: 700;">65%</span>
                </div>
              </div>
              <div class="goal-details ms-3">
                <div class="goal-stats">
                  <div class="stat-item">
                    <span class="stat-label">Target:</span>
                    <span class="stat-value" style="color: #467054;">500 kWh</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Achieved:</span>
                    <span class="stat-value" style="color: #467054;">325 kWh</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Remaining:</span>
                    <span class="stat-value" style="color: #467054;">175 kWh</span>
                  </div>
                </div>
              </div>
            </div>
            <p class="text-center text-secondary mt-3">Monthly Energy Saving Goal</p>
          </div>
        </div>
   
        <!-- NEIGHBORHOOD COMPARISON -->
        <div class="widget-card location-comparison small-widget">  
          <header class="header d-flex align-items-center">
            <i class="fas fa-map-marker-alt me-2" style="color: #467054;"></i>
            <h5 class="title mb-0">Neighborhood</h5>
          </header>

          <div v-if="consumptionsStore.isLoadingSimilarHouses" class="text-center py-3">
            Loading neighborhood data...
          </div>

          <div v-else-if="consumptionsStore.hasErrorSimilarHouses" class="text-danger py-3">
            {{ consumptionsStore.errorSimilarHouses }}
          </div>

          <div v-else-if="consumptionsStore.similarHouses" class="neighborhood-content">
            <p class="mb-8 neighborhood-subtitles">
              <strong>My House: </strong>
              <span class=" house-address">{{ myHouseAddress }}</span>
            </p>

            <p class="mb-1 neighborhood-subtitles">
              <strong>Neighborhood: </strong>
              Comparing with <strong>{{ comparedHousesCount }}</strong> houses nearby
            </p>

            <p class="comparison-text" :class="{ positive: isPositiveComparison, negative: !isPositiveComparison }">
              Consumption difference: {{ comparisonValue }}
            </p>
          </div>

          <div v-else class="text-muted py-3">
            No neighborhood data available.
          </div>
        </div>

        <!-- PERIOD COMPARISON -->
        <div class="widget-card time-comparison small-widget position-relative"> 
          <div class="widget-header d-flex justify-content-between align-items-center">
            <h5 class="text-dark">
              <i class="fas fa-chart-line me-2"></i> Period Average
            </h5>
            <select class="form-select form-select-sm" style="width: 120px;" v-model="selectedPeriod" @change="onPeriodChange">
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month" selected>Month</option>
            </select>
          </div>

          <div class="widget-content" v-if="periodComparisonData.currentPeriod !== undefined" style="position: relative;">
            <div class="time-comparison-chart d-flex justify-content-center">
              <div class="chart-bar" :style="{ height: (periodComparisonData.lastPeriod * 10) + '%', backgroundColor: 'rgba(70, 112, 84, 0.3)', position: 'relative' }">
                <span class="text-secondary">This {{ selectedPeriod }}</span>
                <span class="value">{{ periodComparisonData.currentPeriod.toFixed(2) }} kW</span>
                <div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 12rem; height: 0.15rem; background-color: rgba(70, 112, 84, 1);"></div>
              </div>
            </div>
          </div>

          <div v-else>
            <p class="text-center text-muted py-3">Loading data...</p>
          </div>
          <i class="fas fa-chart-line" style=" position: absolute; bottom: 0.5rem; right: 1rem; font-size: 8rem; color: rgba(0, 0, 0, 0.05); pointer-events: none;"></i>
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
import VueApexCharts from "vue3-apexcharts";


const appliancesStore = useAppliancesStore();
const consumptionsStore = useConsumptionsStore();


onMounted(() => {
  appliancesStore.fetchAppliances();
  consumptionsStore.fetchPeriodComparison(selectedPeriod.value);
  consumptionsStore.fetchLatestReading();
  consumptionsStore.fetchSimilarHouses();
  consumptionsStore.fetchConsumptionHistory();

  // Set up an interval to refresh the current consumption every 30 minutes
  const interval = setInterval(() => {
    consumptionsStore.fetchLatestReading();
  }, 2 * 60 * 1000); // 30 minutes in milliseconds

  // Clean up the interval when the component is unmounted
  onBeforeUnmount(() => clearInterval(interval));
});


////////// CURRENT CONSUMPTION //////////
const currentConsumption = computed(() => {
  const value = consumptionsStore.latestReading?.consumption_value;
  return value !== undefined && value !== null ? parseFloat(value).toFixed(2) : 'N/A';
});


/////// CHART ///////
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
// Selected period for consumption data (default is 'month')
const selectedPeriod = ref('month');

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

// Fetch new comparison data when the period changes
function onPeriodChange() {
  consumptionsStore.fetchPeriodComparison(selectedPeriod.value);
}

// Computed property to get the period comparison data
const periodComparisonData = computed(() => consumptionsStore.periodComparison || {});


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

// Expose
const components = {
  apexchart: VueApexCharts,
};


</script>



<style scoped lang="scss">
.dashboard-container {
  background: white;
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

.device-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  
  .device-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
  }
}

.progress {
  height: 6px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
  overflow: hidden;
  
  .progress-bar {
    height: 100%;
  }
}

.comparison-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.circular-progress {
  position: relative;
  width: 100px;
  height: 100px;
  
  .circle-progress {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: conic-gradient(#467054 calc(var(--progress) * 3.6deg), #f0f0f0 0deg);
    display: flex;
    align-items: center;
    justify-content: center;
    
    &::before {
      content: '';
      position: absolute;
      width: 70px;
      height: 70px;
      background: white;
      border-radius: 50%;
    }
    
    span {
      position: relative;
      z-index: 1;
      font-size: 1.4rem;
    }
  }
}

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



/* Mínimos ajustes para o card */
.widget-card.location-comparison {
  font-size: 0.9rem;
  color: #333;
}

.neighborhood-subtitles{
  margin-top: 2rem;
  font-size: 1rem;
  color: #467054;
}

.house-address{
  // color: #467054;
}

/* Texto de comparação no centro e com cor verde (ou vermelho) */
.comparison-text {
  text-align: center;
  font-size: 1rem;
  font-weight: 600;
  margin-top: 2rem;
  color: #dfb046;
}

.comparison-text.positive {
  color: #dfb046; /* verde mais carregado */
}

.comparison-text.negative {
  color:#467054; 
}

</style>