const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const cors = require("cors");
const ObjectId = require('mongodb').ObjectId;
require("dotenv").config();
const fileUpload = require("express-fileupload");
const port = process.env.PORT || 5000;

// middleware ------------------------->
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());

app.get("/", (req, res) => res.status(201).send("hello world this is express home page!"))

// start mongodb ------------------------>

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lvyry.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
      await client.connect();
      const database = client.db("zuan-travels-agency");
        const travelsCollection = database.collection("travelsCollection");
        const selectProduct = database.collection("selectProductCollection");
        const usersCollection = database.collection("usersCollection");
        const reviewCollection = database.collection("reviewCollection");
        
      // post addproduct data-----------------=>
        
      app.post("/addTravels", async (req, res) => {
          const { title, description, category, cost, location, rating, panding } = req.body;
          const pic = req.files.image;
          const picData = pic.data;
          const encodedpic = picData.toString("base64");
          const images = Buffer.from(encodedpic, "base64");
        const blogData = {
          title,
          body: description,
          category,
          price: cost,
          location,
          rating,
          panding,
          src: images
        };
          const result = await travelsCollection.insertOne(blogData);
          res.json(result);
        })
      
      // post single product data ----------------->

      app.post("/selectProduct", async (req, res) => {
        const result = await selectProduct.insertOne(req.body)
        res.json(result);
      })
      
      // get single product data ---------------->

      app.get("/selectProduct", async (req, res) => {
        const result = await productColletcion.find({}).toArray();
        res.send(result);
      })

      // delete cart data ---------------->

      app.delete("/selectProduct/:id", async (req, res) => {
        const id = req.params.id;
        const query = {_id : ObjectId(id)}
        const result = await selectProduct.deleteOne(query);
        res.json(result);
    })
      
      // get product data --------------------->
      app.get("/product", async (req, res) => {
        const cursor = travelsCollection.find({});
            const currentPage = req.query.currentPage;
            const size = parseInt(req.query.size);
            let products;
            const count = await cursor.count();

            if (currentPage) {
                products = await cursor.skip(currentPage * size).limit(size).toArray();
            }
            else {
                products = await cursor.toArray();
            }

            res.send({
                count,
                products
            });
      })

      // update product status --------------------------->

      app.put("/selectProduct/:id", async (req, res) => {
        const id = req.params.id;
        const options = { upsert: true };
        const query = { _id: ObjectId(id) };
        const updatePackage = {
            $set: { status: "approved" }
        }
        const result = await selectProduct.updateOne(query,updatePackage,options);
        res.json(result);
      })

      // register userAndadmin ----------------------->

      app.post('/users', async (req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.json(result);
      });

      // review post data ---------------------------->

      app.post('/review', async (req, res) => {
        const user = req.body;
        const result = await reviewCollection.insertOne(user);
        res.json(result);
      });

      // get review data --------------------------->

      app.get('/review', async (req, res) => {
        const result = await reviewCollection.find({}).toArray();
        res.json(result);
      });

      // update userAandAdmin ------------------->

      app.put('/users', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
        const updateDoc = { $set: user };
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.json(result);
    });

      // get userAndAdmin----------------->

      app.get('/users', async (req, res) => {
        const result = await usersCollection.find({}).toArray();
        res.json(result);
      });
      
      // make user to admin --------------------------->
      app.put('/users/admin', async (req, res) => {
        const user = req.body;
        if (user.email) {
                const filter = { email: user.email };
                const updateDoc = { $set: { role: 'admin' } };
                const result = await usersCollection.updateOne(filter, updateDoc);
                res.json(result);
        }

      })
      
      // search admin ------------------------->

      app.get('/users/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if (user?.role === 'admin') {
            isAdmin = true;
        }
        res.json({ admin: isAdmin });
    })
      
    }
    finally
    {
    //   await client.close();
    }
  }
  run().catch(console.dir);

// app listening ------------------------------->
app.listen(port, () => console.log(`express port is ${port}!`));