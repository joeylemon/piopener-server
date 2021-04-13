// The URL to the piopener-server
export const BASE_URL = 'https://jlemon.org/garage'

// How often one can send an open request to the server (in seconds)
export const OPEN_DELAY = 30

// How often one can send an automatic open request to the server (in seconds)
export const AUTOMATIC_OPEN_DELAY = 5 * 60 * 1000

// How many entries to load per page of history
export const HISTORY_PAGE_SIZE = 100

// Errors
export const ERR_UNAUTHORIZED = '401 Unauthorized'
export const ERR_EXCESSIVE_REQUESTS = 'Too many requests at one time'
export const ERR_ALREADY_OPEN = 'Door already open'
export const ERR_BAD_SENSOR = 'Cannot read sensor'
export const ERR_INVALID_MODE = 'Invalid move mode given'
export const ERR_MOVE_ERROR = 'Cannot move garage'
export const ERR_RECENT_EXIT = 'Left the apartment too recently'
