import * as constants from './constants.js'
import * as logger from './logger.js'
import * as db from './db.js'

let lastOpen = 0

/**
 * Middleware function for authorizing the request
 */
export async function auth (req, res, next) {
    const user = await db.findUser(req.params.token).catch(err => new Error(err))
    if (user instanceof Error) {
        logger.print(`user with token ${req.params.token} was attempted to authorize but could not be found`)
        return res.status(401).send(constants.ERR_UNAUTHORIZED)
    }

    if (user.active !== 1) {
        logger.print(`user ${user.name} attempted to authorize but is not active`)
        return res.status(401).send(constants.ERR_UNAUTHORIZED)
    }

    logger.print(`authorized token ${req.params.token} to user ${user.name}`)
    res.locals.user = user
    next()
}

/**
 * Only allow one request to the garage over a specified time
 */
export function canOpen () {
    return Date.now() - lastOpen >= constants.OPEN_DELAY * 1000
}

/**
 * Reset the timer when a user opens the garage
 */
export function resetOpenTimer () {
    lastOpen = Date.now()
}

/**
 * Get the ip address of an http request
 * @param req The request object
 * @return The ip address string
 */
export function getRequestIP (req) {
    return (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress
}
