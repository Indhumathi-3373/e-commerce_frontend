const params = new URLSearchParams(window.location.search);

const name = params.get("name") || "Jersey";
const about = params.get("about") || "Product details are not available.";
const price = params.get("price") || "0";
const image = params.get("image") || "image/shop1.jpg";

document.getElementById("productName").textContent = name;
document.getElementById("productAbout").textContent = about;
document.getElementById("productPrice").textContent = price;

const productImage = document.getElementById("productImage");
productImage.src = image;
productImage.alt = name;
