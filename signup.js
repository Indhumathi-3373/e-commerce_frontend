const USERS_KEY = "gt_admin_users";

const signupForm = document.getElementById("signupForm");
const statusMsg = document.getElementById("status");

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

function saveRegisteredUser(user) {
  const users = readJson(USERS_KEY, []);
  const normalized = String(user.email).toLowerCase();
  const now = new Date().toISOString();

  const existingIndex = users.findIndex((entry) => String(entry.email).toLowerCase() === normalized);

  if (existingIndex >= 0) {
    users[existingIndex] = {
      ...users[existingIndex],
      name: user.name || users[existingIndex].name || "",
      email: normalized
    };
  } else {
    users.push({
      name: user.name || "",
      email: normalized,
      loginCount: 0,
      lastLoginAt: null,
      isLoggedIn: true,
      blocked: false,
      createdAt: now
    });
  }

  writeJson(USERS_KEY, users);
}

if (signupForm) {
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!name || !email || !password) {
      statusMsg.classList.add("error");
      statusMsg.textContent = "Please fill all fields.";
      return;
    }

    try {
      const { response, data } = await window.AuthSession.apiFetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      if (!response.ok) {
        throw new Error(data.message || "Signup failed. Please try again.");
      }

      saveRegisteredUser(data.user);
      window.AuthSession.setSession(data.token, data.user);
      statusMsg.classList.remove("error");
      statusMsg.textContent = "Account created. Redirecting...";
      setTimeout(() => {
        window.location.href = "home.html";
      }, 900);
    } catch (error) {
      statusMsg.classList.add("error");
      statusMsg.textContent = error.message;
    }
  });
}
