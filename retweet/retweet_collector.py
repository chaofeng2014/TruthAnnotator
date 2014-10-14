import tweepy
import json

consumer_key = "Aey8cEiIJcp02HjbUl74M2JrV"
consumer_secret = "bHDf717W4IQgOx42g4g5uCT8ffZwqrtaNJBDOiSl4qrqgFXquq"
access_token = "2600799996-TUJf2enCDoUSVCwAl9ahBFs1Cuit01XgACn9e70"
access_token_secret = "MJWzdkgYkPBvrhIVNrf0zTSqSefh1gqa9XmY9dqTcEWSd"
auth = tweepy.OAuthHandler(consumer_key, consumer_secret)

auth.set_access_token(access_token, access_token_secret)

api = tweepy.API(auth)

public_tweets = api.home_timeline()
tweetId = "521660698162905088"
recentRetweets = api.retweets(tweetId,20)

for tweet in recentRetweets:
  print "retweeter id: ", tweet.author._json[u'id']
  print "retweeter username: ", tweet.author._json[u'name']
  print
