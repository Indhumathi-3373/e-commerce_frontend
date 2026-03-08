const JERSEYS_KEY = "gt_custom_jerseys";
const FALLBACK_IMAGE = "image/shop1.jpg";

const searchInput = document.getElementById("searchInput");
const productGrid = document.getElementById("productGrid");
const toast = document.getElementById("toast");
const heroSlides = Array.from(document.querySelectorAll(".hero-slide"));
const heroDots = Array.from(document.querySelectorAll(".hero-dots .dot"));

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1600);
}

function readCustomJerseys() {
  const raw = localStorage.getItem(JERSEYS_KEY);
  if (!raw) return [];

  try {
    const jerseys = JSON.parse(raw);
    return Array.isArray(jerseys) ? jerseys : [];
  } catch {
    return [];
  }
}

function renderAdminJerseys() {
  if (!productGrid) return;

  productGrid.querySelectorAll(".admin-card").forEach((card) => card.remove());

  const jerseys = readCustomJerseys();

  jerseys.forEach((jersey) => {
    const card = document.createElement("article");
    card.className = "card admin-card";
    card.dataset.name = jersey.name || "Custom Jersey";

    card.innerHTML = `
      <img src="${jersey.image || FALLBACK_IMAGE}" alt="${jersey.name || "Custom Jersey"}">
      <div class="content">
        <h3>${jersey.name || "Custom Jersey"}</h3>
        <p>${jersey.about || "Admin posted jersey"}</p>
        <div class="card-foot">
          <span class="price">Rs. ${jersey.price || "0"}</span>
          <a href="login.html">Buy Now</a>
        </div>
      </div>
    `;

    productGrid.appendChild(card);
  });
}

function getAllCards() {
  return Array.from(document.querySelectorAll(".card"));
}

function getCardDetails(card) {
  const name = card.querySelector("h3")?.textContent.trim() || "Jersey";
  const about = card.querySelector(".content p")?.textContent.trim() || "Product details";
  const priceText = card.querySelector(".price")?.textContent.trim() || "Rs. 0";
  const image = card.querySelector("img")?.getAttribute("src") || FALLBACK_IMAGE;

  return { name, about, priceText, image };
}

function setupProductCardNavigation() {
  if (!productGrid) return;

  productGrid.addEventListener("click", (event) => {
    const clickedLink = event.target.closest("a");
    if (clickedLink) return;

    const card = event.target.closest(".card");
    if (!card || !productGrid.contains(card)) return;

    const { name, about, priceText, image } = getCardDetails(card);
    const params = new URLSearchParams({
      name,
      about,
      price: priceText.replace(/Rs\.\s*/i, "").trim(),
      image
    });

    window.location.href = `product-details.html?${params.toString()}`;
  });
}

function setupHeroSlider() {
  if (heroSlides.length < 2) return;

  let current = 0;

  function renderSlide(index) {
    heroSlides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === index);
    });

    heroDots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === index);
    });
  }

  setInterval(() => {
    current = (current + 1) % heroSlides.length;
    renderSlide(current);
  }, 3000);
}

function setupSmoothNavigation() {
  document.querySelectorAll("a[href]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href === "#") return;
      if (link.target === "_blank") return;

      event.preventDefault();
      document.body.classList.add("page-leave");
      setTimeout(() => {
        window.location.href = href;
      }, 170);
    });
  });
}

if (searchInput) {
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    getAllCards().forEach((card) => {
      const name = String(card.dataset.name || "").toLowerCase();
      const isVisible = name.includes(term);
      card.classList.toggle("hidden", !isVisible);
      if (isVisible) visibleCount += 1;
    });

    if (term.length > 0) {
      showToast(`${visibleCount} item(s) found`);
    }
  });
}

renderAdminJerseys();
setupProductCardNavigation();
setupHeroSlider();
setupSmoothNavigation();
window.AuthSession.mountAuthMenu();
