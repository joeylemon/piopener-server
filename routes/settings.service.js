import * as db from '../db.js'
import * as logger from '../logger.js'

/**
 * Endpoint for getting a user's settings
 * https://jlemon.org/garage/settings
 */
export async function getAllSettings(req, res) {
    const settings = await db.getAllSettings(req.params.token).catch(err => new Error(err))
    if (settings instanceof Error) {
        logger.printf("could not get settings: %s", settings.toString())
        return res.status(500).send(settings.toString())
    }

    logger.printf("retrieving settings for %s", res.locals.user.name)
    res.status(200).send(settings)
}

/**
 * Endpoint for getting a user's specific settings
 * https://jlemon.org/garage/settings
 */
export async function getSetting(req, res) {
    const setting = await db.getSetting(req.params.token, req.params.setting).catch(err => new Error(err))
    if (setting instanceof Error) {
        logger.printf("could not get setting: %s", setting.toString())
        return res.status(500).send(setting.toString())
    }

    logger.printf("retrieving setting %s for %s", req.params.setting, res.locals.user.name)
    res.status(200).send(setting === 1)
}

/**
 * Endpoint for updating a user's settings
 * https://jlemon.org/garage/settings
 */
export async function setSettings(req, res) {
    const results = await db.updateSettings(req.params.token, req.params.setting, req.params.value).catch(err => new Error(err))
    if (results instanceof Error) {
        logger.printf("could not update settings: %s", results.toString())
        return res.status(500).send(results.toString())
    }

    logger.printf("updating setting %s to %s for %s", req.params.setting, req.params.value, res.locals.user.name)
    res.status(200).send("200 OK")
}