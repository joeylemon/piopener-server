import mysql from 'mysql'
import moment from 'moment-timezone'
import * as config from './config.js'
import * as constants from './constants.js'
import * as settings from './settings.js'
import * as notify from './notifications.js'

const pool = mysql.createPool({
    host: config.get("mysql.host"),
    user: config.get("mysql.user"),
    password: config.get("mysql.pass"),
    database: config.get("mysql.db")
})

/**
 * Perform a query on the database
 * @param {string} query The SQL query to perform
 * @param {array} params The list of parameters to inject in the query
 * @param {function} mapFunction The mapping function to perform on the result set
 */
function query(query, params, mapFunction) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, con) => {
            if (err) reject(err)

            con.query(query, params, (err, results) => {
                con.release()
                if (err) return reject(err)

                if (mapFunction)
                    resolve(results.map(mapFunction))
                else
                    resolve(results)
            })
        })
    })
}

/**
 * Search the database for the given user
 * @param {String} token The user's access token
 */
export function findUser(token) {
    return new Promise((resolve, reject) => {
        query("SELECT * FROM users where token = ?", [token])
            .then(rows => {
                if (rows.length > 0)
                    resolve(rows[0])
                else
                    reject("Couldn't find user")
            })
            .catch(err => reject(err))
    })
}

/**
 * Get the user's settings
 * @param {String} token The user's access token
 */
export function getAllSettings(token) {
    return new Promise((resolve, reject) => {
        query("SELECT " + settings.ALL.map(s => s.Entries).flat().map(e => e.SettingKey).join(",") + " FROM users WHERE token = ?", [token])
            .then(rows => {
                const results = rows[0]

                // Set each setting for the user in the respective sections
                for (const settingName of Object.keys(results)) {
                    const sectionIdx = settings.ALL.findIndex(s => s.Entries.find(e => e.SettingKey === settingName))
                    if (sectionIdx === -1) continue;

                    const entryIdx = settings.ALL[sectionIdx].Entries.findIndex(e => e.SettingKey === settingName)
                    if (entryIdx === -1) continue;

                    settings.ALL[sectionIdx].Entries[entryIdx]["Enabled"] = results[settingName] === 1
                }

                resolve(settings.ALL)
            })
            .catch(err => reject(err))
    })
}

/**
 * Get the user's specific setting
 * @param {String} token The user's access token
 */
export function getSetting(token, setting) {
    return new Promise((resolve, reject) => {
        query("SELECT notify_on_long_open, open_upon_arrival FROM users WHERE token = ?", [token])
            .then(rows => {
                const settings = rows[0]
                if (settings[setting] === undefined)
                    reject("Setting does not exist")

                resolve(settings[setting])
            })
            .catch(err => reject(err))
    })
}

/**
 * Get the user's settings
 * @param {String} token The user's access token
 * @param {String} setting The setting name to update
 * @param {String} value The new value for the setting
 */
export function updateSettings(token, setting, value) {
    return query(`UPDATE users SET ${setting} = ${value} WHERE token = ?`, [token])
}

/**
 * Add an action to the list of history
 * @param {Object} user The user object from the database (and findUser() function)
 * @param {String} status The status of the garage door ("open", "closed", or "between")
 */
export function addHistory(user, status) {
    if (status === "closed")
        notify.sendOpenNotification(user)

    return query("INSERT INTO history (user_id,date,closed_status) VALUES (?, UNIX_TIMESTAMP(), ?)", [user.id, status === "closed" ? 1 : 0])
}

/**
 * Get the list of actions from the history for the given page
 * @param {number} page The page of history to retrieve
 */
export function getHistory(page) {
    return new Promise((resolve, reject) => {
        query(`
        SELECT u.name as name,
        u.red as red,u.green as green,u.blue as blue,
        h.date as date, 
        IF(h.closed_status=1, "Opened", "Closed") as action 
        FROM history h 
        LEFT JOIN users u ON u.id=h.user_id 
        ORDER BY h.date desc LIMIT ?, ?`, [(page - 1) * constants.HISTORY_PAGE_SIZE, constants.HISTORY_PAGE_SIZE])
            .then(rows => {
                // Create dict of weeks to their list of entries
                let sections = new Array()
                for (const row of rows) {
                    const time = moment(row.date * 1000).tz("America/New_York")
                    //const title = time.format("MMMM Do YYYY")
                    const title = time.calendar(null, {
                        sameDay: '[Today]',
                        lastDay: '[Yesterday]',
                        lastWeek: 'dddd',
                        sameElse: 'MMMM Do YYYY'
                    })

                    if (!sections[title])
                        sections[title] = new Array()

                    sections[title].push({
                        PersonName: row.name,
                        PersonColor: [row.red, row.green, row.blue],
                        Action: row.action,
                        Date: time.format('YYYY-MM-DD HH:mm:ss')
                    })
                }

                // Organize dict into single array
                resolve(Object.keys(sections).map(t => {
                    return {
                        Title: t,
                        Entries: sections[t]
                    }
                }))
            })
            .catch(err => reject(err))
    })
}

/**
 * Get the entire list of history
 */
export function getAllHistory() {
    return query(`
    SELECT u.name as name,
    u.red as red,u.green as green,u.blue as blue,
    h.date as date, 
    IF(h.closed_status=1, "Opened", "Closed") as action 
    FROM history h 
    LEFT JOIN users u ON u.id=h.user_id 
    ORDER BY h.date desc`, [], row => {
        const time = moment(row.date * 1000).tz("America/New_York")
        return {
            name: row.name,
            color: [row.red, row.green, row.blue],
            date: time.format(),
            action: row.action
        }
    })
}

/**
 * Get an array of iOS device tokens used to send remote notifications
 */
export function getNotificationTokens(filterFunc) {
    return new Promise((resolve, reject) => {
        query("SELECT * FROM users u WHERE u.device_token IS NOT NULL", [])
            .then(rows => {
                if (filterFunc)
                    return resolve(rows.filter(filterFunc).map(r => r.device_token))

                resolve(rows.map(r => r.device_token))
            })
            .catch(err => reject(err))
    })
}