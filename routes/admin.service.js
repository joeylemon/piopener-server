import * as db from '../db.js'
import * as logger from '../logger.js'
import * as config from '../config.js'

/**
 * Endpoint for updating the notification device token for the user
 * https://jlemon.org/garage/updatedevicetoken
 */
export async function updateDeviceToken(token, deviceToken) {
    const results = await db.updateDeviceToken(token, deviceToken).catch(err => new Error(err))

    if (results instanceof Error) {
        logger.printf("could not update device token: %s", results.toString())
        throw results
    }
}

/**
 * Endpoint for updating the ip of the Pi
 * https://jlemon.org/garage/updateip
 */
export async function updateIP(ip) {
    config.set("pi.ip", ip)
}