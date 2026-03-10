export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn } = useAuth()

  // Lista de rutas públicas
  const publicRoutes = ['/login']

  if (!isLoggedIn.value && !publicRoutes.includes(to.path)) {
    return navigateTo('/login')
  }

  if (isLoggedIn.value && to.path === '/login') {
    return navigateTo('/')
  }
})
