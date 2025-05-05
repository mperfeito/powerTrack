<template>
  <div class="auth-page">
    <div class="particles"></div>

    <div class="container">
      <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-lg-6 col-md-8">
          <div class="card auth-card animate__animated animate__fadeIn">
            <div class="card-body p-5">
              <div class="text-center mb-5">
                <i class="fas fa-bolt logo-icon mb-3"></i>
                <h2 class="fw-bold">Welcome Back</h2>
                <p>Sign in to your POWER TRACK account</p>
              </div>

              <form @submit.prevent="handleLogin">
                <div class="mb-4">
                  <label for="email" class="form-label">Email</label>
                  <input
                    type="email"
                    class="form-control auth-input"
                    id="email"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div class="mb-4">
                  <label for="password" class="form-label"
                    >Password</label
                  >
                  <input
                    type="password"
                    class="form-control auth-input"
                    id="password"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <div
                  class="d-flex justify-content-between align-items-center mb-4"
                >
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="remember"
                    />
                    <label class="form-check-label" for="remember"
                      >Remember me</label
                    >
                  </div>
                 
                </div>

                <button
                  type="submit"
                  class="btn btn-primary btn-lg w-100 py-3 shadow mb-3"
                >
                  <router-link to="/dashboard" class="text-white">
                    <i class="fas fa-sign-in-alt me-2"></i> Login
                  </router-link>
                </button>

                <div class="text-center mt-4">
                  <p>
                    Don't have an account?
                    <router-link to="/register" class="text-primary fw-bold"
                      >Register</router-link
                    >
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.auth-page {
  position: relative;
  min-height: 100vh;
  background-color: white;
  overflow: hidden;
}

.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23467054' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
}

.auth-card {
  background-color: white;
  border: 1px solid rgba(70, 112, 84, 0.2);
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(70, 112, 84, 0.1);
}

.auth-input {
  background-color: white;
  border: 1px solid #ced4da;
  color: #495057;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
}

.auth-input::placeholder {
  color: #6c757d;
}

.auth-input:focus {
  background-color: white;
  border-color: #dfb046;
  color: #495057;
  box-shadow: 0 0 0 0.25rem rgba(223, 176, 70, 0.25);
}

.btn-primary {
  background-color: #dfb046;
  border: none;
  font-weight: 600;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-primary:hover {
  background-color: #d4a53f;
}

.logo-icon {
  font-size: 3rem;
  color: #dfb046;
  text-shadow: 0 0 20px rgba(223, 176, 70, 0.4);
  animation: float 3s ease-in-out infinite;
}

.text-primary {
  color: #467054 !important;
}

h2 {
  color: #467054;
}

p {
  color: #6c757d;
}

.form-label {
  color: #467054;
  font-weight: 500;
}

.form-check-label {
  color: #6c757d;
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
router-link,
a {
  text-decoration: none !important;
}

</style>