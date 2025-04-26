// GLOBAL CART OBJECT
let cart = JSON.parse(localStorage.getItem("cart")) || {};

// FILTER MENU
function filterMenu() {
  const searchInput = document.getElementById("menu-search-bar").value.toLowerCase();
  const allItems = document.querySelectorAll(".menu-item");
  allItems.forEach(item => {
    const name = item.dataset.name.toLowerCase();
    const category = item.dataset.category.toLowerCase();
    const subcategory = item.dataset.subcategory.toLowerCase();
    item.style.display = name.includes(searchInput) || category.includes(searchInput) || subcategory.includes(searchInput) ? "block" : "none";
  });
}

// DISPLAY MENU WITH CATEGORY + SUBCATEGORY
fetch('menu.json')
  .then(res => res.json())
  .then(data => {
    displayMenu(data);
    updateCartDisplay();
  })
  .catch(err => console.error("❌ Failed to load menu.json", err));

function displayMenu(menu) {
  const section = document.getElementById("menu-section");
  section.innerHTML = '';

  const categoryMap = {};
  menu.forEach(item => {
    if (!categoryMap[item.category]) categoryMap[item.category] = {};
    if (!categoryMap[item.category][item.subcategory]) categoryMap[item.category][item.subcategory] = [];
    categoryMap[item.category][item.subcategory].push(item);
  });

  Object.entries(categoryMap).forEach(([cat, subcategories]) => {
    const catBlock = document.createElement('div');
    catBlock.className = 'category-block';

    let subHTML = '';
    Object.entries(subcategories).forEach(([subcat, items]) => {
      subHTML += `<h4 class="subcategory-title" onclick="toggleCategory(this)">${subcat} 🔽</h4>
                  <div class='subcategory-items' style="display:none;">`;
      items.forEach(item => {
        subHTML += `
          <div class="menu-item" data-name="${item.name}" data-category="${item.category}" data-subcategory="${item.subcategory}">
            <img src="images/${item.image}" onclick="openPreview('${item.name}', '${item.image}', '${item.price}', '${item.description}')">
            <h4>${item.name}</h4>
            <p>₹${item.price}</p>
            <div class="qty-controls">
              <button onclick="updateQty('${item.name}', -1, ${item.price})">➖</button>
              <span id="qty-${item.name}">${cart[item.name]?.quantity || 0}</span>
              <button onclick="updateQty('${item.name}', 1, ${item.price})">➕</button>
            </div>
          </div>
        `;
      });
      subHTML += `</div>`;
    });

    catBlock.innerHTML = `<h3>${cat}</h3>${subHTML}`;
    section.appendChild(catBlock);
  });
}

function toggleCategory(el) {
  const itemsDiv = el.nextElementSibling;
  if (itemsDiv) {
    itemsDiv.style.display = itemsDiv.style.display === 'none' ? 'block' : 'none';
  }
}

// CART FUNCTIONS (Same as before)
function updateQty(name, delta, price) {
  if (!cart[name]) cart[name] = { quantity: 0, price: price };
  cart[name].quantity += delta;
  if (cart[name].quantity <= 0) delete cart[name];
  localStorage.setItem("cart", JSON.stringify(cart));
  document.getElementById(`qty-${name}`).innerText = cart[name]?.quantity || 0;
  updateCartDisplay();
}

function updateCartDisplay() {
  const count = Object.values(cart).reduce((a, b) => a + b.quantity, 0);
  const cartCountEl = document.getElementById("cart-count");
  if (cartCountEl) cartCountEl.innerText = count;

  const viewCartRow = document.getElementById("view-cart-row");
  const menuButton = document.getElementById("menu-toggle");
  if (count > 0) {
    viewCartRow?.classList.remove("hidden");
    const cartInfoEl = document.getElementById("cart-info");
    if (cartInfoEl) cartInfoEl.innerText = `${count} item${count > 1 ? 's' : ''} added`;
    if (menuButton) menuButton.style.bottom = "60px";
  } else {
    viewCartRow?.classList.add("hidden");
    if (menuButton) menuButton.style.bottom = "20px";
  }

  const panel = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  if (!panel || !totalEl) return;

  panel.innerHTML = '';
  let total = 0;
  Object.entries(cart).forEach(([name, item]) => {
    total += item.quantity * item.price;
    panel.innerHTML += `
      <div>
        <strong>${name}</strong><br>
        ₹${item.price} x 
        <button onclick="updateQty('${name}', -1, ${item.price})">➖</button>
        ${item.quantity}
        <button onclick="updateQty('${name}', 1, ${item.price})">➕</button>
        = ₹${item.price * item.quantity}
        <button onclick="removeFromCart('${name}')">❌</button>
      </div>
    `;
  });
  totalEl.innerText = total;
}

function removeFromCart(name) {
  delete cart[name];
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartDisplay();
}

// CART PANEL
function openCart() {
  document.getElementById("cart-panel")?.classList.remove("hidden");
  document.getElementById("cart-panel")?.classList.add("show");
}

function closeCart() {
  document.getElementById("cart-panel")?.classList.remove("show");
  setTimeout(() => document.getElementById("cart-panel")?.classList.add("hidden"), 300);
}

// MODAL PREVIEW
function openPreview(name, img, price, desc) {
  document.getElementById("preview-img").src = `images/${img}`;
  document.getElementById("preview-name").innerText = name;
  document.getElementById("preview-desc").innerText = desc;
  document.getElementById("preview-price").innerText = `₹${price}`;
  document.getElementById("preview-qty").innerText = cart[name]?.quantity || 0;
  document.getElementById("preview-modal").classList.remove("hidden");
}

function closePreview() {
  document.getElementById("preview-modal").classList.add("hidden");
}

function changeQty(action) {
  const name = document.getElementById("preview-name").innerText;
  const price = parseInt(document.getElementById("preview-price").innerText.replace("₹", ""));
  if (action === 'increase') updateQty(name, 1, price);
  else updateQty(name, -1, price);
  document.getElementById("preview-qty").innerText = cart[name]?.quantity || 0;
}

// OTHER FUNCTIONS
function openCategorySelector() {
  alert("Category selector popup coming soon!");
}

function goBack() {
  window.location.href = "china-home.html";
}

// WHATSAPP ORDER FUNCTION
function orderWhatsApp() {
  const name = document.getElementById("cust-name").value;
  const address = document.getElementById("cust-address").value;
  if (!name || !address) return alert("Enter name and address");

  let msg = `Order from China Bite:\n\n`;
  Object.entries(cart).forEach(([item, val]) => {
    msg += `- ${val.quantity} x ${item} = ₹${val.quantity * val.price}\n`;
  });
  msg += `\nTotal: ₹${Object.values(cart).reduce((a, b) => a + b.quantity * b.price, 0)}\nName: ${name}\nAddress: ${address}`;
  window.open(`https://wa.me/919819618487?text=${encodeURIComponent(msg)}`);
}
