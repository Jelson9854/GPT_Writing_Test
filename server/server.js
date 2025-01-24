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
 	origin: 'https://gptwriting.cs.vt.edu',
 	methods: ['POST'],
 	credentials: true
 };

app.use(cors(corsOptions));
app.use(express.json())

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, '..', "/my-ai-app")));

var jsonParser = bodyParser.json();

// Use body-parser middleware
app.use(jsonParser); // Parse JSON bodies

// app.post('/save_id', jsonParser, async(req, res) => {
// 	console.log('recieved');
//     try {
//         const email = req.body.email;

//         insertEmailRow(
//             {
//                 user_email: email,
//                 gpt_mess: [],
//                 writing_thing: [],
//                 final_text: [],
//             },
//             function (data) {
//                 writeOKResponse(
//                     res,
//                     "user email save successfully(" + data.id +")",
//                     {_id: data._id}
//                 )
//             }
//         )
//     }
//     catch (e) {
//         console.error(e)
//         res.status(500). json({error: "Internal Error"})
//     }
// })

// app.post('/submission', jsonParser, async(req, res) => {
//     try {
//         const email = req.body.email;
//         const mess = req.body.messages;
//         const writ = req.body.rec_thingy;
//         const user_id = req.body.__id;
//         const finText = req.body.final_text;

//         console.log(finText)

//         updateEmailRow(
//             {_id: new ObjectId(user_id)},
//             {
//                 user_email: email,
//                 gpt_mess: mess,
//                 writing_thing: writ,
//                 final_text: finText,
//             },
//             function(err){
//                 if(err) {
//                     writeBadRequestResponse(
//                         res,
//                         "error occured" + err
//                     );
//                     return;
//                 }
//                 writeOKResponse(res, "saved successfully");
//             }
//         )
//     }
//     catch (e) {
//         console.error(e)
//         res.status(500). json({error: "Internal Error"})
//     }
// })

app.post('/research/save_email', jsonParser, async(req, res) => {
    try {
        const { user_id, email, startTime } = req.body;
        // Assume user_id is already an ObjectId
        // Create a new document in the messages collection
        let start = new Date().toISOString()
	console.log(startTime)
        await messages.insertOne({
            _id: user_id,
            email,
            messages: [],
            copy_array: [],
            paste_array: [],
            timer_array: [],
        });

        // Create a new document in the recording collection
        await recording.insertOne({
            _id: user_id,
            email,
            recording: [],
            final_text: [],
            start: start,
            end: null,
        });

        await users.insertOne({
            _id: user_id,
            email,
            time: new Date().toISOString(),
        });

        res.status(200).json({ success: true });
        console.log("emails added")
    } catch (error) {
        console.error("Error saving email:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.post('/research/save_messages', jsonParser, async(req, res) => {
    try {
        const { user_id, email, mess_array, copy_array, paste_array, timer_array } = req.body;
        // Assume user_id is already an ObjectId
        await messages.updateOne(
            { _id: user_id },
            { $set: { email: email, messages: mess_array, copy_array, paste_array, timer_array } }
        );
        res.status(200).json({ success: true });
        console.log('saved messages')
    } catch (error) {
        console.error("Error saving messages:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/research/save_recording', jsonParser, async(req, res) => {
    try {
        const { user_id, email, rec_thingy, final_text, end_time } = req.body;
        console.log(end_time)
        // Assume user_id is already an ObjectId
        await recording.updateOne(
            { _id: user_id },
            { $set: { email, recording: rec_thingy, final_text, end: end_time } }
        );
        res.status(200).json({ success: true });
        console.log('saved recording')
    } catch (error) {
        console.error("Error saving recording and final text:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient("mongodb://127.0.0.1:27017/gptwriting?directConnection=true");
let db;
let recording;
let messages;
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
        messages = db.collection('messages');
        recording = db.collection('recording');
        users = db.collection('users');
        if (messages == null) {
            messages = db.createCollection("messages");
            console.log("Messages collection does not exist so created");
        }
        if (recording == null) {
            recording = db.createCollection("recording");
            console.log("Recording collection does not exist so created");
        }
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
