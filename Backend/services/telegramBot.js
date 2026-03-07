const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const Lead = require("../schemas/lead_schema");
const Message = require("../schemas/message_schema");

const API = "http://localhost:8000/api";

/* ───────── Helper: fetch leads from API ───────── */
async function fetchLeads() {
    const res = await axios.get(`${API}/leads`);
    return res.data.leads || [];
}

/* ───────── Helper: fetch dashboard from DB (analytics route requires auth) ───────── */
async function fetchDashboard() {
    const [totalLeads, emailsSent, replies, conversions, avgResult] = await Promise.all([
        Lead.countDocuments(),
        Message.countDocuments({
            channel: "email",
            status: "sent",
            $or: [{ direction: "outgoing" }, { direction: { $exists: false } }]
        }),
        Lead.countDocuments({ status: "replied" }),
        Lead.countDocuments({ status: "converted" }),
        Lead.aggregate([
            { $match: { lead_score: { $ne: null } } },
            { $group: { _id: null, avg: { $avg: "$lead_score" } } }
        ])
    ]);

    const leadScore = Number(((avgResult?.[0]?.avg || 0) * 100).toFixed(1));

    return { totalLeads, emailsSent, replies, conversions, leadScore };
}

/* ───────── Helper: send follow-up email via API ───────── */
async function sendEmail(leadId) {
    const leadRes = await axios.get(`${API}/leads/${leadId}`);
    const lead = leadRes.data;

    if (!lead || !lead.email) throw new Error("Lead not found or has no email");

    await axios.post(`${API}/messages/send-email`, {
        leadId,
        email: lead.email,
        subject: `Follow-up with ${lead.name || "Lead"}`,
        message: `Hi ${lead.name || "there"}, just following up on our previous conversation. Would love to connect!`
    });

    return lead;
}

/* ───────── Main menu inline keyboard ───────── */
const MAIN_MENU = {
    reply_markup: {
        inline_keyboard: [
            [
                { text: "📊 Campaign Dashboard", callback_data: "dashboard" },
                { text: "📋 View All Leads", callback_data: "leads" }
            ],
            [
                { text: "💬 Replied Leads", callback_data: "replied" },
                { text: "📧 Send Follow-Up", callback_data: "followup_menu" }
            ],
            [
                { text: "📡 Activity Feed", callback_data: "activity" },
                { text: "⚙️ System Status", callback_data: "status" }
            ]
        ]
    }
};

/* ───────── Initialize bot ───────── */
function initTelegramBot() {
    const token = process.env.TELEGRAM_TOKEN;

    if (!token) {
        console.log("[Telegram] ⚠️  TELEGRAM_TOKEN not set – bot disabled");
        return null;
    }

    const bot = new TelegramBot(token, { polling: true });

    console.log("[Telegram] 🤖 Scout AI Sales Assistant started");

    /* ── /start command ── */
    bot.onText(/\/start/, (msg) => {
        bot.sendMessage(
            msg.chat.id,
            "🤖 *Scout AI Assistant*\n\nChoose an option:",
            { parse_mode: "Markdown", ...MAIN_MENU }
        );
    });

    /* ── Callback query router ── */
    bot.on("callback_query", async (query) => {
        const chatId = query.message.chat.id;
        const data = query.data;

        bot.answerCallbackQuery(query.id);

        try {
            if (data === "dashboard") {
                await handleDashboard(bot, chatId);
            } else if (data === "leads") {
                await handleLeads(bot, chatId);
            } else if (data === "replied") {
                await handleReplied(bot, chatId);
            } else if (data === "followup_menu") {
                await handleFollowUpMenu(bot, chatId);
            } else if (data === "activity") {
                await handleActivity(bot, chatId);
            } else if (data === "status") {
                await handleStatus(bot, chatId);
            } else if (data === "main_menu") {
                bot.sendMessage(
                    chatId,
                    "🤖 *Scout AI Assistant*\n\nChoose an option:",
                    { parse_mode: "Markdown", ...MAIN_MENU }
                );
            } else if (data.startsWith("send_email_")) {
                await handleSendEmail(bot, chatId, data.replace("send_email_", ""));
            } else if (data.startsWith("view_lead_")) {
                await handleViewLead(bot, chatId, data.replace("view_lead_", ""));
            }
        } catch (err) {
            console.error("[Telegram] Callback error:", err.message);
            bot.sendMessage(chatId, "⚠️ Something went wrong fetching data.");
        }
    });

    return bot;
}

