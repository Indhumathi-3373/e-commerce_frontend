(function () {
  const API_BASE = window.location.port === "5500" ? "http://localhost:3000" : "";

  async function parseApiResponse(response) {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return {};
    }
  }

  function decodeJwt(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
      return JSON.parse(atob(padded));
    } catch {
      return null;
    }
  }

  function getToken() {
    return localStorage.getItem("gt_token");
  }

  function getUser() {
    const raw = localStorage.getItem("gt_user");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function setSession(token, user) {
    localStorage.setItem("gt_token", token);
    localStorage.setItem("gt_user", JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem("gt_token");
    localStorage.removeItem("gt_user");
  }

  function isTokenExpired(token) {
    const payload = decodeJwt(token);
    if (!payload || !payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
  }

  async function apiFetch(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    const token = getToken();

    if (token && !headers.Authorization) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers
    });

    const data = await parseApiResponse(response);

    if (response.status === 401) {
      clearSession();
    }

    return { response, data };
  }

  async function verifySession() {
    const token = getToken();
    if (!token) {
      return { ok: false, reason: "missing" };
    }

    if (isTokenExpired(token)) {
      clearSession();
      return { ok: false, reason: "expired" };
    }

    try {
      const { response, data } = await apiFetch("/api/auth/me", { method: "GET" });

      if (!response.ok || !data.user) {
        clearSession();
        return { ok: false, reason: data.message || "invalid" };
      }

      localStorage.setItem("gt_user", JSON.stringify(data.user));
      return { ok: true, user: data.user };
    } catch {
      return { ok: false, reason: "network" };
    }
  }

  async function requireAuth(redirectTo = "login.html") {
    const session = await verifySession();
    if (!session.ok) {
      window.location.href = redirectTo;
      return null;
    }
    return session.user;
  }

  function mountAuthMenu() {
    const menu = document.querySelector(".menu");
    if (!menu) return;

    const token = getToken();
    if (!token || isTokenExpired(token)) {
      if (token) clearSession();
      return;
    }

    menu.querySelectorAll('a[href="login.html"], a[href="signup.html"]').forEach((link) => {
      link.parentElement?.remove();
    });

    if (!menu.querySelector('[data-auth="logout"]')) {
      const li = document.createElement("li");
      const logout = document.createElement("a");
      logout.href = "#";
      logout.dataset.auth = "logout";
      logout.textContent = "Logout";
      logout.addEventListener("click", (event) => {
        event.preventDefault();
        clearSession();
        window.location.href = "login.html";
      });
      li.appendChild(logout);
      menu.appendChild(li);
    }
  }

  window.AuthSession = {
    API_BASE,
    apiFetch,
    getToken,
    getUser,
    setSession,
    clearSession,
    verifySession,
    requireAuth,
    mountAuthMenu
  };

  document.addEventListener("DOMContentLoaded", mountAuthMenu);
})();
