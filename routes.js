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
        logger.printf("token %s was attempted to authorize but failed", req.params.token)
        return res.status(401).send(constants.ERR_UNAUTHORIZED)
    }

    logger.printf("authorized token %s to user %s", req.params.token, user.name)
    res.locals.user = user
    next()
}

/**
 * Endpoint for moving the garage
 * https://jlemon.org/garage/{move,open}
 */
export async function move(req, res) {
    // Don't allow too many open requests to be sent at one time
    if (!utils.canOpen()) {
        logger.printf("request to move garage failed: another request was sent within the last %d seconds", constants.OPEN_DELAY)
        return res.status(500).send(constants.ERR_EXCESSIVE_REQUESTS)
    }

    // Ensure a correct mode is given
    if (req.params.mode !== "open" && req.params.mode !== "move") {
        logger.printf("move route was requested with invalid mode %s", req.params.mode)
        return res.status(500).send(constants.ERR_INVALID_MODE)
    }

    const status = await garage.getStatus().catch(err => new Error(err))
    if (status instanceof Error) {
        logger.printf("could not get garage status: %s", status.toString())
        return res.status(500).send(constants.ERR_BAD_SENSOR)
    }

    // If the garage is already open, do nothing
    if (req.params.mode === "open" && status !== "closed") {
        logger.printf("request was sent to open garage but status was %s", status)
        return res.status(500).send(constants.ERR_ALREADY_OPEN)
    }

    utils.resetOpenTimer()

    logger.printf("moving garage for %s", res.locals.user.name)
    db.addHistory(res.locals.user, status)
    garage.sendMoveRequest()

    res.status(200).send(status)
}

/**
 * Endpoint for getting all of the open/close history
 * https://jlemon.org/garage/history/all
 */
export async function allHistory(req, res) {
    const actions = await db.getAllHistory().catch(err => new Error(err))
    if (actions instanceof Error) {
        logger.printf("could not get history: %s", actions.toString())
        return res.status(500).send(actions.toString())
    }

    res.status(200).send(actions)
}

/**
 * Endpoint for getting a user's settings
 * https://jlemon.org/garage/settings
 */
export async function getAllSettings(req, res) {
    const settings = await db.getAllSettings(req.params.token).catch(err => new Error(err))
    if (settings instanceof Error) {
        logger.printf("could not get settings: %s", settings.toString())
        return res.status(500).send(settings.toString())
    }

    logger.printf("retrieving settings for %s", res.locals.user.name)
    res.status(200).send(settings)
}

/**
 * Endpoint for getting a user's specific settings
 * https://jlemon.org/garage/settings
 */
export async function getSetting(req, res) {
    const setting = await db.getSetting(req.params.token, req.params.setting).catch(err => new Error(err))
    if (setting instanceof Error) {
        logger.printf("could not get setting: %s", setting.toString())
        return res.status(500).send(setting.toString())
    }

    logger.printf("retrieving setting %s for %s", req.params.setting, res.locals.user.name)
    res.status(200).send(setting === 1)
}

/**
 * Endpoint for updating a user's settings
 * https://jlemon.org/garage/settings
 */
export async function setSettings(req, res) {
    const results = await db.updateSettings(req.params.token, req.params.setting, req.params.value).catch(err => new Error(err))
    if (results instanceof Error) {
        logger.printf("could not update settings: %s", results.toString())
        return res.status(500).send(results.toString())
    }

    logger.printf("updating setting %s to %s for %s", req.params.setting, req.params.value, res.locals.user.name)
    res.status(200).send("200 OK")
}

/**
 * Endpoint for getting a page of the open/close history
 * https://jlemon.org/garage/history
 */
export async function history(req, res) {
    const actions = await db.getHistory(req.params.page).catch(err => new Error(err))
    if (actions instanceof Error) {
        logger.printf("could not get history: %s", actions.toString())
        return res.status(500).send(actions.toString())
    }

    logger.printf("retrieving page %d of history for %s", req.params.page, res.locals.user.name)
    res.status(200).send(actions)
}

/**
 * Endpoint for manually adding history
 * https://jlemon.org/garage/history/add
 */
export async function addHistory(req, res) {
    if (!utils.canOpen()) {
        logger.printf("request to manually add history failed: a move request was sent within the last %d seconds", constants.OPEN_DELAY)
        return res.status(500).send(constants.ERR_EXCESSIVE_REQUESTS)
    }

    logger.printf("adding history for %s", res.locals.user.name)
    db.addHistory(res.locals.user, req.params.status)
        .then(res.status(200).send("200 OK"))
        .catch(err => res.status(500).send(err.toString()))
}

/**
 * Endpoint for getting the closed status of the garage door (true if closed, false if open)
 * https://jlemon.org/garage/status
 */
export async function status(req, res) {
    const status = await garage.getStatus().catch(err => new Error(err))
    if (status instanceof Error) {
        logger.printf("could not get garage status: %s", status.toString())
        return res.status(500).send(constants.ERR_BAD_SENSOR)
    }

    logger.printf("getting garage status for %s", res.locals.user.name)
    res.status(200).send(status)
}

/**
 * Endpoint for updating the ip of the Pi
 * https://jlemon.org/garage/updateip
 */
export async function updateIP(req, res) {
    const ip = utils.getRequestIP(req)

    logger.printf("updating pi ip to %s", ip)
    config.set("pi.ip", ip)
    res.status(200).send("200 OK")
}