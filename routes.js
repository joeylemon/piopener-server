import * as db from './db.js'
import * as garage from './garage.js'
import * as constants from './constants.js'
import * as utils from './utils.js'
import * as config from './config.js'
import * as logger from './logger.js'

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