/* ═══════════════════════════════════════════
   Handler functions
   ═══════════════════════════════════════════ */

/* ── Campaign Dashboard ── */
async function handleDashboard(bot, chatId) {
    const d = await fetchDashboard();

    const text = [
        "📊 *Scout Campaign Dashboard*",
        "",
        `👥 Total Leads: *${d.totalLeads}*`,
        `📧 Emails Sent: *${d.emailsSent}*`,
        `💬 Replies: *${d.replies}*`,
        `🎯 Conversions: *${d.conversions}*`,
        `⭐ Lead Score: *${d.leadScore}%*`
    ].join("\n");

    bot.sendMessage(chatId, text, {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [{ text: "🔄 Refresh", callback_data: "dashboard" }],
                [{ text: "🏠 Main Menu", callback_data: "main_menu" }]
            ]
        }
    });
}

/* ── View All Leads (max 10) ── */
async function handleLeads(bot, chatId) {
    const leads = await fetchLeads();

    if (!leads.length) {
        bot.sendMessage(chatId, "📋 No leads found.", {
            reply_markup: { inline_keyboard: [[{ text: "🏠 Main Menu", callback_data: "main_menu" }]] }
        });
        return;
    }

    const display = leads.slice(0, 10);

    let text = "📋 *All Leads*\n\n";
    display.forEach((lead, i) => {
        const name = lead.name || "Unknown";
        const title = lead.designation || lead.title || "";
        const company = lead.company || "";
        const info = [title, company].filter(Boolean).join(" – ");
        text += `${i + 1}. *${name}*${info ? ` – ${info}` : ""}\n`;
    });

    if (leads.length > 10) {
        text += `\n_…and ${leads.length - 10} more_`;
    }

    const buttons = display.map((lead) => ([
        { text: `📧 Email ${(lead.name || "Lead").split(" ")[0]}`, callback_data: `send_email_${lead._id}` },
        { text: `🔍 Details`, callback_data: `view_lead_${lead._id}` }
    ]));

    buttons.push([{ text: "🏠 Main Menu", callback_data: "main_menu" }]);

    bot.sendMessage(chatId, text, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: buttons }
    });
}

/* ── Replied Leads ── */
async function handleReplied(bot, chatId) {
    const allLeads = await fetchLeads();
    const replied = allLeads.filter((l) => l.status === "replied");

    if (!replied.length) {
        bot.sendMessage(chatId, "💬 No leads have replied yet.", {
            reply_markup: { inline_keyboard: [[{ text: "🏠 Main Menu", callback_data: "main_menu" }]] }
        });
        return;
    }

    let text = "💬 *Leads Who Replied*\n\n";
    replied.forEach((lead, i) => {
        text += `${i + 1}. *${lead.name || "Unknown"}* – ${lead.company || "N/A"}\n`;
    });

    const buttons = replied.slice(0, 10).map((lead) => ([
        { text: `📧 Follow-Up ${(lead.name || "Lead").split(" ")[0]}`, callback_data: `send_email_${lead._id}` }
    ]));

    buttons.push([{ text: "🏠 Main Menu", callback_data: "main_menu" }]);

    bot.sendMessage(chatId, text, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: buttons }
    });
}

