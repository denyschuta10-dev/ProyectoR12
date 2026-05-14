let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let productoActual = null;

// ABRIR MODAL
function openModal(producto) {

    productoActual = producto;

    document.getElementById('modalTitle').innerText =
        producto.nombre;

    document.getElementById('modalPriceLabel').innerText =
        "Q " + producto.precio;

    document.getElementById('modalDesc').innerText =
        producto.descripcion;

    document.getElementById('modalImg').src =
        producto.imagen_url;

    document.getElementById('productModal').style.display =
        "block";

    document.body.style.overflow =
        "hidden";
}

// CERRAR MODAL
function closeModal() {
    document.getElementById('productModal').style.display = "none";
    document.body.style.overflow = "auto";
}



function eliminarItem(index) {
    carrito.splice(index, 1);
    actualizarCarritoUI();
}

function abrirCarrito() {
    document.getElementById('side-cart').classList.add('open');
}

function cerrarCarrito() {
    document.getElementById('side-cart').classList.remove('open');
}

// FINALIZAR COMPRA
function comprarCarritoWhatsApp() {
    if (carrito.length === 0) return mostrarAlerta("Tu carrito está vacío");

    let mensaje = "¡Hola R12 Sports! 🦁 Quiero realizar el siguiente pedido:\n\n";
    let total = 0;

    carrito.forEach(p => {
        // Multiplicamos precio por la cantidad seleccionada
        let subtotal = p.precio * p.cantidadEnCarrito;
        mensaje += `✅ ${p.nombre} (x${p.cantidadEnCarrito}) - Q${subtotal.toFixed(2)}\n`;
        total += subtotal;
    });

    mensaje += `\n💰 *Total a pagar: Q${total.toFixed(2)}*`;
    
    const url = `https://wa.me/50233816134?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');

setTimeout(() => {

    carrito = [];

    actualizarCarritoUI();

    localStorage.removeItem("carrito");

    cerrarCarrito();

    mostrarAlerta("Pedido enviado correctamente");

}, 500);
}

// COMPRA RÁPIDA (Desde el modal directo)
function sendWhatsAppDirecto() {
    const title = document.getElementById('modalTitle').innerText;
    const price = document.getElementById('modalPriceLabel').innerText;
    const mensaje =
`¡Hola R12 Sports! 🦁

Quiero comprar este producto:

📦 ${title}
💰 ${price}`;
    window.open(`https://wa.me/50233816134?text=${encodeURIComponent(mensaje)}`, '_blank');
}

function pedirPersonalizado() {
    const nombre = document.getElementById('custom-name').value;
    const numero = document.getElementById('custom-number').value;
    const talla = document.getElementById('custom-size').value;

    if (!nombre || !numero) {
        mostrarAlerta("Por favor rellena el nombre y número");
        return;
    }

    const mensaje = `¡Hola R12 Sports! 🦁 Quiero una camisola personalizada:\n👤 Nombre: ${nombre}\n🔢 Número: ${numero}\n📏 Talla: ${talla}`;
    window.open(`https://wa.me/50233816134?text=${encodeURIComponent(mensaje)}`, '_blank');
}

