"use strict"

const fs = require('fs');
const axios = require('axios');

const internal_secret = fs.readFileSync('/var/openfaas/secrets/internal-secret', 'utf-8').replace(/(\r\n|\n|\r)/gm,"");

const url = "http://gateway:8080/function/mongo-service/unidades/find";

const buildQuery = (data) => {

  var query = { "local":
                { "$near":
                  { "$geometry":
                    { 
                      "type": "Point" ,
                      "coordinates": [ data.longitude, data.latitude] 
                    },
                    "$maxDistance": data.distancia || data.distancia <= 1000 ? data.distancia : 10000
                  } 
                }
              };

  return query;

}

const buildHeader = () => {
  var header = {
      'x-http-internal-secret':  internal_secret,
      'Content-Type': 'application/json'
  };
  return {'headers': header};
}

module.exports = (event, context) => {
    axios.post(url, buildQuery(event.body), buildHeader()).then(function (response) {
        context.status(200).succeed(response.data.result);
    }).catch(function (error) {
      console.log(error);
      context.status(500).succeed(error);
    });
}
