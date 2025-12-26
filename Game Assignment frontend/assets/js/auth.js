// Simple auth client handlers for login and register pages

function showAlert(container, type, message) {
  container.innerHTML = `\n    <div class="alert alert-${type} alert-dismissible" role="alert">\n      ${message}\n      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>\n    </div>`;
}

// LOGIN
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const alertEl = document.getElementById('loginAlert');
    alertEl.innerHTML = '';

    if (!username || !password) {
      showAlert(alertEl, 'warning', 'Please enter username and password.');
      return;
    }

    const submitBtn = loginForm.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Logging in...'; }

    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        let data = {};
        try { data = await res.json(); } catch (e) { /* no JSON */ }

        const jwtToken = data.jwtToken || data.token || data.accessToken || null;
        const refreshToken = data.refreshToken || null;
        const respUsername = data.username || username;
        const playerId = data.id || data.playerId || null;

        if (jwtToken) localStorage.setItem('jwtToken', jwtToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        if (respUsername) localStorage.setItem('username', respUsername);
        if (playerId) localStorage.setItem('player_id', playerId);

        showAlert(alertEl, 'success', 'Login successful. Redirecting...');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 700);
      } else {
        const err = await res.json().catch(() => ({}));
        showAlert(alertEl, 'danger', err.message || `Login failed (status ${res.status}).`);
      }
    } catch (err) {
      showAlert(alertEl, 'danger', 'Network error. Make sure backend runs and allows CORS.');
      console.error(err);
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Login'; }
    }
  });
}

// REGISTER
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    const deviceId = document.getElementById('regDeviceId').value.trim();
    const platform = document.getElementById('regPlatform').value;
    const country = document.getElementById('regCountry').value.trim();
    const alertEl = document.getElementById('registerAlert');
    alertEl.innerHTML = '';

    if (!username || !password || !deviceId || !platform || !country) {
      showAlert(alertEl, 'warning', 'Please fill all fields.');
      return;
    }

    const submitBtn = registerForm.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Registering...'; }

    try {
      const res = await fetch('http://localhost:8080/api/players/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, deviceId, platform, country })
      });

      if (res.ok) {
        showAlert(alertEl, 'success', 'Registration successful. Redirecting to login...');
        setTimeout(() => { window.location.href = 'login.html'; }, 700);
      } else {
        const err = await res.json().catch(() => ({}));
        showAlert(alertEl, 'danger', err.message || `Registration failed (status ${res.status}).`);
      }
    } catch (err) {
      showAlert(alertEl, 'danger', 'Network error. Make sure backend runs and allows CORS.');
      console.error(err);
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Register'; }
    }
  });
}
