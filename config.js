import fs from 'fs'

let cachedConfig;
let lastCache = 0;

/**
 * Get the most recently cached config
 */
export function getConfig() {
    if (Date.now() - lastCache > 10000) {
        cachedConfig = JSON.parse(fs.readFileSync("config.json"))
        lastCache = Date.now()
    }

    return cachedConfig
}

/**
 * Set the config contents
 */
export function setConfig(config) {
    fs.writeFileSync("config.json", JSON.stringify(config, null, 4))
}

/**
 * Get a value from the config
 * @param {string} path The path to the json field
 */
export function get(path) {
    return path.split(".").reduce((o, n) => o[n], getConfig())
}