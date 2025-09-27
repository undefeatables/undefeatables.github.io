/* app.js — page-specific API helpers and Razorpay helper (stub)
   Keep minimal; backend endpoints will be added in Part 3.
*/
// Example: fetch videos for videos.html
async function loadVideos() {
  const grid = document.getElementById("video-grid");
  if (!grid) return;

  const token = localStorage.getItem("token");
  if (!token) {
    // Not logged in: show login/signup popup and hide videos
    grid.innerHTML = `<div style="text-align:center;margin:2rem 0;">
      <button class="btn" onclick="window.openAuth && window.openAuth()">Sign in to view videos</button>
    </div>`;
    return;
  }

  // Check subscription status
  let subscribed = false;
  try {
    const res = await fetch("/api/subscription/status", {
      headers: { Authorization: "Bearer " + token }
    });
    const json = await res.json();
    subscribed = !!json.active;
  } catch {
    grid.innerHTML = `<div style="text-align:center;margin:2rem 0;">
      <p>Could not check subscription status. Try again.</p>
    </div>`;
    return;
  }

  // Fetch videos
  let videos = [];
  try {
    const res = await fetch("/api/videos", {
      headers: { Authorization: "Bearer " + token }
    });
    videos = await res.json();
  } catch {
    grid.innerHTML = `<div style="text-align:center;margin:2rem 0;">
      <p>Could not load videos. Try again.</p>
    </div>`;
    return;
  }

  if (!subscribed) {
    // Not subscribed: show thumbs with subscribe button
    grid.innerHTML = `
      <div style="text-align:center;margin:2rem 0;">
        <p>You need to subscribe to watch videos.</p>
        <a href="pricing.html" class="btn">Subscribe Now</a>
      </div>
      <div class="grid">
        ${videos.map(v => `
          <div class="card" style="max-width:220px;">
            <img src="${v.thumbnailUrl || 'assets/logo-u.jpg'}" alt="${v.title}" style="width:100%;border-radius:8px;">
            <div style="padding:0.5rem 0;">
              <div class="small" style="font-weight:bold;">${v.title}</div>
              <div class="small" style="color:#888;">By ${v.creator?.name || "Unknown"}</div>
            </div>
            <a href="pricing.html" class="btn btn-sm">Subscribe to Watch</a>
          </div>
        `).join("")}
      </div>
    `;
    return;
  }

  // Subscribed: show all videos with links
  grid.innerHTML = `
    <div class="grid">
      ${videos.map(v => `
        <div class="card" style="max-width:220px;">
          <a href="video-player?id=${v._id}">
            <img src="${v.thumbnailUrl || 'assets/logo-u.jpg'}" alt="${v.title}" style="width:100%;border-radius:8px;">
          </a>
          <div style="padding:0.5rem 0;">
            <div class="small" style="font-weight:bold;">${v.title}</div>
            <div class="small" style="color:#888;">By ${v.creator?.name || "Unknown"}</div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

/* Razorpay checkout helper — will call /api/subscription/create-order (backend).
   Replace with your real key and endpoints in backend later.
*/
async function startSubscriptionFlow() {
  const token = localStorage.getItem('token');
  if (!token) { document.getElementById('btn-login').click(); return; }
  try {
    const res = await fetch('/api/subscription/create-order', { method:'POST', headers:{ Authorization: 'Bearer ' + token }});
    const json = await res.json();
    if (!res.ok) return alert(json.message || 'Could not create order');
    // open Razorpay checkout
    const options = {
      key: json.keyId,
      amount: json.amount,
      currency: json.currency,
      name: 'Undefeatables',
      description: 'Monthly subscription ₹129',
      order_id: json.orderId,
      handler: async function(response) {
        // call verify endpoint
        await fetch('/api/subscription/verify', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:'Bearer ' + token }, body: JSON.stringify(response) });
        alert('Payment processed. If verification succeeds, subscription will be active.');
        window.updateAuthUI && window.updateAuthUI();
        location.reload();
      },
      theme: { color: '#7b4bff' }
    };
    const rzp = new Razorpay(options);
    rzp.open();
  } catch (err) { alert('Could not start payment. Backend not ready.') }
}

function startLearning() {
  if (window.auth && window.auth.isLoggedIn && window.auth.isLoggedIn()) {
    window.location.href = 'videos';
  } else {
    document.getElementById('btn-login').click();
  }
}

// Show modal on button click
document.addEventListener("DOMContentLoaded", () => {
  const changeBtn = document.getElementById("change-pass-btn");
  const modal = document.getElementById("change-pass-modal");
  const closeBtn = document.getElementById("close-change-pass");
  if (changeBtn && modal && closeBtn) {
    changeBtn.onclick = () => { modal.style.display = "block"; };
    closeBtn.onclick = () => { modal.style.display = "none"; };
    window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
  }

  const submitBtn = document.getElementById("submit-change-pass");
  if (submitBtn) {
    submitBtn.onclick = async () => {
      const oldPass = document.getElementById("old-pass").value;
      const newPass = document.getElementById("new-pass").value;
      if (!oldPass || !newPass) return alert("Fill all fields");
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("/api/auth/change-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          },
          body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass })
        });
        const json = await res.json();
        alert(json.message);
        if (res.ok) modal.style.display = "none";
      } catch {
        alert("Server error");
      }
    };
  }

  const feedbackForm = document.getElementById("feedback-form");
  if (feedbackForm) {
    feedbackForm.onsubmit = async function(e) {
      e.preventDefault();
      const name = document.getElementById("feedback-name").value;
      const email = document.getElementById("feedback-email").value;
      const message = document.getElementById("feedback-message").value;
      try {
        const res = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, message })
        });
        const json = await res.json();
        alert(json.message || "Feedback sent!");
        this.reset();
      } catch {
        alert("Server error");
      }
    };
  }
});

window.loadVideos = loadVideos;
