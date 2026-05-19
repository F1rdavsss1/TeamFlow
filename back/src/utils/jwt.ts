import jwt from 'jsonwebtoken'
import { Response } from 'express'

export interface TokenPayload {
  id: string
  email: string
  name: string
}

export interface DecodedToken extends TokenPayload {
  iat: number
  exp: number
}

export const generateAccessToken = (payload: TokenPayload): string =>
  jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' })

export const generateRefreshToken = (payload: TokenPayload): string =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: '30d' })

export const verifyAccessToken = (token: string): DecodedToken | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken
  } catch {
    return null
  }
}

export const verifyRefreshToken = (token: string): DecodedToken | null => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as DecodedToken
  } catch {
    return null
  }
}

export const setTokenCookies = (res: Response, accessToken: string, refreshToken: string): void => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  })
}

export const clearTokenCookies = (res: Response): void => {
  res.clearCookie('accessToken')
  res.clearCookie('refreshToken')
}
