import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

export interface JWTPayload {
  authorized: boolean
  iat?: number
  exp?: number
}

export function generateToken(): string {
  const payload: JWTPayload = {
    authorized: true
  }

  // Token expires in 24 hours
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: '24h' })
}

export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as jwt.JwtPayload & JWTPayload
    return {
      authorized: decoded.authorized,
      iat: decoded.iat,
      exp: decoded.exp
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token')
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired')
    }
    throw new Error('Token verification failed')
  }
}