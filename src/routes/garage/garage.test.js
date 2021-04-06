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
})
