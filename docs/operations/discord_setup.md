# Discord Notification Setup Guide

This guide walks you through setting up Discord webhook notifications for the Ghost Factory automation pipeline.

## Overview

The factory sends Discord notifications when:
- ✅ Build completes successfully (SUCCESS)
- ⚠️ QA fails or finds issues (QA_FAILED)
- ⚠️ Build completes but QA couldn't run (WARNING)

## Step 1: Create a Discord Webhook

### 1.1 Open Discord Server Settings

1. Open your Discord server
2. Click on **Server Settings** (gear icon next to server name)
3. Navigate to **Integrations** in the left sidebar
4. Click **Webhooks** in the submenu
5. Click **New Webhook**

### 1.2 Configure the Webhook

1. **Name**: Set a descriptive name (e.g., "Factory Manager" or "Ghost Factory Notifications")
2. **Channel**: Select the channel where you want notifications to appear
3. **Copy Webhook URL**: Click **Copy Webhook URL** - you'll need this in the next step
4. Click **Save Changes**

> ⚠️ **Security Note**: Keep your webhook URL secret! Anyone with this URL can send messages to your Discord channel. Never commit it to version control.

## Step 2: Configure Environment Variable

### 2.1 Create `.env` File

1. In the project root, create a file named `.env` (if it doesn't exist)
2. Copy the template from `.env.example`:

```bash
cp .env.example .env
```

### 2.2 Add Your Webhook URL

Open `.env` and add your Discord webhook URL:

```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
```

Replace `YOUR_WEBHOOK_ID` and `YOUR_WEBHOOK_TOKEN` with the actual values from your webhook URL.

### 2.3 Verify `.env` is Ignored

The `.env` file should already be in `.gitignore` to prevent committing secrets. Verify it's listed there.

## Step 3: Test the Integration

### 3.1 Test with Python Script

You can test the webhook by running this quick test:

```python
import os
import requests
from dotenv import load_dotenv

load_dotenv()
webhook_url = os.getenv("DISCORD_WEBHOOK_URL")

if webhook_url:
    response = requests.post(webhook_url, json={
        "username": "Factory Manager",
        "content": "🧪 Test notification from Ghost Factory"
    })
    print(f"Status: {response.status_code}")
    if response.status_code == 204:
        print("✅ Webhook is working!")
    else:
        print(f"❌ Error: {response.text}")
else:
    print("❌ DISCORD_WEBHOOK_URL not set in .env")
```

### 3.2 Test with Factory Pipeline

The webhook will automatically be tested when the factory processes a client build. Check your Discord channel for notifications.

## Step 4: Notification Format

Notifications appear as rich embeds with:

- **Title**: Status emoji + client name (e.g., "🚀 Build Ready: acme-corp")
- **Description**: Brief status message
- **Color**: 
  - 🟢 Green (5763719) for SUCCESS
  - 🔴 Red (15548997) for QA_FAILED
  - 🟠 Orange (16776960) for WARNING
- **Fields**:
  - Location: Path to client files
  - Report Details: QA report (if available, truncated to 900 chars)

## Troubleshooting

### No Notifications Appearing

1. **Check `.env` file exists** and contains `DISCORD_WEBHOOK_URL`
2. **Verify webhook URL is correct** - it should start with `https://discord.com/api/webhooks/`
3. **Check factory logs** - look for Discord-related warnings or errors
4. **Test webhook manually** - use the test script above or send a POST request to your webhook URL

### Common Error Messages

- **"DISCORD_WEBHOOK_URL not set"**: Add the webhook URL to your `.env` file
- **"Discord webhook not found (404)"**: Webhook URL is invalid or webhook was deleted
- **"Discord webhook unauthorized (401)"**: Webhook token is incorrect
- **"Discord webhook request timed out"**: Network issue or Discord is down

### Webhook Not Working?

1. **Regenerate webhook**: Delete the old webhook and create a new one
2. **Check channel permissions**: Ensure the webhook has permission to send messages
3. **Verify URL format**: Should be `https://discord.com/api/webhooks/[ID]/[TOKEN]`

## Optional: Multiple Webhooks

If you want notifications in multiple channels, you can:

1. Create multiple webhooks (one per channel)
2. Modify `send_discord_alert()` in `automation/factory.py` to send to multiple URLs
3. Or use a Discord bot with more advanced features

## Security Best Practices

- ✅ Never commit `.env` to version control
- ✅ Regenerate webhook if URL is accidentally exposed
- ✅ Use separate webhooks for different environments (dev/prod)
- ✅ Regularly rotate webhook tokens
- ✅ Monitor webhook usage in Discord server settings

