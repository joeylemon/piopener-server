import request from 'request'
import * as db from '../db.js'
import * as utils from '../utils.js'
import * as logger from '../logger.js'
import * as config from '../config.js'
import * as constants from '../constants.js'
import * as notifications from '../notifications.js'

/**
 * Send a request to the Pi to open the garage
 */
export function sendMoveRequest() {
    return new Promise((resolve, reject) => {
        request({
            url: `http://${config.get("pi.ip")}:${config.get("pi.port")}/move/${config.get("secret")}`,
            timeout: 2000
        }, (error, response, body) => {
            if (error || response.statusCode != 200)
                reject(error)

            resolve(body)
        })
    })
}

/**
 * Send a request to the Pi to read the magnetic switch to determine the garage position
 */
export function getStatus() {
    return new Promise((resolve, reject) => {
        request({
            url: `http://${config.get("pi.ip")}:${config.get("pi.port")}/status/${config.get("secret")}`,
            timeout: 2000
        }, (error, response, body) => {
            if (error || response.statusCode != 200)
                reject(error)

            resolve(body)
        })
    })
}

/**
 * Endpoint for sending an alert when the garage has been open for a long time
 * https://jlemon.org/garage/sendopenalert
 */
export async function sendLongOpenAlert(openTime) {
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
export async function status() {
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
export async function move(user, mode) {
    // Don't allow too many open requests to be sent at one time
    if (!utils.canOpen()) {
        logger.print(`request to move garage failed: another request was sent within the last ${constants.OPEN_DELAY} seconds`)
        throw new Error(constants.ERR_EXCESSIVE_REQUESTS)
    }

    // Ensure a correct mode is given
    if (mode !== "open" && mode !== "move") {
        logger.print(`move route was requested with invalid mode ${mode}`)
        throw new Error(constants.ERR_INVALID_MODE)
    }

    const status = await getStatus().catch(err => new Error(err))
    if (status instanceof Error) {
        logger.print(`could not get garage status: ${status.toString()}`)
        throw new Error(constants.ERR_BAD_SENSOR)
    }

    // If the garage is already open and mode is open-only, do nothing
    if (mode === "open" && status !== "closed") {
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