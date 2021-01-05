import * as db from '../db.js'
import * as utils from '../utils.js'
import * as logger from '../logger.js'
import * as constants from '../constants.js'

/**
 * Endpoint for getting all of the open/close history
 * https://jlemon.org/garage/history/all
 */
export async function allHistory() {
    const actions = await db.getAllHistory().catch(err => new Error(err))
    if (actions instanceof Error) {
        logger.printf("could not get history: %s", actions.toString())
        throw new Error(actions.toString())
    }

    return actions
}

/**
 * Endpoint for getting a page of the open/close history
 * https://jlemon.org/garage/history
 */
export async function getHistoryPage(page) {
    const actions = await db.getHistory(page).catch(err => new Error(err))
    if (actions instanceof Error) {
        logger.printf("could not get history: %s", actions.toString())
        throw new Error(actions.toString())
    }

    logger.printf("retrieving page %d of history", page)
    return actions
}

/**
 * Endpoint for manually adding history
 * https://jlemon.org/garage/history/add
 */
export async function addHistory(user, status) {
    if (!utils.canOpen()) {
        logger.printf("request to manually add history failed: a move request was sent within the last %d seconds", constants.OPEN_DELAY)
        throw new Error(constants.ERR_EXCESSIVE_REQUESTS)
    }

    logger.printf("adding history for %s", user.name)

    const result = db.addHistory(user, status)
    if (result instanceof Error) {
        logger.printf("could not add history: %s", result.toString())
        throw new Error(result.toString())
    }
}