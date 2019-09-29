"use strict"

const fs = require('fs');
const axios = require('axios');
const Joi = require('@hapi/joi');

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
                    "$maxDistance": data.distancia <= 10000 ? data.distancia : 10000
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

const schema = Joi.object({
  longitude: Joi.number().required(),
  latitude: Joi.number().required(),
  distancia: Joi.number().integer().required()
});

module.exports = (event, context) => {

  var data = event.body;

  const { error, value }  = schema.validate(data);

  if(error){
    context.status(422).succeed({"error": error.message});
  }

  axios.post(url, buildQuery(value), buildHeader()).then(function (response) {
    context.status(200).succeed( {"unidades": response.data.result } );
  }).catch(function (error) {
    console.log(error)
    context.fail();
  });

}
