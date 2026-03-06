import os
import json
import re
import argparse
from dotenv import load_dotenv

# Keep imports light at module import time. The SDK import happens lazily so
# this file can still be imported even when dependencies are missing.

MODEL_CANDIDATES = ["gemini-2.0-flash", "gemini-flash-latest"]
EMAIL_TYPES = ("cold_email", "followup_1", "followup_2", "final_followup")

# ======================================================
# LOAD API KEY FROM .env
# ======================================================

load_dotenv()


# ======================================================
# INITIALIZE GEMINI CLIENT
# ======================================================

def get_client():
    api_key = os.getenv("LLM_API_KEY")
    if not api_key:
        raise ValueError("LLM_API_KEY not found in .env file")

    try:
        from google import genai
    except Exception as exc:
        raise ImportError(
            "google-genai package is not installed. Install with: pip install google-genai"
        ) from exc

    return genai.Client(api_key=api_key)


# ======================================================
# PROMPT BUILDER
# ======================================================

def build_prompt(lead, insights, campaign_context, email_type):

    lead_name = lead.get('name', '')
    first_name = lead_name.split(' ')[0] if lead_name else ''
    email_instruction = ""
    tone_guidance = ""

    if email_type == "cold_email":
        email_instruction = "Write the first cold outreach email. This is the very first time we are reaching out — make a strong, personalized first impression."
        tone_guidance = "Be warm and curious. Reference something specific about their role or industry to show you did your homework. Lead with a relevant pain point, not a product pitch."

    elif email_type == "followup_1":
        email_instruction = "Write a polite first follow-up email. The lead has not replied to the initial outreach."
        tone_guidance = "Be understanding and low-pressure. Add new value (e.g. a relevant insight or stat) rather than just repeating the first email. Keep it shorter than the initial email."

    elif email_type == "followup_2":
        email_instruction = "Write a brief second follow-up email. The lead has not replied to two previous emails."
        tone_guidance = "Be concise and direct. Offer a specific, easy next step (e.g. 'Would a 10-minute call on Thursday work?'). Show respect for their time."

    elif email_type == "final_followup":
        email_instruction = "Write a final follow-up email before closing the outreach loop."
        tone_guidance = "Be graceful and confident. Make it clear this is the last email. Leave the door open without being pushy. A brief 2-3 sentence email works best."

    insight_block = ""
    if insights:
        insight_block = f"\nAI INSIGHTS ABOUT THIS LEAD (use these to personalize):\n{chr(10).join(insights)}\n"

    name_rule = f'Address the recipient as "{first_name}"' if first_name else 'Do NOT use any name greeting — start with a contextual hook instead'
    role_val = lead.get('role', 'their position')
    industry_val = lead.get('industry', 'their field')

    prompt = f"""
{email_instruction}

-------------------------
ABOUT THE RECIPIENT
-------------------------
Name: {first_name or '(not available — do NOT use a placeholder name)'}
Role/Title: {lead.get('role', 'Unknown')}
Seniority: {lead.get('seniority', 'Unknown')}
Company: {lead.get('company_name', 'Unknown')}
Industry: {lead.get('industry', 'Unknown')}
Company Size: {lead.get('company_size', 'Unknown')}
Lead Source: {lead.get('lead_source', 'Unknown')}
Lead Score: {lead.get('lead_score', 'Unknown')}
{insight_block}
-------------------------
WHAT WE OFFER
-------------------------
Team/Sender: {campaign_context.get('team_name', 'Our Team')}
Product: {campaign_context.get('product_name', 'Our Product')}
What it does: {campaign_context.get('product_description', 'A platform to help businesses grow')}
Pain point we solve: {campaign_context.get('pain_point', 'improving efficiency')}
Desired outcome: {campaign_context.get('goal', 'a short introductory call')}

-------------------------
TONE & STYLE
-------------------------
{tone_guidance}

-------------------------
RULES (MUST FOLLOW)
-------------------------
- {name_rule}
- 100-150 words maximum
- Write like a real human, not a bot — vary sentence length, be natural
- NO generic openers like "I hope this email finds you well" or "I wanted to reach out"
- Reference their specific industry ({industry_val}) or role ({role_val}) naturally
- One clear call-to-action at the end
- Sign off with just a first name (use "Best" or "Cheers" — no "Regards" or "Sincerely")
- Return ONLY the email body text — no subject line, no labels, no markdown formatting
"""

    return prompt


# ======================================================
# EMAIL GENERATOR
# ======================================================

def extract_text(response):
    text = getattr(response, "text", None)
    if text:
        return text.strip()

    # Fallback for SDK responses that don't expose `response.text`.
    candidates = getattr(response, "candidates", None) or []
    for candidate in candidates:
        content = getattr(candidate, "content", None)
        parts = getattr(content, "parts", None) or []
        for part in parts:
            part_text = getattr(part, "text", None)
            if part_text:
                return part_text.strip()
    return ""


def is_quota_error(message):
    msg = (message or "").lower()
    return "resource_exhausted" in msg or "quota" in msg or "429" in msg


def get_retry_seconds(message):
    if not message:
        return None
    match = re.search(
        r"retry in ([0-9]+(?:\.[0-9]+)?)s", message, flags=re.IGNORECASE)
    if not match:
        return None
    try:
        return max(0, int(round(float(match.group(1)))))
    except Exception:
        return None


