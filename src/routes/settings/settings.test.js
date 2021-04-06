import supertest from 'supertest'
import should from 'should' // eslint-disable-line no-unused-vars
import { ALL } from './settings.service.js'
import { BASE_URL } from '../../utils/constants.js'
import * as config from '../../utils/config.js'

const api = supertest.agent(BASE_URL)

describe('Settings Endpoints', () => {
    const token = config.get('other_token')
    const newValue = Math.random() < 0.5 ? 'true' : 'false'

    it('should update notify_on_long_open to a random value', done => {
        api
            .get(`/settings/set/${token}/notify_on_long_open/${newValue}`)
            .expect(200)
            .then(res => {
                res.text.should.eql('200 OK')
                return api.get(`/settings/get/${token}/notify_on_long_open`)
                    .expect(200)
            })
            .then(res => {
                res.text.should.eql(newValue)
                return done() // eslint-disable-line promise/no-callback-in-promise
            })
            .catch(err => done(err)) // eslint-disable-line promise/no-callback-in-promise
    })

    it('should return a properly-sized settings object', done => {
        api
            .get(`/settings/get/${token}`)
            .expect(200)
            .then(res => {
                res.body.length.should.eql(ALL.length)
                for (let i = 0; i < ALL.length; i++) {
                    res.body[i].Name.should.eql(ALL[i].Name)
                    res.body[i].Entries.length.should.eql(ALL[i].Entries.length)
                }
                return done() // eslint-disable-line promise/no-callback-in-promise
            })
            .catch(err => done(err)) // eslint-disable-line promise/no-callback-in-promise
    })
})
