import React from "react"
import * as jose from "jose"

import { loginUser } from "@client/services/login-client"


export interface AuthContext {
    isAuthorized: (requiredRoles?: string[]) => boolean
    hasRoles: (requiredRoles: string[]) => boolean
    login: (username: string, password: string) => Promise<void>
    logout: () => Promise<void>
}


export const AuthContext = React.createContext<AuthContext>({
    isAuthorized: () => false,
    hasRoles: (requiredRoles: string[]) => false,
    login: async (username: string, password: string) => {},
    logout: async () => {},
})


const localStorageTokenKey = "access-token"


export const AuthProvider = (props: React.PropsWithChildren) => {

    const [userId, setUserId] = React.useState<string | null>(null)
    const [roles, setRoles] = React.useState<string[]>(["user", "admin"])
    const [token, setToken] = React.useState<string | null>(localStorage.getItem(localStorageTokenKey))

    const hasRoles = (requiredRoles: string[]) => roleChecker(requiredRoles, roles)

    const login = async (username: string, password: string) => {
        
        const { accessToken } = await loginUser(username, password)
        
        const decoded = jose.decodeJwt<{ userId: string }>(accessToken)        

        setToken(accessToken)
        setUserId(decoded.userId)
        localStorage.setItem(localStorageTokenKey, accessToken)

    }

    const logout = async () => {

        setUserId(null)
        setRoles([])
        setToken(null)
        localStorage.removeItem(localStorageTokenKey)

    }

    const isAuthorized = (requiredRoles?: string[]) => {
        
        if (!token) {
            return false
        }
        
        if (requiredRoles) {
            return roleChecker(requiredRoles, roles)
        }

        return true

    }

    return (
        <AuthContext.Provider value={{ isAuthorized, hasRoles, login, logout }}>
            {props.children}
        </AuthContext.Provider>
    )
}


export function useAuth () {
    return React.useContext(AuthContext)
}



const roleChecker = (required: string[], current: string[]) => required.every(role => current.includes(role))