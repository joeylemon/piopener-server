import * as db from '../../utils/db.js'
import * as utils from '../../utils/utils.js'
import * as logger from '../../utils/logger.js'
import * as sockets from '../../utils/sockets.js'
import * as constants from '../../utils/constants.js'
import * as notifications from '../../utils/notifications.js'

/**
 * Send a request to the Pi to open the garage
 */
export function sendMoveRequest () {
    return sockets.sendMoveRequest()
}

/**
 * Send a request to the Pi to read the magnetic switch to determine the garage position
 */
export function getStatus () {
    return sockets.getStatus()
}

/**
 * Endpoint for sending an alert when the garage has been open for a long time
 * https://jlemon.org/garage/sendopenalert
 */
export async function sendLongOpenAlert (openTime) {
    const status = await notifications.sendLongOpenNotification(openTime).catch(err => new Error(err))
    if (status instanceof Error) {
        logger.print(`could not send open alert: ${status.toString()}`)
        throw status
    }
}

/**
 * Endpoint for getting the closed status of the garage door (true if closed, false if open)
 * https://jlemon.org/garage/status
 */
export async function status () {
    const status = await getStatus().catch(err => new Error(err))
    if (status instanceof Error) {
        logger.print(`could not get garage status: ${status.toString()}`)
        throw new Error(constants.ERR_BAD_SENSOR)
    }

    return status
}

/**
 * Endpoint for moving the garage
 * https://jlemon.org/garage/{move,open}
 */
export async function move (user, mode) {
    // Don't allow too many open requests to be sent at one time
    if (!utils.canOpen()) {
        logger.print(`request to move garage failed: another request was sent within the last ${constants.OPEN_DELAY} seconds`)
        throw new Error(constants.ERR_EXCESSIVE_REQUESTS)
    }

    // Ensure a correct mode is given
    if (mode !== 'open' && mode !== 'move') {
        logger.print(`move route was requested with invalid mode ${mode}`)
        throw new Error(constants.ERR_INVALID_MODE)
    }

    const status = await getStatus().catch(err => new Error(err))
    if (status instanceof Error) {
        logger.print(`could not get garage status: ${status.toString()}`)
        throw new Error(constants.ERR_BAD_SENSOR)
    }

    // If the garage is already open and mode is open-only, do nothing
    if (mode === 'open' && status !== 'closed') {
        logger.print(`request was sent to open garage but status was ${status}`)
        throw new Error(constants.ERR_ALREADY_OPEN)
    }

    const result = await sendMoveRequest().catch(err => new Error(err))
    if (result instanceof Error) {
        logger.print(`could not move garage: ${result.toString()}`)
        throw new Error(constants.ERR_MOVE_ERROR)
    }

    utils.resetOpenTimer()
    logger.print(`moving garage for ${user.name}`)
    db.addHistory(user, status)

    return status
}