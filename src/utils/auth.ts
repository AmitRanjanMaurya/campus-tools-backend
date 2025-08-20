// Authentication utilities
export const setAuthCookie = (isAuthenticated: boolean) => {
  if (typeof document !== 'undefined') {
    if (isAuthenticated) {
      document.cookie = 'student_tools_auth=true; path=/; max-age=86400; secure; samesite=strict'
    } else {
      document.cookie = 'student_tools_auth=false; path=/; max-age=0; secure; samesite=strict'
    }
  }
}

export const getAuthCookie = (): boolean => {
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';')
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('student_tools_auth='))
    return authCookie?.split('=')[1] === 'true'
  }
  return false
}

export const clearAuthCookie = () => {
  if (typeof document !== 'undefined') {
    document.cookie = 'student_tools_auth=; path=/; max-age=0; secure; samesite=strict'
  }
}
