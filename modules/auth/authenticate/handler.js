"use strict"

var jwt = require('jsonwebtoken');
const fs = require('fs');

const MongoClient = require('mongodb').MongoClient;
const crypto = require('crypto');

const secret = 'abcdefg';

var clientsDB;  // Cached connection-pool for further requests.

module.exports = (event, context) => {
    prepareDB()
    .then((users) => {
        users.collection("users").findOne({'email': event.body.email}).then(function (item) {
            
            console.log("Começou essa porra!!")

            const hash = crypto.createHmac('sha256', secret)
                   .update(event.body.password)
                   .digest('hex');

            if(item.password != hash){
                throw "erro";
            }
            
            var privateKey = fs.readFileSync('/var/openfaas/secrets/jwtRS256.key');

            var token = jwt.sign(item, privateKey, { algorithm: 'RS256', expiresIn: 60 * 60});

            const result =  {
                token: token
            };
    
            context.status(200).succeed(result);

        }).catch(function(err){
            context.status(401).succeed("Erro!");
        });
    })
    .catch(err => {
        context.fail(err.toString());
    });
}

const prepareDB = () => {

    const url = "mongodb://mongo:27017/comunas"

    return new Promise((resolve, reject) => {
        if(clientsDB) {
            console.error("DB already connected.");
            return resolve(clientsDB);
        }

        console.error("DB connecting");

        MongoClient.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
          }, (err, database) => {
            if(err) {
                return reject(err)
            }
    
            clientsDB = database.db("comunas");
            return resolve(clientsDB)
        });
    });
}
