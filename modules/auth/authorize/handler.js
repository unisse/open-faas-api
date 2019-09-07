"use strict"

var jwt = require('jsonwebtoken');
const fs = require('fs');

var publicKey = fs.readFileSync('/var/openfaas/secrets/jwtRS256.key.pub');

module.exports = (event, context) => {

    const token = event.headers.authorization.replace('Bearer ','');

    jwt.verify(token, publicKey, {algorithm: 'RS256'}, function(err, result){
        
        if(err){
            context.status(403).succeed(err);
            return;
        }
       
        context.status(200).succeed(result);
    });
}