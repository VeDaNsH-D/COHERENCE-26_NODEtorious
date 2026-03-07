const express = require("express");
const router = express.Router();
const axios = require("axios");
const twilio = require("twilio");

const API_BASE = "http://localhost:8000/api";

/*
ENTRY POINT
Twilio hits this when someone calls the phone number
*/
router.post("/", (req, res) => {
    try {
        const twiml = new twilio.twiml.VoiceResponse();

        const gather = twiml.gather({
            input: "speech",
            action: "/api/voice/process",
            method: "POST",
            speechTimeout: "auto",
            speechModel: "phone_call"
        });

        gather.say(
            "Hello. This is Scout A I assistant. You can ask things like. How many leads do I have. Or. How many replies do I have."
        );

        res.type("text/xml");
        res.send(twiml.toString());
    } catch (err) {
        console.error("Voice entry error:", err.message);
        const twiml = new twilio.twiml.VoiceResponse();
        twiml.say("There was an error. Please try again later.");
        res.type("text/xml");
        res.send(twiml.toString());
    }
});


/*
PROCESS SPEECH
Twilio sends the user's speech transcription here
*/
router.post("/process", async (req, res) => {

    const twiml = new twilio.twiml.VoiceResponse();

    const speech = (req.body.SpeechResult || "").toLowerCase();

    console.log("User said:", speech);

    let response = "Sorry. I did not understand that.";

    try {

        /*
        CHECK FOR LEADS
        */
        if (speech.includes("lead")) {

            const api = await axios.get(`${API_BASE}/leads`);

            const count = api.data.total || api.data.leads.length;

            twiml.say(`You currently have ${count} leads in the system.`);

            const gather = twiml.gather({
                input: "speech",
                action: "/api/voice/send-emails",
                method: "POST",
                speechTimeout: "auto",
                speechModel: "phone_call"
            });

            gather.say("Would you like to send emails to any of these leads? Say yes or no.");

            twiml.say("Thank you for calling Scout AI. Goodbye.");

            res.type("text/xml");
            return res.send(twiml.toString());

        }

        /*
        CHECK FOR REPLIES
        */
        else if (
            speech.includes("repli") ||
            speech.includes("response") ||
            speech.includes("replied")
        ) {

            const api = await axios.get(`${API_BASE}/leads`);

            const replied = (api.data.leads || []).filter(l => l.status === "replied");

            response = `You have ${replied.length} leads who replied to your emails.`;

        }

        /*
        CHECK FOR DASHBOARD STATS
        */
        else if (
            speech.includes("stats") ||
            speech.includes("dashboard") ||
            speech.includes("campaign")
        ) {

            const api = await axios.get(`${API_BASE}/leads`);

            const leads = api.data.leads || [];
            const totalLeads = api.data.total || leads.length;
            const contacted = leads.filter(l => l.status === "contacted").length;
            const replied = leads.filter(l => l.status === "replied").length;

            response =
                `Here are your campaign statistics. ` +
                `Total leads ${totalLeads}. ` +
                `Contacted ${contacted}. ` +
                `Replies ${replied}.`;

        }

    } catch (err) {

        console.error("Voice API error:", err.message);

        response = "There was an error fetching data from the system.";

    }

    twiml.say(response);

    twiml.say("Thank you for calling Scout AI. Goodbye.");

    res.type("text/xml");
    res.send(twiml.toString());

});


/*
SEND EMAILS FOLLOW-UP
Handles yes/no response after asking about sending emails
*/
router.post("/send-emails", async (req, res) => {

    const twiml = new twilio.twiml.VoiceResponse();

    const speech = (req.body.SpeechResult || "").toLowerCase();

    console.log("User said (send-emails):", speech);

    try {

        if (speech.includes("yes") || speech.includes("yeah") || speech.includes("sure") || speech.includes("yep")) {

            const api = await axios.get(`${API_BASE}/leads`);
            const leads = api.data.leads || [];
            const newLeads = leads.filter(l => l.status === "new");

            if (newLeads.length === 0) {
                twiml.say("There are no new leads to send emails to. All leads have already been contacted.");
            } else {
                let sent = 0;
                let failed = 0;

                for (const lead of newLeads) {
                    try {
                        await axios.post(`${API_BASE}/enroll-lead`, {
                            name: lead.name,
                            email: lead.email,
                            company: lead.company
                        });
                        sent++;
                    } catch (err) {
                        console.error(`Failed to enroll lead ${lead.email}:`, err.message);
                        failed++;
                    }
                }

                twiml.say(`Done. I enrolled ${sent} new leads into email workflows.${failed > 0 ? ` ${failed} failed.` : ""}`);
            }

        } else {
            twiml.say("Okay. No emails will be sent.");
        }

    } catch (err) {

        console.error("Send emails voice error:", err.message);
        twiml.say("There was an error processing your request.");

    }

    twiml.say("Thank you for calling Scout AI. Goodbye.");

    res.type("text/xml");
    res.send(twiml.toString());

});

module.exports = router;