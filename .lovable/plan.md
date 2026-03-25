

# Send Feedback via EmailJS

## What this does
When a user submits feedback in the modal, it will be emailed to **yaniv.loveable@gmail.com** using EmailJS (a free client-side email service).

## Setup required (one-time, ~3 minutes)
You'll need a free EmailJS account:
1. Go to [emailjs.com](https://www.emailjs.com) and sign up
2. **Add an email service** (e.g. Gmail) — this connects EmailJS to your inbox
3. **Create an email template** with these variable placeholders:
   - `{{message}}` — the feedback text
   - `{{to_email}}` — recipient (we'll send `yaniv.loveable@gmail.com`)
4. Note down your **Service ID**, **Template ID**, and **Public Key** (found in Account → API Keys)

## Code changes

| File | Change |
|------|--------|
| `package.json` | Add `@emailjs/browser` dependency |
| `src/components/FeedbackModal.tsx` | Import EmailJS, call `emailjs.send()` on submit with the feedback text, show loading state on the button, handle errors with a toast |

### FeedbackModal changes
- Store EmailJS public key, service ID, and template ID as constants (these are public/safe to store in code)
- On submit: call `emailjs.send(serviceId, templateId, { message: text, to_email: "yaniv.loveable@gmail.com" }, publicKey)`
- Add a loading state to disable the button and show "שולח..." while sending
- On success: show the existing ✓ confirmation
- On error: show a toast error message

