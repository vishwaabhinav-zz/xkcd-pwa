const mp = require('mongodb-promise');

const dbstr = 'mongodb://heroku_97mjvv9b:l7qh0eg92ln8echsl6no1e6en0@ds145997.mlab.com:45997/her' +
    'oku_97mjvv9b';

module.exports = {
    init: function init() {
        return mp.MongoClient
            .connect(dbstr);
    },
    getAllPosts: function getAllPosts(db) {
        return db.collection('records')
            .then(col => {
                return col.find()
                    .sort({
                        "num": -1
                    })
                    .toArray();
            });
    },
    getNextSetOfPosts: function getNextSetOfPosts(db, current) {
        return db.collection('records')
            .then(col => {
                let promise;
                let limit = 20;
                if (!current || current === -1) {
                    promise = col.find();
                    limit = 10;
                } else {
                    promise = col.find({
                        "num": {
                            "$lt": current
                        }
                    });
                }

                return promise
                    .sort({
                        "num": -1
                    })
                    .limit(limit)
                    .toArray();
            });
    },
    getAllAuthTokens: function _getAllTokens(db) {
        return db
            .collection('token')
            .then(collection => collection.find().toArray());
    },
    registerAuthToken: function(db, token) {
        return db.collection('token')
            .then(collection => collection.update({
                'token': token
            }, {
                'token': token
            }, {
                upsert: true
            }));
    }
};
