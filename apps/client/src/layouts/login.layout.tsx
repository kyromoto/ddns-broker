import React from "react"
import { Outlet } from "react-router-dom";

export default function LoginLayout () {

    return (
        <>
            <h1>Login Layout</h1>
            <div>
                <Outlet />
            </div>
        </>
    ) 

}