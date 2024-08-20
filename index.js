const express = require('express')
const cors = require("cors");
const app = express()
const port = 5000
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mmcp2nn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        const productCollection = client.db("phoneNestDB").collection("products");

        app.get('/', (req, res) => {
            res.send('Hello World!')
        })

        app.get('/products', async (req, res) => {
            const size = parseInt(req.query.size)
            const page = parseInt(req.query.page) - 1
            const search = req.query.search;
            const sortItem = req.query.sort;
            const selectedCategory = req.query.selectedCategory;
            const minPrice = parseFloat(req.query.minPrice); 
            const maxPrice = parseFloat(req.query.maxPrice); 

            let query = {}
            if(search !== '' && search!== 'null') {
              query = { ProductName: { $regex: search, $options: 'i' } }
            }
            if(selectedCategory !== '' && selectedCategory!== 'null') {
                query = { Category:  { $regex: selectedCategory, $options: 'i' }}
              }
            let sort = {}
            if(sortItem=== 'lowToHigh'){
                sort = {Price: 1}
            }
            if(sortItem=== 'highToLow'){
                sort = {Price: -1}
            }
            if(sortItem=== 'new'){
                sort = {ProductCreationDateTime: -1}
            }
            if(sortItem=== 'old'){
                sort = {ProductCreationDateTime: 1}
            }

            const result = await productCollection
                .find(query)
                .sort(sort)
                .skip(page * size)
                .limit(size)
                .toArray()
            res.send(result)
        })


        app.get('/product-count', async (req, res) => {
            const count = await productCollection.countDocuments()
            res.send({ count })
        })


        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})