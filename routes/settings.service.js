import * as db from '../db.js'
import * as logger from '../logger.js'

export const OPEN_AND_CLOSE = {
    Name: "Openings and closings",
    Entries: [
        {
            SettingName: "Notify on long open time",
            SettingKey: "notify_on_long_open",
            Description: "Send a notification when the door has been open for a long time"
        },
        {
            SettingName: "Notify on all opens",
            SettingKey: "notify_on_all_opens",
            Description: "Send a notification when the door has been opened"
        },
        {
            SettingName: "Open door upon arrival",
            SettingKey: "open_upon_arrival",
            Description: "Automatically open the door when you arrive at the apartment"
        }
    ]
}

export const ALL = [OPEN_AND_CLOSE]

/**
 * Get a list of all setting column names for the user table
 */
export function getAllSettingKeys() {
    return ALL.map(s => s.Entries).flat().map(e => e.SettingKey)
}

/**
 * Endpoint for getting a user's settings
 * https://jlemon.org/garage/settings
 */
export async function getAllSettings(token) {
    const settings = await db.getAllSettings(token).catch(err => new Error(err))
    if (settings instanceof Error) {
        logger.print(`could not get settings: ${settings.toString()}`)
        throw settings
    }

    return settings
}

/**
 * Endpoint for getting a user's specific settings
 * https://jlemon.org/garage/settings
 */
export async function getSetting(token, setting) {
    const settingResult = await db.getSetting(token, setting).catch(err => new Error(err))
    if (settingResult instanceof Error) {
        logger.print(`could not get setting ${setting}: ${settingResult.toString()}`)
        throw settingResult
    }

    return settingResult === 1
}

/**
 * Endpoint for updating a user's settings
 * https://jlemon.org/garage/settings
 */
export async function updateSetting(token, setting, value) {
    const results = await db.updateSettings(token, setting, value).catch(err => new Error(err))
    if (results instanceof Error) {
        logger.print(`could not update setting ${setting}: ${results.toString()}`)
        throw results
    }
}