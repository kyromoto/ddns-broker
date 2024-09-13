import React from "react"
import { Navigate, RouteObject } from "react-router-dom"


import ProfileView from "./views/profile.view"
import ClientsView from "./views/clients.view"
import DashboardView from "./views/dashboard.view"
import AdminUserView from "./views/admin/adminUser.view"
import AdminClientView from "./views/admin/adminClients.view"
import AdminDashboardView from "./views/admin/adminDashboard.view"

import AppLayout from "./layouts/app.layout"
import LoginLayout from "./layouts/login.layout"
import AdminLayout from "./layouts/admin.layout"


export const routerConfig: RouteObject[] = [
    {
        path: "/",
        element: <AppLayout />,
        children: [
            {
                path: "",
                element: <Navigate to="/dashboard" />
            },
            {
                path: "dashboard",
                element: <DashboardView />
            },
            {
                path: "profile",
                element: <ProfileView />
            },
            {
                path: "clients",
                element: <ClientsView />
            },
            {
                path: "admin",
                element: <AdminLayout />,
                children: [
                    {
                        path: "",
                        element: <Navigate to="/admin/dashboard" />
                    },
                    {
                        path: "dashboard",
                        element: <AdminDashboardView />
                    },
                    {
                        path: "users",
                        element: <AdminUserView />
                    },
                    {
                        path: "clients",
                        element: <AdminClientView />
                    }
                ]
            }
        ]
    },
    {
        path: "/login",
        element: <LoginLayout />
    }
]