function openClientModal(imgSrc) {
    const modal = document.getElementById('clientModal');
    const img = document.getElementById('clientModalImg');

    if (!modal || !img) return;

    clientIndex = clientImages.indexOf(imgSrc);
    if (clientIndex === -1) clientIndex = 0;

    img.src = clientImages[clientIndex];

    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

function closeClientModal() {
    const modal = document.getElementById('clientModal');
    if (!modal) return;

    modal.style.display = "none";
    document.body.style.overflow = "auto";
}

/* 🔥 MEJOR QUE window.onclick */
window.addEventListener("click", function(event) {
    const pModal = document.getElementById('productModal');
    const cModal = document.getElementById('clientModal');

    if (pModal && event.target === pModal) closeModal();
    if (cModal && event.target === cModal) closeClientModal();
});





// ========================================
// GALERÍA DE IMÁGENES (ACADEMIA R12)
// ========================================

let currentImages = [];
let currentIndex = 0;

// ABRIR GALERÍA
function openGallery(images, index) {
    const modal = document.getElementById("galleryModal");
    const img = document.getElementById("galleryImg");

    if (!modal || !img) return;

    currentImages = images;
    currentIndex = index;

    modal.style.display = "flex";
    document.body.style.overflow = "hidden";

    img.src = currentImages[currentIndex];

    // 🔥 MOSTRAR / OCULTAR FLECHAS
    const arrows = document.querySelectorAll(".arrow");

    if (images.length <= 1) {
        arrows.forEach(a => a.style.display = "none");
    } else {
        arrows.forEach(a => a.style.display = "block");
    }
}

// SIGUIENTE
function nextImage() {
    if (currentImages.length === 0) return;

    currentIndex++;
    if (currentIndex >= currentImages.length) currentIndex = 0;

    document.getElementById("galleryImg").src = currentImages[currentIndex];
}

// ANTERIOR
function prevImage() {
    if (currentImages.length === 0) return;

    currentIndex--;
    if (currentIndex < 0) currentIndex = currentImages.length - 1;

    document.getElementById("galleryImg").src = currentImages[currentIndex];
}

// CERRAR
function closeGallery() {
    const modal = document.getElementById("galleryModal");
    if (!modal) return;

    modal.style.display = "none";
    document.body.style.overflow = "auto";
}

// CLICK AFUERA
window.addEventListener("click", function(e) {
    const modal = document.getElementById("galleryModal");

    if (modal && e.target === modal) {
        closeGallery();
    }
});

// TECLADO (opcional PRO)
document.addEventListener("keydown", function(e) {
    const modal = document.getElementById("galleryModal");

    if (modal && modal.style.display === "flex") {
        if (e.key === "ArrowRight") nextImage();
        if (e.key === "ArrowLeft") prevImage();
        if (e.key === "Escape") closeGallery();
    }
});


// ========================================
// FLECHAS PARA CLIENTES (CORRECTO)
// ========================================

let clientImages = [
    "/Imagenes/Cliente1.jpg",
    "/Imagenes/Cliente2.jpg",
    "/Imagenes/Cliente3.jpg",
    "/Imagenes/Cliente4.jpg",
    "/Imagenes/Cliente5.jpg",
    "/Imagenes/Cliente6.jpg",
    "/Imagenes/Cliente7.jpg",
    "/Imagenes/Cliente8.jpg"
];

let clientIndex = 0;

function nextClientImage() {
    clientIndex++;
    if (clientIndex >= clientImages.length) clientIndex = 0;

    document.getElementById("clientModalImg").src = clientImages[clientIndex];
}

function prevClientImage() {
    clientIndex--;
    if (clientIndex < 0) clientIndex = clientImages.length - 1;

    document.getElementById("clientModalImg").src = clientImages[clientIndex];
}


// ========================================
// CONEXIÓN CON EL INVENTARIO REAL (BACKEND)
// ========================================

document.addEventListener('DOMContentLoaded', () => {

    if (document.getElementById('product-grid-db')) {
        cargarProductosDesdeBD();
    }

    if (document.getElementById('cart-items')) {
        actualizarCarritoUI();
    }

});



let productosOriginales = []; // Guardamos la lista completa para el buscador

// 1. CARGAR PRODUCTOS Y GUARDARLOS
function cargarProductosDesdeBD() {
    const grid = document.getElementById('product-grid-db');

if (!grid) return;
    
    fetch('/productos')
        .then(response => response.json())
        .then(productos => {
            productosOriginales = productos; // Backup para el buscador
            renderizarProductos(productos);
            inicializarBuscador();
        })
        .catch(err => {
            grid.innerHTML = "<p style='color: red;'>Error al conectar con el servidor.</p>";
        });
}

// 2. DIBUJAR LAS TARJETAS (Con validación de Stock)
function renderizarProductos(lista) {

    const grid =
    document.getElementById('product-grid-db');

    grid.innerHTML = "";

    lista.forEach(p => {

        const tieneStock =
        p.cantidad > 0;

        const card =
        document.createElement('div');

        card.className =
        `product-card-apple ${!tieneStock ? 'out-of-stock' : ''}`;

        // CLICK EN LA TARJETA → MODAL
        card.onclick = () => {

            openModal(p);

        };

        card.innerHTML = `
            <div class="img-placeholder">

                <img
                    src="${p.imagen_url}"
                    alt="${p.nombre}"
                    onerror="this.src='/Imagenes/LogoT.jpg'"
                >

                ${!tieneStock
                    ? '<span class="badge-agotado">Agotado</span>'
                    : ''
                }

            </div>

            <h3 class="product-name">
                ${p.nombre}
            </h3>

            <p class="product-price">
                Q ${parseFloat(p.precio).toFixed(2)}
            </p>

            <p class="product-stock">
                ${tieneStock
                    ? `Disponibles: ${p.cantidad}`
                    : 'Sin existencias'
                }
            </p>

            <button
                class="btn-apple"
                ${!tieneStock ? 'disabled' : ''}
            >
                Ver Detalles
            </button>
        `;

        grid.appendChild(card);

        // CLICK EN BOTÓN → PÁGINA PRODUCTO
        const boton =
        card.querySelector("button");

        boton.addEventListener("click", (e) => {

            e.stopPropagation();

            window.location.href =
            'producto.html?id=' + p.id;

        });

    });

}

// 3. BUSCADOR EN TIEMPO REAL
function inicializarBuscador() {
    document.getElementById('search-tienda').addEventListener('input', (e) => {
        const termino = e.target.value.toLowerCase();
        const filtrados = productosOriginales.filter(p => 
            p.nombre.toLowerCase().includes(termino)
        );
        renderizarProductos(filtrados);
    });
}

// 4. CARRITO CON CONTROL DE CANTIDADES
function agregarAlCarritoDesdeModal() {

    if (!productoActual) return;

    const existe = carrito.find(
        item => item.id === productoActual.id
    );

    if (existe) {

        if (existe.cantidadEnCarrito < productoActual.cantidad) {

            existe.cantidadEnCarrito++;

        } else {

            mostrarAlerta(
                "⚠️ No hay más stock disponible"
            );

            return;
        }

    } else {

        carrito.push({

            id: productoActual.id,
            nombre: productoActual.nombre,
            precio: parseFloat(productoActual.precio),
            img: productoActual.imagen_url,
            cantidadEnCarrito: 1,
            stockMax: productoActual.cantidad

        });
    }

   actualizarCarritoUI();

closeModal();

document.getElementById('side-cart').classList.add('open');

mostrarAlerta("Producto agregado al carrito");
}

// 5. INTERFAZ DEL CARRITO ACTUALIZADA
function actualizarCarritoUI() {

    if (!document.getElementById('cart-items')) return;
    const cartContainer = document.getElementById('cart-items');
    const totalContainer = document.getElementById('cart-total');
    const countContainer = document.getElementById('cart-count');
    
    cartContainer.innerHTML = '';
    let total = 0;

    carrito.forEach((prod, index) => {
        total += (prod.precio * prod.cantidadEnCarrito);
        cartContainer.innerHTML += `
            <div class="cart-item-modern">
                <img src="${prod.img}" width="60">
                <div class="cart-item-info">
                    <h4>${prod.nombre}</h4>
                    <div class="quantity-controls">
                        <button onclick="cambiarCantidad(${index}, -1)">-</button>
                        <span>${prod.cantidadEnCarrito}</span>
                        <button onclick="cambiarCantidad(${index}, 1)">+</button>
                    </div>
                </div>
                <div class="cart-item-price">
                    Q ${(prod.precio * prod.cantidadEnCarrito).toFixed(2)}
                </div>
            </div>
        `;
    });

    if (carrito.length === 0) {

    cartContainer.innerHTML = `
        <p style="text-align:center; color:#888;">
            Tu carrito está vacío
        </p>
    `;
}

    countContainer.innerText = carrito.reduce((sum, p) => sum + p.cantidadEnCarrito, 0);
    totalContainer.innerText = `Q ${total.toFixed(2)}`;
    localStorage.setItem(
    "carrito",
    JSON.stringify(carrito)
);
}

function cambiarCantidad(index, valor) {
    const item = carrito[index];
    const nuevaCant = item.cantidadEnCarrito + valor;

    if (nuevaCant > 0 && nuevaCant <= item.stockMax) {
        item.cantidadEnCarrito = nuevaCant;
    } else if (nuevaCant <= 0) {
        carrito.splice(index, 1);
    } else {
        mostrarAlerta("Máximo stock disponible alcanzado");
    }
    actualizarCarritoUI();
}

function mostrarAlerta(msg) {

    document.getElementById("alertMessage").innerText = msg;

    document.getElementById("customAlert").style.display = "flex";

    document.body.style.overflow = "hidden";
}

function cerrarAlerta() {

    document.getElementById("customAlert").style.display = "none";

    document.body.style.overflow = "auto";
}


function agregarProducto() {

    if (!productoActual) return;

    let carrito =
    JSON.parse(localStorage.getItem("carrito")) || [];

    const existe = carrito.find(
        item => item.id === productoActual.id
    );

    if (existe) {

        if (existe.cantidadEnCarrito < productoActual.cantidad) {

            existe.cantidadEnCarrito++;

        } else {

            mostrarAlerta("⚠️ No hay más stock disponible");

            return;
        }

    } else {

        carrito.push({

            id: productoActual.id,
            nombre: productoActual.nombre,
            precio: parseFloat(productoActual.precio),
            img: productoActual.imagen_url,
            cantidadEnCarrito: 1,
            stockMax: productoActual.cantidad

        });
    }

    localStorage.setItem(
        "carrito",
        JSON.stringify(carrito)
    );

    mostrarAlerta("Producto agregado al carrito");
}