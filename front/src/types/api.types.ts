export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    name: string
    avatarUrl?: string
    createdAt: string
  }
  accessToken: string
}
