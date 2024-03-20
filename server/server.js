import express from "express";
import * as path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import cors from 'cors'
import mongodb from 'mongodb';
const { MongoClient, ObjectId } = mongodb;


const app = express();
const PORT = process.env.PORT || 8080;

const corsOptions = {
	origin: 'http://gptwriting.cs.vt.edu:3000',
	methods: 'POST',
	credentials: true
};

app.use(cors(corsOptions));
app.use(express.json())

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, '..', "/my-ai-app")));

var jsonParser = bodyParser.json();

// Use body-parser middleware
app.use(jsonParser); // Parse JSON bodies

app.post('/save_id', jsonParser, async(req, res) => {
	console.log('recieved');
    try {
        const email = req.body.email;

        insertEmailRow(
            {
                user_email: email,
                gpt_mess: [],
                writing_thing: [],
            },
            function (data) {
                writeOKResponse(
                    res,
                    "user email save successfully(" + data.id +")",
                    {_id: data._id}
                )
            }
        )
    }
    catch (e) {
        console.error(e)
        res.status(500). json({error: "Internal Error"})
    }
})

app.post('/submission', jsonParser, async(req, res) => {
    console.log(req.body)
    try {
        const email = req.body.email;
        const mess = req.body.messages;
        const writ = req.body.rec_thingy;
        const user_id = req.body.__id;

        updateEmailRow(
            {_id: new ObjectId(user_id)},
            {
                user_email: email,
                gpt_mess: mess,
                writing_thing: writ,
            },
            function(err){
                if(err) {
                    writeBadRequestResponse(
                        res,
                        "error occured" + err
                    );
                    return;
                }
                writeOKResponse(res, "saved successfully");
            }
        )
    }
    catch (e) {
        console.error(e)
        res.status(500). json({error: "Internal Error"})
    }
})

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient("mongodb://127.0.0.1:27017/gptwriting?directConnection=true");
let db;
let users;

async function run() {
    try {
        // Connect the client to the server
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("gptwriting").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );

        // Send a ping to confirm a successful connection
        db = await client.db("gptwriting");
        users = db.collection("users");
        if (users == null) {
            users = db.createCollection("users");
            console.log("Users collection does not exist so created");
        }
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
})

let insertEmailRow = async function (data, callback) {
    const result = await users.insertOne(data);
    console.log(
        "InsertDBRow: Inserted a document into the user collection: " +
            data._id
    );
    if (callback) callback(data);
};


let updateEmailRow = async function (query, newvalues, callback) {
    console.log("updateDBRow: query: " + JSON.stringify(query));
    console.log("updateDBRow: newValue: " + JSON.stringify(newvalues));

    try {
        // Assuming query._id is a string, convert it to an ObjectID
        if (query._id && typeof query._id === 'string') {
            query._id = new ObjectID(query._id);
        }

        const result = await users.updateOne(query, {
            $set: newvalues,
        });

        console.log("updateDBRow: Updated a document in users");
        if (callback) callback();
    } catch (error) {
        console.error("Error updating tweet:", error);
        if (callback) callback(error);
    }
};


//https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
let writeOKResponse = function (res, message, data) {
    let obj = {
        status: "OK",
        message: message,
        data: data,
    };
    console.log("writeOKResponse: " + message);

    res.status(200).json(obj);
};

let writeBadRequestResponse = function (res, message) {
    console.log("writeBadRequestResponse: " + message);
    res.status(400).send(message);
};
