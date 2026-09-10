/* ═══════════════════════════════════════════════════════
   Spark — contact form
   ═══════════════════════════════════════════════════════ */

/* Where submissions go.
   ─ Leave empty and the form composes a mail-client draft,
     which works with no backend at all.
   ─ Set it to a form service (Formspree, Basin, a Worker,
     …) and the form POSTs JSON there instead.            */
const FORM_ENDPOINT = '';
const FALLBACK_EMAIL = 'shellylyf@gmail.com';

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

/* No endpoint configured → hand off to the visitor's mail client */
function mailtoFallback(data) {
  const body = [
    `Name:  ${data.name}`,
    `Email: ${data.email}`,
    data.phone ? `Phone: ${data.phone}` : null,
    '',
    data.message,
  ].filter(Boolean).join('\n');

  window.location.href =
    `mailto:${FALLBACK_EMAIL}` +
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
    errorEl.textContent = 'Something went wrong sending that. Please try again, or email ' + FALLBACK_EMAIL + '.';
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
