import React from "react"
import { Navigate, NavLink, Outlet } from "react-router-dom"

import { useAuth } from "@client/contexts/auth.context"

import styles from "./admin.module.css"



export default function AdminLayout () {

    const auth = useAuth()

    if (!auth.isAuthorized(["admin"])) {
        return <Navigate to="/login" />
    }

    const links = [
        { name: "Dashboard",link: "/admin/dashboard",   icon: "speedometer" },
        { name: "Users",    link: "/admin/users",       icon: "people" },
        { name: "Clients",  link: "/admin/clients",     icon: "pc" },
    ]
    
    return (
        <div className={`container ${styles.layout}`}>

            <div className={`${styles.nav} py-3 rounded d-flex justify-content-center`}>
                <ul className="nav nav-underline d-flex gap-4">
                    {
                        links.map(link =>
                            <li key={link.name} className="nav-item">
                                <NavLink to={link.link} className="nav-link">
                                    <i className={`bi bi-${link.icon}`} /> {link.name}
                                </NavLink>
                            </li>
                        )
                    }
                </ul>
            </div>

            <div className={styles.view}>
                <Outlet />
            </div>

        </div>
    )
}