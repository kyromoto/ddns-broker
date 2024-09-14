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
        { name: "Dashboard",    link: "/dashboard", icon: "speedometer" },
        { name: "Clients",      link: "/clients",   icon: "pc" },
        { name: "Jobs",         link: "/jobs",      icon: "list-task" },
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

                    <div className={styles.headerRight}>

                        <ul className="nav nav-underline d-flex gap-4">

                            {
                                auth.hasRoles(["admin"]) &&
                                <li className="nav-item">
                                    <NavLink to="/admin" className="nav-link">
                                        <i className="bi bi-building"></i> Admin
                                    </NavLink>
                                </li>
                            }

                            <li className="nav-item">
                                <button className="btn btn-outline-secondary" onClick={auth.logout}>
                                    <i className="bi bi-box-arrow-right"></i> Logout
                                </button>
                            </li>


                        </ul>
                        



                        
                    </div>

                </header>

                

                <main className={styles.main}>
                    <Outlet />
                </main>

            </div>
        </>
    ) 

}