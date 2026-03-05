const orderDataRaw = localStorage.getItem("gt_last_order");

function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function fillOrderDetails() {
  if (!orderDataRaw) {
    window.location.href = "placeorder.html";
    return;
  }

  const order = JSON.parse(orderDataRaw);

  document.getElementById("orderId").textContent = order.id;
  document.getElementById("customerName").textContent = order.name;
  document.getElementById("orderQty").textContent = order.qty;
  document.getElementById("orderTotal").textContent = `Rs. ${order.total}`;
  document.getElementById("placedOn").textContent = formatDate(new Date(order.placedAt));
  document.getElementById("etaDate").textContent = formatDate(new Date(order.estimatedDelivery));
}

fillOrderDetails();
