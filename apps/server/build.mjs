import * as esbuild from "esbuild"
import esbuildPluginTsc from "esbuild-plugin-tsc"

export const config = {
    entryPoints: ["apps/server/src/index.ts"],
    outdir: "dist/server",
    platform: "node",
    target: "node18",
    bundle: true,
    sourcemap: true,
    plugins: [
        esbuildPluginTsc({
            tsconfigPath: "apps/server/tsconfig.json"
        })
    ]
}

await esbuild.build(config)