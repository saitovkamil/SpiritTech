const products = [
  {
    id: 1,
    title: "Наушники Logitech G735 White",
    price: 9000,
    image: "images/logitech_g735.jpg"
  },
  {
    id: 2,
    title: "Logitech G PRO X Superlight 2C White",
    price: 31510,
    image:"images/logitech_g_pro_x.jpg"
  }
];

const productList = document.querySelector(".product-list");

productList.innerHTML = products.map(product => {
  return `
    <article class="product-card">
      <div class="product-image"><img src="${product.image}" alt="${product.title}"></div>
      <h3 class="product-title">${product.title}</h3>
      <p class="product-price">${product.price.toLocaleString("ru-RU")} ₽</p>
      <button class="add-to-cart" type="button" data-id="${product.id}">
        В корзину
      </button>
    </article>
  `;
}).join("");