/* ── Follow-Up Menu (select a lead to email) ── */
async function handleFollowUpMenu(bot, chatId) {
    const leads = await fetchLeads();
    const contactable = leads.filter((l) => l.email).slice(0, 10);

    if (!contactable.length) {
        bot.sendMessage(chatId, "📧 No leads with email addresses found.", {
            reply_markup: { inline_keyboard: [[{ text: "🏠 Main Menu", callback_data: "main_menu" }]] }
        });
        return;
    }

    let text = "📧 *Send Follow-Up*\n\nSelect a lead:\n\n";
    contactable.forEach((lead, i) => {
        text += `${i + 1}. ${lead.name || "Unknown"} – ${lead.email}\n`;
    });

    const buttons = contactable.map((lead) => ([
        { text: `📧 ${lead.name || lead.email}`, callback_data: `send_email_${lead._id}` }
    ]));

    buttons.push([{ text: "🏠 Main Menu", callback_data: "main_menu" }]);

    bot.sendMessage(chatId, text, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: buttons }
    });
}

/* ── Send Email ── */
async function handleSendEmail(bot, chatId, leadId) {
    const lead = await sendEmail(leadId);
    bot.sendMessage(
        chatId,
        `✅ *Email sent successfully!*\n\n📧 To: ${lead.name} (${lead.email})`,
        {
            parse_mode: "Markdown",
            reply_markup: { inline_keyboard: [[{ text: "🏠 Main Menu", callback_data: "main_menu" }]] }
        }
    );
}

/* ── View Lead Details ── */
async function handleViewLead(bot, chatId, leadId) {
    const res = await axios.get(`${API}/leads/${leadId}`);
    const lead = res.data;

    if (!lead) {
        bot.sendMessage(chatId, "⚠️ Lead not found.");
        return;
    }

    const text = [
        `🔍 *Lead Details*`,
        "",
        `👤 Name: *${lead.name || "N/A"}*`,
        `📧 Email: ${lead.email || "N/A"}`,
        `🏢 Company: ${lead.company || "N/A"}`,
        `💼 Title: ${lead.designation || lead.title || "N/A"}`,
        `📊 Status: ${lead.status || "N/A"}`,
        `⭐ Score: ${lead.lead_score != null ? (lead.lead_score * 100).toFixed(1) + "%" : "N/A"}`
    ].join("\n");

    bot.sendMessage(chatId, text, {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [{ text: "📧 Send Email", callback_data: `send_email_${lead._id}` }],
                [{ text: "🏠 Main Menu", callback_data: "main_menu" }]
            ]
        }
    });
}

/* ── Activity Feed ── */
async function handleActivity(bot, chatId) {
    const [leads, messages] = await Promise.all([
        Lead.find().sort({ createdAt: -1 }).limit(5).lean(),
        Message.find({ channel: "email" }).sort({ sent_at: -1 }).limit(5).lean()
    ]);

    let text = "📡 *Recent Activity Feed*\n\n";

    messages.forEach((msg) => {
        if (msg.direction === "incoming") {
            text += `💬 Reply received (Lead ID: ${msg.lead_id})\n`;
        } else {
            text += `📧 Email sent (Lead ID: ${msg.lead_id})\n`;
        }
    });

    leads.forEach((lead) => {
        text += `🆕 New lead uploaded: ${lead.name || "Unknown"}\n`;
    });

    if (!messages.length && !leads.length) {
        text += "_No recent activity_";
    }

    bot.sendMessage(chatId, text, {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [{ text: "🔄 Refresh", callback_data: "activity" }],
                [{ text: "🏠 Main Menu", callback_data: "main_menu" }]
            ]
        }
    });
}

/* ── System Status ── */
async function handleStatus(bot, chatId) {
    const totalLeads = await Lead.countDocuments();

    const text = [
        "⚙️ *System Status*",
        "",
        "🟢 Server: *Running*",
        "🟢 Outreach Engine: *Active*",
        `📋 Leads Loaded: *${totalLeads}*`
    ].join("\n");

    bot.sendMessage(chatId, text, {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [{ text: "🔄 Refresh", callback_data: "status" }],
                [{ text: "🏠 Main Menu", callback_data: "main_menu" }]
            ]
        }
    });
}

module.exports = { initTelegramBot };