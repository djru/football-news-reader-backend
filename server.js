const express = require('express')
const app = express()
const _ = require('lodash')
const cors = require('cors');
const m_client = require('mongodb').MongoClient;
// load our local .env file for development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}

// enable cors because I'm testing locally and on codepen
app.use(cors())

const PORT = process.env.PORT || 5000
// connect to the mongodb instance
m_client.connect(process.env.MONGO_URL, (e, c) => {
    console.log("Connected successfully to mongo server");
    if(e){
      console.log('ERROR CONNECTING TO MONGO SERVER', e)
    }
    const db = c.db(process.env.MONGO_COLLECTION).collection('tweets')

    // this is the main route for the api
    app.get('/tweets', (req, res) => {
        let page = req.query.page ? req.query.page : 1
        let size = req.query.size ? req.query.size : 10
        let limit = size * page
        // fetch tweets and handle pagination
        let tweets = db.find({timestamp: {$gte: (new Date(new Date() - 1000*60*60*24))}}).sort({timestamp: -1}).limit(page * size).skip((page-1)*size).toArray().then((data) => {
            console.log(data)
            res.send(data)
        }) 
    })

    // this is the main route for the api
    app.get('/users', (req, res) => {
      let tweets = db.distinct('user_name').then((data) => {
          res.send(data)
      }) 
  })


    app.get('/', (req, res) => {res.redirect('/ping')})
    app.get('/ping', (req, res) => {res.send('pong')})

    app.listen(PORT, () => console.log('server listening'))


  })



