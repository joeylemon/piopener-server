import * as db from '../db.js'
import * as utils from '../utils.js'
import * as logger from '../logger.js'
import * as constants from '../constants.js'

/**
 * Endpoint for getting all of the open/close history
 * https://jlemon.org/garage/history/all
 */
export async function allHistory(req, res) {
    const actions = await db.getAllHistory().catch(err => new Error(err))
    if (actions instanceof Error) {
        logger.printf("could not get history: %s", actions.toString())
        return res.status(500).send(actions.toString())
    }

    res.status(200).send(actions)
}

/**
 * Endpoint for getting a page of the open/close history
 * https://jlemon.org/garage/history
 */
export async function getHistoryPage(req, res) {
    const actions = await db.getHistory(req.params.page).catch(err => new Error(err))
    if (actions instanceof Error) {
        logger.printf("could not get history: %s", actions.toString())
        return res.status(500).send(actions.toString())
    }

    logger.printf("retrieving page %d of history for %s", req.params.page, res.locals.user.name)
    res.status(200).send(actions)
}

/**
 * Endpoint for manually adding history
 * https://jlemon.org/garage/history/add
 */
export async function addHistory(req, res) {
    if (!utils.canOpen()) {
        logger.printf("request to manually add history failed: a move request was sent within the last %d seconds", constants.OPEN_DELAY)
        return res.status(500).send(constants.ERR_EXCESSIVE_REQUESTS)
    }

    logger.printf("adding history for %s", res.locals.user.name)
    db.addHistory(res.locals.user, req.params.status)
        .then(res.status(200).send("200 OK"))
        .catch(err => res.status(500).send(err.toString()))
}