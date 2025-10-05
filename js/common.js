/* common.js
   Injects header/nav/footer + auth modal.
   Also provides token helpers and subscription badge update.
   Place this file at /js/common.js
*/
(function () {
  const basePath = ''; // use if hosting frontend elsewhere

  const headerHTML = `
    <div class="container header-wrap">
      <div class="brand">
        <a href="https://undefeatables.in"><img src="https://undefeatables.in/assets/logo-u.png" alt="Undefeatables logo" /></a>
        <div>
          <h2>UNDEFEATABLES</h2>
          <p>Limitless. Fearless. Undefeatable.</p>
        </div>
      </div>

      <div style="display:flex;align-items:center;gap:1rem">
        <nav>
          <ul id="main-nav">
            <li><a href="https://undefeatables.in">Home</a></li>
            <li><a href="https://undefeatables.in/videos">Videos</a></li>
            <li><a href="https://undefeatables.in/creators">Creators</a></li>
            <li><a href="https://undefeatables.in/about">About</a></li>
            <li><a href="https://undefeatables.in/contact">Contact</a></li>
            <li><a href="https://undefeatables.in/dashboard" id="dashboard-nav">Dashboard</a></li>
        <div class="actions">
          <span id="sub-badge" class="sub-badge" title="Subscription status"></span>
          <button id="btn-login" class="btn">Login / Signup</button>
          <button id="btn-logout" class="btn ghost" style="display:none">Logout</button>
          </div>
          </ul>
          <div class="hamburger" id="hamburger" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
      </div>
      </nav>
    </div>
  `;

  const footerHTML = `
    <footer class="site-footer">
      <div class="container">
        © ${new Date().getFullYear()} Undefeatables • Built for learners and creators.
      </div>
    </footer>
  `;

  // auth modal (login/signup)
  const modalHTML = `
    <div id="auth-modal" class="modal" aria-hidden="true">
      <div class="auth-card">
        <button id="close-modal" style="float:right;border:none;background:transparent;color:#fff;font-size:20px;cursor:pointer">×</button>
        <h3 id="auth-title">Login to Undefeatables</h3>

        <div id="login-form" style="display:block">
          <div class="input-row">
            <label class="small">Email</label>
            <input id="login-email" type="email" placeholder="you@domain.com" required />
          </div>
          <div class="input-row">
            <label class="small">Password</label>
            <input id="login-pass" type="password" placeholder="••••••••" required />
          </div>
          <div style="display:flex;gap:.6rem;align-items:center;justify-content:space-between">
            <button id="login-submit" class="btn">Login</button>
            <a id="show-signup" class="small" href="#">Create an account</a>
          </div>
        </div>

        <div id="signup-form" style="display:none">
          <div class="input-row">
            <label class="small">Full name</label>
            <input id="signup-name" type="text" placeholder="Your full name" required />
          </div>
          <div class="input-row">
            <label class="small">Email</label>
            <input id="signup-email" type="email" placeholder="you@domain.com" required />
          </div>
          <div class="input-row">
            <label class="small">Create password</label>
            <input id="signup-pass" type="password" placeholder="At least 6 characters" minlength="6" required />
          </div>
          <div style="display:flex;gap:.6rem;align-items:center;justify-content:space-between">
            <button id="signup-submit" class="btn">Create account</button>
            <a id="show-login" class="small" href="#">Already have account</a>
          </div>
        </div>

      </div>
    </div>
  `;

  // inject
  document.addEventListener('DOMContentLoaded', () => {
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    document.body.insertAdjacentHTML('beforeend', footerHTML);
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    // load script handlers from script.js (will run separately)
    updateAuthUI();
    document.dispatchEvent(new Event('layout:ready'));
  });

  // token helpers
  window.auth = {
    getToken() { return localStorage.getItem('token') },
    setToken(t) { if (t) localStorage.setItem('token', t); else localStorage.removeItem('token') },
    isLoggedIn() { return !!localStorage.getItem('token') }
  };

  async function updateAuthUI(){
    const token = window.auth.getToken();
    const loginBtn = document.getElementById('btn-login');
    const logoutBtn = document.getElementById('btn-logout');
    const subBadge = document.getElementById('sub-badge');
    const dashNav = document.getElementById('dashboard-nav'); // Add this line

    if (token) {
      loginBtn.style.display = 'none';
      logoutBtn.style.display = 'inline-block';
      if (dashNav) dashNav.style.display = 'inline-block'; // Show dashboard when logged in
      try {
        const res = await fetch('/api/subscription/status', { headers: { Authorization: 'Bearer ' + token } });
        const json = await res.json();
        if (res.ok && json.active) {
          subBadge.textContent = 'Subscribed ✓';
        } else {
          subBadge.textContent = 'Inactive';
        }
      } catch (e) {
        subBadge.textContent = 'Inactive';
      }
    } else {
      loginBtn.style.display = 'inline-block';
      logoutBtn.style.display = 'none';
      subBadge.textContent = 'Inactive';
      if (dashNav) dashNav.style.display = 'none'; // Hide dashboard when not logged in
    }
  }

  // Expose update for script.js to call after login/logout
  window.updateAuthUI = updateAuthUI;

})();



