/*!
 * baearer-auth
 * Copyright(c) 2024 Oliver Rademaker
 * MIT Licensed
 */


const CREDENTIALS_REGEXP = /^ *(?:[Bb][Ee][Aa][Rr][Ee][Rr]) +([A-Za-z0-9._~+/-]+=*) *$/


export default function auth(req: any) {

    if (!req) {
        throw new TypeError('argument req is required')
    }

    if (typeof req !== 'object') {
        throw new TypeError('argument req is required to be an object')
    }

    return parse(getAuthorization(req))

}



function getAuthorization (req: any) {

    if (!req.headers || typeof req.headers !== 'object') {
        throw new TypeError('argument req is required to have headers property')
    }
    
    return req.headers.authorization
}



function parse (str: string) {

    if (typeof str !== 'string') {
        return undefined
    }

    const match = CREDENTIALS_REGEXP.exec(str)

    if (!match) {
        return undefined
    }

    return match[1]

}