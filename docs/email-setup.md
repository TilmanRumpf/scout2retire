# Email Notification Setup for Scout2Retire

## Overview
Scout2Retire needs email functionality for sending friend invitations. This guide explains how to set up email notifications using Supabase Edge Functions.

## Option 1: Supabase Edge Functions with Resend (Recommended)

### Step 1: Set up Resend Account
1. Sign up for a free account at [Resend.com](https://resend.com)
2. Verify your domain or use their testing domain
3. Get your API key from the dashboard

### Step 2: Create Supabase Edge Function
1. In your Supabase dashboard, go to "Edge Functions"
2. Create a new function called `send-email`
3. Add this code:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const handler = async (req: Request): Promise<Response> => {
  try {
    const { to, subject, template, templateData } = await req.json()
    
    // Create HTML content based on template
    let html = ''
    
    if (template === 'friend_invitation') {
      html = `
        <h2>You're invited to Scout2Retire!</h2>
        <p><strong>${templateData.fromName}</strong> has invited you to join Scout2Retire.</p>
        ${templateData.personalMessage ? `
          <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #8fbc8f;">
            <p><strong>Personal message:</strong></p>
            <p>${templateData.personalMessage}</p>
          </div>
        ` : ''}
        <p>
          <a href="${templateData.inviteLink}" style="display: inline-block; padding: 12px 24px; background-color: #8fbc8f; color: white; text-decoration: none; border-radius: 5px;">
            Accept Invitation
          </a>
        </p>
      `
    }
    
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Scout2Retire <notifications@yourdomain.com>',
        to: [to],
        subject: subject,
        html: html,
      }),
    })
    
    const data = await res.json()
    
    if (res.ok) {
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    } else {
      throw new Error(data.message || 'Failed to send email')
    }
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
}

serve(handler)
```

### Step 3: Set Environment Variable
1. In Supabase dashboard, go to "Edge Functions" → "Settings"
2. Add environment variable: `RESEND_API_KEY` = your Resend API key

### Step 4: Deploy the Function
```bash
supabase functions deploy send-email
```

## Option 2: Using Supabase Auth Email Templates

### Step 1: Configure SMTP in Supabase
1. Go to Authentication → Settings → Email Settings
2. Enable custom SMTP
3. Add your SMTP credentials (Gmail, SendGrid, etc.)

### Step 2: Create Database Trigger
Create a PostgreSQL function to send emails when invitations are created:

```sql
-- Create a function to notify about new invitations
CREATE OR REPLACE FUNCTION notify_friend_invitation()
RETURNS TRIGGER AS $$
DECLARE
  sender_email text;
  sender_name text;
  recipient_email text;
BEGIN
  -- Get sender details
  SELECT email, full_name INTO sender_email, sender_name
  FROM auth.users
  WHERE id = NEW.user_id;
  
  -- Get recipient email
  SELECT email INTO recipient_email
  FROM auth.users
  WHERE id = NEW.friend_id;
  
  -- Insert into a notifications queue table
  INSERT INTO email_queue (
    to_email,
    template_type,
    template_data,
    status
  ) VALUES (
    recipient_email,
    'friend_invitation',
    jsonb_build_object(
      'sender_name', COALESCE(sender_name, sender_email),
      'sender_email', sender_email,
      'message', NEW.message,
      'invitation_id', NEW.id
    ),
    'pending'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER on_friend_invitation_created
  AFTER INSERT ON user_connections
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION notify_friend_invitation();

-- Create email queue table
CREATE TABLE IF NOT EXISTS email_queue (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  to_email text NOT NULL,
  template_type text NOT NULL,
  template_data jsonb,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  sent_at timestamp with time zone
);
```

## Option 3: Quick Setup - Using Mailto Links

For immediate functionality without server setup, update the invitation to show a mailto link:

```javascript
// In Chat.jsx, after invitation is created:
const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(
  `${user.full_name || user.email} invited you to Scout2Retire`
)}&body=${encodeURIComponent(
  `Hi!\n\n${user.full_name || user.email} has invited you to join Scout2Retire.\n\n` +
  (inviteMessage ? `Personal message:\n${inviteMessage}\n\n` : '') +
  `Join here: ${window.location.origin}/signup?invite_from=${user.id}\n\n` +
  `Scout2Retire helps you discover your perfect retirement destination!`
)}`;

// Show the link to the user
toast.success(
  <div>
    Invitation saved! 
    <a href={mailtoLink} className="underline ml-2">
      Click here to send email
    </a>
  </div>,
  { duration: 10000 }
);
```

## Testing Email Functionality

1. Check Supabase logs: Dashboard → Logs → Edge Functions
2. Use Resend dashboard to monitor sent emails
3. Check email_queue table if using database approach

## Connecting to Settings Page

The email notification preferences in `/settings` can be used to control which emails users receive:

```javascript
// Check user's email preferences before sending
const { data: userSettings } = await supabase
  .from('user_settings')
  .select('email_notifications')
  .eq('user_id', recipientId)
  .single();

if (userSettings?.email_notifications) {
  // Send the email
}
```