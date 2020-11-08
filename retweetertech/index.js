const Twit = require("twit");
const config = require("./config");
const _ = require("lodash");

const T = new Twit(config);

let tweetArr = [];

const USA = ["-171.79", "18.92", "-66.96", "71.36"];
const UK = ["-7.57", "49.96", "1.68", "58.64"];
const africa = ["-47.18", "-22.13", "16.33", "38.29"];
const jamaica = ["16.59", "18.73", "-78.58", "-75.75"];
const USAGeo = "39.7837304, -100.4458825, 4500km";
const UKGeo = "54.7023545, -3.2765753, 1000km";
const africaGeo = "11.5024338, 17.7578122, 8000km";
const jamaicaGeo = "18.1152958, -77.1598455, 250km";
const countries = [USA, UK, africa, jamaica];
const countriesGeo = [USAGeo, UKGeo, africaGeo, jamaicaGeo];
const hashtags = [
  "#blacktechtwitter",
  "#codingtips",
  "#codenewbie",
  "#codenewbies",
  "#100daysofcode",
  "#blacktech",
];
let retweetParams = {
  q: _.sample(hashtags),
  // geocode: _.sample(countriesGeo),
  lang: "en",
  count: 100,
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

async function engageTweet(tweet) {
  if (tweet && !tweet.retweeted && !tweet.is_quote_status) {
    let [retweeted, favorited] = [true, true];
    T.post("favorites/create", { id: tweet.id_str }, (err) => {
      if (err) {
        console.log("Error occurred when favoriting", err);
        favorited = false;
        return;
      }
      console.log("==========favorited!!==========");
    });

    await sleep(_.random(3000, 5000));

    T.post("statuses/retweet/:id", { id: tweet.id_str }, (err) => {
      if (err) {
        console.log("Error occurred when retweeting", err);
        retweeted = false;
        return;
      }

      console.log("==========retweeted!!==========");
    });

    await sleep(_.random(3000, 5000));
    if (
      !tweet.user.following &&
      !tweet.user.follow_request_sent &&
      (favorited || retweeted)
    ) {
      T.post("friendships/create", { id: tweet.user.id_str }, (err) => {
        if (err) {
          console.log("Error occurred when following", err);
          return;
        }
        console.log("==========followed!!==========");
      });

      await sleep(_.random(3000, 5000));
    }
  } else {
    console.log("=========already engaged with this tweet==========");
    return;
  }
}

async function processTweets(tweets) {
  if (tweets) {
    for (const tweet of tweets) {
      console.log("==========here is the tweet text==========", tweet.text);
      await engageTweet(tweet);
      await sleep(_.random(60000, 150000));
    }
  } else {
    console.log(
      "==========no tweets provided to processTweets function=========="
    );
    return;
  }
}
async function likeRetweetFollow(params) {
  if (params) {
    T.get("search/tweets", params, async function (err, data, response) {
      if (err) {
        console.log("An error occurred: ", err);
        return;
      }

      let tweets = _.uniqBy(data.statuses, "user.id");
      tweets = _.uniqBy(tweets, "text");
      tweets.filter((tweet) => tweet.retweeted === false);

      if (tweets.length > 20) {
        // delete everything after the 20th item
        tweets.length = 20;
      }

      console.log(
        "===========twets==========",
        tweets.map((tweet) => tweet.id)
      );
      console.log("==========tweetsNewLength==========", tweets.length);
      if (tweets && Array.isArray(tweets)) {
        console.log("==========tweet is an array and populated!!!==========");
        await processTweets(tweets);
      }
      retweetParams = {
        q: _.sample(hashtags),
        // geocode: _.sample(countriesGeo),
        lang: "en",
        count: 20,
      };
    });
  } else {
    console.log(
      "==========no params supplied to likeRetweetFollow function=========="
    );
    return;
  }
}

likeRetweetFollow(retweetParams);

console.log("LIKED RETWEETED AND FOLLOWED COMPLETE!");

// setTimeout(
//   () => likeRetweetFollow(retweetParams),
//   _.random(1000 * 60 * 55, 1000 * 60 * 65)
// );









async function pruneFollowers() {
  T.get("followers/ids", function (err, data, response) {
    if (err) {
      console.log("An error occured: ", err);
    } else {
      const followers = data.ids;

      T.get("friends/ids", function (err, data, response) {
        if (err) {
          console.log("An error occurred: ", err);
        } else {
          const friends = data.ids;
          let pruned = false;

          while (!pruned) {
            const target = _.sample(friends);

            if (!~followers.indexOf(target)) {
              console.log("==========target==========", target);
              pruned = true;
              T.post("friendships/destroy", { user_id: target });
            }
          }
        }
      });
    }
  });
}

// pruneFollowers();
// setTimeout(
//   () => pruneFollowers(),
//   _.random(1000 * 60 * 55 * 24 * 7, 1000 * 60 * 65 * 24 * 7)
// );
