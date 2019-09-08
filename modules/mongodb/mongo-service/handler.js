"use strict"

const MongoClient = require('mongodb').MongoClient;
const crypto = require('crypto');
const fs = require('fs');

const hmac = fs.readFileSync('/var/openfaas/secrets/hmac-secret');

var clientsDB;

module.exports = async (config) => {
    const routing = new Routing(config.app);
    routing.configure();
    routing.bind(routing);
}

class Routing {
    constructor(app) {
        this.app = app; 
    }

    configure() {
        const bodyParser = require('body-parser')
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.raw());
        this.app.use(bodyParser.text({ type : "text/*" }));
        this.app.disable('x-powered-by');        
    }

    bind(route) {        
        this.app.all('/*', route.verifyHmac);
        this.app.put('/:collection/save', route.save);
        this.app.post('/:collection/findOne', route.findOne);
        this.app.post('/:collection/find', route.find);
        this.app.delete('/:collection/delete/:id', route.delete);
        this.app.post('/:collection/update', route.update);
    }

    verifyHmac(req, res, next){
        console.log('Intercepting requests ...');

        var compute_hmac= crypto.createHmac('sha384', hmac).update(JSON.stringify(req.body)).digest('hex');
       
        if(compute_hmac != req.get("Http_Hmac")){
            res.status(401).end({erro: true, msg: "Endpoint Not Authorized!"});
        }
        
        next();  // call next() here to move on to next middleware/router
    }

    save(req, res){
        res.send("save!"); 
    }

    findOne(req, res){
        var params = req.params;
        var body = req.body;

        prepareDB().then((db) => {

            console.log("Pesquisa na coleção -> " + params.collection);
            console.log("Filtro realizado -> " + JSON.stringify(body));

            db.collection(params.collection).findOne(body).then(function (item) {
                res.send({erro: false, result: item});
            }).catch(function(err){
                res.send({erro: true, msg: err});
            });

         })
        .catch(err => {
            res.send({erro: true, msg: err});
        });
        
    }

    find(req, res){
        res.send('find!'); 
    }

    update(req, res){
        res.send('update!'); 
    }

    delete(req, res){
        res.send('delete!'); 
    }

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
