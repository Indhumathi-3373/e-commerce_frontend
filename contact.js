const contactForm = document.getElementById("contactForm");
const statusMsg = document.getElementById("status");

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("uname").value.trim();
    const email = document.getElementById("semail").value.trim();
    const message = document.getElementById("msg").value.trim();

    if (!name || !email || !message) {
      statusMsg.classList.add("error");
      statusMsg.textContent = "Please complete all fields.";
      return;
    }

    try {
      const { response, data } = await window.AuthSession.apiFetch("/api/queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message })
      });

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit query. Please try again.");
      }

      statusMsg.classList.remove("error");
      statusMsg.textContent = "Query submitted successfully.";

      setTimeout(() => {
        window.location.href = "queries.html";
      }, 900);
    } catch (error) {
      statusMsg.classList.add("error");
      statusMsg.textContent = error.message;
    }
  });
}
