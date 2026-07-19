// wishlist

function saveFormData() {
  const form = document.getElementById("email-form");
  const formData = Array.from(form.elements).reduce((data, element) => {
    if (element.name && element.value) {
      data[element.name] = element.value;
    }
    return data;
  }, {});

  localStorage.setItem("formData", JSON.stringify(formData));
}

function loadFormData() {
  const form = document.getElementById("email-form");
  const savedFormData = JSON.parse(localStorage.getItem("formData") || "{}");

  for (let key in savedFormData) {
    const element = form.elements.namedItem(key);
    if (element) {
      element.value = savedFormData[key];
    }
  }
}

function formatPhoneNumber(input) {
  let phoneNumber = input.value.replace(/\D/g, "");

  if (phoneNumber.length === 10) {
    phoneNumber = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    input.value = phoneNumber;
  }
}

const EMAILJS_SERVICE_ID = "service_dqgba86";
const EMAILJS_TEMPLATE_ID = "template_5x4lgtb";
const EMAILJS_PUBLIC_KEY = "RYRyCisbSaLO-meXP";

const getWishlist = () => {
  const wishlist = localStorage.getItem("wishlist");
  return wishlist ? JSON.parse(wishlist) : [];
};

const parsePrice = (price) => parseFloat(String(price).replace("$", "")) || 0;

const formatMoney = (amount) => `$${amount.toFixed(2)}`;

function calculateTotal(quantity, prices) {
  const oneprice = parsePrice(prices.oneprice);
  const twentyfiveprice = parsePrice(prices.twentyfiveprice);
  const onehundredprice = parsePrice(prices.onehundredprice);
  const fivehundredprice = parsePrice(prices.fivehundredprice);

  if (quantity >= 500) {
    return quantity * fivehundredprice;
  } else if (quantity >= 100) {
    return quantity * onehundredprice;
  } else if (quantity >= 25) {
    return quantity * twentyfiveprice;
  } else {
    return quantity * oneprice;
  }
}

function updateGrandTotal() {
  const grandTotalElement = document.getElementById("grand-total");
  if (grandTotalElement) {
    const tbody = document
      .getElementById("wishlist-table")
      .querySelector("tbody");
    const rows = tbody.querySelectorAll("tr");
    const enabledRows = Array.from(rows).filter(
      (row) => !row.classList.contains("disabled")
    );
    let grandTotal = 0;
    enabledRows.forEach((row) => {
      const totalElement = row.querySelector(".td-total");
      const total = parsePrice(totalElement && totalElement.textContent);
      grandTotal += total;
    });
    grandTotalElement.textContent = formatMoney(grandTotal);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  createWishlistTable();
  updateGrandTotal();
  loadFormData();
});

