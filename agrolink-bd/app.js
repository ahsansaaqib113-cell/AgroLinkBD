/**
 * AgroLink BD - Main Application Logic
 * Manages view routing, product list rendering, search/filtering,
 * shopping cart state, form validation, and toast notifications.
 */

// Mock Databases
const PRODUCTS = [
  {
    id: 1,
    name: "Fresh Organic Tomatoes",
    price: 120,
    unit: "kg",
    category: "vegetables",
    image: "assets/product_tomatoes.png",
    farmerName: "Md. Rafiq Uddin",
    rating: 4.8,
    featured: true
  },
  {
    id: 2,
    name: "Organic Wild Honey",
    price: 650,
    unit: "jar (500g)",
    category: "honey",
    image: "assets/product_honey.png",
    farmerName: "Anwara Begum",
    rating: 4.9,
    featured: true
  },
  {
    id: 3,
    name: "Fresh Green Spinach",
    price: 40,
    unit: "bundle",
    category: "vegetables",
    image: "assets/product_spinach.png",
    farmerName: "Arif Hossein",
    rating: 4.6,
    featured: true
  },
  {
    id: 4,
    name: "Crisp Red Apples",
    price: 220,
    unit: "kg",
    category: "fruits",
    image: "assets/product_apples.png",
    farmerName: "Md. Rafiq Uddin",
    rating: 4.7,
    featured: true
  },
  {
    id: 5,
    name: "Farm Fresh Eggs",
    price: 130,
    unit: "dozen",
    category: "poultry",
    image: "assets/product_eggs.png",
    farmerName: "Anwara Begum",
    rating: 4.8,
    featured: true
  },
  {
    id: 6,
    name: "Premium Miniket Rice",
    price: 75,
    unit: "kg",
    category: "grains",
    image: "", // Use fallback SVG for rice
    farmerName: "Arif Hossein",
    rating: 4.5,
    featured: false
  }
];

const FARMERS = [
  {
    id: 1,
    name: "Md. Rafiq Uddin",
    location: "Bogura, Rajshahi",
    specialties: ["Organic Tomatoes", "Apples", "Fresh Vegetables"],
    bio: "Rafiq has been practicing organic vegetable farming for over 15 years. He is dedicated to supplying pesticide-free produce.",
    email: "rafiq.farm@agrolink.bd",
    phone: "+880 1712-345678"
  },
  {
    id: 2,
    name: "Anwara Begum",
    location: "Sreemangal, Sylhet",
    specialties: ["Wild Honey", "Fresh Eggs", "Organic Spices"],
    bio: "Anwara manages an eco-friendly farm in the hills of Sreemangal. Her wild honey is locally famous for its pure flavor.",
    email: "anwara.honey@agrolink.bd",
    phone: "+880 1819-876543"
  },
  {
    id: 3,
    name: "Arif Hossein",
    location: "Jashore, Khulna",
    specialties: ["Miniket Rice", "Green Spinach", "Organic Lentils"],
    bio: "Arif uses modern sustainable agriculture techniques to grow grains and leafy greens, reducing water waste by 30%.",
    email: "arif.grains@agrolink.bd",
    phone: "+880 1911-223344"
  }
];

// Application State
let cart = [];
let activeCategory = "all";
let searchQuery = "";

// DOM Elements
document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initProductsPage();
  initFarmersPage();
  initCart();
  initContactForm();
  
  // Render featured items on home page
  renderFeaturedProducts();
});

// --- NAVIGATION SYSTEM ---
function initNavigation() {
  const navLinks = document.querySelectorAll(".nav-link");
  const menuToggle = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");

  // Router listener
  window.addEventListener("hashchange", handleRouting);
  
  // Initial route
  handleRouting();

  // Mobile menu toggle
  menuToggle.addEventListener("click", () => {
    menuToggle.classList.toggle("open");
    mobileNav.classList.toggle("open");
  });

  // Close mobile menu when a nav link is clicked
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      menuToggle.classList.remove("open");
      mobileNav.classList.remove("open");
    });
  });
}

