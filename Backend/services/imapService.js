const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const Lead = require('../schemas/lead_schema');
const Message = require('../schemas/message_schema');
const emailService = require('./emailService');

class ImapService {
  constructor() {
    const user = process.env.SMTP_USER;
    const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
    let host = process.env.SMTP_HOST || 'imap.gmail.com';
    
    // Gmail specific override if SMTP host is provided instead of IMAP
    if (host.includes('smtp.gmail.com')) {
      host = 'imap.gmail.com';
    }

    if (!user || !pass) {
      console.warn('[ImapService] Missing SMTP_USER or SMTP_PASS. IMAP polling will be disabled.');
      return;
    }

    this.client = new ImapFlow({
      host: host,
      port: 993,
      secure: true,
      auth: {
        user: user,
        pass: pass
      },
      logger: false // Set to true for debugging
    });

    this.isRunning = false;
  }

  clampScore(value) {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(1, value));
  }

  async processMessage(msg) {
    try {
      if (!msg.source) return;
      
      const parsed = await simpleParser(msg.source);
      const senderArray = parsed.from.value;
      if (!senderArray || senderArray.length === 0) return;
      
      const senderEmail = senderArray[0].address.toLowerCase().trim();
      const subject = parsed.subject;
      const textBody = parsed.text || '(No text body)';

      console.log(`[ImapService] 📩 Received email from: ${senderEmail}`);

      // Try to match sender to a Lead
      const lead = await Lead.findOne({ email: senderEmail });
      if (!lead) {
        console.log(`[ImapService] No lead found for ${senderEmail}, ignoring email.`);
        return;
      }

      console.log(`[ImapService] Found lead: ${lead.email} (Status: ${lead.status})`);

      const previousStatus = lead.status;
      const previousScore = this.clampScore(lead.lead_score == null ? 0 : Number(lead.lead_score));
      
      const shouldTransitionToReplied = previousStatus === 'new' || previousStatus === 'contacted';

      if (shouldTransitionToReplied) {
        lead.status = 'replied';
        lead.lead_score = this.clampScore(previousScore + 0.1);
        await lead.save();
        console.log(`[ImapService] 🎉 Lead status updated to 'replied'. New score: ${(lead.lead_score * 100).toFixed(1)}%`);
      }

      // Record the incoming message in history
      await Message.create({
        lead_id: lead._id,
        channel: 'email',
        direction: 'incoming',
        content: textBody,
        sent_at: new Date(),
        status: 'received'
      });

      // Optionally send auto-acknowledgment if that fits our mock behavior
      if (shouldTransitionToReplied && lead.email) {
        const firstName = lead.name ? String(lead.name).split(' ')[0] : 'there';
        const ackSubject = `Thanks for your reply, ${firstName}`;
        const ackBody = `Hi ${firstName},\n\nMakes sense. Thanks for reaching out.\n\nBest regards,\nOutreach Team`;
        
        const ackResult = await emailService.sendEmail(lead.email, ackSubject, ackBody);
        
        await Message.create({
          lead_id: lead._id,
          channel: 'email',
          direction: 'outgoing',
          content: ackBody,
          sent_at: new Date(),
          status: ackResult.success ? 'sent' : 'failed',
        });
      }

    } catch (error) {
      console.error('[ImapService] Error processing message:', error.message);
    }
  }

  async start() {
    if (!this.client || this.isRunning) return;
    
    try {
      await this.client.connect();
      this.isRunning = true;
      console.log('[ImapService] ✅ Connected to IMAP. Listening for replies...');

      const lock = await this.client.getMailboxLock('INBOX');
      
      // Fetch currently unread messages immediately and mark them as seen
      try {
        const messages = this.client.fetch({ unread: true }, { source: true });
        for await (let msg of messages) {
            await this.processMessage(msg);
            await this.client.messageFlagsAdd(msg.uid, ['\\Seen']);
        }
      } catch (err) {
        console.error('[ImapService] Error fetching initial unread messages:', err.message);
      }

      // Listen for new messages
      this.client.on('exists', async (data) => {
        try {
          console.log(`[ImapService] New message arrived (${data.count} total in INBOX).`);
          const messages = this.client.fetch({ unread: true }, { source: true, uid: true });
          for await (let msg of messages) {
              await this.processMessage(msg);
              // Mark as seen to avoid duplicate processing
              await this.client.messageFlagsAdd(msg.uid, ['\\Seen']);
          }
        } catch (err) {
            console.error('[ImapService] Error handling exists event:', err.message);
        }
      });

      lock.release();

    } catch (err) {
      console.error('[ImapService] Failed to start IMAP connection:', err.message);
      this.isRunning = false;
    }
  }

  async stop() {
    if (!this.client || !this.isRunning) return;
    try {
      await this.client.logout();
      this.isRunning = false;
      console.log('[ImapService] 🛑 IMAP connection closed.');
    } catch (err) {
      console.error('[ImapService] Error stopping IMAP connection:', err.message);
    }
  }
}

module.exports = new ImapService();
