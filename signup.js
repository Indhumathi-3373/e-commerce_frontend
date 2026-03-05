const signupForm = document.getElementById("signupForm");
const statusMsg = document.getElementById("status");

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
