import supertest from 'supertest'
import should from 'should' // eslint-disable-line no-unused-vars
import { config, BASE_URL } from '../../utils/constants.js'

const api = supertest.agent(BASE_URL)
const token = config.other_token

describe('Admin Endpoints', () => {
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
