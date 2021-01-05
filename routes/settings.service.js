import * as db from '../db.js'
import * as logger from '../logger.js'

/**
 * Endpoint for getting a user's settings
 * https://jlemon.org/garage/settings
 */
export async function getAllSettings(user, token) {
    const settings = await db.getAllSettings(token).catch(err => new Error(err))
    if (settings instanceof Error) {
        logger.printf("could not get settings: %s", settings.toString())
        throw settings
    }

    logger.printf("retrieving settings for %s", user.name)
    return settings
}

/**
 * Endpoint for getting a user's specific settings
 * https://jlemon.org/garage/settings
 */
export async function getSetting(token, setting) {
    const settingResult = await db.getSetting(token, setting).catch(err => new Error(err))
    if (settingResult instanceof Error) {
        logger.printf("could not get setting: %s", settingResult.toString())
        throw settingResult
    }

    logger.printf("retrieving setting %s for %s", setting, token)
    return settingResult === 1
}

/**
 * Endpoint for updating a user's settings
 * https://jlemon.org/garage/settings
 */
export async function updateSetting(token, setting, value) {
    const results = await db.updateSettings(token, setting, value).catch(err => new Error(err))
    if (results instanceof Error) {
        logger.printf("could not update settings: %s", results.toString())
        throw results
    }

    logger.printf("updating setting %s to %s for %s", setting, value, token)
}