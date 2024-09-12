import React from "react"

import styles from "./dashboard.module.css"

export default function DashboardView () {
    return (
        <div className={styles.layout}>

            <div className={styles.clients}>
                <h1>Clients</h1>
            </div>

            <div className={styles.jobs}>
                <h1>Jobs</h1>
            </div>

            <div className={styles.events}>
                <h1>Events</h1>
            </div>

        </div>
    )
}