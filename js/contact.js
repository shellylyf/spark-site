/* ═══════════════════════════════════════════════════════
   Spark — contact form
   ═══════════════════════════════════════════════════════ */

/* ── Where submissions go ─────────────────────────────
   Fill in ONE of these to switch the form on.

   FORM_ENDPOINT  a form service (Formspree, Basin, a Worker…).
                  Submissions are POSTed there as JSON. Best option:
                  nothing is exposed and you get a real inbox.

   CONTACT_EMAIL  a plain address. Submitting opens the visitor's
                  mail client with a pre-filled draft, which they
                  then send themselves. No backend needed, but the
                  address ends up publicly visible in this file.

   With both empty the form still validates, then tells the visitor
   it isn't connected yet rather than silently doing nothing.      */
const FORM_ENDPOINT = '';
const CONTACT_EMAIL = '';

const form    = document.getElementById('cform');
const errorEl = document.getElementById('cformError');
const okEl    = document.getElementById('cformOk');
const button  = form.querySelector('.cbtn');

const fieldOf = (input) => input.closest('.field');

const clearMarks = () => {
  form.querySelectorAll('.field.is-bad').forEach(f => f.classList.remove('is-bad'));
  errorEl.hidden = true;
};

/* Return the first problem, or null when everything is fine */
function findProblem() {
  const name    = form.name.value.trim();
  const email   = form.email.value.trim();
  const message = form.message.value.trim();

  if (!name)    return [form.name,    'Please add your name.'];
  if (!email)   return [form.email,   'Please add an email address.'];
  /* deliberately loose: something@something.something */
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                return [form.email,   'That email address looks incomplete.'];
  if (!message) return [form.message, 'Please add a message.'];
  return null;
}

function showProblem([input, text]) {
  fieldOf(input).classList.add('is-bad');
  errorEl.textContent = text;
  errorEl.hidden = false;
  input.focus();
}

/* No endpoint, but an address → hand off to the mail client */
function mailtoFallback(data) {
  const body = [
    `Name:  ${data.name}`,
    `Email: ${data.email}`,
    data.phone ? `Phone: ${data.phone}` : null,
    '',
    data.message,
  ].filter(Boolean).join('\n');

  window.location.href =
    `mailto:${CONTACT_EMAIL}` +
    `?subject=${encodeURIComponent('Spark enquiry from ' + data.name)}` +
    `&body=${encodeURIComponent(body)}`;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMarks();
  okEl.hidden = true;

  const problem = findProblem();
  if (problem) { showProblem(problem); return; }

  const data = {
    name:    form.name.value.trim(),
    email:   form.email.value.trim(),
    phone:   form.phone.value.trim(),
    message: form.message.value.trim(),
  };

  /* Nothing configured yet — say so plainly instead of pretending */
  if (!FORM_ENDPOINT && !CONTACT_EMAIL) {
    errorEl.textContent =
      'This form isn\u2019t connected yet. Please get in touch another way for now.';
    errorEl.hidden = false;
    return;
  }

  if (!FORM_ENDPOINT) {
    mailtoFallback(data);
    okEl.textContent = 'Opening your mail app…';
    okEl.hidden = false;
    return;
  }

  button.disabled = true;
  button.textContent = 'Sending…';

  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Request failed: ' + res.status);

    form.reset();
    okEl.textContent = 'Thanks — your message is on its way.';
    okEl.hidden = false;
  } catch (err) {
    errorEl.textContent = 'Something went wrong sending that. Please try again in a moment.';
    errorEl.hidden = false;
  } finally {
    button.disabled = false;
    button.textContent = 'Send message';
  }
});

/* Clear the red state as soon as the visitor starts fixing it */
form.querySelectorAll('input, textarea').forEach(el =>
  el.addEventListener('input', () => {
    fieldOf(el).classList.remove('is-bad');
    if (![...form.querySelectorAll('.field.is-bad')].length) errorEl.hidden = true;
  })
);
