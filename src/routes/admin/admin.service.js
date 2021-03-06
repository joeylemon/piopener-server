import * as db from '../../utils/db.js'
import * as logger from '../../utils/logger.js'

/**
 * Endpoint for updating the notification device token for the user
 * https://jlemon.org/garage/updatedevicetoken
 */
export async function updateDeviceToken (token, deviceToken) {
    if (deviceToken === 'null') deviceToken = null
    const results = await db.updateDeviceToken(token, deviceToken).catch(err => new Error(err))

    if (results instanceof Error) {
        logger.print(`could not update device token: ${results.toString()}`)
        throw results
    }
}
