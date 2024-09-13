import http from "node:http"

import * as esbuild from "esbuild"

import { config as buildConfig } from "./build.mjs"


const config = {
    ...buildConfig,
    minify: false,
}

const ctx = await esbuild.context(config)

await ctx.watch()
const { host, port } = await ctx.serve({
    servedir: "dist/client",
    // port: 3002,
    onRequest: ({ remoteAddress, method, path, status, timeInMS }) => {
        console.info(remoteAddress, status, `"${method} ${path}" [${timeInMS}ms]`);
    }
})

console.info(`esbuild server started http://${host}:${port}`)

const proxyRoute = (req, res) => {

    const opts = {
        host,
        port,
        method: req.method,
        path: req.url,
        headers: req.headers
    }

    const proxyReq = http.request(opts, proxyRes => {

        if (proxyRes.statusCode === 404) {

            console.info(proxyReq.method, proxyReq.url, proxyRes.statusCode, "redirecting to /")
            
            const redirectReq = http.request({ ...opts, path: "/" }, redirectRes => {
                res.writeHead(redirectRes.statusCode, redirectRes.headers)
                proxyRes.pipe(res, { end: true })
            })

            redirectReq.end()

        } else {

            console.info(proxyReq.method, proxyReq.url, proxyRes.statusCode)

            res.writeHead(proxyRes.statusCode, proxyRes.headers)
            proxyRes.pipe(res, { end: true })
        }
    })

    req.pipe(proxyReq, { end: true })

}

const proxyPort = port + 1

http.createServer(proxyRoute).listen(proxyPort, host, () => {
    console.info(`proxy server started http://${host}:${proxyPort}`)
})