const createWishlistTable = () => {
  const wishlist = getWishlist();
  const tbody = document
    .getElementById("wishlist-table")
    .querySelector("tbody");
  tbody.innerHTML = "";
  const items = {};

  wishlist.forEach((item) => {
    const existingItem = items[item.name];
    if (existingItem) {
      existingItem.sizes.push(item.sizes[0]);
      return;
    }

    const newItem = {
      name: item.name,
      age: item.summaries[0].age,
      summaries: item.summaries,
      prices: {
        fivehundredprice: item.summaries[0].fivehundredprice || "-",
        onehundredprice: item.summaries[0].onehundredprice || "-",
        twentyfiveprice: item.summaries[0].twentyfiveprice || "-",
        oneprice: item.summaries[0].oneprice || "-",
      },
      sizes: item.summaries.map((summary) => summary.size),
    };

    items[item.name] = newItem;
  });

  Object.values(items).forEach((item) => {
    const tr = document.createElement("tr");
    const tdName = document.createElement("td");
    const tdSize = document.createElement("td");
    const tdQuantity = document.createElement("td");
    const tdTotal = document.createElement("td");
    tdTotal.classList.add("td-total");

    const tdXButton = document.createElement("td");

    tr.dataset.oneprice = item.prices.oneprice;
    tr.dataset.twentyfiveprice = item.prices.twentyfiveprice;
    tr.dataset.onehundredprice = item.prices.onehundredprice;
    tr.dataset.fivehundredprice = item.prices.fivehundredprice;

    const sizeSelector = document.createElement("select");
    item.sizes.forEach((size) => {
      const option = document.createElement("option");
      option.textContent = size;
      sizeSelector.appendChild(option);
    });

    const quantityInput = document.createElement("input");
    quantityInput.type = "number";
    quantityInput.min = "0";
    quantityInput.value = "0";
    quantityInput.classList.add("quantity-input");

    quantityInput.addEventListener("focus", () => {
      if (quantityInput.value === "0") {
        quantityInput.select();
      }
    });

    quantityInput.addEventListener("blur", () => {
      if (quantityInput.value === "") {
        quantityInput.value = "0";
      }
    });

    quantityInput.addEventListener("input", () => {
      const size = sizeSelector.value;
      const quantity = parseInt(quantityInput.value, 10);
      const selectedSize = item.summaries.find(
        (summary) => summary.size === size
      );
      tr.dataset.oneprice = selectedSize.price[1] || "-";
      tr.dataset.twentyfiveprice = selectedSize.price[25] || "-";
      tr.dataset.onehundredprice = selectedSize.price[100] || "-";
      tr.dataset.fivehundredprice = selectedSize.price[500] || "-";
      const total = calculateTotal(quantity, {
        oneprice: tr.dataset.oneprice,
        twentyfiveprice: tr.dataset.twentyfiveprice,
        onehundredprice: tr.dataset.onehundredprice,
        fivehundredprice: tr.dataset.fivehundredprice,
      });
      tdTotal.textContent = formatMoney(total);
      updateGrandTotal();
    });

    sizeSelector.addEventListener("input", () => {
      const size = sizeSelector.value;
      const quantity = parseInt(quantityInput.value, 10);
      const selectedSize = item.summaries.find(
        (summary) => summary.size === size
      );
      tr.dataset.oneprice = selectedSize.price[1] || "-";
      tr.dataset.twentyfiveprice = selectedSize.price[25] || "-";
      tr.dataset.onehundredprice = selectedSize.price[100] || "-";
      tr.dataset.fivehundredprice = selectedSize.price[500] || "-";
      const total = calculateTotal(quantity, {
        oneprice: tr.dataset.oneprice,
        twentyfiveprice: tr.dataset.twentyfiveprice,
        onehundredprice: tr.dataset.onehundredprice,
        fivehundredprice: tr.dataset.fivehundredprice,
      });

      tdTotal.textContent = formatMoney(total);
      updateGrandTotal();
    });

    quantityInput.addEventListener("input", () => {
      updateGrandTotal();
    });

    sizeSelector.addEventListener("input", () => {
      updateGrandTotal();
    });

    const initialTotal = calculateTotal(parseInt(quantityInput.value, 10), {
      oneprice: tr.dataset.oneprice,
      twentyfiveprice: tr.dataset.twentyfiveprice,
      onehundredprice: tr.dataset.onehundredprice,
      fivehundredprice: tr.dataset.fivehundredprice,
    });
    tdTotal.textContent = formatMoney(initialTotal);

    const xButton = document.createElement("button");
    xButton.textContent = "x";
    tdXButton.appendChild(xButton);

    const undoButton = document.createElement("button");
    undoButton.textContent = "⟲";
    undoButton.style.display = "none";
    undoButton.style.opacity = "1";
    tdXButton.appendChild(undoButton);

    xButton.addEventListener("click", (event) => {
      event.preventDefault();
      tr.querySelectorAll("td:not(:last-child)").forEach((td) => {
        td.style.opacity = "0.25";
      });

      tr.classList.add("disabled");

      undoButton.style.opacity = "1";
      xButton.style.display = "none";
      undoButton.style.display = "inline";
      updateGrandTotal();
    });

    undoButton.addEventListener("click", (event) => {
      event.preventDefault();
      tr.querySelectorAll("td").forEach((td) => {
        td.style.opacity = "1";
      });

      tr.classList.remove("disabled");

      undoButton.style.opacity = "1";
      xButton.style.display = "inline";
      undoButton.style.display = "none";
      updateGrandTotal();
    });

    tdName.textContent = item.name;
    tdSize.appendChild(sizeSelector);
    tdQuantity.appendChild(quantityInput);
    tr.appendChild(tdName);
    tr.appendChild(tdQuantity);
    tr.appendChild(tdSize);
    tr.appendChild(tdTotal);
    tr.appendChild(tdXButton);
    tbody.appendChild(tr);
  });

  const emptyRow = document.createElement("tr");
  const emptyCell = document.createElement("td");
  emptyCell.colSpan = 5;
  emptyRow.appendChild(emptyCell);
  tbody.appendChild(emptyRow);
};

