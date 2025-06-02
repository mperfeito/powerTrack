<template>
  <div class="auth-page">
    <div class="particles"></div>

    <div class="container py-5 px-3">
      <div class="row justify-content-center align-items-center">
        <div class="col-lg-8 col-xl-6">
          <div class="card auth-card animate__animated animate__fadeIn">
            <div class="card-body p-5">
              <div class="text-center mb-5">
                <i class="fas fa-bolt logo-icon mb-3"></i>
                <h2 class="fw-bold">Create Account</h2>
                <p>Join POWER TRACK to start monitoring your energy</p>
              </div>

              <form @submit.prevent="handleRegister">
                <!-- Success Message -->
                <div v-if="successMessage" class="alert alert-success mb-4">
                  <i class="fas fa-check-circle me-2"></i>
                  {{ successMessage }}
                </div>

                <!-- Error Message -->
                <div v-if="errorMessage" class="alert alert-danger mb-4">
                  <i class="fas fa-exclamation-circle me-2"></i>
                  {{ errorMessage }}
                </div>

                <div class="row">
                  <div class="col-md-6 mb-4">
                    <label for="firstName" class="form-label">First Name</label>
                    <input
                      type="text"
                      class="form-control auth-input"
                      id="firstName"
                      v-model="firstName"
                      placeholder="Name"
                      required
                    />
                  </div>
                  <div class="col-md-6 mb-4">
                    <label for="lastName" class="form-label">Last Name</label>
                    <input
                      type="text"
                      class="form-control auth-input"
                      id="lastName"
                      v-model="lastName"
                      placeholder="Last Name"
                      required
                    />
                  </div>
                </div>

                <div class="mb-4">
                  <label for="email" class="form-label">Email</label>
                  <input
                    type="email"
                    class="form-control auth-input"
                    id="email"
                    v-model="email"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div class="mb-4">
                  <label for="phoneNumber" class="form-label">Phone Number</label>
                  <input
                    type="tel"
                    class="form-control auth-input"
                    id="phoneNumber"
                    v-model="phoneNumber"
                    placeholder="+351 912 345 678"
                    required
                  />
                </div>

                <div class="mb-4">
                  <label for="nif" class="form-label">NIF</label>
                  <input
                    type="text"
                    class="form-control auth-input"
                    id="nif"
                    v-model="nif"
                    placeholder="Número de Identificação Fiscal"
                    required
                  />
                </div>

                <div class="mb-4">
                  <label for="password" class="form-label">Password</label>
                  <input
                    type="password"
                    class="form-control auth-input"
                    id="password"
                    v-model="password"
                    placeholder="Create password"
                    required
                  />
                  <div class="form-text text-muted">Minimum 8 characters</div>
                </div>

                <div class="mb-4">
                  <label for="confirmPassword" class="form-label"
                    >Confirm Password</label
                  >
                  <input
                    type="password"
                    class="form-control auth-input"
                    id="confirmPassword"
                    v-model="confirmPassword"
                    placeholder="Confirm password"
                    required
                  />
                </div>

                <div class="form-check mb-4">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="terms"
                    v-model="agreeTerms"
                    required
                  />
                  <label class="form-check-label" for="terms">
                    I agree to the
                    <a href="#" class="text-primary">Terms of Service</a> and
                    <a href="#" class="text-primary">Privacy Policy</a>
                  </label>
                </div>

                <button
                  type="submit"
                  class="btn btn-primary btn-lg w-100 py-3 shadow mb-3"
                  :disabled="loading"
                >
                  <span v-if="loading">
                    <i class="fas fa-spinner fa-spin me-2"></i>
                    Processing...
                  </span>
                  <span v-else>
                    <i class="fas fa-user-plus me-2"></i> Create Account
                  </span>
                </button>

                <div class="text-center mt-4">
                  <p>
                    Already have an account?
                    <router-link to="/login" class="text-primary fw-bold"
                      >Sign in</router-link
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

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phoneNumber = ref('')
const nif = ref('')
const password = ref('')
const confirmPassword = ref('')
const agreeTerms = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const router = useRouter()
const authStore = useAuthStore()

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  // Client-side validation
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match'
    loading.value = false
    return
  }

  if (password.value.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters'
    loading.value = false
    return
  }

  try {
    // Register the user
    await authStore.register({
      first_name: firstName.value,
      last_name: lastName.value,
      email: email.value,
      phone_number: phoneNumber.value,
      nif: nif.value,
      password: password.value
    })

    // Show success message
    successMessage.value = 'Registration successful! Redirecting to login...'
    
    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/login')
    }, 2000)
    
    
  } catch (error) {
    console.error('Registration failed:', error);
    
    if (error.response?.data?.error === 'Invalid token') {
      errorMessage.value = 'Registration successful! Please login now.';
      router.push('/login');
    }
    else if (error.response?.data?.sqlMessage?.includes('Duplicate entry')) {
      if (error.response?.data?.sqlMessage?.includes('users.nif')) {
        errorMessage.value = 'This NIF is already registered';
      } 
      else if (error.response?.data?.sqlMessage?.includes('users.email')) {
        errorMessage.value = 'This email is already registered';
      }
      else if (error.response?.data?.sqlMessage?.includes('users.phone_number')) {
        errorMessage.value = 'This phone number is already registered';
      }
    } else {
      errorMessage.value = error.response?.data?.message || 
                         'Registration failed. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};

</script>

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
  color: white;
}

.btn-primary:hover {
  background-color: #d4a53f;
}

.btn-primary:disabled {
  background-color: #dfb046;
  opacity: 0.7;
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

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border-color: #c3e6cb;
  padding: 0.75rem 1.25rem;
  border-radius: 0.25rem;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border-color: #f5c6cb;
  padding: 0.75rem 1.25rem;
  border-radius: 0.25rem;
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
</style>