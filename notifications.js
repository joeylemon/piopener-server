import * as constants from './constants.js'
import * as db from './db.js'
import * as garage from './garage.js'
import * as logger from './logger.js'
import * as config from './config.js'
import apn from 'apn'

// Apple APN configuration for sending remote notifications
const notifications = new apn.Provider({
    token: config.get("apn"),
    production: false
})

let lastNotificationTime = 0
let lastClosedTime = Date.now()

/**
 * Get the duration (in ms) that the garage door has been open
 */
function getOpenTime() {
    return Date.now() - lastClosedTime
}

/**
 * Start a timer that tracks the garage's open status
 */
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
        if (getOpenTime() > constants.LONG_OPEN_DURATION)
            return sendLongOpenNotification()
    }, 20000)
}

/**
 * Send notifications to all users when the garage has been opened for a long time
 */
async function sendLongOpenNotification() {
    // Wait a while between sending multiple notifications
    if (Date.now() - lastNotificationTime < constants.LONG_OPEN_DURATION * 2)
        return

    // Get the device tokens of all users who have opted in to open notifications
    const tokens = await db.getNotificationTokens(row => row.notify_on_long_open === 1).catch(err => new Error(err))
    if (tokens instanceof Error)
        return logger.printf("could not get user device tokens: %s", tokens.toString())

    const minutesOpen = Math.floor(getOpenTime() / 60000)

    // Send notifications to each device
    logger.printf("garage has been open for %d minutes", Math.floor((getOpenTime()) / 60000))
    logger.printf("send long open notifications to [%s]", tokens.join(","))
    for (const t of tokens)
        sendNotification(t, `The garage door has been open for over ${minutesOpen} minutes!`)

    lastNotificationTime = Date.now()
}

/**
 * Send notifications to all users when the garage was opened
 * @param {Object} user The user object that opened the garage
 */
export async function sendOpenNotification(user) {
    // Get the device tokens of all users who have opted in to open notifications
    const tokens = await db.getNotificationTokens(row => row.token !== user.token && row.notify_on_all_opens === 1).catch(err => new Error(err))
    if (tokens instanceof Error)
        return logger.printf("could not get user device tokens: %s", tokens.toString())

    // Send notifications to each device
    logger.printf("send open notifications to [%s]", tokens.join(","))
    const msg = user.name === "Other" ? "Someone has just opened the garage" : `${user.name} has just opened the garage`

    for (const t of tokens)
        sendNotification(t, msg)
}

/**
 * Send a notification to the specific device
 * @param {string} token The device token
 * @param {number} msg The notifcation body
 */
function sendNotification(token, msg) {
    var note = new apn.Notification()

    note.expiry = Math.floor(Date.now() / 1000) + 3600
    note.badge = 3
    note.sound = "ping.aiff"
    note.type = "alert"
    note.alert = msg
    note.topic = "org.jlemon.garage.Garage-Door"

    notifications.send(note, token)
        .catch(err => logger.printf("could not send notification to %s: %s", token, err.toString()))
}