// search

const searchInput = document.querySelector("#data-search");

searchInput.addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase();
  allUsers.forEach((user) => {
    const isVisible =
      user.name.toLowerCase().includes(value) ||
      user.body.toLowerCase().includes(value) ||
      (user.type && user.type.toLowerCase().includes(value));
    user.element.classList.toggle("hide", !isVisible);
  });
});

// cards

const toggleResourceMode = (isChecked) => {
  body.style.filter = isChecked ? "invert(1)" : "";
  body.classList.toggle("resource-mode", isChecked);
};

const updateMainHeaderAndParagraph = (isResourceModeEnabled) => {
  const mainHeader = document.querySelector(".main h1");
  const mainParagraph = document.querySelector(".main p");

  mainHeader.textContent = isResourceModeEnabled ? "Resource Mode" : "Catalog";
  mainParagraph.textContent = isResourceModeEnabled
    ? "Discover more information about Native Plants."
    : "A new way to find plant sizing & pricing by name & category.";
};

const createElement = (element, content) => {
  const el = document.createElement(element);
  el.innerHTML = content;
  return el;
};

const createTableHeaders = (headers) =>
  createElement("tr", headers.map((header) => `<th>${header}</th>`).join(""));

const createTableRow = (rowData) =>
  createElement("tr", rowData.map((data) => `<td>${data ?? ""}</td>`).join(""));

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
  const button = event.target;
  button.classList.toggle("active");

  const cardName = button.dataset.cardName;
  const user = allUsers.find((user) => user.name === cardName);

  const wishlist = getWishlist();

  if (wishlist.some((item) => item.name === cardName)) {
    removeFromWishlist(cardName);
  } else {
    addToWishlist(cardName, user);
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

const slider = document.getElementById("slider");
const body = document.body;
const userCardContainer = document.querySelector("[data-user-cards-container]");
const wishlistCountDisplay = document.getElementById("wishlist-count-display");

const updateResourceMode = () => {
  const isResourceModeEnabled = slider.checked;
  toggleResourceMode(isResourceModeEnabled);
  updateMainHeaderAndParagraph(isResourceModeEnabled);

  allUsers.forEach(({ element, summaries }) => {
    const summary = element.querySelector("[data-summary]");
    const table = createResourceModeTable(isResourceModeEnabled, summaries);
    summary.innerHTML = "";
    summary.append(table);
  });
};

const createResourceModeTable = (isResourceModeEnabled, summaries) => {
  const table = document.createElement("table");

  const tableHeaders = isResourceModeEnabled
    ? createTableHeaders([])
    : createTableHeaders(["Size", "Age", "500+", "100+", "25+", "1+"]);

  table.append(tableHeaders);

  if (isResourceModeEnabled) {
    const descriptionSummary = summaries.find(
      (summary) => summary?.description
    );

    if (descriptionSummary) {
      const tableRow = document.createElement("tr");
      tableRow.classList.add("table-row");

      const descriptionCell = document.createElement("td");
      descriptionCell.classList.add("description-additional");

      const descriptionContainer = document.createElement("div");
      descriptionContainer.classList.add("description-container");
      descriptionContainer.innerHTML = descriptionSummary.description;
      descriptionCell.append(descriptionContainer);

      const treeSvgCell = document.createElement("td");
      const treeSvgContainer = document.createElement("div");
      treeSvgContainer.classList.add("tree-svg-container");
      treeSvgContainer.innerHTML =
        "<img class='tree-svg' src='assets/tree.svg' alt='Tree Icon'>";
      treeSvgCell.append(treeSvgContainer);

      const symbolsCell = document.createElement("td");
      const buttonContainer = document.createElement("div");
      buttonContainer.classList.add("button-container");

      const symbols = ["🍋", "💧", "🪨", "☀️"];
      symbols.forEach((symbol) => {
        const circleButton = document.createElement("div");
        circleButton.classList.add("circle-button");
        circleButton.classList.add("symbol");
        circleButton.textContent = symbol;
        buttonContainer.append(circleButton);
      });

      symbolsCell.append(buttonContainer);

      tableRow.append(descriptionCell, treeSvgCell, symbolsCell);
      table.append(tableRow);
    }
  } else {
    summaries.forEach((summary) => {
      const { size, age, prices } = summary;
      const tableRow = createTableRow([
        size,
        age,
        prices.fivehundredprice,
        prices.onehundredprice,
        prices.twentyfiveprice,
        prices.oneprice,
      ]);

      tableRow.dataset.oneprice = prices.oneprice;
      tableRow.dataset.twentyfiveprice = prices.twentyfiveprice;
      tableRow.dataset.onehundredprice = prices.onehundredprice;
      tableRow.dataset.fivehundredprice = prices.fivehundredprice;

      table.append(tableRow);
    });
  }

  return table;
};

slider.addEventListener("change", () => updateResourceMode());

const userCardTemplate = document.querySelector("[data-user-template]");
let allUsers = [];

fetch("https://raw.githubusercontent.com/clowndog/alpha/main/data.json")
  .then((res) => res.json())
  .then((data) => {
    allUsers = createUserCards(data);
    updateResourceMode();
    updateWishlistCount();
  });

const createUserCards = (data) => {
  const uniqueNames = [...new Set(data.map(({ name }) => name))];
  const userCards = [];

  uniqueNames.forEach((name) => {
    const usersWithName = data.filter(
      ({ name: userName }) => userName === name
    );
    const { latin: body, type } = usersWithName[0];

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

    userCards.push({ name, body, type, summaries, element: card });

    card.addEventListener("click", () => {
      card.classList.toggle("expanded");
    });

    const wishlistButton = document.createElement("button");
    wishlistButton.textContent = "♥";
    wishlistButton.dataset.cardName = name;
    wishlistButton.classList.add("wishlist-button");
    wishlistButton.addEventListener("click", handleWishlistButtonClick);

    card.appendChild(wishlistButton);
    userCardContainer.append(card);
  });

  return userCards;
};
