import mysql from 'mysql'
import moment from 'moment-timezone'
import * as config from './config.js'
import * as constants from './constants.js'

const pool = mysql.createPool({
    host: config.get("mysql.host"),
    user: config.get("mysql.user"),
    password: config.get("mysql.pass"),
    database: config.get("mysql.db")
})

/**
 * Search the database for the given user
 * @param {String} token The user's access token
 */
export function findUser(token) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, con) => {
            if (err) reject(err)

            con.query("SELECT * FROM users where token = ?", [token], (err, results) => {
                con.release()
                if (err) reject(err)

                if (results.length > 0)
                    resolve(results[0])
                else
                    reject("Couldn't find user")
            })
        })
    })
}

/**
 * Add an action to the list of history
 * @param {Object} user The user object from the database (and findUser() function)
 * @param {String} status The status of the garage door ("open", "closed", or "between")
 */
export function addHistory(user, status) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, con) => {
            if (err) reject(err)

            con.query("INSERT INTO history (user_id,date,closed_status) VALUES (?, UNIX_TIMESTAMP(), ?)", [user.id, status === "closed" ? 1 : 0], (err, results) => {
                con.release()
                if (err) reject(err)

                resolve()
            })
        })
    })
}

/**
 * Get the list of actions from the history for the given page
 * @param {number} page The page of history to retrieve
 */
export function getHistory(page) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, con) => {
            if (err) reject(err)

            con.query(`
            SELECT u.name as name,
            u.red as red,u.green as green,u.blue as blue,
            h.date as date, 
            IF(h.closed_status=1, "Opened", "Closed") as action 
            FROM history h 
            LEFT JOIN users u ON u.id=h.user_id 
            ORDER BY h.date desc LIMIT ?, ?`, [(page - 1) * constants.HISTORY_PAGE_SIZE, constants.HISTORY_PAGE_SIZE], (err, results) => {
                con.release()
                if (err) reject(err)

                // Create dict of weeks to their list of entries
                let sections = new Array()
                for (const row of results) {
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
        })
    })
}

/**
 * Get the entire list of history
 */
export function getAllHistory() {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, con) => {
            if (err) reject(err)

            con.query(`
            SELECT u.name as name,
            u.red as red,u.green as green,u.blue as blue,
            h.date as date, 
            IF(h.closed_status=1, "Opened", "Closed") as action 
            FROM history h 
            LEFT JOIN users u ON u.id=h.user_id 
            ORDER BY h.date desc`, [], (err, results) => {
                con.release()
                if (err) reject(err)

                resolve(results.map(row => {
                    const time = moment(row.date * 1000).tz("America/New_York")
                    return {
                        name: row.name,
                        color: [row.red, row.green, row.blue],
                        date: time.format(),
                        action: row.action
                    }
                }))
            })
        })
    })
}