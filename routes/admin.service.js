import * as db from '../db.js'
import * as utils from '../utils.js'
import * as logger from '../logger.js'
import * as config from '../config.js'

/**
 * Endpoint for updating the notification device token for the user
 * https://jlemon.org/garage/updatedevicetoken
 */
export async function updateDeviceToken(req, res) {
    const results = db.updateDeviceToken(req.params.token, req.params.devicetoken).catch(err => new Error(err))

    if (results instanceof Error) {
        logger.printf("could not update device token: %s", results.toString())
        return res.status(500).send(results.toString())
    }

    logger.printf("updating device token for %s to %s", req.params.token, req.params.devicetoken)
    res.status(200).send("200 OK")
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