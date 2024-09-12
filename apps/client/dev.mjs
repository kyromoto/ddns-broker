import * as esbuild from "esbuild"

import { config as buildConfig } from "./build.mjs"


const config = {
    ...buildConfig,
    minify: false,
}

const ctx = await esbuild.context(config)

await ctx.watch()
await ctx.serve({
    servedir: "dist/client",
    port: 3002,
    onRequest: ({ remoteAddress, method, path, status, timeInMS }) => {
        console.info(remoteAddress, status, `"${method} ${path}" [${timeInMS}ms]`);
    }
})