function handleRouting() {
  const hash = window.location.hash || "#home";
  const viewId = hash.substring(1) + "-view";
  const targetSection = document.getElementById(viewId);
  
  if (targetSection) {
    // Deactivate all sections and links
    document.querySelectorAll(".page-view").forEach(sec => sec.classList.remove("active"));
    document.querySelectorAll(".nav-link").forEach(link => link.classList.remove("active"));
    
    // Activate target section
    targetSection.classList.add("active");
    
    // Highlight corresponding navbar links (both desktop and mobile)
    document.querySelectorAll(`.nav-link[href="${hash}"]`).forEach(link => link.classList.add("active"));
    
    // Scroll to top
    window.scrollTo(0, 0);
  }
}

// Helper to switch view programmatically
function navigateTo(hash) {
  window.location.hash = hash;
}

// --- PRODUCTS & FILTERING SYSTEM ---
function initProductsPage() {
  const searchInput = document.getElementById("productSearch");
  const filterButtons = document.querySelectorAll(".filter-btn");

  // Search input event
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      filterAndRenderProducts();
    });
  }

  // Category filter events
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategory = btn.dataset.category;
      filterAndRenderProducts();
    });
  });

  // Initial render
  filterAndRenderProducts();
}

function filterAndRenderProducts() {
  const filtered = PRODUCTS.filter(prod => {
    const matchesCategory = activeCategory === "all" || prod.category === activeCategory;
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery) || 
                          prod.farmerName.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  renderProductsGrid(filtered, "productsGrid");
}

function renderFeaturedProducts() {
  const featured = PRODUCTS.filter(p => p.featured);
  renderProductsGrid(featured, "featuredGrid");
}

function renderProductsGrid(productsList, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (productsList.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-message" style="grid-column: 1 / -1; padding: 4rem 0;">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="48" height="48">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <p>No products found matching your search.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = productsList.map(prod => {
    // Generate image block: use actual png asset or high-quality inline SVG illustration fallback
    let imgHTML = "";
    if (prod.image) {
      imgHTML = `<img src="${prod.image}" alt="${prod.name}" loading="lazy">`;
    } else {
      // Premium SVG illustration for Rice / Grain Sack
      imgHTML = `
        <div style="width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; background: linear-gradient(135deg, #e8f5e9, #c8e6c9); color:#1b4332;">
          <svg viewBox="0 0 64 64" width="70" height="70" fill="currentColor">
            <path d="M32 6C20 6 12 18 12 36c0 14 10 22 20 22s20-8 20-22c0-18-8-30-20-30zm0 4c8.5 0 15 11 15 26c0 10.5-6.5 17-15 17s-15-6.5-15-17c0-15 6.5-26 15-26z" opacity="0.8"/>
            <path d="M32 18v28M26 24l12 4M38 34l-12 4" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
          </svg>
          <span style="font-family:'Outfit'; font-weight:700; font-size:0.85rem; margin-top:0.5rem; text-transform:uppercase; letter-spacing:1px;">Premium Grain</span>
        </div>
      `;
    }

    return `
      <div class="product-card">
        <div class="product-img-wrapper">
          ${imgHTML}
          <span class="product-tag">${prod.category.charAt(0).toUpperCase() + prod.category.slice(1)}</span>
        </div>
        <div class="product-info">
          <div class="product-meta">
            <span class="product-farmer">
              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" style="display:inline; margin-top:-2px;">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
              </svg>
              ${prod.farmerName}
            </span>
            <span class="product-rating">
              ★ ${prod.rating.toFixed(1)}
            </span>
          </div>
          <h3 class="product-name">${prod.name}</h3>
          <div class="product-price-row">
            <div class="product-price">
              ৳${prod.price} <span>/ ${prod.unit}</span>
            </div>
            <button class="btn-add-cart" onclick="handleAddToCart(${prod.id})" aria-label="Add to cart">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// --- FARMERS DIRECTORY SYSTEM ---
function initFarmersPage() {
  const container = document.getElementById("farmersGrid");
  if (!container) return;

  container.innerHTML = FARMERS.map(farmer => {
    // Generate simple custom avatar SVG based on ID (to avoid image loading errors)
    const avatarSVG = `
      <svg viewBox="0 0 64 64" fill="currentColor">
        <circle cx="32" cy="22" r="12" />
        <path d="M14 50c0-10 8-18 18-18s18 8 18 18H14z" />
      </svg>
    `;

    const specialtyBadges = farmer.specialties.map(spec => `
      <span class="specialty-badge">${spec}</span>
    `).join("");

    return `
      <div class="farmer-card">
        <div class="farmer-avatar">
          ${avatarSVG}
        </div>
        <h3>${farmer.name}</h3>
        <div class="farmer-location">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          ${farmer.location}
        </div>
        <p class="farmer-bio">"${farmer.bio}"</p>
        <div class="farmer-specialties">
          ${specialtyBadges}
        </div>
        <a class="farmer-contact-btn"
   href="mailto:${farmer.email}?subject=Inquiry from AgroLink BD&body=Hello ${farmer.name}, I am interested in your agricultural products.">
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z">
    </path>
  </svg>
  Send Message
</a>
                  </button>
      </div>
    `;
  }).join("");
}

function openFarmerContact(farmerName) {
  // Pre-fill the contact form message and navigate there
  const messageInput = document.getElementById("contactMessage");
  if (messageInput) {
    messageInput.value = `Hello, I would like to get in touch with farmer ${farmerName} regarding their agricultural products.`;
  }
  navigateTo("#contact");
  showToast(`Inquiry initiated with ${farmerName}. Fill out the contact form.`, "success");
}

// --- SHOPPING CART SYSTEM ---
function initCart() {
  const cartToggle = document.getElementById("cartToggle");
  const cartDrawer = document.getElementById("cartDrawer");
  const cartOverlay = document.getElementById("cartDrawerOverlay");
  const closeCartBtn = document.getElementById("closeCart");
  const checkoutBtn = document.getElementById("checkoutBtn");

  // Event listners for cart open/close
  if (cartToggle) cartToggle.addEventListener("click", toggleCartDrawer);
  if (closeCartBtn) closeCartBtn.addEventListener("click", toggleCartDrawer);
  if (cartOverlay) cartOverlay.addEventListener("click", toggleCartDrawer);
  
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (cart.length === 0) return;
      
      // Simulate Checkout
      showToast("Order placed successfully! We will coordinate with the farmers and contact you soon.", "success");
      cart = [];
      updateCartUI();
      toggleCartDrawer();
    });
  }
}

function toggleCartDrawer() {
  const cartDrawer = document.getElementById("cartDrawer");
  const cartOverlay = document.getElementById("cartDrawerOverlay");
  
  if (cartDrawer && cartOverlay) {
    cartDrawer.classList.toggle("open");
    cartOverlay.classList.toggle("open");
  }
}

// Exposed wrapper for inline onclick
window.handleAddToCart = function(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existingItem = cart.find(item => item.product.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ product, quantity: 1 });
  }

  updateCartUI();
  showToast(`${product.name} added to cart!`, "success");
};

window.changeCartQuantity = function(productId, delta) {
  const item = cart.find(item => item.product.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(item => item.product.id !== productId);
    showToast(`${item.product.name} removed from cart.`, "danger");
  }

  updateCartUI();
};

window.removeFromCart = function(productId) {
  const item = cart.find(item => item.product.id === productId);
  if (!item) return;

  cart = cart.filter(item => item.product.id !== productId);
  showToast(`${item.product.name} removed from cart.`, "danger");
  updateCartUI();
};

function updateCartUI() {
  const cartCountBadges = document.querySelectorAll(".cart-count");
  const cartItemsContainer = document.getElementById("cartItems");
  const cartTotalVal = document.getElementById("cartTotalVal");
  const checkoutBtn = document.getElementById("checkoutBtn");

  // Calculate items count and total price
  let totalItems = 0;
  let totalPrice = 0;
  
  cart.forEach(item => {
    totalItems += item.quantity;
    totalPrice += item.product.price * item.quantity;
  });

  // Update badge count
  cartCountBadges.forEach(badge => {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? "flex" : "none";
  });

  // Render Cart Drawer list
  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty-message">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
        </svg>
        <p>Your cart is empty.</p>
        <button class="btn btn-primary" onclick="toggleCartDrawer(); navigateTo('#products');" style="padding: 0.6rem 1.2rem; font-size: 0.85rem; margin-top:0.5rem;">Browse Products</button>
      </div>
    `;
    cartTotalVal.textContent = "৳0";
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  if (checkoutBtn) checkoutBtn.disabled = false;
  cartTotalVal.textContent = `৳${totalPrice}`;

  cartItemsContainer.innerHTML = cart.map(item => {
    const fallbackSVG = `
      <div style="width:64px; height:64px; border-radius:8px; display:flex; align-items:center; justify-content:center; background:#c8e6c9; color:#1b4332;">
        <svg viewBox="0 0 64 64" width="32" height="32" fill="currentColor">
          <circle cx="32" cy="32" r="16" />
        </svg>
      </div>
    `;

    const imgHTML = item.product.image 
      ? `<img src="${item.product.image}" alt="${item.product.name}" class="cart-item-img">`
      : fallbackSVG;

    return `
      <div class="cart-item">
        ${imgHTML}
        <div class="cart-item-details">
          <h4 class="cart-item-name">${item.product.name}</h4>
          <p class="cart-item-farmer">from ${item.product.farmerName}</p>
          <div class="cart-item-price">৳${item.product.price}</div>
        </div>
        <div class="cart-item-actions">
          <div class="quantity-control">
            <button class="quantity-btn" onclick="changeCartQuantity(${item.product.id}, -1)">−</button>
            <span class="quantity-value">${item.quantity}</span>
            <button class="quantity-btn" onclick="changeCartQuantity(${item.product.id}, 1)">+</button>
          </div>
          <button class="btn-remove-item" onclick="removeFromCart(${item.product.id})">Remove</button>
        </div>
      </div>
    `;
  }).join("");
}

// --- CONTACT FORM SYSTEM ---
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    if (validateContactForm()) {
  const name = document.getElementById("contactName").value;
  const email = document.getElementById("contactEmail").value;
  const phone = document.getElementById("contactPhone").value;
  const message = document.getElementById("contactMessage").value;

  const recipient = "muhammadasahsansakib@gmail.com";

  const subject = encodeURIComponent("New Message from AgroLink BD");
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`
  );

  window.location.href =
    `mailto:${recipient}?subject=${subject}&body=${body}`;
}
  });

  // Realtime error clearing on input
  const inputs = form.querySelectorAll("input, textarea");
  inputs.forEach(input => {
    input.addEventListener("input", () => {
      const errorEl = document.getElementById(`${input.id}Error`);
      if (errorEl) {
        errorEl.style.display = "none";
      }
    });
  });
}

function validateContactForm() {
  let isValid = true;
  
  const name = document.getElementById("contactName");
  const email = document.getElementById("contactEmail");
  const phone = document.getElementById("contactPhone");
  const message = document.getElementById("contactMessage");

  // Name Validation
  if (name.value.trim() === "") {
    showError("contactNameError", "Name is required.");
    isValid = false;
  }

  // Email Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email.value.trim() === "") {
    showError("contactEmailError", "Email is required.");
    isValid = false;
  } else if (!emailRegex.test(email.value.trim())) {
    showError("contactEmailError", "Please enter a valid email address.");
    isValid = false;
  }

  // Phone Validation (BD mobile number formats)
  const phoneRegex = /^(?:\+8801|01)[3-9]\d{8}$/;
  if (phone.value.trim() === "") {
    showError("contactPhoneError", "Phone number is required.");
    isValid = false;
  } else if (!phoneRegex.test(phone.value.trim().replace(/[-\s]/g, ""))) {
    showError("contactPhoneError", "Please enter a valid Bangladeshi phone number (e.g. 01712345678).");
    isValid = false;
  }

  // Message Validation
  if (message.value.trim() === "") {
    showError("contactMessageError", "Message is required.");
    isValid = false;
  } else if (message.value.trim().length < 10) {
    showError("contactMessageError", "Message must be at least 10 characters long.");
    isValid = false;
  }

  return isValid;
}

function showError(errorId, message) {
  const errorEl = document.getElementById(errorId);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = "block";
  }
}

// --- DYNAMIC TOAST NOTIFICATION SYSTEM ---
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  // Icon based on type
  let iconHTML = "";
  if (type === "success") {
    iconHTML = `
      <svg fill="currentColor" viewBox="0 0 20 20" width="18" height="18" style="color:#10b981; flex-shrink:0;">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
      </svg>
    `;
  } else {
    iconHTML = `
      <svg fill="currentColor" viewBox="0 0 20 20" width="18" height="18" style="color:#ef4444; flex-shrink:0;">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
      </svg>
    `;
  }

  toast.innerHTML = `
    ${iconHTML}
    <div style="flex:1;">${message}</div>
  `;

  container.appendChild(toast);

  // Auto remove toast
  setTimeout(() => {
    toast.classList.add("fade-out");
    toast.addEventListener("transitionend", () => {
      toast.remove();
    });
  }, 4000);
}

// Make sure global navigation helper is accessible
window.navigateTo = navigateTo;
window.toggleCartDrawer = toggleCartDrawer;
