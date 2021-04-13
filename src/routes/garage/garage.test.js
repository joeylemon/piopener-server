import supertest from 'supertest'
import should from 'should' // eslint-disable-line no-unused-vars
import { BASE_URL } from '../../utils/constants.js'
import * as config from '../../utils/config.js'

const api = supertest.agent(BASE_URL)
const token = process.env.OTHER_TOKEN ? process.env.OTHER_TOKEN : config.get('other_token')

describe('Garage Endpoints', () => {
    it('should return the status of the garage', done => {
        api
            .get(`/status/${token}`)
            .expect(200)
            .then(res => {
                res.text.should.equalOneOf('open', 'closed', 'between')
                return done() // eslint-disable-line promise/no-callback-in-promise
            })
            .catch(err => done(err)) // eslint-disable-line promise/no-callback-in-promise
    })

    it('should update the region exit time of the user', done => {
        let previousExitTime
        api
            .get(`/getregionexittime/${token}`)
            .expect(200)
            .then(async res => {
                previousExitTime = parseInt(res.text)
                if (isNaN(previousExitTime)) {
                    return done(new Error(`could not parse int: ${res.text}`)) // eslint-disable-line promise/no-callback-in-promise
                }

                await api.get(`/updateregionexittime/${token}`).expect(200)
                return api.get(`/getregionexittime/${token}`).expect(200)
            })
            .then(res => {
                const newExitTime = parseInt(res.text)
                if (isNaN(newExitTime)) {
                    return done(new Error(`could not parse int: ${res.text}`)) // eslint-disable-line promise/no-callback-in-promise
                }

                previousExitTime.should.not.eql(newExitTime)
                return done() // eslint-disable-line promise/no-callback-in-promise
            })
            .catch(err => done(err)) // eslint-disable-line promise/no-callback-in-promise
    })
})
