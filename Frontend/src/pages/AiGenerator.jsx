import React, { useState } from 'react';
import { mockAiMessages } from '../utils/mockData';
import messagesService from '../services/messagesService';

const buildLocalFallback = ({ tone, length, leadName, company, additionalContext }) => {
  const name = leadName || 'there';
  const org = company || 'your team';
  const contextLine = additionalContext
    ? ` I noticed ${additionalContext.trim().replace(/\.$/, '')}.`
    : '';

  const templates = {
    professional: `Hi ${name}, I came across ${org} and wanted to share an idea that could improve outreach consistency.${contextLine}`,
    casual: `Hey ${name}, quick note about ${org}.${contextLine} I think there is an easy way to improve campaign replies.`,
    urgent: `Hi ${name}, reaching out quickly because this could impact ${org}'s campaign results this quarter.${contextLine}`,
  };

  const lengthSuffix = {
    short: ' Open to a 10-minute chat?',
    medium: ' If this is relevant, I can share a practical plan and examples from similar teams. Open to a quick call this week?',
    long: ' We have seen teams in similar situations improve response rates by tightening targeting, cadence, and personalization quality. If useful, I can share a concise plan tailored to your workflow. Would you be open to a short call this week?',
  };

  return `${templates[tone] || templates.professional}${lengthSuffix[length] || lengthSuffix.medium}`;
};

