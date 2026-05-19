import axios, { AxiosError } from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

// публичные маршруты — не делаем редирект при 401
const PUBLIC_URLS = ['/auth/login', '/auth/register', '/auth/refresh']

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message: string; code?: string }>) => {
    const original = error.config as typeof error.config & { _retry?: boolean }
    const url = original?.url ?? ''

    // на публичных маршрутах просто пробрасываем ошибку
    if (PUBLIC_URLS.some((u) => url.includes(u))) {
      return Promise.reject(error)
    }

    // если 401 и ещё не пробовали рефреш
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        await axios.post('/api/auth/refresh', {}, { withCredentials: true })
        return api(original)
      } catch {
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default api
