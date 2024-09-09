export const NODE_ENV = String(process.env.NODE_ENV || "development")

export const HTTP_PORT = Number(process.env.HTTP_PORT || 3000)
export const HTTP_BIND = String(process.env.HTTP_BIND || "0.0.0.0")

export const SQLITE_DB = String(process.env.SQLITE_DB || "database.sqlite")