def fallback_email(lead, campaign_context, email_type):
    lead_name = lead.get("name", "")
    first_name = lead_name.split(" ")[0] if lead_name else ""
    company = lead.get("company_name", "your team")
    role = lead.get("role", "team")
    product = campaign_context.get("product_name", "our platform")
    pain = campaign_context.get(
        "pain_point", "improving pipeline visibility").lower()
    goal = campaign_context.get("goal", "a short intro call").lower()
    greeting = f"Hi {first_name}," if first_name else "Hi there,"

    templates = {
        "cold_email": (
            f"{greeting}\n\n"
            f"I came across {company} and noticed your {role} team might be navigating challenges around {pain}. "
            f"We built {product} specifically to help with that — and teams in your space have seen real results.\n\n"
            f"Would you be open to a quick 15-minute chat this week to see if it's a fit?\n\n"
            f"Cheers"
        ),
        "followup_1": (
            f"{greeting}\n\n"
            f"Just circling back on my earlier note. I know things get busy, so I'll keep this short — "
            f"{product} has been helping teams like {company} tackle {pain}, and I think there could be a fit.\n\n"
            f"Worth a brief conversation?\n\n"
            f"Best"
        ),
        "followup_2": (
            f"{greeting}\n\n"
            f"If {pain} is still on your radar this quarter, I'd love to show you how {product} could help your team at {company}. "
            f"Happy to keep it to 10 minutes.\n\n"
            f"Cheers"
        ),
        "final_followup": (
            f"{greeting}\n\n"
            f"This will be my last note — I don't want to clutter your inbox. "
            f"If {product} ever becomes relevant for {company}, I'd be happy to chat. No pressure at all.\n\n"
            f"Wishing you and the team all the best.\n\n"
            f"Best"
        )
    }
    return templates.get(email_type, f"{greeting}\n\nI'd love to connect about how {product} can help {company}. Would you be open to a quick chat?\n\nCheers")


def generate_email(lead, insights, campaign_context, email_type, client):

    prompt = build_prompt(lead, insights, campaign_context, email_type)

    last_error = None
    for model_name in MODEL_CANDIDATES:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt
            )
            email = extract_text(response)
            if email:
                return email, None
            last_error = f"Model '{model_name}' returned an empty response."
        except Exception as exc:
            last_error = str(exc)
            if is_quota_error(last_error):
                retry_in = get_retry_seconds(last_error)
                if retry_in is not None:
                    return (
                        f"Using fallback email template (API quota reached; retry after ~{retry_in}s).",
                        "quota"
                    )
                return "Using fallback email template (API quota reached).", "quota"

    return f"Email generation failed: {last_error}", "error"


# ======================================================
# TEST EXAMPLE
# ======================================================

lead = {
    "role": "Marketing Manager",
    "industry": "AI",
    "company_size": "small",
    "lead_source": "Referral",
    "company_name": "NeuralStack",
    "lead_score": 0.65
}

insights = [
    "Focus messaging on revenue growth and pipeline efficiency.",
    "AI companies respond well to innovation and performance improvements.",
    "Referral leads have high trust; prioritize them early."
]

campaign_context = {
    "team_name": "NodeTorious",
    "product_name": "PipelineIQ",
    "product_description":
    "AI-powered sales intelligence platform that helps teams prioritize leads and automate outreach workflows.",
    "pain_point":
    "Marketing teams struggle to convert leads efficiently and lack visibility into pipeline performance.",
    "goal": "Book a short demo meeting."
}


# ======================================================
# GENERATE OUTREACH SEQUENCE
# ======================================================

def main():
    parser = argparse.ArgumentParser(
        description="Generate outreach emails with Gemini.")
    parser.add_argument(
        "--email-type",
        choices=EMAIL_TYPES,
        default="cold_email",
        help="Generate only one email type (default: cold_email)."
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Generate all email types (uses more API calls)."
    )
    args = parser.parse_args()

    client = get_client()

    emails = {}
    quota_reached = False
    selected_types = EMAIL_TYPES if args.all else (args.email_type,)
    for email_type in selected_types:
        if quota_reached:
            emails[email_type] = fallback_email(
                lead, campaign_context, email_type)
            continue

        generated, status = generate_email(
            lead, insights, campaign_context, email_type, client)
        if status == "quota":
            quota_reached = True
            emails[email_type] = fallback_email(
                lead, campaign_context, email_type)
        else:
            emails[email_type] = generated

    output = {
        "company_name": lead.get("company_name"),
        "lead_role": lead.get("role"),
        "lead_score": lead.get("lead_score"),
        "mode": "all" if args.all else "single",
        "emails": emails
    }
    print(json.dumps(output, indent=4))


if __name__ == "__main__":
    main()


# ======================================================
# SYSTEM INTEGRATION (FOR AUTOMATION PIPELINE)
# ======================================================

"""
def generate_email_sequence(lead):

    score, insights = generate_insights(lead)

    lead["lead_score"] = score

    emails = {
        "cold_email": generate_email(lead, insights, campaign_context, "cold_email"),
        "followup_1": generate_email(lead, insights, campaign_context, "followup_1"),
        "followup_2": generate_email(lead, insights, campaign_context, "followup_2"),
        "final_followup": generate_email(lead, insights, campaign_context, "final_followup")
    }

    return emails
"""
