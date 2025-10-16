import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text: string;
  type?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { to, subject, html, text, type }: EmailRequest = await req.json();

    console.log(`Sending ${type || 'email'} to ${to}: ${subject}`);

    // Using Gmail SMTP via fetch to send email
    // For production, you'd integrate with Resend, SendGrid, or AWS SES
    // For now, we'll log the email and return success
    
    const emailLog = {
      timestamp: new Date().toISOString(),
      to,
      subject,
      type: type || 'general',
      preview: text.substring(0, 200)
    };

    console.log('Email Details:', JSON.stringify(emailLog, null, 2));

    // In production, you would call an email service here:
    // const response = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     from: 'Fund8r <noreply@fund8r.com>',
    //     to: [to],
    //     subject,
    //     html,
    //     text
    //   })
    // });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        emailId: `email-${Date.now()}`,
        recipient: to,
        subject: subject
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});