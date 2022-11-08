const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

// MIDDLE WARES
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zzty5cj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// Database Collection
const Services = client.db('rakib-consultancy').collection('services');
const Reviews = client.db('rakib-consultancy').collection('reviews');

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


app.post('/services', async (req, res) => {
    try {
        const service = req.body;
        const result = await Services.insertOne(service);

        if (result.insertedId) {
            res.send({
                success: true,
                message: 'Successfully insert the service',
                data: result
            })
        } else {
            res.send({
                success: false,
                error: 'Could not insert the service'
            })
        }
    } catch (error) {
        console.log(error.message);
        res.secure(error.message)
    }
})


app.get('/services', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit);

        if (limit) {
            const services = await Services.find({}).limit(limit).toArray();
            res.send({
                success: true,
                message: 'Successfully got the services',
                data: services
            });
        } else {
            const services = await Services.find({}).toArray();
            res.send({
                success: true,
                message: 'Successfully got the services',
                data: services
            });
        }

    } catch (error) {
        console.log(error.message);
        res.send({
            success: false,
            error: error.message
        })
    }
});

app.get('/services/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const service = await Services.findOne(query);
        res.send({
            success: true,
            message: 'Successfully got the service',
            data: service
        })
    } catch (error) {
        console.log(error.message);
        res.send({
            success: false,
            error: error.message
        })
    }
})

// get reviews api
app.get('/reviews', async (req, res) => {
    try {
        const reviews = await Reviews.find({}).toArray();
        res.send({
            success: true,
            message: 'Successfully got the reviews',
            data: reviews
        })
    } catch (error) {
        console.log(error);
        res.send({
            success: false,
            error: error.message
        })
    }
})


// post reviews api
app.post('/reviews', async (req, res) => {
    try {
        const reviews = req.body;
        const result = await Reviews.insertOne(reviews);
        if (result.insertedId) {
            res.send({
                success: true,
                message: 'Successfully insert the reviews',
                data: reviews
            })
        } else {
            res.send({
                success: false,
                message: 'Could not insert the reviews',
            })
        }
    } catch (error) {
        console.log(error);
        res.send({
            success: false,
            error: error.message
        })
    }
})

app.listen(port, () => { console.log(`server is running on port ${port}`) })