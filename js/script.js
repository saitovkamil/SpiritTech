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