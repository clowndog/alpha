// wishlist

const userEmail = "info@alphanurseries.com";

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
    xButton.textContent = "X";
    tdXButton.appendChild(xButton);

    const undoButton = document.createElement("button");
    undoButton.textContent = "Undo";
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

createWishlistTable();
updateGrandTotal();
