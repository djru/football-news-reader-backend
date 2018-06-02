'use strict';

let twitter = require('twitter')
let axios = require('axios')
let _ = require('lodash')
const AWS = require('aws-sdk');

AWS.config.update({region: 'us-east-1'});

let ddb = new AWS.DynamoDB.DocumentClient();
const LIST_ID = '1001854078492774402'
const twitter_creds = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_TOKEN,
  access_token_secret: process.env.TWITTER_TOKEN_SECRET
}

var client = new twitter(twitter_creds);


exports.handler = async function(event, context, callback){
  console.log('beginning fetch')
  console.log('using twitter tokens: ', twitter_creds)
  await client.get('lists/statuses', {list_id: LIST_ID, include_entities: true, count: 10}).then((data) => {
    console.log('about to filter and compress')
    let tweets =  _.compact(mapToObjects(data)).sort(date_comp)
    console.log('about to write ' + tweets.length + ' tweets to db ' + process.env.TABLE_NAME)
    if(tweets.length){
      for (let t of tweets){
        var params = {
          'Item' : t,
          'TableName' : process.env.TABLE_NAME
        }
        ddb.put(params, function(e, data) {
            if(e){
              console.log('ERROR: ', e)
            }
            console.log("data written to dynamodb: " + data);
          })
      }
    }
  }).then(callback).catch((e) => {console.log('ERROR: ', e)})
}

let date_comp = (a,b) => {return a.time>b.time ? -1 : a.time<b.time ? 1 : 0}

function mapToObjects(tweets){
  // pull url, timestamp and id if the url exists
  return tweets.map((t) => {return {'Type': 'Tweet', 'Id': Number(t.id), 'Time': Number(new Date(t.created_at)), 'UserId': Number(t.user.id), 'UserName': t.user.name}})
}

