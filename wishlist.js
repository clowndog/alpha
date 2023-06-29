// wishlist

function formatPhoneNumber(input) {
  let phoneNumber = input.value.replace(/\D/g, "");

  if (phoneNumber.length === 10) {
    phoneNumber = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    input.value = phoneNumber;
  }
}

const userEmail = "stephenbusscher@gmail.com";

const getWishlist = () => {
  const wishlist = localStorage.getItem("wishlist");
  return wishlist ? JSON.parse(wishlist) : [];
};

function calculateTotal(quantity, prices) {
  const oneprice = parseFloat(prices.oneprice) || 0;
  const twentyfiveprice = parseFloat(prices.twentyfiveprice) || 0;
  const onehundredprice = parseFloat(prices.onehundredprice) || 0;
  const fivehundredprice = parseFloat(prices.fivehundredprice) || 0;

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
      const total = parseFloat(totalElement && totalElement.textContent) || 0;
      grandTotal += total;
    });
    grandTotalElement.textContent = grandTotal.toFixed(2);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  createWishlistTable();
  updateGrandTotal();
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
      tdTotal.textContent = total.toFixed(2);
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

      tdTotal.textContent = total.toFixed(2);
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
    tdTotal.textContent = initialTotal.toFixed(2);

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

emailjs.init("RYRyCisbSaLO-meXP");

document.getElementById("email-form").addEventListener("submit", (event) => {
  event.preventDefault();

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
  const formattedTableValue = document.getElementById("formatted-table").value;

  // Send email using EmailJS
  const emailParams = {
    customerName: customerName,
    customerPhone: customerPhone,
    customerEmail: customerEmail,
    customerAddress: customerAddress,
    message: message,
    wishlist: formattedTable,
    grand_total: grandTotal,
  };

  // Send the email using EmailJS
  emailjs
    .send(
      "service_v3fnwk5",
      "template_5x4lgtb",
      emailParams,
      "RYRyCisbSaLO-meXP"
    )
    .then((response) => {
      console.log("Email sent!", response.status, response.text);
      // Reset the form or show a success message
    })
    .catch((error) => {
      console.error("Error sending email:", error);
      // Handle error, show an error message, etc.
    });
});