export default function AiGenerator() {
  const messages = mockAiMessages;
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [generatedSubject, setGeneratedSubject] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [leadName, setLeadName] = useState('John Smith');
  const [company, setCompany] = useState('TechCorp');
  const [role, setRole] = useState('Growth Manager');
  const [industry, setIndustry] = useState('SaaS');
  const [recipientEmail, setRecipientEmail] = useState('john.smith@techcorp.com');
  const [additionalContext, setAdditionalContext] = useState(
    'They are looking to expand their marketing team and improve response rates.',
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendFeedback, setSendFeedback] = useState({ type: '', message: '' });
  const [error, setError] = useState('');

  const isValidEmail = (email) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);

  const handleGenerateMessage = async () => {
    setIsGenerating(true);
    setError('');
    setSendFeedback({ type: '', message: '' });

    try {
      const templateContext = selectedMessage
        ? `Preferred template: ${selectedMessage.template}. Subject style: ${selectedMessage.subject}.`
        : '';

      const data = await messagesService.generateMessage({
        leadName,
        company,
        role,
        industry,
        tone,
        length,
        additionalContext,
        context: templateContext,
      });

      setGeneratedSubject(data?.subject || '');
      setGeneratedText(data?.body || '');
    } catch (err) {
      console.error('Failed to generate AI message:', err);
      setError(
        `Live AI generation is unavailable right now (${err.message || 'request failed'}). Showing a local draft.`,
      );

      const fallbackText = buildLocalFallback({
        tone,
        length,
        leadName,
        company,
        additionalContext,
      });

      setGeneratedSubject(`${company || 'Your team'} outreach idea`);
      setGeneratedText(fallbackText);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = async (text) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      setError('Failed to copy message. Please try again.');
    }
  };

  const handleSendGeneratedEmail = async () => {
    if (!generatedText.trim()) {
      setError('Generate a message before sending.');
      return;
    }

    const email = recipientEmail.trim();
    if (!isValidEmail(email)) {
      setError('Enter a valid recipient email before sending.');
      return;
    }

    setError('');
    setSendFeedback({ type: '', message: '' });
    setIsSending(true);

    const fallbackSubject = `${company || 'Scout'} outreach message`;
    const finalSubject = generatedSubject || fallbackSubject;

    const openMailClientFallback = () => {
      const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(finalSubject)}&body=${encodeURIComponent(generatedText)}`;
      window.location.href = mailtoUrl;
    };

    try {
      const response = await messagesService.sendEmail({
        email,
        subject: finalSubject,
        message: generatedText,
      });

      const sent = response?.result?.success !== false;
      if (sent) {
        setSendFeedback({ type: 'success', message: 'Email sent successfully.' });
      } else {
        const backendMessage = response?.message || 'Email request completed, but delivery failed.';

        if (/not configured|smtp/i.test(backendMessage)) {
          openMailClientFallback();
          setSendFeedback({
            type: 'info',
            message: 'SMTP is not configured on the server. Opened your email app with this draft.',
          });
          return;
        }

        setSendFeedback({
          type: 'error',
          message: backendMessage,
        });
      }
    } catch (err) {
      console.error('Failed to send generated email:', err);

      const errMessage = err?.message || 'request failed';
      if (/not configured|smtp/i.test(errMessage)) {
        openMailClientFallback();
        setSendFeedback({
          type: 'info',
          message: 'SMTP is not configured on the server. Opened your email app with this draft.',
        });
        return;
      }

      setSendFeedback({
        type: 'error',
        message: `Failed to send email (${errMessage}).`,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">AI Message Generator</h1>
        <p className="text-text-secondary">Generate personalized outreach messages powered by AI</p>
      </div>

      {error && (
        <div className="rounded-lg border border-yellow-400/35 bg-yellow-500/10 p-3 text-sm text-yellow-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Input Section */}
          <div className="bg-bg-card border border-border-card rounded-xl p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">Generate Message</h3>

            <div className="space-y-4">
              {/* Tone Selection */}
              <div>
                <label className="block text-text-secondary text-sm font-semibold mb-2">Tone</label>
                <div className="grid grid-cols-3 gap-2">
                  {['professional', 'casual', 'urgent'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        tone === t
                          ? 'bg-accent text-text-inverse'
                          : 'bg-bg-card-hover text-text-secondary hover:bg-border-card'
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Length Selection */}
              <div>
                <label className="block text-text-secondary text-sm font-semibold mb-2">Length</label>
                <div className="grid grid-cols-3 gap-2">
                  {['short', 'medium', 'long'].map((l) => (
                    <button
                      key={l}
                      onClick={() => setLength(l)}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        length === l
                          ? 'bg-accent text-text-inverse'
                          : 'bg-bg-card-hover text-text-secondary hover:bg-border-card'
                      }`}
                    >
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Context Fields */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Lead Name"
                  className="px-4 py-2 bg-bg-card-hover border border-border-card rounded-lg text-text-primary placeholder-text-muted"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Company"
                  className="px-4 py-2 bg-bg-card-hover border border-border-card rounded-lg text-text-primary placeholder-text-muted"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Role"
                  className="px-4 py-2 bg-bg-card-hover border border-border-card rounded-lg text-text-primary placeholder-text-muted"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Industry"
                  className="px-4 py-2 bg-bg-card-hover border border-border-card rounded-lg text-text-primary placeholder-text-muted"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>

              <input
                type="email"
                placeholder="Recipient Email"
                className="w-full px-4 py-2 bg-bg-card-hover border border-border-card rounded-lg text-text-primary placeholder-text-muted"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />

              <textarea
                placeholder="Add additional context..."
                className="w-full px-4 py-2 bg-bg-card-hover border border-border-card rounded-lg text-text-primary placeholder-text-muted h-24 resize-none"
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
              />

              <button
                onClick={handleGenerateMessage}
                disabled={isGenerating}
                className="w-full px-6 py-3 bg-accent hover:bg-accent-hover text-text-inverse font-bold rounded-lg transition"
              >
                {isGenerating ? 'Generating...' : '✨ Generate Message'}
              </button>
            </div>
          </div>

          {/* Generated Message */}
          {generatedText && (
            <div className="bg-bg-card border border-accent/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-text-primary">Generated Message</h3>
                <button
                  onClick={() =>
                    handleCopyToClipboard(
                      generatedSubject
                        ? `Subject: ${generatedSubject}\n\n${generatedText}`
                        : generatedText,
                    )
                  }
                  className="px-3 py-1 bg-bg-card-hover hover:bg-border-card text-text-primary text-sm rounded transition"
                >
                  Copy
                </button>
              </div>

              {generatedSubject && (
                <p className="mb-3 rounded-md bg-bg-card-hover px-3 py-2 text-sm text-text-primary">
                  <span className="mr-1 text-text-muted">Subject:</span>
                  {generatedSubject}
                </p>
              )}

              <p className="text-text-secondary leading-relaxed">{generatedText}</p>

              {sendFeedback.message && (
                <div
                  className={`mt-4 rounded-md border px-3 py-2 text-sm ${
                    sendFeedback.type === 'success'
                      ? 'border-green-400/35 bg-green-500/10 text-green-300'
                      : sendFeedback.type === 'info'
                        ? 'border-blue-400/35 bg-blue-500/10 text-blue-300'
                      : 'border-red-400/35 bg-red-500/10 text-red-300'
                  }`}
                >
                  {sendFeedback.message}
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleGenerateMessage}
                  disabled={isGenerating}
                  className="flex-1 px-3 py-2 bg-bg-card-hover hover:bg-border-card text-text-primary font-semibold rounded-lg transition text-sm"
                >
                  {isGenerating ? 'Generating...' : 'Regenerate'}
                </button>
                <button
                  onClick={handleSendGeneratedEmail}
                  disabled={isSending}
                  className="flex-1 px-3 py-2 bg-accent hover:bg-accent-hover text-text-inverse font-semibold rounded-lg transition text-sm"
                >
                  {isSending ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-bg-card-hover border border-border-card rounded-xl p-6">
            <h4 className="font-semibold text-text-primary mb-3">Tips for Better Results</h4>
            <ul className="text-text-secondary text-sm space-y-2">
              <li>• Provide specific context about the lead or company</li>
              <li>• Use personalization variables like {'{name}'} and {'{company}'}</li>
              <li>• Match the tone to your brand voice</li>
              <li>• Review and edit AI-generated content before sending</li>
            </ul>
          </div>
        </div>

        {/* Templates Sidebar */}
        <div className="bg-bg-card border border-border-card rounded-xl p-6 h-fit">
          <h3 className="text-lg font-bold text-text-primary mb-4">Templates</h3>
          <div className="space-y-2">
            {messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => {
                  setSelectedMessage(msg);
                  setGeneratedSubject(msg.subject);
                  setGeneratedText(msg.body);
                }}
                className={`w-full text-left p-3 rounded-lg transition border ${
                  selectedMessage?.id === msg.id
                    ? 'bg-accent-soft border-accent/50'
                    : 'bg-bg-card-hover border-border-card hover:border-border-strong'
                }`}
              >
                <p className="font-semibold text-text-primary text-sm">{msg.template}</p>
                <p className="text-text-muted text-xs mt-1 line-clamp-1">{msg.subject}</p>
              </button>
            ))}
          </div>

          <button className="w-full mt-4 px-4 py-2 bg-bg-card-hover hover:bg-border-card border border-border-card text-text-primary font-semibold rounded-lg transition text-sm">
            + New Template
          </button>
        </div>
      </div>
    </div>
  );
}
