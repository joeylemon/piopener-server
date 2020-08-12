import * as constants from './constants.js' 

let lastOpen = 0

/**
 * Only allow one request to the garage over a specified time
 */
export function canOpen() {
    return Date.now() - lastOpen >= constants.OPEN_DELAY * 1000
}

/**
 * Reset the timer when a user opens the garage
 */
export function resetOpenTimer() {
    lastOpen = Date.now()
}