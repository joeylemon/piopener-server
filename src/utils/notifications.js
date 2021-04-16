import * as db from './db.js'
import * as logger from './logger.js'
import { config } from './constants.js'
import apn from 'apn'

// Apple APN configuration for sending remote notifications
let notifications

// Don't set up APN configuration if testing
if (!process.env.TESTING) {
    notifications = new apn.Provider({
        token: config.apn,
        production: false
    })
}

/**
 * Send notifications to all users when the garage has been opened for a long time
 */
export async function sendLongOpenNotification (openTime) {
    // Get the device tokens of all users who have opted in to open notifications
    const tokens = await db.getNotificationTokens(row => row.notify_on_long_open === 1).catch(err => new Error(err))
    if (tokens instanceof Error) {
        logger.print(`could not get user device tokens: ${tokens.toString()}`)
        throw tokens
    }

    const minutesOpen = Math.floor(openTime / 60000)

    // Send notifications to each device
    logger.print(`garage has been open for ${minutesOpen} minutes`)
    logger.print(`send long open notifications to [${tokens.join(',')}]`)
    for (const t of tokens) { sendNotification(t, `The garage door has been open for over ${minutesOpen} minutes!`) }
}

/**
 * Send notifications to all users when the garage was opened
 * @param {Object} user The user object that opened the garage
 */
export async function sendOpenNotification (user) {
    // Get the device tokens of all users who have opted in to open notifications
    const tokens = await db.getNotificationTokens(row => row.token !== user.token && row.notify_on_all_opens === 1).catch(err => new Error(err))
    if (tokens instanceof Error) { return logger.print(`could not get user device tokens: ${tokens.toString()}`) }

    // Send notifications to each device
    logger.print(`send open notifications to ${tokens.join(',')}`)
    const msg = user.name === 'Other' ? 'Someone has just opened the garage' : `${user.name} has just opened the garage`

    for (const t of tokens) { sendNotification(t, msg) }
}

/**
 * Send a notification to the specific device
 * @param {string} token The device token
 * @param {number} msg The notifcation body
 */
function sendNotification (token, msg) {
    const note = new apn.Notification()

    note.expiry = Math.floor(Date.now() / 1000) + 3600
    note.badge = 3
    note.sound = 'ping.aiff'
    note.type = 'alert'
    note.alert = msg
    note.topic = 'org.jlemon.garage.Garage-Door'

    notifications.send(note, token)
        .catch(err => logger.print(`could not send notification to ${token}: ${err.toString()}`))
}
