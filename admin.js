const USERS_KEY = "gt_admin_users";
const LOGIN_EVENTS_KEY = "gt_login_events";
const JERSEYS_KEY = "gt_custom_jerseys";

const totalUsersEl = document.getElementById("totalUsers");
const activeUsersEl = document.getElementById("activeUsers");
const loginEventsEl = document.getElementById("loginEvents");
const usersTableBody = document.getElementById("usersTableBody");
const jerseyForm = document.getElementById("jerseyForm");
const jerseyList = document.getElementById("jerseyList");
const formStatus = document.getElementById("formStatus");

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

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

function getUsers() {
  return readJson(USERS_KEY, []);
}

function getLogins() {
  return readJson(LOGIN_EVENTS_KEY, []);
}

function getJerseys() {
  return readJson(JERSEYS_KEY, []);
}

function setUsers(users) {
  writeJson(USERS_KEY, users);
}

function setJerseys(jerseys) {
  writeJson(JERSEYS_KEY, jerseys);
}

function renderStats() {
  const users = getUsers();
  const logins = getLogins();

  totalUsersEl.textContent = users.length;
  activeUsersEl.textContent = users.filter((user) => user.isLoggedIn && !user.blocked).length;
  loginEventsEl.textContent = logins.length;
}

function toggleBlock(email) {
  const users = getUsers();
  const nextUsers = users.map((user) => {
    if (user.email !== email) return user;

    const blocked = !Boolean(user.blocked);
    return {
      ...user,
      blocked,
      isLoggedIn: blocked ? false : user.isLoggedIn
    };
  });

  setUsers(nextUsers);
  renderUsers();
  renderStats();
}

function renderUsers() {
  const users = getUsers();
  usersTableBody.innerHTML = "";

  if (users.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = "<td colspan='6'>No users found yet. User data appears after signup/login.</td>";
    usersTableBody.appendChild(tr);
    return;
  }

  users.forEach((user) => {
    const tr = document.createElement("tr");
    const statusClass = user.blocked ? "blocked" : "active";
    const statusLabel = user.blocked ? "Blocked" : "Active";
    const actionLabel = user.blocked ? "Unblock" : "Block";

    tr.innerHTML = `
      <td>${user.name || "-"}</td>
      <td>${user.email}</td>
      <td>${user.loginCount || 0}</td>
      <td>${formatDate(user.lastLoginAt)}</td>
      <td><span class="status-pill ${statusClass}">${statusLabel}</span></td>
      <td><button class="secondary" data-email="${user.email}">${actionLabel}</button></td>
    `;

    usersTableBody.appendChild(tr);
  });

  usersTableBody.querySelectorAll("button[data-email]").forEach((button) => {
    button.addEventListener("click", () => toggleBlock(button.dataset.email));
  });
}

function removeJersey(id) {
  const jerseys = getJerseys();
  setJerseys(jerseys.filter((jersey) => jersey.id !== id));
  renderJerseys();
}

function renderJerseys() {
  const jerseys = getJerseys();
  jerseyList.innerHTML = "";

  if (jerseys.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No admin-posted jerseys yet.";
    jerseyList.appendChild(li);
    return;
  }

  jerseys.forEach((jersey) => {
    const li = document.createElement("li");
    li.className = "posted-item";
    li.innerHTML = `
      <div>
        <strong>${jersey.name}</strong>
        <p>Rs. ${jersey.price} | ${jersey.about}</p>
      </div>
      <button data-remove-id="${jersey.id}" class="secondary">Remove</button>
    `;

    jerseyList.appendChild(li);
  });

  jerseyList.querySelectorAll("button[data-remove-id]").forEach((button) => {
    button.addEventListener("click", () => removeJersey(button.dataset.removeId));
  });
}

if (jerseyForm) {
  jerseyForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("jerseyName").value.trim();
    const price = document.getElementById("jerseyPrice").value.trim();
    const about = document.getElementById("jerseyAbout").value.trim();
    const image = document.getElementById("jerseyImage").value.trim();

    if (!name || !price || !about || !image) {
      formStatus.classList.add("error");
      formStatus.textContent = "Fill all required fields.";
      return;
    }

    try {
      // Ensures the value is an absolute URL as requested by admin form.
      new URL(image);
    } catch {
      formStatus.classList.add("error");
      formStatus.textContent = "Enter a valid image URL (https://...).";
      return;
    }

    const jerseys = getJerseys();
    jerseys.unshift({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      price,
      about,
      image,
      createdAt: new Date().toISOString()
    });

    setJerseys(jerseys);
    jerseyForm.reset();
    formStatus.classList.remove("error");
    formStatus.textContent = "Jersey posted. It will show on Home products.";
    renderJerseys();
  });
}

window.AuthSession.mountAuthMenu();
renderStats();
renderUsers();
renderJerseys();
