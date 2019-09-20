"use strict"

const nodemailer = require('nodemailer');
const fs = require('fs');

const crypto = require('crypto');
const axios = require('axios');

const hmac = fs.readFileSync('/var/openfaas/secrets/hmac-secret');
const email_config = fs.readFileSync('/var/openfaas/secrets/email-config', 'utf8');

const url = "http://gateway:8080/function/mongo-service/users/findOne";

module.exports = (event, context) => {

  let config = buildConfig();

  let transport = nodemailer.createTransport(config);

  const message = {
      from: 'teste@teste.com', // Sender address
      to: 'ricardo.dantas31@gmail.com',         // List of recipients
      subject: 'Design Your Model S | Tesla', // Subject line
      text: 'Have the most fun you can in a car. Get your Tesla today!' // Plain text body
  };

  transport.sendMail(message, function(err, info) {
      if (err) {
        console.log(err)
      } else {
        console.log(info);
      }
  })

  context
      .status(200)
      .succeed(result);
}

function buildConfig(){

  let emailConfig = email_config.replace(/(\r\n|\n|\r)/gm," ");

  let configs = emailConfig.split(" ");

  let configMap = new Map();

  for(var i = 0; i < configs.length; i++) {
    if(i % 2 == 0){
      configMap.set(configs[i], configs[i+1]);
    }
  }

  let config = {
    host: configMap.get('host:'),
    port: configMap.get('port:'),
    auth: {
      user: configMap.get('user:'),
      pass: configMap.get('pass:')
    }
  };

  return config;

}