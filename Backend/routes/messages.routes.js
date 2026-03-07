const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
const Message = require('../schemas/message_schema');
const Lead = require('../schemas/lead_schema');
const { generateEmail } = require('../services/llmService');

const clampScore = (value) => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
};

const normalizeTone = (tone) => {
  const value = String(tone || 'professional').toLowerCase().trim();
  if (['professional', 'casual', 'urgent'].includes(value)) return value;
  return 'professional';
};

const normalizeLength = (length) => {
  const value = String(length || 'medium').toLowerCase().trim();
  if (['short', 'medium', 'long'].includes(value)) return value;
  return 'medium';
};

const toneToEmailType = {
  professional: 'cold_email',
  casual: 'followup_1',
  urgent: 'followup_2',
};

const buildGenerationLead = (payload, leadDoc = null) => {
  const bodyLead = payload.lead || {};

  return {
    name: payload.leadName || bodyLead.name || leadDoc?.name || '',
    email: payload.email || bodyLead.email || leadDoc?.email || '',
    company: payload.company || bodyLead.company || leadDoc?.company || '',
    role: payload.role || bodyLead.role || leadDoc?.role || '',
    industry: payload.industry || bodyLead.industry || leadDoc?.industry || '',
    seniority: payload.seniority || bodyLead.seniority || leadDoc?.seniority || '',
    company_size: payload.companySize || bodyLead.company_size || leadDoc?.company_size || '',
    lead_source: payload.leadSource || bodyLead.lead_source || leadDoc?.lead_source || '',
    lead_score:
      payload.leadScore != null
        ? Number(payload.leadScore)
        : leadDoc?.lead_score != null
          ? Number(leadDoc.lead_score)
          : null,
  };
};

const buildLengthHint = (length) => {
  if (length === 'short') return 'Keep it concise: around 50-80 words.';
  if (length === 'long') return 'Write a fuller version: around 130-170 words.';
  return 'Use a balanced medium length: around 90-120 words.';
};

/**
 * @route POST /api/messages/generate
 * @desc Generates an AI outreach message from lead/campaign context
 * @access Public/Private
 */
router.post('/generate', async (req, res) => {
  try {
    const {
      leadId,
      additionalContext,
      context,
      tone,
      length,
      campaignContext: rawCampaignContext,
    } = req.body || {};

    let leadDoc = null;
    if (leadId) {
      leadDoc = await Lead.findById(leadId);
      if (!leadDoc) {
        return res.status(404).json({ error: 'Lead not found' });
      }
    }

    const finalTone = normalizeTone(tone);
    const finalLength = normalizeLength(length);
    const lead = buildGenerationLead(req.body || {}, leadDoc);

    const campaignContext = {
      team_name:
        rawCampaignContext?.team_name ||
        rawCampaignContext?.teamName ||
        'Scout Team',
      product_name:
        rawCampaignContext?.product_name ||
        rawCampaignContext?.productName ||
        'Scout AI',
      product_description:
        rawCampaignContext?.product_description ||
        rawCampaignContext?.productDescription ||
        'AI-powered outreach automation and campaign optimization platform',
      pain_point:
        rawCampaignContext?.pain_point ||
        rawCampaignContext?.painPoint ||
        'inconsistent campaign performance and low reply rates',
      goal:
        rawCampaignContext?.goal ||
        'book a short discovery call',
    };

    const promptHints = [
      `Preferred tone: ${finalTone}.`,
      buildLengthHint(finalLength),
    ];

    if (additionalContext) {
      promptHints.push(`Additional context: ${String(additionalContext).trim()}`);
    }
    if (context) {
      promptHints.push(`Extra context: ${String(context).trim()}`);
    }
    if (leadDoc?.insights?.length) {
      promptHints.push(...leadDoc.insights.slice(0, 8));
    }

    const generated = await generateEmail(
      lead,
      promptHints,
      campaignContext,
      toneToEmailType[finalTone] || 'cold_email',
    );

    return res.status(200).json({
      subject: generated.subject,
      body: generated.body,
      tone: finalTone,
      length: finalLength,
      source: leadDoc ? 'lead-context' : 'manual-context',
    });
  } catch (error) {
    console.error('[Routes] Error generating message:', error.message);
    return res.status(500).json({ error: 'Failed to generate message' });
  }
});

/**
 * @route POST /api/messages/send-email
 * @desc Sends an email directly to a lead
 * @access Public/Private
 */
