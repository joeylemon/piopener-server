import * as constants from './constants.js'

let lastOpen = 0

/**
 * Only allow one request to the garage over a specified time
 */
export function canOpen() {
    return Date.now() - lastOpen >= constants.OPEN_DELAY * 1000
}

/**
 * Reset the timer when a user opens the garage
 */
export function resetOpenTimer() {
    lastOpen = Date.now()
}

/**
 * Get the ip address of an http request
 * @param req The request object
 * @return The ip address string
 */
export function getRequestIP(req) {
    return (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress
}