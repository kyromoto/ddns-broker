import React from "react"
import { Navigate, NavLink, useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";

import { useAuth } from "@client/contexts/auth.context";

import styles from "./app.module.css"


export default function AppLayout () {

    const auth = useAuth()

    if (!auth.isAuthorized(["user"])) {
        return <Navigate to="/login" />
    }

    const links = [
        { name: "Dashboard",    link: "/dashboard" },
        { name: "Clients",      link: "/clients" },
        { name: "Jobs",         link: "/jobs" },
    ]

    return (
        <>
            <div className={styles.layout}>

                <header className={`${styles.header} shadow-sm`}>

                    <div className={styles.headerLeft}>
                        <div className={styles.brand}>
                            <i className="bi bi-app-indicator"></i>
                            <span>DDNS-Broker</span>
                        </div>
                    </div>

                    <div className={styles.headerCenter}>
                        <ul className="nav nav-underline">
                            {
                                links.map(link =>
                                    <li key={link.name} className="nav-item">
                                        <NavLink to={link.link} className="nav-link">
                                            {link.name}
                                        </NavLink>
                                    </li>
                                )
                            }
                        </ul>
                    </div>

                    <div className={styles.headerRight}>
                        
                        {
                            auth.hasRoles(["admin"])
                            && <NavLink to="/admin">Admin</NavLink>
                        }

                        <button className="btn" onClick={auth.logout}>
                            Logout
                        </button>
                        
                    </div>

                </header>

                

                <main className={styles.main}>
                    <Outlet />
                </main>

            </div>
        </>
    ) 

}