import request from 'request'
import * as constants from './constants.js'
import * as config from './config.js'

/**
 * Send a request to the Pi to open the garage
 */
export function sendMoveRequest() {
    return new Promise((resolve, reject) => {
        request({
            url: `http://${config.get("pi.ip")}:${config.get("pi.port")}/move/${config.get("secret")}`,
            timeout: 2000
        }, (error, response, body) => {
            if (error || response.statusCode != 200)
                reject(error)

            resolve(body)
        })
    })
}

/**
 * Send a request to the Pi to read the magnetic switch to determine the garage position
 */
export function getStatus() {
    return new Promise((resolve, reject) => {
        request({
            url: `http://${config.get("pi.ip")}:${config.get("pi.port")}/status/${config.get("secret")}`,
            timeout: 2000
        }, (error, response, body) => {
            if (error || response.statusCode != 200)
                reject(error)

            resolve(body)
        })
    })
}