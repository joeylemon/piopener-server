import * as db from './db.js'
import * as garage from './garage.js'
import * as constants from './constants.js'
import * as utils from './utils.js'
import * as config from './config.js'

/**
 * Middleware function for authorizing the request
 */
export async function auth(req, res, next) {
    const user = await db.findUser(req.params.token).catch(err => new Error(err))
    if (user instanceof Error) {
        return res.status(401).send(constants.ERR_UNAUTHORIZED)
    }

    next()
}

/**
 * Endpoint for moving the garage
 * https://jlemon.org/garage/{move,open}
 */
export async function move(req, res) {
    // Don't allow too many open requests to be sent at one time
    if (!utils.canOpen()) {
        return res.status(500).send(constants.ERR_EXCESSIVE_REQUESTS)
    }

    // Ensure a correct mode is given
    if (req.params.mode !== "open" && req.params.mode !== "move")
        return res.status(500).send(constants.ERR_INVALID_MODE)

    const status = await garage.getStatus().catch(err => new Error(err))
    if (status instanceof Error)
        return res.status(500).send(constants.ERR_BAD_SENSOR)

    // If the garage is already open, do nothing
    if (req.params.mode === "open" && status !== "closed")
        return res.status(500).send(constants.ERR_ALREADY_OPEN)

    utils.resetOpenTimer()

    db.addHistory(user, status)
    garage.sendMoveRequest()

    res.status(200).send(status)
}

/**
 * Endpoint for getting all of the open/close history
 * https://jlemon.org/garage/history/all
 */
export async function allHistory(req, res) {
    const actions = await db.getAllHistory().catch(err => new Error(err))
    if (actions instanceof Error)
        return res.status(500).send(actions.toString())

    res.status(200).send(actions)
}

/**
 * Endpoint for getting a page of the open/close history
 * https://jlemon.org/garage/history
 */
export async function history(req, res) {
    const actions = await db.getHistory(req.params.page).catch(err => new Error(err))
    if (actions instanceof Error)
        return res.status(500).send(actions.toString())

    res.status(200).send(actions)
}

/**
 * Endpoint for manually adding history
 * https://jlemon.org/garage/history/add
 */
export async function addHistory(req, res) {
    if (!utils.canOpen()) {
        return res.status(500).send(constants.ERR_EXCESSIVE_REQUESTS)
    }

    db.addHistory(user, req.params.status)
        .then(res.status(200).send("200 OK"))
        .catch(err => res.status(500).send(err.toString()))
}

/**
 * Endpoint for getting the closed status of the garage door (true if closed, false if open)
 * https://jlemon.org/garage/status
 */
export async function status(req, res) {
    const status = await garage.getStatus().catch(err => new Error(err))
    if (status instanceof Error)
        return res.status(500).send(constants.ERR_BAD_SENSOR)

    res.status(200).send(status)
}

/**
 * Endpoint for updating the ip of the Pi
 * https://jlemon.org/garage/updateip
 */
export async function updateIP(req, res) {
    const ip = utils.getRequestIP(req)
    console.log(`request to update ip to: "${ip}"`)

    config.set("pi.ip", ip)

    res.status(200).send("200 OK")
}