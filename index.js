const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const fs = require("fs");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define your token here
const mytoken = "vivek";
const token ="EAAQitBtT28sBOZCrqxmDOosmui0W6XZAgehRjg3JUKw3ZCLvZCS5t0dkZA2m4nmNDbHTyOMNB1ZBLZAi60ZBd60jL3hHTPagGZAZB5q5QzKV6sZAkXOTzfzdcLEiBvsMqmwAVyieRtlGAKrsZCjeKriyRlG5wslQfuWLz1qmuTH7mUPqsZBeRNfVcdVapc0ADAakZBEhK0Ly0xcZBmKm7PAFKlDnZBIZD";

app.get("/webhook", async (req, res) => {
  console.log("inside webhook get request");
  console.log("inside webhook get request");
  console.log("inside webhook get request");

  const mode = req.query["hub.mode"];
  const challenge = req.query["hub.challenge"];
  const token = req.query["hub.verify_token"];

  if (mode && token) {
    if (mode === "subscribe" && token == mytoken) {
      res.status(200).send(challenge);
    } else {
      res.status(403);
    }
  }
});

// Define a map of keywords and corresponding responses
const keywordResponses = {
  "hi": "Hello!",
  "hello": "Hi there!",
  "help": "Sure, how can I assist you?",
  "thanks": "You're welcome!",
  // Add more keywords and responses as needed
};

// app.post("/webhook", async (req, res) => {
//   let body_param = req.body;
//   console.log("inside webhook post request", body_param);

//   if (body_param.object) {
//     if (
//       body_param.entry &&
//       body_param.entry[0].changes &&
//       body_param.entry[0].changes[0].value.messages &&
//       body_param.entry[0].changes[0].value.messages[0]
//     ) {
//       const phon_no_id =
//         body_param.entry[0].changes[0].value.metadata.phone_number_id;
//       const from = body_param.entry[0].changes[0].value.messages[0].from;
//       const msg_body =
//         body_param.entry[0].changes[0].value.messages[0].text.body.toLowerCase(); // Convert message body to lowercase for case-insensitive matching

//       let responseText = ""; // Initialize response text

//       // Check if any keyword is present in the message body
//       for (const keyword in keywordResponses) {
//         if (msg_body.includes(keyword)) {
//           responseText = keywordResponses[keyword];
//           break; // Stop checking for other keywords once a match is found
//         }
//       }

//       // If no keyword match found, send a default response
//       if (!responseText) {
//         responseText = "Sorry, I didn't understand that. How can I assist you?";
//       }

//       // Send the response
//       axios({
//         method: "POST",
//         url: `https://graph.facebook.com/v13.0/${phon_no_id}/messages?access_token=${token}`,
//         data: {
//           messaging_product: "whatsapp",
//           to: from,
//           text: {
//             body: responseText,
//           },
//         },
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }).then(() => {
//         console.log("Response sent successfully:", responseText);
//         res.sendStatus(200);
//       }).catch(error => {
//         console.error("Error sending response:", error);
//         res.sendStatus(500);
//       });
//     } else {
//       res.sendStatus(404);
//     }
//   }
//   console.log("first request done")
// });
// Maintain a cache of processed message IDs
const processedMessages = new Set();

app.post("/webhook", async (req, res) => {
  let body_param = req.body;
  console.log("inside webhook post request", body_param);

  if (body_param.object) {
    if (
      body_param.entry &&
      body_param.entry[0].changes &&
      body_param.entry[0].changes[0].value.messages &&
      body_param.entry[0].changes[0].value.messages[0]
    ) {
      const messageId = body_param.entry[0].changes[0].value.messages[0].id;

      // // Check if the message has already been processed
      // if (processedMessages.has(messageId)) {
      //   console.log("Duplicate message, skipping processing.");
      //   res.sendStatus(200);
      //   return;
      // }

      const phon_no_id =
        body_param.entry[0].changes[0].value.metadata.phone_number_id;
      const from = body_param.entry[0].changes[0].value.messages[0].from;
      const msg_body =
        body_param.entry[0].changes[0].value.messages[0].text.body.toLowerCase();

      let responseText = "";

      // Check if any keyword is present in the message body
      for (const keyword in keywordResponses) {
        if (msg_body.includes(keyword)) {
          responseText = keywordResponses[keyword];
          break;
        }
      }

      if (!responseText) {
        responseText = "Sorry, I didn't understand that. How can I assist you?";
      }

      axios({
        method: "POST",
        url: `https://graph.facebook.com/v13.0/${phon_no_id}/messages?access_token=${token}`,
        data: {
          messaging_product: "whatsapp",
          to: from,
          text: {
            body: responseText,
          },
        },
        headers: {
          "Content-Type": "application/json",
        },
      }).then(() => {
        console.log("Response sent successfully:", responseText);
        res.sendStatus(200);
        // Add the message ID to the processed messages cache
        processedMessages.add(messageId);
      }).catch(error => {
        console.error("Error sending response:", error);
        res.sendStatus(500);
      });
    } else {
      res.sendStatus(404);
    }
  }
});


app.get("/", (req, res) => {
  res.status(200).send("webhook is setup correctly");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
