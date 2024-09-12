import React from "react"
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";

import { routerConfig } from "../router.config";

import styles from "./app.module.css"



export default function AppLayout () {

    return (
        <>
            <div className={styles.layout}>

                <header className={styles.header}>

                    <div className={styles.headerLeft}>
                        <div className={styles.brand}>
                            <i className="bi bi-app-indicator"></i>
                            <span>DDNS-Broker</span>
                        </div>
                    </div>

                    <div className={styles.headerCenter}>
                        <ul className={styles.menu}>
                            <li className={styles.item}>
                                <Link to="/">
                                    Dashboard
                                </Link>
                            </li>
                            <li className={styles.item}>
                                <Link to="/profile">
                                    Profile
                                </Link>
                            </li>
                            <li className={styles.item}>
                                <Link to="/clients">
                                    Clients
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className={styles.headerRight}>
                        <button className="btn">
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