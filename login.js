const form = document.getElementById("loginForm");
const statusMsg = document.getElementById("status");
const password = document.getElementById("pas");
const togglePass = document.getElementById("togglePass");

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

    try {
      const { response, data } = await window.AuthSession.apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass })
      });

      if (!response.ok) {
        throw new Error(data.message || "Login failed. Please try again.");
      }

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
