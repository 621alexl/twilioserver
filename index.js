const express = require('express');
const app = express();

// to manage user session
const dialogflowSessionClient =
    require('./botlib/dialogflow_session_client.js');

const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const projectId = 'eduhelp-niyy';
const phoneNumber = "+17629945445";

const accountSid = 'AC70a60a9c23e9e2caf2047710f66d9535';
const authToken = '1d3095bad01bcf0cb84ef49aeda3c526';

const client = require('twilio')(accountSid, authToken);
const sessionClient = new dialogflowSessionClient(projectId);

port_num = 8989;
// start the server
const listener = app.listen(port_num, function() {
    console.log('Your Twilio integration server is listening on port ' +
        listener.address().port);
});

app.post('/', async function(req, res) {
    // get the body of the msg
    const body = req.body;
    // get original text by the user
    const text = body.Body;
    // get user mobile number
    const sendTo = body.From;
    // detect the intent and pass the query
    const dialogflowResponse = (
        await sessionClient.detectIntent(text, sendTo, body)).fulfillmentText;

    console.log("User response => " + JSON.stringify(text, null, 2));

    try {
        await client.messages.create({
            body: dialogflowResponse,
            from: phoneNumber,
            to: sendTo
        }).then(message => console.log("*** message sent successfully to => " + sendTo + "  *****"));
    } catch (error) {
        console.log("error => " + JSON.stringify(error, null, 2))
    }
    console.log("Dialogflow responce => " + JSON.stringify(dialogflowResponse, null, 2));
    // terminate the user request successfully
    res.end();
});


process.on('SIGTERM', () => {
    listener.close(() => {
        console.log('Closing http server.');
        process.exit(0);
    });

});