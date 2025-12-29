import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/global-chat',
      name: 'global-chat',
      component: () => import('@/views/GlobalChatView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('@/views/TestView.vue')
    },
    {
      path: '/diagnostics',
      name: 'diagnostics',
      component: () => import('@/views/SystemDiagnostics.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('@/views/AdminLogin.vue')
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: () => import('@/views/AdminDashboard.vue'),
      meta: { requiresAdmin: true }
    },

    {
      path: '/admin/super',
      name: 'super-admin',
      component: () => import('@/views/SuperAdminPanel.vue'),
      meta: { requiresAdmin: true }
    },
    {
      path: '/admin/errors',
      name: 'admin-errors',
      component: () => import('@/views/ErrorLogView.vue'),
      meta: { requiresAdmin: true }
    },
    {
      path: '/admin/backups',
      name: 'admin-backups',
      component: () => import('@/views/BackupView.vue'),
      meta: { requiresAdmin: true }
    },
    {
      path: '/admin/logs',
      name: 'admin-logs',
      component: () => import('@/views/AdminLogsView.vue'),
      meta: { requiresAdmin: true }
    },
    {
      path: '/admin/analytics',
      name: 'admin-analytics',
      component: () => import('@/views/AdminAnalyticsView.vue'),
      meta: { requiresAdmin: true }
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('@/views/AdminUsersView.vue'),
      meta: { requiresAdmin: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue')
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/ForgotPasswordView.vue')
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/ResetPasswordView.vue')
    },
    {
      path: '/email-verified',
      name: 'email-verified',
      component: () => import('@/views/EmailVerifiedView.vue')
    },
    {
      path: '/map',
      name: 'map',
      component: () => import('@/views/MapView.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/create-request',
      name: 'create-request',
      component: () => import('@/views/CreateRequestView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/my-requests',
      name: 'my-requests',
      component: () => import('@/views/MyRequestsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/my-helps',
      name: 'my-helps',
      component: () => import('@/views/MyHelpersView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/my-responses',
      name: 'my-responses',
      component: () => import('@/views/MyResponsesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/chats',
      redirect: '/my-chats'
    },
    {
      path: '/my-chats',
      name: 'my-chats',
      component: () => import('@/views/MyChatsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/responses/:requestId',
      name: 'responses',
      component: () => import('@/views/ResponsesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/chat/:requestId',
      name: 'chat',
      component: () => import('@/views/ChatView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/friends',
      name: 'friends',
      component: () => import('@/views/FriendsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/city-chats',
      name: 'city-chats',
      component: () => import('@/views/CityChatsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/user/:id',
      name: 'public-profile',
      component: () => import('@/views/PublicProfileView.vue')
    },
    {
      path: '/direct-chat/:chatId',
      name: 'direct-chat',
      component: () => import('@/views/DirectChatView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/messages',
      name: 'messages',
      component: () => import('@/views/MessagesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('@/views/FavoritesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/terminal',
      name: 'admin-terminal',
      component: () => import('@/views/AdminTerminal.vue'),
      meta: { requiresAdmin: true }
    },
    {
      path: '/admin/requests',
      name: 'admin-requests',
      component: () => import('@/views/AdminRequestsView.vue'),
      meta: { requiresAdmin: true }
    },
    {
      path: '/admin/settings',
      name: 'admin-settings',
      component: () => import('@/views/AdminSettingsView.vue'),
      meta: { requiresAdmin: true }
    },
    {
      path: '/admin/bulk',
      name: 'admin-bulk',
      component: () => import('@/views/AdminBulkOperations.vue'),
      meta: { requiresAdmin: true }
    },
    {
      path: '/admin/chats-moderation',
      name: 'admin-chats-moderation',
      component: () => import('@/views/AdminChatModeration.vue'),
      meta: { requiresAdmin: true }
    },
    {
      path: '/admin/finance',
      name: 'admin-finance',
      component: () => import('@/views/AdminFinance.vue'),
      meta: { requiresAdmin: true }
    },
    {
      path: '/admin/notifications',
      name: 'admin-notifications',
      component: () => import('@/views/AdminNotifications.vue'),
      meta: { requiresAdmin: true }
    },
    {
      path: '/admin/roles',
      name: 'admin-roles',
      component: () => import('@/views/AdminRoles.vue'),
      meta: { requiresAdmin: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const token = localStorage.getItem('token')
  const adminToken = localStorage.getItem('adminToken')
  
  const isAuth = authStore.isAuthenticated || !!token
  const isAdmin = !!adminToken
  
  if (to.meta.requiresAuth && !isAuth) {
    // Сохраняем путь, куда пользователь хотел попасть, для редиректа после входа
    if (to.path.startsWith('/responses/')) {
      // Для страницы откликов сохраняем путь, чтобы вернуться после входа
      next({ path: '/login', query: { redirect: to.fullPath } })
    } else {
      next('/login')
    }
  } else if (to.meta.requiresAdmin && !isAdmin) {
    next('/admin/login')
  } else if (to.path === '/' && isAuth) {
    // Авторизованных с гостевой страницы на дашборд
    next('/dashboard')
  } else if (to.path === '/login' && isAuth) {
    next('/dashboard')
  } else if (to.path === '/admin/login' && isAdmin) {
    next('/admin/dashboard')
  } else {
    next()
  }
})

export default router