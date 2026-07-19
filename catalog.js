// search

const searchInput = document.querySelector("#data-search");
const categoryFilter = document.querySelector("#category-filter");

const getCategory = (type) => {
  if (!type) return "";
  if (type.includes("Shrubs")) return "Shrubs";
  if (type.includes("Small Trees")) return "Small Trees";
  if (type.includes("Large Trees")) return "Large Trees";
  if (type.includes("Bigger Stuff")) return "Bigger Stuff";
  return type;
};

const updateCatalogFilters = () => {
  const value = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;

  allUsers.forEach((user) => {
    const isVisible =
      (selectedCategory === "all" || user.categories.includes(selectedCategory)) &&
      (user.name.toLowerCase().includes(value) ||
        user.body.toLowerCase().includes(value) ||
        (user.type && user.type.toLowerCase().includes(value)));
    user.element.classList.toggle("hide", !isVisible);
  });
};

const resetCatalogFilters = () => {
  searchInput.value = "";
  categoryFilter.value = "all";
  updateCatalogFilters();
};

searchInput.addEventListener("input", updateCatalogFilters);
categoryFilter.addEventListener("change", updateCatalogFilters);
window.addEventListener("pageshow", resetCatalogFilters);

// cards

const createElement = (element, content) => {
  const el = document.createElement(element);
  el.innerHTML = content;
  return el;
};

const createTableHeaders = (headers) =>
  createElement("tr", headers.map((header) => `<th>${header}</th>`).join(""));

const createTableRow = (rowData) =>
  createElement("tr", rowData.map((data) => `<td>${data ?? ""}</td>`).join(""));

const formatPrice = (price) => {
  const numericPrice = parseFloat(price);
  return Number.isFinite(numericPrice) ? `$${numericPrice.toFixed(2)}` : "—";
};

const getWishlist = () => {
  const wishlist = localStorage.getItem("wishlist");
  return wishlist ? JSON.parse(wishlist) : [];
};

const addToWishlist = (cardName, item) => {
  const wishlist = getWishlist();
  const newItem = {
    name: item.name,
    summaries: item.summaries.map((summary) => ({
      ...summary,
      price: {
        1: parseFloat(summary.prices.oneprice),
        25: parseFloat(summary.prices.twentyfiveprice),
        100: parseFloat(summary.prices.onehundredprice),
        500: parseFloat(summary.prices.fivehundredprice),
      },
    })),
  };
  wishlist.push(newItem);
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
};

const removeFromWishlist = (cardName) => {
  const wishlist = getWishlist();
  const index = wishlist.findIndex((item) => item.name === cardName);
  if (index !== -1) {
    wishlist.splice(index, 1);
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }
};

const handleWishlistButtonClick = (event) => {
  event.stopPropagation();
  const button = event.currentTarget;
  button.classList.toggle("active");

  const cardName = button.dataset.cardName;
  const user = allUsers.find((user) => user.name === cardName);

  const wishlist = getWishlist();

  if (wishlist.some((item) => item.name === cardName)) {
    removeFromWishlist(cardName);
    button.setAttribute("aria-pressed", "false");
  } else {
    addToWishlist(cardName, user);
    button.setAttribute("aria-pressed", "true");
  }

  updateWishlistCount();
};

const updateWishlistCount = () => {
  const wishlist = getWishlist();
  wishlistCountDisplay.textContent = wishlist.length;
};

const wishlistSubmitButton = document.getElementById("wishlist-submit-button");
wishlistSubmitButton.addEventListener("click", () => {
  window.location.href = "wishlist.html";
});

const clearWishlist = () => {
  localStorage.setItem("wishlist", JSON.stringify([]));

  updateWishlistCount();

  const allWishlistButtons = document.querySelectorAll(".wishlist-button");
  allWishlistButtons.forEach((button) => {
    button.classList.remove("active");
  });
};

document
  .getElementById("clear-wishlist")
  .addEventListener("click", clearWishlist);

const userCardContainer = document.querySelector("[data-user-cards-container]");
const wishlistCountDisplay = document.getElementById("wishlist-count-display");

const updateCardTables = () => {
  allUsers.forEach(({ element, summaries }) => {
    const summary = element.querySelector("[data-summary]");
    const table = createCardTable(summaries);
    summary.innerHTML = "";
    summary.append(table);
  });
};

const createCardTable = (summaries) => {
  const table = document.createElement("table");

  const tableHeaders = createTableHeaders([
    "Size",
    "Age",
    "500+",
    "100+",
    "25+",
    "1+",
  ]);

  table.append(tableHeaders);

  summaries.forEach((summary) => {
    const { size, age, prices } = summary;
    const tableRow = createTableRow([
      size,
      age || "—",
      formatPrice(prices.fivehundredprice),
      formatPrice(prices.onehundredprice),
      formatPrice(prices.twentyfiveprice),
      formatPrice(prices.oneprice),
    ]);

    tableRow.dataset.oneprice = prices.oneprice;
    tableRow.dataset.twentyfiveprice = prices.twentyfiveprice;
    tableRow.dataset.onehundredprice = prices.onehundredprice;
    tableRow.dataset.fivehundredprice = prices.fivehundredprice;

    table.append(tableRow);
  });

  return table;
};

const userCardTemplate = document.querySelector("[data-user-template]");
let allUsers = [];

fetch("data.json")
  .then((res) => res.json())
  .then((data) => {
    allUsers = createUserCards(data);
    updateCardTables();
    resetCatalogFilters();
    setTimeout(resetCatalogFilters, 0);
    updateWishlistCount();
  });

const createUserCards = (data) => {
  const uniqueNames = [...new Set(data.map(({ name }) => name))];
  const userCards = [];
  const wishlist = getWishlist();

  uniqueNames.forEach((name) => {
    const usersWithName = data.filter(
      ({ name: userName }) => userName === name
    );
    const { latin: body, type } = usersWithName[0];
    const categories = [
      ...new Set(usersWithName.map((user) => getCategory(user.type))),
    ];

    const card = userCardTemplate.content.cloneNode(true).children[0];
    const header = card.querySelector("[data-header]");
    const bodyElement = card.querySelector("[data-body]");
    const summary = card.querySelector("[data-summary]");

    header.textContent = name;
    bodyElement.textContent = body;

    const summaries = usersWithName.map((user) => {
      const {
        size,
        age,
        fivehundredprice,
        onehundredprice,
        twentyfiveprice,
        oneprice,
        description,
      } = user;
      return {
        size,
        age,
        prices: {
          fivehundredprice,
          onehundredprice,
          twentyfiveprice,
          oneprice,
        },
        description,
      };
    });

    userCards.push({
      name,
      body,
      type,
      categories,
      summaries,
      element: card,
    });

    card.addEventListener("click", () => {
      card.classList.toggle("expanded");
    });

    const wishlistButton = document.createElement("button");
    wishlistButton.innerHTML =
      '<span class="icon icon-heart" aria-hidden="true"></span>';
    wishlistButton.setAttribute("aria-label", `Add ${name} to wishlist`);
    wishlistButton.setAttribute(
      "aria-pressed",
      wishlist.some((item) => item.name === name) ? "true" : "false"
    );
    wishlistButton.dataset.cardName = name;
    wishlistButton.classList.add("wishlist-button");
    wishlistButton.classList.toggle(
      "active",
      wishlist.some((item) => item.name === name)
    );
    wishlistButton.addEventListener("click", handleWishlistButtonClick);

    card.appendChild(wishlistButton);
    userCardContainer.append(card);
  });

  return userCards;
};
