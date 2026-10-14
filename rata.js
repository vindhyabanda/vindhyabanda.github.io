// ===== Rata launch page interactions =====

// IMPORTANT: Replace this with your deployed Google Apps Script Web App URL.
// See the setup instructions shared alongside this file for how to create it.
const RATA_WAITLIST_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyjpxzCcANNjkcJE92J6eiNQDVIhwLUZ0cJgDZhxIzWs24PoNpB4Uh1yeMtcZkPeZrlPQ/exec';

// ===== Scroll-triggered fade-in animations =====
const fadeElements = document.querySelectorAll('.fade-in');

const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
};

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

fadeElements.forEach(el => fadeObserver.observe(el));

// ===== Waitlist form handling =====
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setupWaitlistForm(formId, inputId, submitId, messageId) {
    const form = document.getElementById(formId);
    const input = document.getElementById(inputId);
    const submitBtn = document.getElementById(submitId);
    const message = document.getElementById(messageId);

    if (!form || !input || !submitBtn || !message) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = input.value.trim();

        if (!isValidEmail(email)) {
            input.classList.add('rata-input-error');
            message.textContent = 'Please enter a valid email address.';
            message.className = 'rata-form-message rata-error';
            return;
        }

        input.classList.remove('rata-input-error');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Joining...';
        message.textContent = '';
        message.className = 'rata-form-message';

        try {
            if (RATA_WAITLIST_ENDPOINT.includes('REPLACE_WITH_YOUR_DEPLOYMENT_ID')) {
                // Endpoint hasn't been configured yet — surface this clearly instead of
                // silently pretending the submission worked.
                throw new Error('not-configured');
            }

            // Apps Script web apps don't return CORS headers for this simple setup,
            // so we fire the request in no-cors mode and treat it as optimistic success.
            await fetch(RATA_WAITLIST_ENDPOINT, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ email, source: 'rata-launch-page' })
            });

            form.reset();
            message.textContent = "You're on the list! We'll email you when Rata launches.";
            message.className = 'rata-form-message rata-success';
        } catch (err) {
            message.textContent = "Something went wrong. Please try again in a moment.";
            message.className = 'rata-form-message rata-error';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Join the Waitlist';
        }
    });

    input.addEventListener('input', () => {
        input.classList.remove('rata-input-error');
    });
}

setupWaitlistForm('rata-waitlist-form', 'rata-email', 'rata-waitlist-submit', 'rata-form-message');
setupWaitlistForm('rata-waitlist-form-2', 'rata-email-2', 'rata-waitlist-submit-2', 'rata-form-message-2');
