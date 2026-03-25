export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuth()

  // Lista de rutas públicas
  const publicRoutes = ['/login']

  if (!authStore.isLoggedIn && !publicRoutes.includes(to.path)) {
    return navigateTo('/login')
  }

  if (authStore.isLoggedIn && to.path === '/login') {
    return navigateTo('/')
  }
})
