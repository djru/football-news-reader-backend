const express = require('express')
const PORT = process.env.PORT || 5000
const app = express()

app.get('/tweets', (req, res) => {
    let page = req.query.page ? req.query.page : 1
    let limit = 10 * page
    let tweets = []
    res.send(tweets.reverse().slice((page-1)*10, limit))
})

app.get('/ping', (req, res) => {
    res.send('pong')
})

app.listen(PORT, () => console.log('Example app listening on port 3000!'))

