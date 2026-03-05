const basePrice = 799;

const orderForm = document.getElementById("order");
const quantityInput = document.getElementById("qty");
const totalPrice = document.getElementById("totalPrice");
const statusMsg = document.getElementById("status");

function refreshTotal() {
  const qty = Math.max(1, Number(quantityInput.value) || 1);
  quantityInput.value = qty;
  totalPrice.textContent = `Total: Rs. ${basePrice * qty}`;
}

if (quantityInput) {
  quantityInput.addEventListener("input", refreshTotal);
  refreshTotal();
}

if (orderForm) {
  orderForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const address = document.getElementById("addr").value.trim();
    const payment = document.getElementById("pay").value;
    const size = document.getElementById("size").value;

    if (!name || !address || !payment || !size) {
      statusMsg.classList.add("error");
      statusMsg.textContent = "Please fill all required fields.";
      return;
    }

    const qty = Math.max(1, Number(quantityInput.value) || 1);
    const total = basePrice * qty;
    const placedAt = new Date();
    const deliveryDays = payment === "cod" ? 6 : 4;
    const estimatedDelivery = new Date(placedAt);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + deliveryDays);
    const orderId = `GT${Date.now().toString().slice(-6)}`;

    localStorage.setItem(
      "gt_last_order",
      JSON.stringify({
        id: orderId,
        name,
        qty,
        total,
        payment,
        size,
        placedAt: placedAt.toISOString(),
        estimatedDelivery: estimatedDelivery.toISOString()
      })
    );

    statusMsg.classList.remove("error");
    statusMsg.textContent = "Order placed successfully. Redirecting...";

    setTimeout(() => {
      window.location.href = "confirmation.html";
    }, 1000);
  });
}

(async () => {
  await window.AuthSession.requireAuth("login.html");
})();
