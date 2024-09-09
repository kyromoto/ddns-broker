export class AppError extends Error {

    constructor(private code: number, private reason: string, private data?: any) {

        let msg = `Error ${code} : ${reason}`

        if (data) {
            msg += ` : ${JSON.stringify(data)}`
        }

        super(msg)
    }


    get Code()      { return this.code }
    get Reason()    { return this.reason }
    get Data()      { return this.data }

}