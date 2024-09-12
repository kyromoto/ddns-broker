import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"


// development only
// Reload app on esbuild change
const esbuildEvents = new EventSource('/esbuild')
esbuildEvents.addEventListener("error", () => location.reload())
esbuildEvents.addEventListener("change", () => location.reload())



const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
)

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)