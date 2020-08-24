import * as db from './db.js'
import * as garage from './garage.js'
import * as constants from './constants.js'
import * as utils from './utils.js'
import * as config from './config.js'

/**
 * Endpoint for moving the garage
 * https://jlemon.org/garage/{move,open}
 */
export async function move(req, res) {
    const user = await db.findUser(req.params.token).catch(err => new Error(err))
    if (user instanceof Error)
        return res.status(401).send(constants.ERR_UNAUTHORIZED)

    // Don't allow too many open requests to be sent at one time
    if (!utils.canOpen()) {
        return res.status(500).send(constants.ERR_EXCESSIVE_REQUESTS)
    }

    const status = await garage.getClosedStatus().catch(err => new Error(err))
    if (status instanceof Error)
        return res.status(500).send(constants.ERR_BAD_SENSOR)

    // If the garage is already open, do nothing
    if (req.params.mode === "open" && status === "false")
        return res.status(500).send(constants.ERR_ALREADY_OPEN)

    utils.resetOpenTimer()

    db.addHistory(user, status)
    garage.sendMoveRequest()

    res.status(200).send(status)
}

/**
 * Endpoint for getting the open/close history
 * https://jlemon.org/garage/history
 */
export async function history(req, res) {
    const user = await db.findUser(req.params.token).catch(err => new Error(err))
    if (user instanceof Error)
        return res.status(401).send(constants.ERR_UNAUTHORIZED)

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
    const user = await db.findUser(req.params.token).catch(err => new Error(err))
    if (user instanceof Error)
        return res.status(401).send(constants.ERR_UNAUTHORIZED)

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
    const user = await db.findUser(req.params.token).catch(err => new Error(err))
    if (user instanceof Error)
        return res.status(401).send(constants.ERR_UNAUTHORIZED)

    const status = await garage.getClosedStatus().catch(err => new Error(err))
    if (status instanceof Error)
        return res.status(500).send(constants.ERR_BAD_SENSOR)

    res.status(200).send(status)
}

/**
 * Endpoint for updating the ip of the Pi
 * https://jlemon.org/garage/setip
 */
export async function updateIP(req, res) {
    const user = await db.findUser(req.params.token).catch(err => new Error(err))
    if (user instanceof Error)
        return res.status(401).send(constants.ERR_UNAUTHORIZED)

    const conf = config.getConfig()
    conf.pi.ip = req.params.ip
    config.setConfig(conf)

    res.status(200).send("200 OK")
}