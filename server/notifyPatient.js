const axios = require('axios');

const siteUrl = () =>
  (process.env.SITE_URL || process.env.VERCEL_FRONTEND_URL || 'https://srikamalahospital.online').replace(/\/$/, '');

const toE164In = (phone) => {
  const ten = String(phone || '').replace(/\D/g, '').slice(-10);
  if (ten.length !== 10) return null;
  return { ten, e164: `+91${ten}` };
};

const labReadyMessage = ({ token, testName, patientName }) => {
  const url = `${siteUrl()}/my-care`;
  const name = patientName || 'Patient';
  const test = testName || 'Lab test';
  return (
    `Sri Kamala Hospital: ${name}, your lab report is ready (${test}). Token: ${token}. ` +
    `Open My Care to download: ${url}\n\n` +
    `శ్రీ కమల ఆసుపత్రి: ${name} గారు, మీ ల్యాబ్ రిపోర్ట్ రెడీ (${test}). టోకెన్: ${token}. ` +
    `My Careలో డౌన్‌లోడ్ చేయండి: ${url}`
  );
};

const whatsappClickUrl = (phone, text) => {
  const parsed = toE164In(phone);
  if (!parsed) return null;
  return `https://wa.me/${parsed.e164.replace('+', '')}?text=${encodeURIComponent(text)}`;
};

const twilioSend = async ({ to, from, body }) => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const auth = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !auth || !from || !to) return false;
  const creds = Buffer.from(`${sid}:${auth}`).toString('base64');
  await axios.post(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    new URLSearchParams({ From: from, To: to, Body: body }),
    {
      headers: {
        Authorization: `Basic ${creds}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 12000,
    }
  );
  return true;
};

/**
 * Notify patient that a lab report is ready.
 * Always returns a WhatsApp click-to-chat URL (works without API keys).
 * If Twilio env is set, also sends WhatsApp or SMS automatically.
 */
const notifyLabReportReady = async ({ phone, token, testName, patientName }) => {
  const text = labReadyMessage({ token, testName, patientName });
  const whatsappUrl = whatsappClickUrl(phone, text);
  const parsed = toE164In(phone);
  let sent = false;
  let channel = 'whatsapp_link';

  const fromWa = process.env.TWILIO_WHATSAPP_FROM;
  const fromSms = process.env.TWILIO_FROM || process.env.TWILIO_SMS_FROM;

  try {
    if (parsed && fromWa) {
      const from = fromWa.startsWith('whatsapp:') ? fromWa : `whatsapp:${fromWa}`;
      sent = await twilioSend({ from, to: `whatsapp:${parsed.e164}`, body: text });
      if (sent) channel = 'whatsapp';
    } else if (parsed && fromSms) {
      sent = await twilioSend({ from: fromSms, to: parsed.e164, body: text });
      if (sent) channel = 'sms';
    }
  } catch (err) {
    console.warn('Lab notify send failed:', err.response?.data?.message || err.message);
    sent = false;
    channel = 'whatsapp_link';
  }

  return { sent, channel, whatsappUrl, text };
};

module.exports = { notifyLabReportReady, labReadyMessage, whatsappClickUrl, toE164In };
