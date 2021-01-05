import * as db from '../db.js'
import * as utils from '../utils.js'
import * as logger from '../logger.js'
import * as constants from '../constants.js'
import * as garage from '../garage.js'

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

    // If the garage is already open and mode is open-only, do nothing
    if (req.params.mode === "open" && status !== "closed") {
        logger.printf("request was sent to open garage but status was %s", status)
        return res.status(500).send(constants.ERR_ALREADY_OPEN)
    }

    const result = await garage.sendMoveRequest().catch(err => new Error(err))
    if (result instanceof Error) {
        logger.printf("could not move garage: %s", result.toString())
        return res.status(500).send(constants.ERR_MOVE_ERROR)
    }

    utils.resetOpenTimer()
    logger.printf("moving garage for %s", res.locals.user.name)
    db.addHistory(res.locals.user, status)

    res.status(200).send(status)
}