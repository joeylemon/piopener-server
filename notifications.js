import * as constants from './constants.js'
import * as db from './db.js'
import * as garage from './garage.js'
import * as logger from './logger.js'

let lastNotificationTime = 0
let lastClosedTime = Date.now()

export function checkStatus() {
    setInterval(async () => {
        const status = await garage.getStatus().catch(err => new Error(err))
        if (status instanceof Error)
            return logger.printf("could not get garage status: %s", status.toString())

        if (status === "closed") {
            lastClosedTime = Date.now()
            return
        }

        // If it's been too long since the garage was last seen closed, send a notification
        if (Date.now() - lastClosedTime > constants.LONG_OPEN_DURATION) {
            logger.printf("garage has been open for %d seconds", Math.floor((Date.now() - lastClosedTime) / 1000))
            return sendNotifications()
        }
    }, 20000)
}

async function sendNotifications() {
    // Wait a while between sending multiple notifications
    if (Date.now() - lastNotificationTime < constants.LONG_OPEN_DURATION * 2)
        return

    const tokens = await db.getNotificationTokens().catch(err => new Error(err))
    if (tokens instanceof Error)
        return logger.printf("could not get user device tokens: %s", tokens.toString())

    logger.printf("send notifications to [%s]", tokens.join(","))

    lastNotificationTime = Date.now()
}