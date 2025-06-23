// ==========================================
// GLOBAL VARIABLES
// ==========================================
let products = [];
let productsCart = [];
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const closeBtn = document.getElementById('close-cart');

// ==========================================
// FUNCTIONS
// ==========================================

// Render the product cards in the shop
function renderProducts(data) {
  const shopCards = document.getElementById('shopCards');
  shopCards.innerHTML = "";

  data.forEach(product => {
    const productDiv = document.createElement('div');
    productDiv.classList.add('product-card');

    productDiv.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-image" />
      <h3>${product.name}</h3>
      <p>${product.type}</p><br>
      <p><strong> $ ${product.price}</strong></p>
      <button class="btnAddCart" data-id="${product.id}">ADD TO CART</button>
    `;

    shopCards.appendChild(productDiv);
  });
}

// Show cart products inside the modal
function renderModal() {
  const productsModal = document.getElementById("productsModal");
  productsModal.innerHTML = ""; // Limpiar antes de mostrar

  if (productsCart.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.textContent = "🛒 Your cart is empty.";
    emptyMsg.style.textAlign = "center";
    emptyMsg.style.padding = "20px";
    emptyMsg.style.color = "#653924";
    emptyMsg.style.fontStyle = "italic";

    productsModal.appendChild(emptyMsg);
    return; // ❌ Salimos de la función para que no muestre más nada
  }

  productsCart.forEach(product => {
    const item = document.createElement("div");
    item.classList.add("divProductsModal")
    item.innerHTML = `  <div class="modal-info">
                          <img class="img-modal" src="${product.image}" alt="">
                          <p>${product.name}</p>
                          <p>$ ${product.price} ea.</p>
                        </div>
                        <div class="btns-modal">
                          <button class="btn-minus" data-id="${product.id}">-</button>
                          <span class="contador">${product.quantity}</span>
                          <button class="btn-plus" data-id="${product.id}">+</button>
                          <button class="btn-remove" data-id="${product.id}">❌</button>
                        </div>`;
    productsModal.appendChild(item);
  });

  // Si querés también mostrar el total al final
  const total = productsCart.reduce((acc, prod) => acc + prod.price * prod.quantity, 0);  
  const totalElement = document.createElement("div");
  totalElement.innerHTML = `<br><hr>
                            <div class="totalModal">
                              <p> Total: $${total.toFixed(2)}</p>
                              <button id="confirmOrder-btn">Confirm Order</button>
                            </div>
                            `;
  productsModal.appendChild(totalElement);
}

// Add a product to the cart (with quantity)
function addToCart(id) {
  const product = products.find(p => p.id == id);
  const itemInCart = productsCart.find(p => p.id == product.id);

  if (itemInCart) {
    itemInCart.quantity += 1;
  } else {
    const productQuantity= { ...product, quantity: 1 };
    productsCart.push(productQuantity);
  }

  countCart();
  renderModal();
  localStorage.setItem("carrito", JSON.stringify(productsCart));
  console.log(productsCart); // Ver el carrito en consola
}

// Remove a product from the cart by ID
function removeFromCart(id) {
  // Eliminar el producto cuyo id coincida
  productsCart = productsCart.filter(product => product.id != Number(id));

  // Volver a mostrar el carrito actualizado
  renderModal();

  // Actualizar el número del contador 🛒
  countCart();

  localStorage.setItem("carrito", JSON.stringify(productsCart));
}

// Increase or decrease product quantity
function changeQuantity(id, change) {
  const product = productsCart.find(p => p.id == Number(id));
  if (!product) return;

  product.quantity += change;

  if (product.quantity <= 0) {
    productsCart = productsCart.filter(p => p.id != product.id);
  }

  countCart();
  renderModal();
  localStorage.setItem("carrito", JSON.stringify(productsCart));
}

// Update the cart counter on the icon
function countCart(){
  const totalItems = productsCart.reduce((acc, prod) => acc + prod.quantity, 0);
  document.getElementById("numCart").textContent = totalItems;
}

// show cheackoutSummary
function showCheckoutSummary() {
  const summaryContainer = document.getElementById("checkout-summary");
  summaryContainer.innerHTML = ""; // Limpiamos
  document.getElementById("productsModal").innerHTML = "";

  // Title
  const title = document.createElement("h3");
  title.innerHTML = `<div class="checkout-title">
                      <hr><p>Order Summary</p><hr>
                    </div>`;
  summaryContainer.appendChild(title);

  // List products
  productsCart.forEach(product => {
    const item = document.createElement("div");
    item.className = "chekoutListProducts"
    const subtotal = (product.price * product.quantity).toFixed(2);
    item.innerHTML = `<div> <strong>${product.name}</strong> - x ${product.quantity}</div>
                      <div> <strong>$ ${subtotal}</strong></div>`;
    summaryContainer.appendChild(item);
  });

  // total without discount
  const total = productsCart.reduce((acc, prod) => acc + prod.price * prod.quantity, 0);
  const totalElement = document.createElement("div");
  totalElement.innerHTML = `<br><hr>
                            <div class="ckeckout-total">
                              <p><strong>Total:</strong></p>
                              <strong>$${total.toFixed(2)}</strong>
                            </div>`
  summaryContainer.appendChild(totalElement);

  // coupon input and btn valide
  const divCoupon = document.createElement("div");
  divCoupon.classList.add("divCheakoutsBtns");
  divCoupon.innerHTML= `<div>
                          <input type="text" id="coupon-code" name="name" placeholder="Coupon code" />
                          <button id="apply-coupon-btn">Apply Coupon</button>          
                        </div>
                        <div id="info-coupon"></div>
                        <div>
                          <button id="confirm-order-btn">Confirm Order</button>
                        </div>`
  summaryContainer.appendChild(divCoupon);
}

//function apply coupon
function applyCoupon(e) {
  const input = document.getElementById("coupon-code");
  const couponCode = input.value.trim().toUpperCase();

  const validCoupon = "PLANTITA";
  const discountRate = 0.10;

  const summaryContainer = document.getElementById("checkout-summary");
  const infocoupon = document.getElementById("info-coupon")

  

  if (couponCode === validCoupon) {
    // Calcular total con descuento
    const total = productsCart.reduce((acc, p) => acc + p.price * p.quantity, 0);
    const discounted = (total * (1 - discountRate)).toFixed(2);

    infocoupon.innerHTML = `<div class="cuponApply">
                              <p>✅ <br>Coupon applied! <br><p>
                              <p><strong>New total: $${discounted}</strong></p>`;
                    
    input.style.display = "none";
    e.target.style.display = "none";
  } else {
    infocoupon.innerHTML = `invalid coupon`    
    infocoupon.style.color = "#FF5656";

    setTimeout(() => {
      infocoupon.innerHTML = ``     
    }, 2000);
  }
}

//function final alerts
function showFinalAlerts(){
  let timerInterval;
    Swal.fire({
      title: "Processing your order...",
      html: "Please wait a moment ",
      timer: 2000,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
        const timer = Swal.getPopup().querySelector("b");
        timerInterval = setInterval(() => {
        timer.textContent = `${Swal.getTimerLeft()}`;
        }, 1000);
      },
      willClose: () => {
        clearInterval(timerInterval);
        cartModal.style.display = 'none';

      }
    }).then((result) => {
      /* Read more about handling dismissals below */
      if (result.dismiss === Swal.DismissReason.timer) {
        Swal.fire({
          title: "Order confirmed!",
          text: "🌿 Thank you! 🌿",
          icon: "success",
          draggable: true
        });
      }
    });
  // Vaciar el carrito
  productsCart = [];
  // Actualizar el número del carrito
  countCart();
  // Limpiar el modal si está abierto
  renderModal();

  // Borrar carrito guardado del localStorage
  localStorage.removeItem("carrito");
}


// ==========================================
// FETCH PRODUCTS
// ==========================================

fetch('products.json')
  .then(res => res.json())
  .then(data => {
    products = data;
    renderProducts(products); // Mostrar los productos en pantalla
  })
  .catch(err => console.error('Error loading JSON:', err));

// ==========================================
// EVENT LISTENERS
// ==========================================

// Open cart modal
cartBtn.addEventListener('click', () => {
  renderModal() ;
  cartModal.style.display = 'block'; 

  const summary = document.getElementById("checkout-summary");
  if (summary) {
    summary.innerHTML = "";
  }
});

// Close cart modal
closeBtn.addEventListener('click', () => {
  cartModal.style.display = 'none';

  const summary = document.getElementById("checkout-summary");
  if (summary) {
    summary.innerHTML = "";
  }
});

// Close modal by clicking outside
window.addEventListener('click', (e) => {
  if (e.target === cartModal) {
    cartModal.style.display = 'none';
  }
});

// Handle all cart button clicks
document.addEventListener("click", e => {

  // click Add product to cart
  if (e.target.classList.contains("btnAddCart")) {
    const id = e.target.getAttribute("data-id");
    addToCart(id);

    Toastify({
      text: "Added to cart!",
      duration: 3000,
      gravity: "bottom", 
      position: "right", 
      style: {
        background: "linear-gradient(to right,rgb(87, 163, 101),rgb(46, 122, 73))",
      },
      }).showToast();
  }

  //click Remove product from cart
  if (e.target.classList.contains("btn-remove")) {
    const id = e.target.getAttribute("data-id");
    removeFromCart(id);
  }

  // click + Increase product quantity
  if (e.target.classList.contains("btn-plus")) {
    const id = e.target.getAttribute("data-id");
    changeQuantity(id, 1);
  }

  //click -- Decrease product quantit
  if (e.target.classList.contains("btn-minus")) {
    const id = e.target.getAttribute("data-id");
    changeQuantity(id, -1); // resta 1
  }  

  // Show checkout - confirmOrder
    if (e.target.id === "confirmOrder-btn") {
    showCheckoutSummary();
  }

  // validate coupon
  if (e.target.id === "apply-coupon-btn") {
    applyCoupon(e);
  }

  //button final confirm
  if(e.target.id === "confirm-order-btn"){
    showFinalAlerts()
  }

  //ver despues
  // 🔄 Optional: Clear all cart (if you add a "Clear cart" button later)
  // if (e.target.id === "clear-cart-btn") {
  //   productsCart = [];
  //   countCart();
  //   renderModal();
  //   localStorage.removeItem("carrito");
  // }

});

// ==========================================
// COUPON ALERT
// ==========================================
setTimeout(() => {
  Swal.fire({
    title: "COUPON 10% OFF",
    text: "🌿 PLANTITA 🌿",
    footer: 'Enter the coupon at checkout'
  });
}, 5000);


// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  const saveCart = localStorage.getItem("carrito");

  if (saveCart) {
    productsCart = JSON.parse(saveCart); // convierte de texto a array
    countCart(); // actualiza el número del carrito 🛒
  }


  window.scrollTo(0, 0); 
});

