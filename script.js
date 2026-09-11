const degree = document.querySelector('#degree');
const stage = document.querySelector('#stage');
const language = document.querySelector('#language');
const result = document.querySelector('#route-result');
const form = document.querySelector('#student-enquiry-form');

function showRoute() {
  const isBachelor = degree.value === 'bachelor';
  const languageNote = language.value === 'German-taught' ? 'Build your German-language plan into the first phase.' : 'Compare course language requirements before building your shortlist.';
  const checkpoints = isBachelor
    ? ['Check whether your Class 12 qualification enables direct entry or Studienkolleg.', 'Map language and entrance requirements for your intended subject.', 'Start APS, programme research and intake planning early.']
    : ['Check course-specific credits and academic fit—not only your overall score.', 'Shortlist public and private options with tuition and city-cost trade-offs visible.', 'Start APS, language documents and application timeline early.'];
  result.innerHTML = `<strong>${isBachelor ? 'Your Bachelor’s' : 'Your Master’s'} starting checkpoints</strong><ol>${checkpoints.map(item => `<li>${item}</li>`).join('')}</ol><p>${languageNote}</p>`;
  result.classList.add('show');
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
    profile_snapshot: { degree_goal: degree.value, academic_stage: stage.value, preferred_language: language.value }
  };
  if (!config.url || config.url.includes('YOUR_') || !config.publishableKey || config.publishableKey.includes('YOUR_')) {
    throw new Error('DeutschYatra’s Supabase connection has not been configured yet.');
  }
  const response = await fetch(`${config.url.replace(/\/$/, '')}/rest/v1/student_submissions`, {
    method: 'POST',
    headers: {
      apikey: config.publishableKey,
      Authorization: `Bearer ${config.publishableKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(submitted)
  });
  if (!response.ok) throw new Error('We could not save your enquiry. Please try again.');
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  showRoute();
  const button = document.querySelector('#route-button');
  button.disabled = true;
  button.textContent = 'Saving your route…';
  try {
    await submitEnquiry();
    result.insertAdjacentHTML('beforeend', '<p><strong>Saved.</strong> Your study enquiry is with the DeutschYatra team.</p>');
  } catch (error) {
    result.insertAdjacentHTML('beforeend', `<p><strong>Note:</strong> ${error.message}</p>`);
  } finally {
    button.disabled = false;
    button.innerHTML = 'Save my route & show checkpoints <span>→</span>';
  }
});
document.querySelectorAll('[data-route]').forEach(button => button.addEventListener('click', () => {
  degree.value = button.dataset.route;
  document.querySelector('#route-builder').scrollIntoView({behavior:'smooth'});
  setTimeout(showRoute, 450);
}));

let masters = false;
document.querySelector('#budget-toggle').addEventListener('click', () => {
  masters = !masters;
  document.querySelector('#budget-eur').textContent = masters ? '€14,500–€19,500' : '€14,500–€18,500';
  document.querySelector('#budget-inr').textContent = masters ? 'Approx. ₹13.1–17.6 lakh*' : 'Approx. ₹13.1–16.7 lakh*';
  document.querySelector('#budget-toggle').innerHTML = masters ? 'Switch to Bachelor’s estimate <span>→</span>' : 'Switch to Master’s estimate <span>→</span>';
});
