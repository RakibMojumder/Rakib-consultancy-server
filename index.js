const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

// MIDDLE WARES
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zzty5cj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const Services = client.db('rakib-consultancy').collection('services');

// connect database
const dbConnect = async () => {
    try {
        await client.connect();
        console.log('Database connected')
    } catch (error) {
        console.log(error.message)
    }
}
dbConnect();

app.get('/', (req, res) => {
    res.send('API is running');
});

app.get('/services', async (req, res) => {
    try {
        const query = {};
        const cursor = Services.find(query);
        const services = await cursor.toArray();
        res.send({
            success: true,
            message: 'Successfully got the services',
            data: services
        })
    } catch (error) {
        console.log(error.message);
        res.send({
            success: false,
            error: error.message
        })
    }
});

app.get('/services/:id', (req, res) => {
    const id = req.params.id;
})

app.listen(port, () => { console.log(`server is running on port ${port}`) })