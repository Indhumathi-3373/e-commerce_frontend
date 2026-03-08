const USERS_KEY = "gt_admin_users";
const LOGIN_EVENTS_KEY = "gt_login_events";

const form = document.getElementById("loginForm");
const statusMsg = document.getElementById("status");
const password = document.getElementById("pas");
const togglePass = document.getElementById("togglePass");

function readJson(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function isBlockedUser(email) {
  const users = readJson(USERS_KEY, []);
  const normalized = email.toLowerCase();
  const user = users.find((entry) => String(entry.email).toLowerCase() === normalized);
  return Boolean(user?.blocked);
}

function trackLogin(user) {
  const normalized = String(user.email).toLowerCase();
  const users = readJson(USERS_KEY, []);
  const now = new Date().toISOString();
  let found = false;

  const nextUsers = users.map((entry) => {
    if (String(entry.email).toLowerCase() !== normalized) return entry;
    found = true;
    return {
      ...entry,
      name: user.name || entry.name || "",
      email: normalized,
      loginCount: (entry.loginCount || 0) + 1,
      lastLoginAt: now,
      isLoggedIn: true,
      blocked: Boolean(entry.blocked)
    };
  });

  if (!found) {
    nextUsers.push({
      name: user.name || "",
      email: normalized,
      loginCount: 1,
      lastLoginAt: now,
      isLoggedIn: true,
      blocked: false,
      createdAt: now
    });
  }

  writeJson(USERS_KEY, nextUsers);

  const events = readJson(LOGIN_EVENTS_KEY, []);
  events.unshift({
    email: normalized,
    name: user.name || "",
    loggedInAt: now
  });
  writeJson(LOGIN_EVENTS_KEY, events);
}

if (togglePass) {
  togglePass.addEventListener("click", () => {
    const isPassword = password.type === "password";
    password.type = isPassword ? "text" : "password";
    togglePass.textContent = isPassword ? "Hide" : "Show";
  });
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("ema").value.trim();
    const pass = password.value.trim();

    if (!email || !pass) {
      statusMsg.classList.add("error");
      statusMsg.textContent = "Please enter email and password.";
      return;
    }

    if (isBlockedUser(email)) {
      statusMsg.classList.add("error");
      statusMsg.textContent = "This user is blocked by admin.";
      return;
    }

    try {
      const { response, data } = await window.AuthSession.apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass })
      });

      if (!response.ok) {
        throw new Error(data.message || "Login failed. Please try again.");
      }

      trackLogin(data.user);
      window.AuthSession.setSession(data.token, data.user);

      statusMsg.classList.remove("error");
      statusMsg.textContent = "Login successful. Redirecting...";

      setTimeout(() => {
        window.location.href = "placeorder.html";
      }, 800);
    } catch (error) {
      statusMsg.classList.add("error");
      statusMsg.textContent = error.message;
    }
  });
}
