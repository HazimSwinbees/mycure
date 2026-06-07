import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    if (to.hash) {
      return {
        el: to.hash,
        top: 96,
        behavior: 'smooth',
      }
    }

    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      component: () => import('../layouts/PublicLayout.vue'),
      children: [
        {
          path: '',
          name: 'landing',
          component: () => import('../views/LandingView.vue'),
          meta: { title: 'MyCure Web' },
        },
        {
          path: 'home',
          redirect: { name: 'landing' },
        },
        {
          path: 'about-us',
          name: 'about-us',
          component: () => import('../views/AboutUsView.vue'),
          meta: { title: 'About Us' },
        },
        {
          path: 'privacy-policy',
          name: 'privacy-policy',
          component: () => import('../views/PrivacyPolicyView.vue'),
          meta: { title: 'Privacy Policy' },
        },
        {
          path: 'terms-and-conditions',
          name: 'terms-and-conditions',
          component: () => import('../views/TermsConditionsView.vue'),
          meta: { title: 'Terms and Conditions' },
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
      meta: { title: 'Login' },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/auth/ForgotPasswordView.vue'),
      meta: { title: 'Forgot Password' },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/auth/ResetPasswordView.vue'),
      meta: { title: 'Reset Password' },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/RegisterView.vue'),
      meta: { title: 'Register' },
    },
    {
      path: '/register-doctor',
      name: 'register-doctor',
      component: () => import('../views/auth/DoctorRegisterView.vue'),
      meta: { title: 'Register Doctor' },
    },
    {
      path: '/app',
      component: () => import('../layouts/AppLayout.vue'),
      children: [
        {
          path: '',
          redirect: { name: 'dashboard' },
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../views/app/DashboardView.vue'),
          meta: { title: 'Dashboard', requiresAuth: true },
        },
        {
          path: 'services',
          name: 'services',
          component: () => import('../views/app/ServicesView.vue'),
          meta: { title: 'Services', requiresAuth: true },
        },
        {
          path: 'clinic-and-doctor-info',
          name: 'clinic-and-doctor-info',
          component: () => import('../views/app/ClinicDoctorInfoView.vue'),
          meta: { title: 'Clinic and Doctor Info', requiresAuth: true },
        },
        {
          path: 'gemini-chat',
          name: 'gemini-chat',
          component: () => import('../views/shared/GeminiChatView.vue'),
          meta: { title: 'Gemini Chat', chatAudience: 'patient', requiresAuth: true },
        },
        {
          path: 'symptom-checker',
          name: 'symptom-checker',
          component: () => import('../views/app/SymptomCheckerView.vue'),
          meta: { title: 'Symptom Checker', requiresAuth: true },
        },
        {
          path: 'prescriptions',
          name: 'prescriptions',
          component: () => import('../views/app/PrescriptionsView.vue'),
          meta: { title: 'Medical Visits', requiresAuth: true },
        },
        {
          path: 'prescriptions/:id',
          name: 'medical-visit-details',
          component: () => import('../views/app/MedicalVisitDetailsView.vue'),
          props: true,
          meta: { title: 'Medical Visit Details', requiresAuth: true },
        },
        {
          path: 'services/:id',
          name: 'service-details',
          component: () => import('../views/app/ServiceDetailsView.vue'),
          props: true,
          meta: { title: 'Service Details', requiresAuth: true },
        },
        {
          path: 'booking',
          name: 'booking',
          component: () => import('../views/app/BookingView.vue'),
          meta: { title: 'Book Appointment', requiresAuth: true },
        },
        {
          path: 'booking/confirm',
          name: 'booking-confirmation',
          component: () => import('../views/app/BookingConfirmationView.vue'),
          meta: { title: 'Confirm Appointment', requiresAuth: true },
        },
        {
          path: 'booking/success',
          name: 'booking-success',
          component: () => import('../views/app/BookingSuccessView.vue'),
          meta: { title: 'Booking Successful', standalone: true, requiresAuth: true },
        },
        {
          path: 'appointments',
          name: 'appointments',
          component: () => import('../views/app/AppointmentsView.vue'),
          meta: { title: 'Appointments', requiresAuth: true },
        },
        {
          path: 'appointments/:id',
          name: 'appointment-details',
          component: () => import('../views/app/AppointmentDetailsView.vue'),
          props: true,
          meta: { title: 'Appointment Details', requiresAuth: true },
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('../views/app/ProfileView.vue'),
          meta: { title: 'Profile', requiresAuth: true },
        },
        {
          path: 'notifications',
          name: 'notifications',
          component: () => import('../views/app/NotificationsView.vue'),
          meta: { title: 'Notifications', requiresAuth: true },
        },
      ],
    },
    {
      path: '/admin',
      component: () => import('../layouts/AdminLayout.vue'),
      children: [
        {
          path: '',
          redirect: { name: 'admin-dashboard' },
        },
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('../views/admin/AdminDashboardView.vue'),
          meta: { title: 'Doctor Overview', requiresAuth: true },
        },
        {
          path: 'appointments',
          name: 'admin-appointments',
          component: () => import('../views/admin/AdminAppointmentsView.vue'),
          meta: { title: 'Appointment Queue', requiresAuth: true },
        },
        {
          path: 'appointments/:id',
          name: 'admin-appointment-details',
          component: () => import('../views/admin/AdminAppointmentDetailsView.vue'),
          props: true,
          meta: { title: 'Appointment Details', requiresAuth: true },
        },
        {
          path: 'patients',
          name: 'admin-patients',
          component: () => import('../views/admin/AdminPatientsView.vue'),
          meta: { title: 'Patients', requiresAuth: true },
        },
        {
          path: 'services',
          name: 'admin-services',
          component: () => import('../views/admin/AdminServicesView.vue'),
          meta: { title: 'Manage Services', requiresAuth: true },
        },
        {
          path: 'services/:id',
          name: 'admin-service-details',
          component: () => import('../views/admin/AdminServiceDetailsView.vue'),
          props: true,
          meta: { title: 'Service Details', requiresAuth: true },
        },
        {
          path: 'patients/:id',
          name: 'admin-patient-profile',
          component: () => import('../views/admin/AdminPatientProfileView.vue'),
          props: true,
          meta: { title: 'Patient Profile', requiresAuth: true },
        },
        {
          path: 'medical-records',
          name: 'admin-medical-records',
          component: () => import('../views/admin/AdminMedicalRecordsView.vue'),
          meta: { title: 'Visit Records', requiresAuth: true },
        },
        {
          path: 'medical-records/create',
          name: 'admin-medical-record-create',
          component: () => import('../views/admin/AdminMedicalRecordCreateView.vue'),
          meta: { title: 'Create Visit Record', requiresAuth: true },
        },
        {
          path: 'medical-records/:id',
          name: 'admin-medical-record-details',
          component: () => import('../views/admin/AdminMedicalRecordDetailsView.vue'),
          props: true,
          meta: { title: 'View Visit Record', requiresAuth: true },
        },
        {
          path: 'availability',
          name: 'admin-availability',
          component: () => import('../views/admin/AdminAvailabilityView.vue'),
          meta: { title: 'Availability', requiresAuth: true },
        },
        {
          path: 'notifications',
          name: 'admin-notifications',
          component: () => import('../views/admin/AdminNotificationsView.vue'),
          meta: { title: 'Notifications', requiresAuth: true },
        },
        {
          path: 'clinic-info',
          name: 'admin-clinic-info',
          component: () => import('../views/admin/AdminClinicInfoView.vue'),
          meta: { title: 'Clinic Info', requiresAuth: true },
        },
        {
          path: 'doctor-profile',
          name: 'admin-doctor-profile',
          component: () => import('../views/admin/AdminDoctorProfileView.vue'),
          meta: { title: 'Doctor Profile', requiresAuth: true },
        },
        {
          path: 'gemini-chat',
          name: 'admin-gemini-chat',
          component: () => import('../views/shared/GeminiChatView.vue'),
          meta: { title: 'Gemini Chat', chatAudience: 'doctor', requiresAuth: true },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'landing' },
    },
  ],
})

router.beforeEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} | MyCure Web` : 'MyCure Web'

  const role = localStorage.getItem('mycure_role') || 'patient'

  if (role === 'doctor' && ['booking', 'booking-confirmation', 'booking-success'].includes(to.name)) {
    return { name: 'admin-dashboard' }
  }

  if (!to.meta.requiresAuth) {
    return true
  }

  const token = localStorage.getItem('mycure_token')

  if (token) {
    return true
  }

  return {
    name: 'login',
    query: {
      redirect: to.fullPath,
    },
  }
})

export default router
