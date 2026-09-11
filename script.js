
const degree = document.querySelector('#degree');
const stage = document.querySelector('#stage');
const language = document.querySelector('#language');
const result = document.querySelector('#route-result');
const form = document.querySelector('#student-enquiry-form');

function showRoute() {
  if (!degree || !language || !result) return;

  const isBachelor = degree.value === 'bachelor';

  const languageNote =
    language.value === 'German-taught'
      ? 'Build your German-language plan into the first phase.'
      : 'Compare course language requirements before building your shortlist.';

  const checkpoints = isBachelor
    ? [
        'Check whether your Class 12 qualification enables direct entry or Studienkolleg.',
        'Map language and entrance requirements for your intended subject.',
        'Start APS, programme research and intake planning early.'
      ]
    : [
        'Check course-specific credits and academic fit—not only your overall score.',
        'Shortlist public and private options with tuition and city-cost trade-offs visible.',
        'Start APS, language documents and application timeline early.'
      ];

  result.innerHTML = `
    <strong>${isBachelor ? "Your Bachelor's" : "Your Master's"} starting checkpoints</strong>
    <ol>
      ${checkpoints.map(item => `<li>${item}</li>`).join('')}
    </ol>
    <p>${languageNote}</p>
  `;

  result.classList.add('show');
}

function setFieldError(input, message) {
  const error = document.querySelector(`[data-error-for="${input.id}"]`);
  input.classList.add('invalid');

  if (error) {
    error.textContent = message;
    error.classList.add('show');
  }
}

function clearFieldError(input) {
  const error = document.querySelector(`[data-error-for="${input.id}"]`);
  input.classList.remove('invalid');

  if (error) error.classList.remove('show');
}

function validateForm() {
  if (!form) return false;

  const name = document.querySelector('#full-name');
  const email = document.querySelector('#email');
  const phone = document.querySelector('#phone');
  const consent = document.querySelector('#consent');

  let valid = true;

  [name, email, phone].forEach(clearFieldError);

  const cleanName = name.value.trim();
  const cleanEmail = email.value.trim();
  const cleanPhone = phone.value.replace(/[\s()-]/g, '');

  if (cleanName.length < 2) {
    setFieldError(name, 'Please enter at least 2 characters.');
    valid = false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
    setFieldError(email, 'Please enter a valid email address.');
    valid = false;
  }

  if (!/^\+?\d{10,15}$/.test(cleanPhone)) {
    setFieldError(phone, 'Enter a valid phone number with 10–15 digits.');
    valid = false;
  }

  if (!consent.checked) {
    const message = document.querySelector('#form-message');
    message.textContent = 'Please accept the consent checkbox before submitting.';
    message.className = 'form-message error';
    valid = false;
  }

  return valid;
}

async function submitEnquiry() {
  const config = window.DEUTSCHYATRA_SUPABASE || {};

  const submitted = {
    full_name: document.querySelector('#full-name').value.trim(),
    email: document.querySelector('#email').value.trim().toLowerCase(),
    phone: document.querySelector('#phone').value.trim(),
    degree_goal: degree.value,
    academic_stage: stage.value,
    preferred_language: language.value,
    consent_given: document.querySelector('#consent').checked,
    source_page: window.location.pathname,
    profile_snapshot: {
      degree_goal: degree.value,
      academic_stage: stage.value,
      preferred_language: language.value
    }
  };

  if (
    !config.url ||
    config.url.includes('YOUR_') ||
    !config.publishableKey ||
    config.publishableKey.includes('YOUR_')
  ) {
    throw new Error("DeutschYatra's Supabase connection has not been configured yet.");
  }

  const response = await fetch(
    `${config.url.replace(/\/$/, '')}/rest/v1/student_submissions`,
    {
      method: 'POST',
      headers: {
        apikey: config.publishableKey,
        Authorization: `Bearer ${config.publishableKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(submitted)
    }
  );

  if (!response.ok) {
    throw new Error('We could not save your enquiry. Please try again.');
  }
}

if (form) {
  form.addEventListener('submit', async event => {
    event.preventDefault();

    const button = document.querySelector('#route-button');
    const message = document.querySelector('#form-message');

    message.textContent = '';
    message.className = 'form-message';

    if (!validateForm()) {
      showRoute();
      return;
    }

    showRoute();

    button.disabled = true;
    button.innerHTML = '<span class="spinner" aria-hidden="true"></span> Saving your route…';

    try {
      await submitEnquiry();

      message.textContent = 'Saved successfully. Your study enquiry is with the DeutschYatra team.';
      message.className = 'form-message success';

      result.insertAdjacentHTML(
        'beforeend',
        '<p><strong>Saved.</strong> Your study enquiry is with the DeutschYatra team.</p>'
      );
    } catch (error) {
      message.textContent = error.message;
      message.className = 'form-message error';

      result.insertAdjacentHTML(
        'beforeend',
        `<p><strong>Note:</strong> ${error.message}</p>`
      );
    } finally {
      button.disabled = false;
      button.innerHTML = 'Save my route & show checkpoints <i data-lucide="arrow-right"></i>';

      if (window.lucide) lucide.createIcons();
    }
  });
}

document.querySelectorAll('[data-route]').forEach(button => {
  button.addEventListener('click', () => {
    if (!degree) return;

    degree.value = button.dataset.route;

    const builder = document.querySelector('#route-builder');

    if (builder) {
      builder.scrollIntoView({ behavior: 'smooth' });
      setTimeout(showRoute, 450);
    }
  });
});

let masters = false;

const budgetToggle = document.querySelector('#budget-toggle');
const budgetEur = document.querySelector('#budget-eur');
const budgetInr = document.querySelector('#budget-inr');

if (budgetToggle && budgetEur && budgetInr) {
  budgetToggle.addEventListener('click', () => {
    masters = !masters;

    budgetEur.textContent = masters
      ? '€14,500–€19,500'
      : '€14,500–€18,500';

    budgetInr.textContent = masters
      ? 'Approx. ₹13.1–17.6 lakh*'
      : 'Approx. ₹13.1–16.7 lakh*';

    budgetToggle.innerHTML = masters
      ? 'Switch to Bachelor’s estimate <i data-lucide="arrow-right"></i>'
      : 'Switch to Master’s estimate <i data-lucide="arrow-right"></i>';

    if (window.lucide) lucide.createIcons();
  });
}

document.querySelectorAll('#student-enquiry-form input, #student-enquiry-form select').forEach(input => {
  input.addEventListener('input', () => clearFieldError(input));
  input.addEventListener('change', () => clearFieldError(input));
});

if (window.lucide) {
  lucide.createIcons();
}
