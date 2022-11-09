const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const jwt = require('jsonwebtoken');
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


// Verify JwT Token 
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers?.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' });
        }

        req.decode = decode;
        next();
    })
}

// JWT api
app.post('/jwt', async (req, res) => {
    const email = req.body;
    const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
    res.send({ token });
})



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
app.get('/reviews/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const query = { service_id: id }
        const reviews = await Reviews.find(query).sort({ data: 'desc' }).toArray();
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


app.get('/reviews', verifyJWT, async (req, res) => {
    try {
        const decode = req.decode;
        const email = req.query?.email;

        if (email !== decode?.email) {
            return res.status(403).send({ message: 'Forbidden access' })
        }

        const query = {
            email: email
        };
        const reviews = await Reviews.find(query).sort({ date: 'desc' }).toArray();
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
});


// Review update
app.patch('/reviews/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const review = req.body.review;
        const date = req.body.date;
        const query = { _id: ObjectId(id) };
        const updatedReview = {
            $set: {
                review: review,
                date: date
            }
        };

        const result = await Reviews.updateOne(query, updatedReview);
        if (result.modifiedCount > 0) {
            res.send({
                success: true,
                message: 'Successfully modified the reviews',
                data: result
            })
        } else {
            res.send({
                success: false,
                message: 'Could not modified the reviews',
            })
        }
    } catch (error) {
        console.log(error);
        res.send(error.message)
    }
})

// Delete Review
app.delete('/reviews/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await Reviews.deleteOne(query);

        if (result.deletedCount > 0) {
            res.send({
                success: true,
                message: 'Successfully delete one item',
                data: result
            })
        } else {
            res.send({
                success: false,
                message: 'Could not delete item'
            })
        }
    } catch (error) {
        console.log(error)
        res.send({
            success: false,
            error: error.message
        })
    }
})

app.listen(port, () => { console.log(`server is running on port ${port}`) })