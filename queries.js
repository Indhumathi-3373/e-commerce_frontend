const queryList = document.getElementById("queryList");
const statusMsg = document.getElementById("status");

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function renderQueries(queries) {
  queryList.innerHTML = "";

  if (!queries.length) {
    queryList.innerHTML = "<p>No queries found.</p>";
    return;
  }

  queries.forEach((query) => {
    const item = document.createElement("article");
    item.className = "item";
    item.innerHTML = `
      <div class="item-top">
        <strong>${query.name}</strong>
        <span class="pill ${query.status === "resolved" ? "resolved" : ""}">${query.status}</span>
      </div>
      <small>${formatDate(query.createdAt)}</small>
      <p>${query.message}</p>
      ${query.status !== "resolved" ? `<button data-id="${query._id}">Mark Resolved</button>` : ""}
    `;
    queryList.appendChild(item);
  });
}

async function loadQueries() {
  try {
    const { response, data } = await window.AuthSession.apiFetch("/api/queries", {
      method: "GET"
    });

    if (response.status === 401) {
      window.location.href = "login.html";
      return;
    }

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch queries. Please try again.");
    }

    renderQueries(data.queries || []);
  } catch (error) {
    statusMsg.textContent = error.message;
  }
}

queryList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button) return;

  try {
    const { response, data } = await window.AuthSession.apiFetch(
      `/api/queries/${button.dataset.id}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" })
      }
    );

    if (response.status === 401) {
      window.location.href = "login.html";
      return;
    }

    if (!response.ok) {
      throw new Error(data.message || "Failed to update status. Please try again.");
    }

    loadQueries();
  } catch (error) {
    statusMsg.textContent = error.message;
  }
});

(async () => {
  const user = await window.AuthSession.requireAuth("login.html");
  if (user) {
    loadQueries();
  }
})();
