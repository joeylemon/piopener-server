import supertest from 'supertest'
import should from 'should' // eslint-disable-line no-unused-vars
import { BASE_URL } from '../../utils/constants.js'
import * as config from '../../utils/config.js'

const api = supertest.agent(BASE_URL)

describe('Admin Endpoints', () => {
    const token = config.get('other_token')

    it('should update user device token', done => {
        api
            .get(`/updatedevicetoken/${token}/test`)
            .expect(200)
            .then(res => {
                res.text.should.eql('200 OK')
                return api.get(`/updatedevicetoken/${token}/null`).expect(200)
            })
            .then(res => {
                res.text.should.eql('200 OK')
                return done() // eslint-disable-line promise/no-callback-in-promise
            })
            .catch(err => done(err)) // eslint-disable-line promise/no-callback-in-promise
    })
})
