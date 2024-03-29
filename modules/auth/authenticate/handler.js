"use strict"

const jwt = require('jsonwebtoken');
const fs = require('fs');

const crypto = require('crypto');
const axios = require('axios');

const pass_secret = fs.readFileSync('/var/openfaas/secrets/password-secret');
const internal_secret = fs.readFileSync('/var/openfaas/secrets/internal-secret');

var url = "http://gateway:8080/function/mongo-service/users/findOne";

module.exports = (event, context) => {

    var data = {'email': event.body.email};

    axios.post(url, data, buildHeader(data)).then(function (response) {
        const hash = crypto.createHmac('sha256', pass_secret)
            .update(event.body.password)
            .digest('hex');

        var user = response.data.result;

        if(user.password != hash){
            throw {'msg': "Invalid Authentication!"};
        }
        
        var privateKey = fs.readFileSync('/var/openfaas/secrets/jwtRS256.key');
        var token = jwt.sign(user, privateKey, { algorithm: 'RS256', expiresIn: 60 * 60});
        const result =  {'token': token};

        context.status(200).succeed(result);
    
      })
    .catch(function (error) {
        context.status(401).succeed(error);
    });
}

function buildHeader(){

    var header = {
        'x-http-internal-secret':  internal_secret,
        'Content-Type': 'application/json'
    };
    return {'headers': header};
}
