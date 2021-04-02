import * as db from '../../utils/db.js'
import * as utils from '../../utils/utils.js'
import * as logger from '../../utils/logger.js'
import * as constants from '../../utils/constants.js'

/**
 * Endpoint for getting all of the open/close history
 * https://jlemon.org/garage/history/all
 */
export async function allHistory () {
    const actions = await db.getAllHistory().catch(err => new Error(err))
    if (actions instanceof Error) {
        logger.print(`could not get history: ${actions.toString()}`)
        throw actions
    }

    return actions
}

/**
 * Endpoint for getting a page of the open/close history
 * https://jlemon.org/garage/history
 */
export async function getHistoryPage (page) {
    const actions = await db.getHistory(page).catch(err => new Error(err))
    if (actions instanceof Error) {
        logger.print(`could not get history: ${actions.toString()}`)
        throw actions
    }

    return actions
}

/**
 * Endpoint for manually adding history
 * https://jlemon.org/garage/history/add
 */
export async function addHistory (user, status) {
    if (!utils.canOpen()) {
        logger.print(`request to manually add history failed: a move request was sent within the last ${constants.OPEN_DELAY} seconds`)
        throw new Error(constants.ERR_EXCESSIVE_REQUESTS)
    }

    const result = db.addHistory(user, status)
    if (result instanceof Error) {
        logger.print(`could not add history: ${result.toString()}`)
        throw result
    }
}
