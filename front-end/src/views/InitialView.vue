<template>
  <div class="home-page">
    <div class="particles"></div>

    <div class="container">
      <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-lg-8 text-center">
          <div class="mb-5 animate__animated animate__fadeInDown">
            <i class="fas fa-bolt logo-icon"></i>
            <h1 class="display-3 fw-bold mt-3">POWER TRACK</h1>
            <p
              class="lead mt-3 animate__animated animate__fadeIn animate__delay-1s"
            >
              Gestão Inteligente de Consumo Energético
            </p>
          </div>

          <div
            class="card card-blur animate__animated animate__fadeIn animate__delay-1-5s mb-5"
          >
            <div class="card-body py-3">
              <p class="mb-0">
                <i class="fas fa-quote-left me-2 icon-primary"></i>
                Monitorize, analise e optimize o consumo energético da sua casa
                de forma inteligente.
                <i class="fas fa-quote-right ms-2 icon-primary"></i>
              </p>
            </div>
          </div>

          <div
            class="d-flex justify-content-center gap-4 animate__animated animate__fadeInUp animate__delay-2s"
          >
            <router-link
              to="/login"
              class="btn btn-primary btn-lg px-4 py-3 shadow"
            >
              <i class="fas fa-sign-in-alt me-2"></i> Login
            </router-link>
            <router-link
              to="/register"
              class="btn btn-outline-primary btn-lg px-4 py-3 shadow"
            >
              <i class="fas fa-user-plus me-2"></i> Register
            </router-link>
          </div>

          <div
            class="row mt-5 g-4 animate__animated animate__fadeIn animate__delay-2-5s"
          >
            <div class="col-md-4">
              <div class="feature-card">
                <i class="fas fa-chart-line feature-icon"></i>
                <h5 class="mt-3">Monitorização</h5>
                <p>Visualize consumos em tempo real</p>
              </div>
            </div>
            <div class="col-md-4">
              <div class="feature-card">
                <i class="fas fa-bullseye feature-icon"></i>
                <h5 class="mt-3">Metas de Consumo</h5>
                <p>Acompanhamento inteligente do seu consumo</p>
              </div>
            </div>
            <div class="col-md-4">
              <div class="feature-card">
                <i class="fas fa-leaf feature-icon"></i>
                <h5 class="mt-3">Eficiência</h5>
                <p>Reduza o desperdício energético</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

</script>

<style scoped>
.home-page {
  position: relative;
  min-height: 100vh;
  background-color: white;
  overflow: hidden;
}
.icon-primary {
  color: #467054;
}
.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23467054' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
}
.logo-icon {
  font-size: 4rem;
  color: #dfb046;
  text-shadow: 0 0 20px rgba(223, 176, 70, 0.4);
}
.card-blur {
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(70, 112, 84, 0.2);
  border-radius: 0.5rem;
  color: #467054;
}
.feature-card {
  padding: 1.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(70, 112, 84, 0.1);
  height: 100%;
  color: #467054;
}
.feature-card:hover {
  transform: translateY(-5px);
  background-color: white;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  border-color: #dfb046;
}
.feature-icon {
  font-size: 2rem;
  color: #dfb046;
}
.btn-primary {
  background-color: #dfb046;
  border: none;
  font-weight: 600;
  min-width: 150px;
  color: white;
}
.btn-primary:hover {
  background-color: white;
  color: #dfb046;
  border: 1px solid #dfb046;
}
.btn-outline-primary {
  background-color: white;
  border-color: #dfb046;
  color: #dfb046;
}
.btn-outline-primary:hover {
  background: rgba(223, 176, 70);
  color: white;
}
h1,
h5 {
  color: #467054;
}
p {
  color: #5a5a5a;
}
.animate__animated {
  --animate-duration: 1s;
}
@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}
.logo-icon {
  animation: float 3s ease-in-out infinite;
}
</style>
