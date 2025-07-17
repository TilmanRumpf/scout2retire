import supabase from './supabaseClient';

// Email notification utilities

/**
 * Send invitation email via Supabase Edge Function
 * Note: This requires setting up a Supabase Edge Function for sending emails
 */
export const sendInvitationEmail = async (toEmail, fromUser, invitationMessage) => {
  try {
    // First, check if we have an edge function set up
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: toEmail,
        subject: `${fromUser.full_name || fromUser.email} invited you to Scout2Retire`,
        template: 'friend_invitation',
        templateData: {
          fromName: fromUser.full_name || fromUser.email.split('@')[0],
          fromEmail: fromUser.email,
          personalMessage: invitationMessage || '',
          inviteLink: `${window.location.origin}/signup?invite_from=${fromUser.id}`,
          appName: 'Scout2Retire'
        }
      }
    });

    if (error) {
      console.error('Error sending invitation email:', error);
      
      // If edge function doesn't exist, provide fallback
      if (error.message?.includes('Function not found')) {
        console.log('Email function not set up. To enable emails, create a Supabase Edge Function.');
        return { 
          success: false, 
          error: 'Email notifications not configured. The invitation was saved but no email was sent.' 
        };
      }
      
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Error in sendInvitationEmail:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Alternative: Send email using Supabase Auth (if configured)
 * This uses Supabase's built-in auth email system
 */
export const sendInvitationEmailViaAuth = async (toEmail, fromUser, invitationMessage) => {
  try {
    // This approach uses a magic link that will create an account if needed
    const inviteUrl = `${window.location.origin}/signup?invite_from=${fromUser.id}&message=${encodeURIComponent(invitationMessage || '')}`;
    
    // Log the invite for now (in production, this would send an actual email)
    console.log('Invitation email would be sent to:', toEmail);
    console.log('From:', fromUser.full_name || fromUser.email);
    console.log('Message:', invitationMessage);
    console.log('Invite link:', inviteUrl);
    
    // Return success but indicate email wasn't actually sent
    return {
      success: true,
      emailSent: false,
      message: 'Invitation saved. Email notifications require additional setup.',
      inviteUrl
    };
  } catch (err) {
    console.error('Error preparing invitation email:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Create email HTML template for invitations
 */
export const createInvitationEmailHtml = (fromName, personalMessage, inviteLink) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>You're invited to Scout2Retire</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #8fbc8f; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f4f4f4; }
          .button { display: inline-block; padding: 12px 24px; background-color: #8fbc8f; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .message { background-color: white; padding: 15px; border-left: 4px solid #8fbc8f; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>You're invited to Scout2Retire!</h1>
          </div>
          <div class="content">
            <p>Hi there,</p>
            <p><strong>${fromName}</strong> has invited you to join Scout2Retire, a personalized retirement planning platform that helps you discover your perfect retirement destination.</p>
            
            ${personalMessage ? `
              <div class="message">
                <p><strong>Personal message from ${fromName}:</strong></p>
                <p>${personalMessage}</p>
              </div>
            ` : ''}
            
            <p>Scout2Retire helps you:</p>
            <ul>
              <li>Discover retirement destinations that match your lifestyle preferences</li>
              <li>Connect with like-minded people planning their retirement</li>
              <li>Compare different locations based on cost, climate, culture, and more</li>
              <li>Plan visits and make informed decisions about your retirement</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${inviteLink}" class="button">Accept Invitation</a>
            </div>
            
            <p>Join ${fromName} and start planning your perfect retirement today!</p>
          </div>
          <div class="footer">
            <p>© 2024 Scout2Retire. All rights reserved.</p>
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};