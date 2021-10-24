const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const ObjectID = require("mongodb").ObjectId;

const app = express();
const port = 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://db-users:u8k5UqaeqSAMEnZJ@cluster0.cyduv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

/* -------------------- without using async-await method -------------------- */

// client.connect((err) => {
//   const collection = client.db("foodCluster").collection("user");
//   const doc = {
//     name: "karim",
//     email: "karimhd@gmail.com",
//   };
//   collection.insertOne(doc).then(() => {
//     console.log("successfull entry");
//   });

//   console.log("hitting data");
//   // perform actions on the collection object
//   //   client.close();
// });

/* ------------------------ Using async-await method ------------------------ */

// async function run() {
// try {
// await client.connect();
// const database = client.db("foodCluster");
// const userCollection = database.collection("user");

// // create doc

// const doc = {
// name: "abdul",
// email: "abdulbd@gmail.com",
// };
// const result = await userCollection.insertOne(doc);
// console.log(`A document was inserted with the _id: ${result.insertedId}`);
// console.log(result);

// } finally {
// await client.close();
// }
// }
// run().catch(console.dir);

async function run() {
  try {
    await client.connect();
    const database = client.db("foodCluster");
    const userCollection = database.collection("user");

    /* ------------------------------- Get API ------------------------------- */
    app.get("/users", async (req, res) => {
      //   const result = await userCollection.find({}).toArray();
      //   res.send(result); // send to client--caught in .then()
      const cursor = userCollection.find({});
      const users = await cursor.toArray();
      res.send(users);
    });

    /*-- load single user from get API--*/
    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectID(id) };
      const user = await userCollection.findOne(query);
      //   console.log("load user id", id);
      res.send(user);
    });

    /* -------------------------- Post API from Client -------------------------- */

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      //   console.log("got", req.body);
      //   console.log("added", result);
      res.json(result); // send to client--caught in .then()
      //Using res.send will get an error:: VM301:1 Uncaught (in promise) SyntaxError: Unexpected token < in JSON at position 0
    });

    /* ------------------------------- Update API ------------------------------- */

    app.put("/users/:id", async (req, res) => {
      const id = req.params.id;
      const updatedUser = req.body;
      const filter = { _id: ObjectID(id) };
      // this option instructs the method to insert a document if no documents match the filter
      const options = { upsert: true };

      // create a document that updates the  user
      const updateDoc = {
        $set: {
          name: updatedUser.name,
          email: updatedUser.email,
        },
      };

      const result = await userCollection.updateOne(filter, updateDoc, options);

      //   console.log("updating", result);
      res.json(result);
    });

    /* --------------------------------- Delete API--------------------------------- */
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectID(id) };
      const result = await userCollection.deleteOne(query);
      console.log("deleting user with id ", result);
      res.json(result); // send to client--caught in .then()
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

// user: db - users;
// pass: u8k5UqaeqSAMEnZJ;

app.get("/", (req, res) => {
  res.send("running server");
});

app.listen(port, () => {
  console.log("listening to port", port);
});
