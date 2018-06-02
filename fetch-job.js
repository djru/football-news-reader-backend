const twitter = require('twitter')
const _ = require('lodash')
const m_client = require('mongodb').MongoClient;
// load our local .env file for development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}


const twitter_creds = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_TOKEN,
  access_token_secret: process.env.TWITTER_TOKEN_SECRET
}
var t_client = new twitter(twitter_creds);


t_client.get('lists/statuses', {list_id: process.env.TWITTER_LIST_ID, include_entities: true, count: 10}).then((data) => {

  // filter and compress mapped objects from tweet data
  console.log('about to filter and compress')
  let tweets =  _.compact(mapToObjects(data)).sort(date_comp)

  console.log('about to write ' + tweets.length + ' tweets to db ' + process.env.MONGO_COLLECTION)
  if(tweets.length){
    // Use connect method to connect to the server
m_client.connect(process.env.MONGO_URL, (e, c) => {
  console.log("Connected successfully to server");
  const db = c.db(process.env.MONGO_COLLECTION).collection('tweets')
  let bulk = db.initializeUnorderedBulkOp()
  for(let t of tweets){
    bulk.find({_id: t._id}).upsert().updateOne(t)
  }
  bulk.execute().then((res) => {
    console.log('finished bulk insert', res)
    c.close()
  }).catch((e) => {
    console.log('ERROR EXECUTING BULK', e)
    c.close
  })
  
})
  }
}).catch((e) => {console.log('ERROR: ', e)})


let date_comp = (a,b) => {return a.timestamp>b.timestamp ? -1 : a.time<b.time ? 1 : 0}

function mapToObjects(tweets){
  // pull url, timestamp and id if the url exists
  return tweets.map((t) => {return {_id: t.id, timestamp: new Date(t.created_at), user_id: t.user.id, user_name: t.user.name}})
}

