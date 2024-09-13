export const NODE_ENV = String(process.env.NODE_ENV || "development")

export const HTTP_PORT = Number(process.env.HTTP_PORT || 3000)
export const HTTP_BIND = String(process.env.HTTP_BIND || "0.0.0.0")
export const HTTP_CORS_ORIGINS = process.env.HTTP_CORS_ORIGINS?.split(",") || ["*"]

export const SQLITE_DB = String(process.env.SQLITE_DB || "database.sqlite")

export const ACCESS_TOKEN_SECRET = String(process.env.ACCESS_TOKEN_SECRET || "access-token-secret")
export const REFRESH_TOKEN_SECRET = String(process.env.REFRESH_TOKEN_SECRET || "refresh-token-secret")

export const REFRESH_TOKEN_COOKIE_NAME = String(process.env.REFRESH_TOKEN_COOKIE_NAME || "x-refresh-token")