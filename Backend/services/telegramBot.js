const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const token = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(token, { polling: true });

const API = "http://localhost:8000/api";

// START COMMAND
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, `
🤖 Outreach Control Bot

Commands:
/leads – Lead summary
/replied – Leads who replied
/pending – Waiting for reply
/email <leadId> – Send email
`);
});


// STEP 4 — LEAD SUMMARY

bot.onText(/\/leads/, async (msg) => {

    const chatId = msg.chat.id;

    try {

        const res = await axios.get(`${API}/leads`);

        const leads = res.data.leads;

        if (!leads || leads.length === 0) {
            bot.sendMessage(chatId, "No leads found.");
            return;
        }

        let message = "📋 Leads\n\n";

        leads.forEach((lead, i) => {
            message += `${i + 1}. ${lead.name} – ${lead.email}\n`;
        });

        bot.sendMessage(chatId, message);

    } catch (err) {

        console.log("BOT ERROR:", err.response?.data || err.message);

        bot.sendMessage(chatId, "Error fetching leads.");

    }

});

// STEP 5 — REPLIED LEADS
bot.onText(/\/replied/, async (msg) => {
    const chatId = msg.chat.id;

    try {

        const res = await axios.get(`${API}/leads`);

        const allLeads = res.data.leads || [];
        const leads = allLeads.filter(lead => lead.status === "replied");

        if (leads.length === 0) {
            bot.sendMessage(chatId, "No leads have replied yet.");
            return;
        }

        let message = "✅ Leads Who Replied\n\n";

        leads.forEach((lead, i) => {
            message += `${i + 1}. ${lead.name} – ${lead.company}\n`;
        });

        bot.sendMessage(chatId, message);

    } catch (err) {
        bot.sendMessage(chatId, "Error fetching replied leads.");
    }
});


// STEP 6 — SEND EMAIL
bot.onText(/\/email (.+)/, async (msg, match) => {

    const chatId = msg.chat.id;
    const leadId = match[1].trim();

    try {

        const leadRes = await axios.get(`${API}/leads/${leadId}`);
        const lead = leadRes.data;

        if (!lead || !lead.email) {
            bot.sendMessage(chatId, "Lead not found or has no email.");
            return;
        }

        await axios.post(`${API}/messages/send-email`, {
            leadId,
            email: lead.email,
            subject: `Outreach to ${lead.name || "Lead"}`,
            message: `Hi ${lead.name || "there"}, reaching out regarding a potential opportunity.`
        });

        bot.sendMessage(chatId, `📧 Email sent to ${lead.name} (${lead.email})!`);

    } catch (err) {

        bot.sendMessage(chatId, "Error sending email.");

    }

});