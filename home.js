const searchInput = document.getElementById("searchInput");
const cards = Array.from(document.querySelectorAll(".card"));
const toast = document.getElementById("toast");

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1600);
}

if (searchInput) {
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
      const name = card.dataset.name.toLowerCase();
      const isVisible = name.includes(term);
      card.classList.toggle("hidden", !isVisible);
      if (isVisible) visibleCount += 1;
    });

    if (term.length > 0) {
      showToast(`${visibleCount} item(s) found`);
    }
  });
}

window.AuthSession.mountAuthMenu();
