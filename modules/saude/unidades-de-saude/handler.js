"use strict"

const fs = require('fs');
const axios = require('axios');
const internal_secret = fs.readFileSync('/var/openfaas/secrets/internal-secret');

const url = "http://gateway:8080/function/mongo-service/unidades-de-saude/find";

module.exports = (event, context) => {
    
    axios.post(url, buildQuery(event.body), buildHeader(data)).then(function (response) {
        context.status(200).succeed(response.data.result);
      })
    .catch(function (error) {
        context.fail(error);
    });

}

function buildQuery(data){

    var query = { location:
                  { $near:
                    { $geometry:
                      { 
                        type: "Point" ,
                        coordinates: [ data.longitude, data.latituda] 
                      },
                      $maxDistance: data.distance >= 10000 ? 10000 : data.distance
                } } };

     return query;

}

function buildHeader(){

    var header = {
        'x-http-internal-secret':  internal_secret,
        'Content-Type': 'application/json'
    };
    return {'headers': header};
}
