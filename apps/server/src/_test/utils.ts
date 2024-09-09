import fs from "node:fs/promises"
import { DataSource } from "typeorm"

const DB_FILE = "database.test.sqlite"

export const deleteFileIfExists = async (filePath: string) => {
    // check if database file exists
    try {
        await fs.access(filePath)
        await fs.unlink(filePath)
    } catch (error: any) {
        error.code === "ENOENT"
        ? console.error(`database file ${filePath} does not exist`)   
        : console.error(`database file ${filePath} could not be deleted`, error.message || error)
    }
}


export const initDatabase = async (ds: DataSource) => {
    
    await deleteFileIfExists(DB_FILE)

    ds.setOptions({
        type: "sqlite",
        database: DB_FILE,
        logging: ["error"]
    })

    !ds.isInitialized && await ds.initialize()
}


export const cleanupDatabase = async (ds: DataSource) => {
    await ds.destroy()
    await deleteFileIfExists(DB_FILE)
}