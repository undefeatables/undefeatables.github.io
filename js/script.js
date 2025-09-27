/* script.js — UI interactions (hamburger, modal, auth buttons, small helpers) */
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const navUl = document.querySelector('nav ul');
  const authModal = document.getElementById('auth-modal');
  const btnLogin = document.getElementById('btn-login');
  const btnLogout = document.getElementById('btn-logout');
  const closeModal = document.getElementById('close-modal');

  // toggle mobile nav
  if (hamburger) {
    hamburger.addEventListener('click', (e) => {
      navUl.classList.toggle('active');
      e.stopPropagation(); // Prevent document click from firing
    });
  }

  // Close nav when clicking outside nav/hamburger (mobile)
  document.addEventListener('click', (e) => {
    if (
      navUl.classList.contains('active') &&
      !navUl.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      navUl.classList.remove('active');
    }
  });

  // open auth modal
  if (btnLogin) btnLogin.addEventListener('click', openAuth);
  if (closeModal) closeModal.addEventListener('click', closeAuth);
  if (btnLogout) btnLogout.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.updateAuthUI && window.updateAuthUI();
    location.reload();
  });

  function openAuth() {
    // Close nav if open
    if (navUl.classList.contains('active')) navUl.classList.remove('active');
    authModal.classList.add('open');
    authModal.setAttribute('aria-hidden', 'false');
  }
  function closeAuth() {
    authModal.classList.remove('open');
    authModal.setAttribute('aria-hidden', 'true');
  }

  // switch forms
  const showSignup = document.getElementById('show-signup');
  const showLogin = document.getElementById('show-login');
  if (showSignup) showSignup.addEventListener('click', (e) => { e.preventDefault(); toggleForms('signup') });
  if (showLogin) showLogin.addEventListener('click', (e) => { e.preventDefault(); toggleForms('login') });

  function toggleForms(which) {
    const login = document.getElementById('login-form');
    const signup = document.getElementById('signup-form');
    const title = document.getElementById('auth-title');
    if (which === 'signup') {
      login.style.display = 'none';
      signup.style.display = 'block';
      title.textContent = 'Create your account';
    } else {
      login.style.display = 'block';
      signup.style.display = 'none';
      title.textContent = 'Login to Undefeatables';
    }
  }

  // basic demo login/signup (calls API endpoints if available)
  const loginSubmit = document.getElementById('login-submit');
  const signupSubmit = document.getElementById('signup-submit');
  if (loginSubmit) loginSubmit.addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-pass').value;
    if (!email || !password) return alert('Provide email and password');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      if (res.ok && json.token) {
        localStorage.setItem('token', json.token);
        window.updateAuthUI && window.updateAuthUI();
        closeAuth();
        location.reload();
      } else alert(json.message || 'Login failed');
    } catch (err) { alert('This is a demo version of site.') }
  });

  if (signupSubmit) signupSubmit.addEventListener('click', async () => {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-pass').value;
    if (!name || !email || !password) return alert('Complete all fields');
    try {
      const res = await fetch('/api/auth/signup', { // <-- change here
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const json = await res.json();
      if (res.ok && json.token) {
        localStorage.setItem('token', json.token);
        window.updateAuthUI && window.updateAuthUI();
        closeAuth();
        location.reload();
      } else alert(json.message || 'Signup failed');
    } catch (err) { alert('This is a demo version of site.') }
  });

  // close modal when clicking outside card
  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) closeAuth();
    });
  }
});


