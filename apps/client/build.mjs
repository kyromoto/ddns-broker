import * as esbuild from "esbuild"
import esbuildPluginTsc from "esbuild-plugin-tsc"

export const config = {
    entryPoints: [
        "apps/client/src/index.html",
        "apps/client/src/index.tsx"
    ],
    outdir: "dist/client",
    platform: "browser",
    bundle: true,
    sourcemap: true,
    minify: true,
    plugins: [
        esbuildPluginTsc({
            tsconfigPath: "apps/client/tsconfig.json"
        })
    ],
    loader: {
        ".html" : "copy",
        ".woff" : "copy",
        ".woff2": "copy"
    }
}

await esbuild.build(config)