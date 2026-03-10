export const useAuth = () => {
  const user = useState<any | null>('user', () => null)
  const token = useCookie('auth_token')

  const isLoggedIn = computed(() => !!token.value)

  const login = (userData: any, userToken: string) => {
    user.value = userData
    token.value = userToken
    return navigateTo('/')
  }

  const logout = () => {
    user.value = null
    token.value = null
    return navigateTo('/login')
  }

  return {
    user,
    token,
    isLoggedIn,
    login,
    logout
  }
}
