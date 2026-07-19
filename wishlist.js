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

const parsePrice = (price) => {
  const parsedPrice = parseFloat(String(price).replace("$", ""));
  return Number.isFinite(parsedPrice) ? parsedPrice : 0;
};

const formatMoney = (amount) => `$${amount.toFixed(2)}`;
const unavailablePriceText = "Contact Us";

const priceKeys = {
  1: "oneprice",
  25: "twentyfiveprice",
  100: "onehundredprice",
  500: "fivehundredprice",
};

const getSummaryPrice = (summary, tier) => {
  if (!summary) {
    return "-";
  }

  const nestedPrice = summary.price && summary.price[tier];
  if (Number.isFinite(parseFloat(nestedPrice))) {
    return nestedPrice;
  }

  const priceKey = priceKeys[tier];
  const legacyPrice =
    summary[priceKey] || (summary.prices && summary.prices[priceKey]);
  return Number.isFinite(parseFloat(legacyPrice)) ? legacyPrice : "-";
};

const getSummaryPrices = (summary) => ({
  oneprice: getSummaryPrice(summary, 1),
  twentyfiveprice: getSummaryPrice(summary, 25),
  onehundredprice: getSummaryPrice(summary, 100),
  fivehundredprice: getSummaryPrice(summary, 500),
});

const setRowPrices = (row, summary) => {
  const prices = getSummaryPrices(summary);
  row.dataset.oneprice = prices.oneprice;
  row.dataset.twentyfiveprice = prices.twentyfiveprice;
  row.dataset.onehundredprice = prices.onehundredprice;
  row.dataset.fivehundredprice = prices.fivehundredprice;
};

const getCultivarLabel = (item) => {
  const latin = item.summaries.map((summary) => summary.latin).find(Boolean);
  return latin || "Common";
};

const getTierPrice = (quantity, prices) => {
  if (quantity >= 500) {
    return prices.fivehundredprice;
  } else if (quantity >= 100) {
    return prices.onehundredprice;
  } else if (quantity >= 25) {
    return prices.twentyfiveprice;
  }

  return prices.oneprice;
};

function calculateTotal(quantity, prices) {
  const safeQuantity = Number.isFinite(quantity) ? quantity : 0;
  const tierPrice = getTierPrice(safeQuantity, prices);
  const parsedTierPrice = parseFloat(String(tierPrice).replace("$", ""));

  if (!Number.isFinite(parsedTierPrice)) {
    return null;
  }

  return safeQuantity * parsedTierPrice;
}

