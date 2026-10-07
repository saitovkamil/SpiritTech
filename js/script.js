const productList = document.querySelector(".product-list");

products.forEach(product => {
  const card = document.createElement("article");
  card.className = "product-card";

  const imageBox = document.createElement("div");
  imageBox.className = "product-image";

  const image = document.createElement("img");
  image.src = product.image;
  image.alt = product.title;

  const title = document.createElement("h3");
  title.className = "product-title";
  title.textContent = product.title;

  const price = document.createElement("p");
  price.className = "product-price";
  price.textContent = product.price.toLocaleString("ru-RU") + " ₽";

  const button = document.createElement("button");
  button.className = "add-to-cart";
  button.type = "button";
  button.dataset.id = product.id;
  button.textContent = "В корзину";

  imageBox.append(image);
  card.append(imageBox, title, price, button);
  productList.append(card);
});

const cartButton = document.querySelector(".cart-button");
const cartDialog = document.querySelector("#cart-dialog");
const cartClose = document.querySelector(".cart-close");

cartButton.addEventListener("click", () => {
  cartDialog.showModal();
});

cartClose.addEventListener("click", () => {
  cartDialog.close();
});

let cart = loadCart();

const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartCount = document.querySelector(".cart-count");
const checkoutButton = document.querySelector(".checkout-button");
const checkoutDialog = document.querySelector("#checkout-dialog");
const checkoutClose = document.querySelector(".checkout-close");
const checkoutForm = document.querySelector(".checkout-form");
const checkoutTitle = document.querySelector("#checkout-title");
const checkoutTotal = document.querySelector(".checkout-total");
const checkoutSuccess = document.querySelector(".checkout-success");
const checkoutFields = checkoutForm.querySelectorAll("input");

checkoutButton.addEventListener("click", () => {
  if (cart.length === 0) {
    return;
  }

  checkoutForm.reset();
  checkoutFields.forEach(field => field.setCustomValidity(""));
  checkoutForm.hidden = false;
  checkoutSuccess.hidden = true;
  checkoutTitle.textContent = "Оформление заказа";
  checkoutTotal.textContent = cartTotal.textContent;
  cartDialog.close();
  checkoutDialog.showModal();
  checkoutFields[0].focus();
});

checkoutClose.addEventListener("click", () => checkoutDialog.close());
checkoutDialog.addEventListener("close", () => cartButton.focus());

checkoutDialog.addEventListener("cancel", event => {
  if (!checkoutSuccess.hidden) {
    event.preventDefault();
  }
});

checkoutDialog.addEventListener("click", event => {
  if (!checkoutSuccess.hidden) {
    return;
  }

  const rect = checkoutDialog.getBoundingClientRect();
  const clickedOutside =
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom;

  if (event.target === checkoutDialog && clickedOutside) {
    checkoutDialog.close();
  }
});

function validateCheckoutField(field) {
  const value = field.value.trim();
  field.setCustomValidity("");

  if (!value) {
    field.setCustomValidity("Заполните это поле.");
  } else if (field.name === "phone") {
    const digits = value.replace(/\D/g, "");

    if (!/^\+?[\d\s()-]+$/.test(value) || digits.length < 10 || digits.length > 15) {
      field.setCustomValidity("Введите номер телефона: от 10 до 15 цифр.");
    }
  }
}

checkoutFields.forEach(field => {
  field.addEventListener("input", () => validateCheckoutField(field));
});

checkoutForm.addEventListener("submit", event => {
  event.preventDefault();
  checkoutFields.forEach(validateCheckoutField);

  if (!checkoutForm.reportValidity() || cart.length === 0) {
    return;
  }

  cart = [];
  renderCart();
  checkoutForm.reset();
  checkoutForm.hidden = true;
  checkoutSuccess.hidden = false;
  checkoutTitle.textContent = "Заказ создан!";
  checkoutTitle.focus();
});

document.querySelectorAll(".add-to-cart").forEach(button => {
  button.addEventListener("click", () => {
    const productId = Number(button.dataset.id);
    addToCart(productId);
  });
});

function loadCart() {
  try {
    const savedCart = JSON.parse(
      localStorage.getItem("spirittech-cart")
    );

    if (!Array.isArray(savedCart)) {
      return [];
    }

    return savedCart.filter(item => {
      return item &&
        products.some(product => product.id === item.id) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0;
    });
  } catch {
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(
      "spirittech-cart",
      JSON.stringify(cart)
    );
  } catch {
    console.warn("Не удалось сохранить корзину");
  }
}

function addToCart(productId) {
  const item = cart.find(item => item.id === productId);

  if (!item) {
    cart.push({
      id: productId,
      quantity: 1
    });

    renderCart();
  }

  if (!cartDialog.open) {
    cartDialog.showModal();
  }
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  renderCart();
}

cartDialog.addEventListener("click", event => {
  const rect = cartDialog.getBoundingClientRect();

  const clickedOutside =
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom;

  if (event.target === cartDialog && clickedOutside) {
    cartDialog.close();
  }
});

function changeQuantity(productId, change) {
  const item = cart.find(item => item.id === productId);

  if (!item) {
    return;
  }

  item.quantity += change;

  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  renderCart();
}

function createCartElement(tag, className, text = "") {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;

  return element;
}

function createCartButton(text, className, label, action) {
  const button = createCartElement("button", className, text);
  button.type = "button";
  button.setAttribute("aria-label", label);
  button.addEventListener("click", action);

  return button;
}

function renderCart() {
  cartItems.replaceChildren();

  let total = 0;
  let totalQuantity = 0;

  if (cart.length === 0) {
    const message = createCartElement(
      "p",
      "cart-empty",
      "Корзина пока пуста"
    );

    cartItems.append(message);
  }

  cart.forEach(item => {
    const product = products.find(product => product.id === item.id);

    total += product.price * item.quantity;
    totalQuantity += item.quantity;

    const row = createCartElement("article", "cart-item");

    const image = createCartElement("img", "cart-item-image");
    image.src = product.image;
    image.alt = product.title;

    const details = createCartElement("div", "cart-item-details");

    const title = createCartElement(
      "h3",
      "cart-item-title",
      product.title
    );

    const price = createCartElement(
      "p",
      "cart-item-price",
      product.price.toLocaleString("ru-RU") + " ₽ за штуку"
    );

    const controls = createCartElement("div", "cart-controls");

    const minus = createCartButton(
      "−",
      "quantity-button",
      "Уменьшить количество: " + product.title,
      () => changeQuantity(item.id, -1)
    );

    const quantity = createCartElement(
      "span",
      "cart-quantity",
      item.quantity
    );

    const plus = createCartButton(
      "+",
      "quantity-button",
      "Увеличить количество: " + product.title,
      () => changeQuantity(item.id, 1)
    );

    const remove = createCartButton(
      "Удалить",
      "cart-remove",
      "Удалить из корзины: " + product.title,
      () => removeFromCart(item.id)
    );

    controls.append(minus, quantity, plus, remove);
    details.append(title, price, controls);
    row.append(image, details);
    cartItems.append(row);
  });

  cartTotal.textContent = total.toLocaleString("ru-RU") + " ₽";
  cartCount.textContent = totalQuantity;
  checkoutButton.disabled = cart.length === 0;
  saveCart();
}

renderCart();
