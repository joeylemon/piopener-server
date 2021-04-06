import supertest from 'supertest'
import should from 'should' // eslint-disable-line no-unused-vars
import { BASE_URL, HISTORY_PAGE_SIZE } from '../../utils/constants.js'
import * as config from '../../utils/config.js'

const api = supertest.agent(BASE_URL)
const token = process.env.OTHER_TOKEN ? process.env.OTHER_TOKEN : config.get('other_token')

describe('History Endpoints', () => {
    it('should return different pages of history', done => {
        let firstPage
        api
            .get(`/history/1/${token}`)
            .expect(200)
            .then(res => {
                res.body[0].should.have.property('Title')
                res.body[0].should.have.property('Entries')
                res.body[0].Title.should.be.String()
                res.body[0].Entries.should.be.Array()
                res.body.map(e => e.Entries.length).reduce((a, b) => a + b, 0).should.eql(HISTORY_PAGE_SIZE)
                firstPage = res.body
                return api.get(`/history/2/${token}`).expect(200)
            })
            .then(res => {
                res.body[0].should.have.property('Title')
                res.body[0].should.have.property('Entries')
                res.body[0].Title.should.be.String()
                res.body[0].Entries.should.be.Array()
                res.body.map(e => e.Entries.length).reduce((a, b) => a + b, 0).should.eql(HISTORY_PAGE_SIZE)
                firstPage.should.not.eql(res.body)
                return done() // eslint-disable-line promise/no-callback-in-promise
            })
            .catch(err => done(err)) // eslint-disable-line promise/no-callback-in-promise
    })
})
