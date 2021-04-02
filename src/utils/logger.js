import moment from 'moment-timezone'

export function print (message) {
    const time = moment().tz('America/New_York').format('M/D/YY h:mm:ssa')

    const path = (new Error().stack).split('at ')[2].trim().replace(/\(|\)|file:\/\/\//g, '').split('/')
    const file = path[path.length - 1].split(':')
    const line = `${file[0]}:${file[1]}`

    console.log(`[${time}] [${line}] ${message}`)
}