const formatTotal = (total) =>
  Number.isFinite(total) ? formatMoney(total) : unavailablePriceText;

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
    const summaries = Array.isArray(item.summaries) ? item.summaries : [];
    if (!item.name || summaries.length === 0) {
      return;
    }

    const existingItem = items[item.name];
    if (existingItem) {
      summaries.forEach((summary) => {
        existingItem.summaries.push(summary);
        if (summary.size) {
          existingItem.sizes.push(summary.size);
        }
      });
      return;
    }

    const newItem = {
      name: item.name,
      age: summaries[0].age,
      summaries,
      prices: getSummaryPrices(summaries[0]),
      sizes: summaries.map((summary) => summary.size),
    };

    items[item.name] = newItem;
  });

  Object.values(items).forEach((item) => {
    const addWishlistRow = () => {
    const tr = document.createElement("tr");
    const tdName = document.createElement("td");
    const tdCultivar = document.createElement("td");
    const tdSize = document.createElement("td");
    const tdQuantity = document.createElement("td");
    const tdTotal = document.createElement("td");
    tdTotal.classList.add("td-total");

    const tdXButton = document.createElement("td");

    setRowPrices(tr, item.summaries[0]);

    const sizeSelector = document.createElement("select");
    item.sizes.forEach((size) => {
      const option = document.createElement("option");
      option.textContent = size;
      sizeSelector.appendChild(option);
    });

    const cultivarSelector = document.createElement("select");
    const cultivarOption = document.createElement("option");
    cultivarOption.textContent = getCultivarLabel(item);
    cultivarSelector.appendChild(cultivarOption);

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
      setRowPrices(tr, selectedSize);
      const total = calculateTotal(quantity, {
        oneprice: tr.dataset.oneprice,
        twentyfiveprice: tr.dataset.twentyfiveprice,
        onehundredprice: tr.dataset.onehundredprice,
        fivehundredprice: tr.dataset.fivehundredprice,
      });
      tdTotal.textContent = formatTotal(total);
      updateGrandTotal();
    });

    sizeSelector.addEventListener("input", () => {
      const size = sizeSelector.value;
      const quantity = parseInt(quantityInput.value, 10);
      const selectedSize = item.summaries.find(
        (summary) => summary.size === size
      );
      setRowPrices(tr, selectedSize);
      const total = calculateTotal(quantity, {
        oneprice: tr.dataset.oneprice,
        twentyfiveprice: tr.dataset.twentyfiveprice,
        onehundredprice: tr.dataset.onehundredprice,
        fivehundredprice: tr.dataset.fivehundredprice,
      });

      tdTotal.textContent = formatTotal(total);
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
    tdTotal.textContent = formatTotal(initialTotal);

    const duplicateButton = document.createElement("button");
    duplicateButton.type = "button";
    duplicateButton.textContent = "+";
    duplicateButton.setAttribute("aria-label", `Duplicate ${item.name} row`);
    duplicateButton.classList.add("wishlist-row-action", "wishlist-duplicate-row");
    tdXButton.appendChild(duplicateButton);

    const xButton = document.createElement("button");
    xButton.type = "button";
    xButton.textContent = "×";
    xButton.setAttribute("aria-label", `Remove ${item.name} from total`);
    xButton.classList.add("wishlist-row-action", "wishlist-remove-row");
    tdXButton.appendChild(xButton);

    const undoButton = document.createElement("button");
    undoButton.type = "button";
    undoButton.textContent = "↩";
    undoButton.setAttribute("aria-label", `Restore ${item.name} to total`);
    undoButton.classList.add("wishlist-row-action", "wishlist-restore-row");
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

    duplicateButton.addEventListener("click", (event) => {
      event.preventDefault();
      addWishlistRow();
      updateGrandTotal();
    });

    tdName.textContent = item.name;
    tdCultivar.appendChild(cultivarSelector);
    tdSize.appendChild(sizeSelector);
    tdQuantity.appendChild(quantityInput);
    tr.appendChild(tdName);
    tr.appendChild(tdXButton);
    tr.appendChild(tdCultivar);
    tr.appendChild(tdSize);
    tr.appendChild(tdQuantity);
    tr.appendChild(tdTotal);
    tbody.appendChild(tr);
    };

    addWishlistRow();
  });

  const emptyRow = document.createElement("tr");
  const emptyCell = document.createElement("td");
  emptyCell.colSpan = 6;
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
    const summaries = Array.isArray(item.summaries) ? item.summaries : [];
    if (!item.name || summaries.length === 0) {
      return acc;
    }

    if (!acc[item.name]) {
      acc[item.name] = {
        name: item.name,
        age: summaries[0].age,
        summaries,
        sizes: summaries.map((summary) => summary.size),
        prices: getSummaryPrices(summaries[0]),
      };
    } else {
      summaries.forEach((summary) => {
        acc[item.name].summaries.push(summary);
        if (summary.size) {
          acc[item.name].sizes.push(summary.size);
        }
      });
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
      const cultivar = row.querySelector("td:nth-child(3) select").value;
      const size = row.querySelector("td:nth-child(4) select").value;
      const quantity = row.querySelector("td:nth-child(5) input").value;
      const total = row.querySelector(".td-total").textContent;

      formattedTable += `${name}: ${cultivar} // ${quantity} // ${size} // ${total}\n`;
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
