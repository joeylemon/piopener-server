import * as constants from './constants.js'
import * as logger from './logger.js'
import * as db from './db.js'

let lastOpen = 0

/**
 * Middleware function for authorizing the request
 */
export async function auth(req, res, next) {
    const user = await db.findUser(req.params.token).catch(err => new Error(err))
    if (user instanceof Error) {
        logger.printf("user with token %s was attempted to authorize but could not be found", req.params.token)
        return res.status(401).send(constants.ERR_UNAUTHORIZED)
    }

    if (user.active !== 1) {
        logger.printf("user %s attempted to authorize but is not active", user.name)
        return res.status(401).send(constants.ERR_UNAUTHORIZED)
    }

    logger.printf("authorized token %s to user %s", req.params.token, user.name)
    res.locals.user = user
    next()
}

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