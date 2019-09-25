"use strict"

const MongoClient = require('mongodb').MongoClient;

var ObjectId = require('mongodb').ObjectId; 

const fs = require('fs');

const internalSecret = fs.readFileSync('/var/openfaas/secrets/internal-secret', 'utf-8');
const mongoInfo = fs.readFileSync('/var/openfaas/secrets/mongo-secret', 'utf-8');

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
        this.app.all('/*', route.verifySecret);
        this.app.put('/:collection/save', route.save);
        this.app.post('/:collection/findOne', route.findOne);
        this.app.get('/:collection/findById/:id', route.findById);
        this.app.post('/:collection/find', route.find);
        this.app.delete('/:collection/remove/:id', route.remove);
    }

    verifySecret(req, res, next){
        console.log('Intercepting requests ...');

        if(internalSecret != req.get("x-http-internal-secret")){
            console.log("Secret not provided or wrong!")
            res.sendStatus(401);
        } else {
            next(); 
        }
        
    }

    save(req, res){

        var params = req.params;
        var body = req.body;

        prepareDB().then((db) => {

            console.log("Inserindo na coleção -> " + params.collection);
            console.log("Objeto Inserido -> " + JSON.stringify(body));

            if(body._id){
                body._id = ObjectId(body._id);
            }

            db.collection(params.collection).save(body);

            res.send({erro: false, result: "Sucesso!"});

         })
        .catch(err => {
            res.send({erro: true, msg: err});
        });
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

    findById(req, res){

        var params = req.params;

        prepareDB().then((db) => {

            console.log("Pesquisa na coleção -> " + params.collection);
            console.log("Filtro realizado -> " + params.id);

            db.collection(params.collection).findOne({"_id": ObjectId(params.id)}).then(function (item) {
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

        var params = req.params;
        var body = req.body;

        prepareDB().then((db) => {

            console.log("Pesquisa na coleção -> " + params.collection);
            console.log("Filtro realizado -> " + JSON.stringify(body));

            db.collection(params.collection).find(body).toArray(function(err, result) {
                if (err) throw err;
                res.send({erro: false, result: result});
              });;

            

         })
        .catch(err => {
            res.send({erro: true, msg: err});
        }); 
    }

    remove(req, res){

        var params = req.params;

        prepareDB().then((db) => {

            console.log("Deleção na coleção -> " + params.collection);
            console.log("Filtro realizado -> " + params.id);

            db.collection(params.collection).remove({"_id": ObjectId(params.id)}, {justOne: true});

            res.send({erro: false, result: "Sucesso!"});

         })
        .catch(err => {
            res.send({erro: true, msg: err});
        });

    }

}

const prepareDB = () => {

    const mongo = JSON.parse(mongoInfo);

    return new Promise((resolve, reject) => {
        if(clientsDB) {
            console.error("DB already connected.");
            return resolve(clientsDB);
        }

        console.error("DB connecting");

        MongoClient.connect(mongo.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
          }, (err, database) => {
            if(err) {
                return reject(err)
            }
    
            clientsDB = database.db(mongo.database);
            return resolve(clientsDB)
        });
    });
}
