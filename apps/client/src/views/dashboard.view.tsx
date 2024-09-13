import React from "react"

import { getClientsByUser } from "@client/services/get-clients.ddns-gw-service"

import styles from "./dashboard.module.css"



export default function DashboardView () {

    const [clients, setClients] = React.useState([])
    const [events, setEvents] = React.useState([])
    const [jobs, setJobs] = React.useState([])

    React.useEffect(() => {
        getClientsByUser("")
            .then(clients => setClients(clients))
            .catch(err => console.error(err.message ?? err))
    })

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