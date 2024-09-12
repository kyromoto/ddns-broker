import React from "react"
import { RouteObject } from "react-router-dom";

import DashboardView from "./views/dashboard.view"
import ProfileView from "./views/profile.view"
import ClientsView from "./views/clients.view"

import AppLayout from "./layouts/app.layout"
import LoginLayout from "./layouts/login.layout"

export const routerConfig: RouteObject[] = [
    {
        path: "/",
        element: <AppLayout />,
        children: [
            {
                path: "",
                element: <DashboardView />
            },
            {
                path: "profile",
                element: <ProfileView />
            },
            {
                path: "clients",
                element: <ClientsView />
            }
        ]
    },
    {
        path: "/login",
        element: <LoginLayout />
    }
]