if (window.emailjs) {
  emailjs.init({
    publicKey: EMAILJS_PUBLIC_KEY,
  });
} else {
  console.error("EmailJS failed to load.");
}

document.getElementById("email-form").addEventListener("submit", (event) => {
  event.preventDefault();

  if (!window.emailjs) {
    alert("Email service is not available. Please try again later.");
    return;
  }

  const sendButton = document.getElementById("send-button");
  const emailStatus = document.getElementById("email-status");
  const emailStatusTitle = document.getElementById("email-status-title");
  const emailStatusMessage = document.getElementById("email-status-message");
  const customerName = document.getElementById("customer-name").value;
  const customerPhone = document.getElementById("customer-phone").value;
  const customerEmail = document.getElementById("customer-email").value;
  const customerAddress = document.getElementById("customer-address").value;
  const message = document.getElementById("message").value;

  const items = getWishlist().reduce((acc, item) => {
    if (!acc[item.name]) {
      acc[item.name] = {
        name: item.name,
        age: item.summaries[0].age,
        summaries: item.summaries,
        sizes: item.summaries.map((summary) => summary.size),
        prices: {
          oneprice: item.summaries[0].oneprice || "-",
          twentyfiveprice: item.summaries[0].twentyfiveprice || "-",
          onehundredprice: item.summaries[0].onehundredprice || "-",
          fivehundredprice: item.summaries[0].fivehundredprice || "-",
        },
      };
    } else {
      acc[item.name].sizes.push(item.sizes[0]);
    }
    return acc;
  }, {});

  let formattedTable = "";
  formattedTable += "Name: " + customerName + "\n";
  formattedTable += "Phone: " + customerPhone + "\n";
  formattedTable += "Email: " + customerEmail + "\n";
  formattedTable += "Address: " + customerAddress + "\n\n";
  formattedTable += "Message:\n\n" + message + "\n\n";
  formattedTable += "Wishlist:\n\n";

  const tbody = document
    .getElementById("wishlist-table")
    .querySelector("tbody");
  const rows = tbody.querySelectorAll("tr");
  rows.forEach((row, index) => {
    if (!row.classList.contains("disabled") && index !== rows.length - 1) {
      const name = row.querySelector("td:first-child").textContent;
      const quantity = row.querySelector("td:nth-child(2) input").value;
      const size = row.querySelector("td:nth-child(3) select").value;
      const total = row.querySelector(".td-total").textContent;

      formattedTable += `${name}: ${quantity} // ${size} // ${total}\n`;
    }
  });

  const grandTotal = document.getElementById("grand-total").textContent;
  formattedTable += `Grand Total: ${grandTotal}\n`;

  document.getElementById("formatted-table").value = formattedTable;

  const emailParams = {
    customerName,
    customerPhone,
    customerEmail,
    customerAddress,
    message,
    grand_total: grandTotal,
    wishlist: formattedTable,
    formatted_table: formattedTable,
    from_name: customerName,
    from_email: customerEmail,
    reply_to: customerEmail,
    name: customerName,
    email: customerEmail,
    phone: customerPhone,
    address: customerAddress,
  };

  sendButton.disabled = true;
  sendButton.value = "Sending...";
  emailStatus.className = "email-status";
  emailStatusTitle.textContent = "Sending wishlist...";
  emailStatusMessage.textContent = "Please keep this page open for a moment.";

  emailjs
    .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, emailParams)
    .then((response) => {
      console.log("Email sent!", response.status, response.text);
      localStorage.removeItem("formData");
      emailStatus.className = "email-status success";
      emailStatusTitle.textContent = "Wishlist sent!";
      emailStatusMessage.textContent =
        "Thanks — we will contact you shortly.";
    })
    .catch((error) => {
      console.error("Error sending email:", error);
      const errorMessage = error.text || error.message || JSON.stringify(error);
      emailStatus.className = "email-status error";
      emailStatusTitle.textContent = "Email did not send";
      emailStatusMessage.textContent = errorMessage;
    })
    .finally(() => {
      sendButton.disabled = false;
      sendButton.value = "Send";
    });
});

document.getElementById("email-form").addEventListener("change", saveFormData);