router.post('/send-email', async (req, res) => {
  try {
    const { leadId, email, subject, message } = req.body;

    if (!email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields: email, subject, message' });
    }

    const result = await emailService.sendEmail(email, subject, message);

    // Save message record
    let leadStatusUpdate = null;
    if (leadId) {
      let lead = null;
      if (result.success) {
        lead = await Lead.findById(leadId);
      }

      if (lead && lead.status === 'new') {
        lead.status = 'contacted';
        await lead.save();
        leadStatusUpdate = {
          previousStatus: 'new',
          newStatus: 'contacted',
        };
      }

      await Message.create({
        lead_id: leadId,
        channel: 'email',
        direction: 'outgoing',
        content: message,
        sent_at: new Date(),
        status: result.success ? 'sent' : 'failed'
      });
    }

    const statusCode = result.success
      ? 200
      : result.code === 'EMAIL_NOT_CONFIGURED'
        ? 503
        : result.code === 'EMAIL_INVALID_PAYLOAD'
          ? 400
          : 502;

    const failureMessage =
      result.error ||
      (result.code === 'EMAIL_NOT_CONFIGURED'
        ? 'SMTP is not configured on the server.'
        : 'Email failed to send');

    res.status(statusCode).json({
      message: result.success ? 'Email sent successfully' : failureMessage,
      code: result.code,
      error: result.success ? null : result.error || null,
      result,
      leadStatusUpdate,
    });
  } catch (error) {
    console.error(`[Routes] ❌ Error sending email:`, error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

/**
 * @route POST /api/messages/reply
 * @desc Records a lead reply, updates lead status/score, and optionally sends acknowledgment.
 * @access Public/Private
 */
router.post('/reply', async (req, res) => {
  try {
    const {
      leadId,
      email,
      message,
      sendAcknowledgement = true,
      acknowledgementSubject,
      acknowledgementMessage,
    } = req.body;

    if ((!leadId && !email) || !message) {
      return res.status(400).json({
        error: 'Missing required fields: (leadId or email), message',
      });
    }

    const query = leadId ? { _id: leadId } : { email: String(email).trim().toLowerCase() };
    const lead = await Lead.findOne(query);

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const previousStatus = lead.status;
    const previousScore = clampScore(
      lead.lead_score == null ? 0 : Number(lead.lead_score),
    );

    const shouldTransitionToReplied = previousStatus === 'new' || previousStatus === 'contacted';
    const scoreBoostApplied = shouldTransitionToReplied;

    if (shouldTransitionToReplied) {
      lead.status = 'replied';
      lead.lead_score = clampScore(previousScore + 0.1);
      await lead.save();
    }

    await Message.create({
      lead_id: lead._id,
      channel: 'email',
      direction: 'incoming',
      content: message,
      sent_at: new Date(),
      status: 'received',
    });

    let acknowledgement = {
      attempted: false,
      sent: false,
      error: null,
    };

    if (sendAcknowledgement && shouldTransitionToReplied && lead.email) {
      const firstName = lead.name ? String(lead.name).split(' ')[0] : 'there';
      const subject = acknowledgementSubject || 'Thanks for your reply';
      const body = acknowledgementMessage ||
        `Hi ${firstName},\n\nThanks for your reply. We have updated your status and our team will get back to you shortly.\n\nBest regards,\nOutreach Team`;

      acknowledgement.attempted = true;
      const acknowledgementResult = await emailService.sendEmail(lead.email, subject, body);
      acknowledgement.sent = Boolean(acknowledgementResult.success);
      acknowledgement.error = acknowledgementResult.error || null;

      await Message.create({
        lead_id: lead._id,
        channel: 'email',
        direction: 'outgoing',
        content: body,
        sent_at: new Date(),
        status: acknowledgementResult.success ? 'sent' : 'failed',
      });
    }

    const updatedScore = clampScore(
      lead.lead_score == null ? 0 : Number(lead.lead_score),
    );
    const userNotification = scoreBoostApplied
      ? `Lead ${lead.email} moved to "${lead.status}" and score updated to ${Math.round(updatedScore * 100)}%.`
      : `Reply recorded for ${lead.email}. Current status is "${lead.status}" with score ${Math.round(updatedScore * 100)}%.`;

    return res.status(200).json({
      message: 'Reply feedback captured',
      userNotification,
      lead: {
        id: lead._id,
        email: lead.email,
        status: lead.status,
        lead_score: updatedScore,
      },
      changes: {
        previousStatus,
        newStatus: lead.status,
        previousScore,
        newScore: updatedScore,
        statusChanged: shouldTransitionToReplied,
        scoreBoostApplied,
      },
      acknowledgement,
    });
  } catch (error) {
    console.error('[Routes] Error recording reply feedback:', error.message);
    return res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
