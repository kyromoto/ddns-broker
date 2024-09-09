import { spawn } from "node:child_process"

import * as esbuild from "esbuild"

import { config } from "./build.mjs"



let process = null

const ctx = await esbuild.context({
    
    ...config,
    
    minify: false,

    plugins: [

        ...config.plugins,

        {
            name: "rebuild-notify",
            setup: (build) => {

                build.onEnd(async () => {

                    if (process) process.kill("SIGINT")
                    process = null


                    process = spawn("node", ["dist/server/index.js"])

                    process.stdout.addListener("data", (data) => {
                        console.log(data.toString())
                    })


                    process.stderr.addListener("data", (data) => {
                        console.error(data.toString())
                    })

                })
            }
        }

    ],
})


await ctx.watch()