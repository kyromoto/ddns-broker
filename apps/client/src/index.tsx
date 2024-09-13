import React from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"

import { routerConfig } from "./router.config"

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-icons/font/bootstrap-icons.css"
import { AuthContext, AuthProvider } from "./contexts/auth.context"


// development only
// Reload app on esbuild change
const esbuildEvents = new EventSource('/esbuild')
esbuildEvents.addEventListener("error", () => location.reload())
esbuildEvents.addEventListener("change", () => location.reload())




const router = createBrowserRouter(routerConfig)

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
)

root.render(
    <React.StrictMode>
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    </React.StrictMode>
)