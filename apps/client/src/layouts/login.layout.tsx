import React from "react"
import { Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "@client/contexts/auth.context";

import styles from "./login.module.css"


export default function LoginLayout () {

    const auth = useAuth()
    const navigate = useNavigate()

    if (auth.isAuthorized()) {
        return <Navigate to="/" />
    }

    const [username, setUsername] = React.useState("")
    const [password, setPassword] = React.useState("")

    const [loginOngoing, setLoginOngoing] = React.useState(false)
    const [alert, setAlert] = React.useState<string | null>(null)

    const handleSubmit = (e: React.FormEvent) => {
        
        e.preventDefault()

        setLoginOngoing(true)
        setAlert(null)

        auth.login(username, password)
            .then(() => {
                setLoginOngoing(false)
                setAlert(null)
                navigate("/")
            })
            .catch(err => {
                setLoginOngoing(false)
                setAlert(`Login failed`)
            })
    }

    return (
        <div className={styles.layout}>
            <form onSubmit={handleSubmit}>

                <h1 className="text-center">Login</h1>

                <hr />
                
                <div>
                    <label htmlFor="username" className="form-label">Username</label>
                    <input
                        type="text"
                        name="username"
                        id="username"
                        required
                        disabled={loginOngoing}
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="form-control"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        required
                        disabled={loginOngoing}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="form-control"
                    />
                </div>

                <hr />

                <button type="submit" disabled={loginOngoing} className="btn btn-lg btn-primary"><i className="bi bi-arrow-right" /> Login</button>

                {
                    alert && alert.length > 0 && <div className="alert alert-danger alert-dismissible" role="alert">
                        <span>{alert}</span>
                        <button type="button" className="btn-close" aria-label="Close" onClick={() => setAlert(null)} />
                    </div>
                }

            </form>
        </div>
    ) 

}