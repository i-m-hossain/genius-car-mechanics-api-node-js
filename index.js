const express = require('express');
const cors = require('cors')
require('dotenv').config()
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectID;
const app = express();
app.use(express.json());
app.use(cors())
const port = process.env.PORT||5000;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.krune.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("carMechanic");
        const servicesCollection = database.collection("services");

        // create a document to insert
        app.post('/service', async (req, res) => {
            const newService = req.body;
            const result = await servicesCollection.insertOne(newService);
            res.json(result);
        })
        app.get('/services', async(req, res)=>{
            const query ={};
            const cursor = servicesCollection.find(query);
            const result = await cursor.toArray();
            res.json(result);
        })
        app.get('/service/:id', async(req, res)=>{
            const serviceId = req.params.id
            const query ={_id:   ObjectId(serviceId)};
            const result = await servicesCollection.findOne(query);
            res.json(result);
        })
        app.put('/service/:id', async(req,res) =>{
            const serviceId = req.params.id
            const service = req.body;
            const filter = { _id: ObjectId(serviceId) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: service.name,
                    price: service.price,
                    description: service.description,
                    img: service.img,
                },
            };
            const result = await servicesCollection.updateOne(filter, updateDoc, options);
            res.json(result)
            
        })
        app.delete('/service/:id', async(req, res)=>{
            const serviceId = req.params.id
            const query ={_id:  ObjectId(serviceId)};
            const result = await servicesCollection.deleteOne(query);
            res.json(result);
        })

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('hello world')
})
app.listen(port, () => {
    console.log(`example app listenning at http://localhost:${port}`);
})