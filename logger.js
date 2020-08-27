import moment from 'moment-timezone'
import util from 'util'

export function print(message) {
    const time = moment().tz("America/New_York").format("lll")

    const path = (new Error().stack).split("at ")[3].trim().replace(/\(|\)|file:\/\/\//g, "").split("/")
    const file = path[path.length - 1].split(":")
    const line = `${file[0]}:${file[1]}`

    console.log(`[${time}] [${line}] ${message}`)
}

export function printf(format, ...args) {
    print(util.format(format, ...args))
}