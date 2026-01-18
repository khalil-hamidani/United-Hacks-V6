"""
Email service for sending Legacy Vault notifications
Uses Gmail SMTP for demo purposes
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List
from jinja2 import Template

from app.core.config import settings

# Gmail SMTP Configuration
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = settings.SMTP_USER
SMTP_PASSWORD = settings.SMTP_PASSWORD
FROM_EMAIL = SMTP_USER
FROM_NAME = "I Am Only Human"


def send_legacy_release_email(
    recipient_email: str,
    recipient_name: str,
    user_name: str,
    days_overdue: int,
    legacy_items: List[dict],
    obligations: List[dict] = None,
) -> bool:
    """
    Send Legacy Vault release email to a recipient

    Args:
        recipient_email: Recipient's email address
        recipient_name: Recipient's name
        user_name: Name of the person who passed
        days_overdue: How many days overdue
        legacy_items: List of decrypted legacy items
        obligations: Optional list of financial obligations

    Returns:
        bool: True if sent successfully
    """
    try:
        # Validate SMTP credentials
        if not SMTP_USER or not SMTP_PASSWORD:
            print("SMTP credentials not configured")
            return False

        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"A message from {user_name}"
        msg["From"] = f"{FROM_NAME} <{FROM_EMAIL}>"
        msg["To"] = recipient_email

        # Generate email content
        html_content = generate_html_email(
            recipient_name, user_name, days_overdue, legacy_items, obligations
        )
        text_content = generate_text_email(
            recipient_name, user_name, days_overdue, legacy_items, obligations
        )

        # Attach both versions
        part1 = MIMEText(text_content, "plain")
        part2 = MIMEText(html_content, "html")
        msg.attach(part1)
        msg.attach(part2)

        # Send email
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)

        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False


def generate_html_email(
    recipient_name: str,
    user_name: str,
    days_overdue: int,
    legacy_items: List[dict],
    obligations: List[dict] = None,
) -> str:
    """Generate beautiful, emotionally resonant HTML email"""

    template = Template(
        """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #0f0f23;
            color: #e5e5e5;
        }
        .container {
            max-width: 650px;
            margin: 40px auto;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }
        .header {
            background: linear-gradient(135deg, #5B21B6 0%, #7c3aed 50%, #a78bfa 100%);
            padding: 50px 40px;
            text-align: center;
            position: relative;
        }
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="rgba(255,255,255,0.03)"/></svg>');
            opacity: 0.3;
        }
        .header h1 {
            margin: 0 0 12px 0;
            color: white;
            font-size: 32px;
            font-weight: 300;
            letter-spacing: -0.5px;
            position: relative;
        }
        .header-subtitle {
            color: rgba(255, 255, 255, 0.85);
            font-size: 15px;
            font-weight: 300;
            position: relative;
        }
        .content {
            padding: 45px 40px;
        }
        .greeting {
            font-size: 20px;
            color: #e5e5e5;
            margin-bottom: 24px;
            font-weight: 300;
        }
        .intro {
            font-size: 16px;
            line-height: 1.8;
            color: #cbd5e1;
            margin-bottom: 32px;
            padding: 24px;
            background: rgba(139, 92, 246, 0.08);
            border-left: 3px solid #8b5cf6;
            border-radius: 8px;
        }
        .intro strong {
            color: #a78bfa;
            font-weight: 500;
        }
        .section-title {
            font-size: 18px;
            font-weight: 500;
            color: #a78bfa;
            margin: 40px 0 20px 0;
            padding-bottom: 12px;
            border-bottom: 2px solid rgba(139, 92, 246, 0.2);
        }
        .message-card {
            background: rgba(139, 92, 246, 0.06);
            border: 1px solid rgba(139, 92, 246, 0.25);
            border-radius: 12px;
            padding: 28px;
            margin: 24px 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        .message-title {
            font-size: 18px;
            font-weight: 500;
            color: #c4b5fd;
            margin-bottom: 16px;
        }
        .message-content {
            font-size: 16px;
            line-height: 1.8;
            color: #e2e8f0;
            white-space: pre-wrap;
            margin-bottom: 20px;
        }
        .message-signature {
            font-size: 15px;
            color: #94a3b8;
            font-style: italic;
            text-align: right;
            padding-top: 12px;
            border-top: 1px solid rgba(148, 163, 184, 0.2);
        }
        .obligations-section {
            margin-top: 40px;
            padding: 32px;
            background: rgba(234, 179, 8, 0.06);
            border: 1px solid rgba(234, 179, 8, 0.25);
            border-radius: 12px;
        }
        .obligations-intro {
            font-size: 15px;
            line-height: 1.7;
            color: #cbd5e1;
            margin-bottom: 24px;
        }
        .obligation-item {
            background: rgba(234, 179, 8, 0.08);
            border: 1px solid rgba(234, 179, 8, 0.3);
            border-radius: 8px;
            padding: 20px;
            margin: 16px 0;
        }
        .obligation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }
        .obligation-creditor {
            font-size: 17px;
            font-weight: 500;
            color: #fef3c7;
        }
        .obligation-amount {
            font-size: 20px;
            font-weight: 600;
            color: #fbbf24;
            font-family: 'Courier New', monospace;
        }
        .obligation-details {
            font-size: 14px;
            color: #cbd5e1;
            line-height: 1.6;
            margin-top: 8px;
        }
        .obligation-detail-row {
            margin: 6px 0;
        }
        .obligation-label {
            color: #94a3b8;
            font-weight: 500;
        }
        .footer {
            padding: 32px 40px;
            text-align: center;
            font-size: 13px;
            color: #64748b;
            background: rgba(0, 0, 0, 0.2);
            border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .footer-note {
            margin-top: 12px;
            font-size: 12px;
            color: #475569;
        }
        @media only screen and (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            .header, .content, .footer {
                padding: 30px 24px;
            }
            .obligations-section {
                padding: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{ user_name }}</h1>
            <div class="header-subtitle">left you something important</div>
        </div>
        
        <div class="content">
            <div class="greeting">Dear {{ recipient_name }},</div>
            
            <div class="intro">
                This message reaches you because <strong>{{ user_name }}</strong> chose you as someone they trust deeply. 
                They haven't been present for a long time, and it's likely they may no longer be with us. What follows are the words and wishes they wanted you to receive.
            </div>
            
            <div class="section-title">Their Messages to You</div>
            
            {% for item in legacy_items %}
            <div class="message-card">
                <div class="message-title">{{ item.title }}</div>
                <div class="message-content">{{ item.content }}</div>
                <div class="message-signature">— {{ user_name }}</div>
            </div>
            {% endfor %}
            
            {% if obligations %}
            <div class="obligations-section">
                <div class="section-title" style="color: #fbbf24; border-color: rgba(234, 179, 8, 0.3);">Financial Obligations</div>
                <div class="obligations-intro">
                    {{ user_name }} wanted to ensure you were aware of these financial matters. 
                    They trusted you to handle this information with care.
                </div>
                {% for obligation in obligations %}
                <div class="obligation-item">
                    <div class="obligation-header">
                        <span class="obligation-creditor">I owe {{ obligation.creditor_name }}: </span>
                        <span class="obligation-amount"> ${{"%.2f"|format(obligation.amount)}}</span>
                    </div>
                    <div class="obligation-details">
                        {% if obligation.due_date %}
                        <div class="obligation-detail-row">
                            <span class="obligation-label">Due Date:</span> {{ obligation.due_date }}
                        </div>
                        {% endif %}
                        {% if obligation.description %}
                        <div class="obligation-detail-row">
                            <span class="obligation-label">Details:</span> {{ obligation.description }}
                        </div>
                        {% endif %}
                    </div>
                </div>
                {% endfor %}
            </div>
            {% endif %}
        </div>
        
        <div class="footer">
            <div>This message was sent by <strong>I Am Only Human</strong></div>
            <div class="footer-note">A service for preserving what matters most when we're no longer here</div>
        </div>
    </div>
</body>
</html>
    """
    )

    return template.render(
        recipient_name=recipient_name,
        user_name=user_name,
        days_overdue=days_overdue,
        legacy_items=legacy_items,
        obligations=obligations or [],
    )


def generate_text_email(
    recipient_name: str,
    user_name: str,
    days_overdue: int,
    legacy_items: List[dict],
    obligations: List[dict] = None,
) -> str:
    """Generate emotionally resonant plain text email fallback"""

    lines = [
        f"A MESSAGE FROM {user_name.upper()}",
        "=" * 60,
        "",
        f"Dear {recipient_name},",
        "",
        f"This message reaches you because {user_name} chose you as someone they",
        f"trust deeply. They haven't been present for {days_overdue} day{'s' if days_overdue != 1 else ''},",
        "and it's likely they may no longer be with us. What follows are the",
        "words and wishes they wanted you to receive.",
        "",
        "=" * 60,
        "THEIR MESSAGES TO YOU",
        "=" * 60,
        "",
    ]

    for item in legacy_items:
        lines.extend(
            [
                f"┌─ {item['title']} " + "─" * (56 - len(item["title"])),
                "│",
                *[f"│ {line}" for line in item["content"].split("\n")],
                "│",
                f"└─ {user_name}",
                "",
            ]
        )

    if obligations:
        lines.extend(
            [
                "=" * 60,
                "FINANCIAL OBLIGATIONS",
                "=" * 60,
                "",
                f"{user_name} wanted to ensure you were aware of these financial",
                "matters. They trusted you to handle this information with care.",
                "",
            ]
        )
        for obligation in obligations:
            lines.append(
                f"\n• {obligation['creditor_name']}: ${obligation['amount']:.2f}"
            )
            if obligation.get("due_date"):
                lines.append(f"  Due Date: {obligation['due_date']}")
            if obligation.get("description"):
                lines.append(f"  Details: {obligation['description']}")
            lines.append("")

    lines.extend(
        [
            "=" * 60,
            "",
            "This message was sent by I Am Only Human",
            "A service for preserving what matters most when we're no longer here",
            "",
        ]
    )

    return "\n".join(lines)
