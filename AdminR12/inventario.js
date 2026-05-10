const API = "/productos";

let editandoID = null;

let dineroActual = 0;

document.addEventListener("DOMContentLoaded", () => {

    const modalProducto = document.getElementById("modal-producto");
    const modalActividad = document.getElementById("modal-actividad");

    // cerrar con X (seguro)
    document.getElementById("close-modal-producto").onclick = cerrarModalProducto;
    document.getElementById("close-modal-actividad").onclick = cerrarModalActividad;

    // cerrar al hacer click SOLO en el fondo
    modalProducto.addEventListener("click", (e) => {
        if (e.target === modalProducto) {
            cerrarModalProducto();
        }
    });

    modalActividad.addEventListener("click", (e) => {
        if (e.target === modalActividad) {
            cerrarModalActividad();
        }
    });

    // ESC opcional (mejora UX)
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            cerrarModalProducto();
            cerrarModalActividad();
        }
    });

    const buscador = document.createElement("input");
    buscador.classList.add("buscador-productos");
    buscador.placeholder = "🔍 Buscar producto por nombre o código...";

    const contSec = document.querySelector(".acciones-secundarias");
    if (contSec) {
        contSec.prepend(buscador);
    }

    buscador.addEventListener("input", () => {
        const valor = buscador.value.toLowerCase();
        document.querySelectorAll(".tarjeta").forEach(card => {
             const texto = card.innerText.toLowerCase();
             card.style.display = texto.includes(valor) ? "block" : "none";
            });
        });


    verificarSesion();

    // Asignar event listeners a todos los botones

    // Asignar event listeners a todos los botones
    document.getElementById("btn-login").addEventListener("click", login);
    document.getElementById("btn-agregar").addEventListener("click", agregar);
    
    // Solo estos dos para el modal de acciones
    document.getElementById("btn-vender").onclick = () => abrirModalAccion("vender");
    document.getElementById("btn-eliminar").onclick = () => abrirModalAccion("eliminar");
    
    // BOTÓN DE SALIR (Asegúrate de que esta línea esté tal cual)
    document.getElementById("btn-salir").addEventListener("click", salir);
    
    document.getElementById("btn-crear-vendedor")
.addEventListener("click", crearVendedor);

document.getElementById("btn-ver-usuarios")
.addEventListener("click", verUsuarios);

document.getElementById("close-modal-usuarios")
.addEventListener("click", cerrarModalUsuarios);

document.getElementById("btn-crear-vendedor")
.addEventListener("click", () => {
    document.getElementById("modal-crear-vendedor")
    .classList.add("activo");
});

document.getElementById("close-modal-crear-vendedor")
.addEventListener("click", () => {
    document.getElementById("modal-crear-vendedor")
    .classList.remove("activo");
});
// ... rest of DOMContentLoaded

});


// ================= LOGIN =================
function login() {

    const u = document.getElementById("login-usuario").value;

    const c = document.getElementById("login-clave").value;

    fetch("/login", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            usuario: u,
            clave: c
        })

    })
    .then(r => r.json())
    .then(data => {

        if (data.error) {

            document.getElementById("login-error")
            .style.display = "block";

            document.getElementById("login-error")
            .innerText = data.error;

            return;
        }

        sessionStorage.setItem("sesion", "true");

        sessionStorage.setItem("usuario", data.usuario);

        sessionStorage.setItem("rol", data.rol);

        document.getElementById("login-section")
        .style.display = "none";

        document.querySelector("main")
        .style.display = "block";

        document.querySelector("aside")
        .style.display = "flex";

        aplicarPermisos();

        cargarDatos();

    })
    .catch(err => {

        console.log(err);

        alert("Error conectando con el servidor");

    });

}


// ================= SESION =================
function verificarSesion() {
    if (sessionStorage.getItem("sesion") === "true") {
        document.getElementById("login-section").style.display = "none";
        document.querySelector("main").style.display = "block";
        document.querySelector("aside").style.display = "flex";
        cargarDatos();
    } else {
        document.getElementById("login-section").style.display = "flex";
    }

    aplicarPermisos();
}

function aplicarPermisos() {

    const rol = sessionStorage.getItem("rol");

    if (rol === "vendedor") {

        document.getElementById("btn-agregar")
        .style.display = "none";

        document.getElementById("btn-eliminar")
        .style.display = "none";

        document.getElementById("btn-crear-vendedor")
        .style.display = "none";

        document.getElementById("btn-ver-usuarios")
        .style.display = "none";
    }
}


// ================= CARGAR TODO =================
function cargarDatos() {
    // 1. Traer el balance
    fetch("/balance")
        .then(r => r.json())
        .then(data => {
            dineroActual = parseFloat(data.dinero_actual || 0);
            document.getElementById("dinero-actual").textContent = "Saldo actual: Q" + dineroActual.toFixed(2);
        });

    // 2. Traer los productos
    verInventario();

    // 3. Traer las actividades
    cargarRegistros(); 
}


// ================= SALIR =================
// 1. Abre el modal al tocar el botón de la puerta
function salir() {
    document.getElementById("modal-salir").classList.add("activo");
}

// 2. Si el usuario hace clic en "Cancelar" (Cierra el modal)
document.getElementById("btn-cancelar-salir").onclick = () => {
    document.getElementById("modal-salir").classList.remove("activo");
};

// 3. Si el usuario confirma "Salir" (Cierra sesión de verdad)
document.getElementById("btn-confirmar-salir").onclick = () => {
    sessionStorage.removeItem("sesion");
    sessionStorage.removeItem("usuario");

    // Ocultar todo y mostrar login
    document.getElementById("modal-salir").classList.remove("activo");
    document.getElementById("login-section").style.display = "flex";
    document.querySelector("main").style.display = "none";
    document.querySelector("aside").style.display = "none";
    
    // Opcional: recargar la página para limpiar todo rastro
    location.reload(); 
};


// ================= INVENTARIO (ACTUALIZADO) =================
function verInventario() {
    fetch(API)
    .then(r => r.json())
    .then(data => {
        const cont = document.getElementById("inventario");
        cont.innerHTML = "";

        data.forEach(p => {
            const div = document.createElement("div");
            div.className = "tarjeta";
            
            const imagen = p.imagen_url 
                ? `<img src="${p.imagen_url}" class="img-producto-tarjeta" onerror="this.src='https://cdn-icons-png.flaticon.com/512/924/924514.png'">` 
                : `<i class="fas fa-coffee fa-3x" style="margin-bottom:10px; color:#006241;"></i>`;
            
            // Creamos el botón por separado para manejar el evento de forma más limpia
            div.innerHTML = `
                ${imagen} 
                <h3>${p.nombre}</h3>
                <p><strong>Código:</strong> ${p.codigo}</p>
                <p><strong>Stock:</strong> ${p.cantidad}</p>
                <p><strong>Precio:</strong> Q${p.precio}</p>
            `;

            const btnEditar = document.createElement("button");
            btnEditar.className = "btn-editar-mini";
            btnEditar.innerHTML = `<i class="fas fa-edit"></i> Editar`;
            btnEditar.onclick = (e) => {
                e.stopPropagation(); // Evita abrir el modal de detalles
                prepararEdicion(p);  // Pasamos el objeto directamente sin stringify
            };

            div.appendChild(btnEditar);
            div.onclick = () => abrirModalProducto(p);
            cont.appendChild(div);
        });
    });
}

function prepararEdicion(p) {
    editandoID = p.id;
    document.getElementById("modal-titulo-registro").innerText = "Editando Producto";
    document.getElementById("form-codigo").value = p.codigo;
    document.getElementById("form-codigo").disabled = true; // No dejamos cambiar el código en edición
    document.getElementById("form-nombre").value = p.nombre;
    document.getElementById("form-cantidad").value = p.cantidad;
    document.getElementById("form-precio").value = p.precio;
    document.getElementById("form-descripcion").value = p.descripcion;
    urlImagenSubida = p.imagen_url;
    document.getElementById("nombre-archivo-status").textContent = "✅ Foto cargada";
    
    document.getElementById("modal-agregar").classList.add("activo");
}

// ================= AGREGAR (CORREGIDO CON TEMPORIZADOR) =================
// Variable global para la URL de la imagen
let urlImagenSubida = "";

// --- LÓGICA DEL MODAL AGREGAR ---
function agregar() {
    document.getElementById("form-codigo").value = "";
    document.getElementById("form-nombre").value = "";
    document.getElementById("form-cantidad").value = "";
    document.getElementById("form-precio").value = "";
    document.getElementById("form-descripcion").value = ""; // <-- NUEVO
    document.getElementById("nombre-archivo-status").textContent = "No hay foto seleccionada";
    urlImagenSubida = "";
    
    document.getElementById("modal-agregar").classList.add("activo");
}

// Cerrar el modal de agregar
document.getElementById("close-modal-agregar").onclick = () => {
    document.getElementById("modal-agregar").classList.remove("activo");
};

// Al hacer clic en "Elegir Foto" dentro del modal
document.getElementById("btn-seleccionar-foto").onclick = () => {
    document.getElementById("input-galeria-oculto").click(); // Esto NUNCA fallará aquí
};

// Cuando el input de archivo cambie (el usuario eligió la foto)
document.getElementById("input-galeria-oculto").onchange = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    document.getElementById("nombre-archivo-status").textContent = "Cargando: " + archivo.name;

    const formData = new FormData();
    formData.append('imagen', archivo);

    try {
        const resSubida = await fetch('/upload-image', { method: 'POST', body: formData });
        if (!resSubida.ok) throw new Error("Error al subir");
        
        const dataSubida = await resSubida.json();
        urlImagenSubida = dataSubida.url;
        document.getElementById("nombre-archivo-status").textContent = "✅ Foto lista: " + archivo.name;
    } catch (error) {
        alert("❌ Error al subir la imagen");
        document.getElementById("nombre-archivo-status").textContent = "Error al cargar";
    }
};


// ================= BUSCAR =================
function buscar() {
    const codigo = prompt("Código:");

    fetch(API)
    .then(r => r.json())
    .then(data => {
        const p = data.find(x => x.codigo == codigo);
        if (!p) return alert("No encontrado");

        alert(`${p.nombre}\nCódigo: ${p.codigo}\nCantidad: ${p.cantidad}\nPrecio: Q${p.precio}`);
    });
}



// ================= DINERO =================
function actualizarDinero() {
    document.getElementById("dinero-actual").textContent = "Saldo actual: Q" + dineroActual.toFixed(2);
    
    // Guardar en la nube (MySQL)
    fetch("/balance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dinero: dineroActual })
    });
}

// ================= REGISTROS (CON MODAL FUNCIONAL) =================
function agregarRegistro(texto) {
    fetch("/actividades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
    texto:
    sessionStorage.getItem("usuario") +
    ": " + texto
})
    }).then(() => cargarRegistros());
}


function cargarRegistros() {
    fetch("/actividades")
    .then(r => r.json())
    .then(data => {

        console.log("ACTIVIDADES:", data);

        const lista = document.getElementById("registro-lista");
        lista.innerHTML = "";

        // Verificar si realmente es un array
        if (!Array.isArray(data)) {
            console.error("Error: la API no devolvió un array");
            return;
        }

        data.forEach(act => {
            const li = document.createElement("li");

            const fecha = new Date(act.fecha).toLocaleString();

            li.textContent = `[${fecha}] ${act.texto}`;

            li.addEventListener("click", () => {
                abrirModalActividad({
                    texto: act.texto,
                    fecha: fecha
                });
            });

            lista.appendChild(li);
        });

    })
    .catch(err => {
        console.error("Error cargando actividades:", err);
    });
}

// ================= MODALES =================
// Ver detalles con descripción incluida
function abrirModalProducto(p) {
    const vistaPreviaImagen = p.imagen_url 
        ? `<img src="${p.imagen_url}" style="width:100%; max-height:200px; object-fit:contain; margin-bottom:15px; border-radius:8px;">` 
        : `<div style="text-align:center; margin-bottom:15px;"><i class="fas fa-coffee fa-4x" style="color:#006241;"></i></div>`;

    document.getElementById("modal-producto-detalles").innerHTML = `
        ${vistaPreviaImagen}
        <div style="border-top: 1px solid #eee; padding-top: 15px;">
            <div style="margin-bottom: 8px;"><strong>Nombre:</strong> ${p.nombre}</div>
            <div style="margin-bottom: 8px;"><strong>Código:</strong> ${p.codigo}</div>
            <div style="margin-bottom: 8px;"><strong>Stock:</strong> ${p.cantidad} unidades</div>
            <div style="margin-bottom: 8px;"><strong>Precio:</strong> Q${p.precio}</div>
            <div style="margin-top: 15px; background: #f9f9f9; padding: 10px; border-radius: 8px;">
                <strong>Descripción:</strong><br>
                <span style="color: #555; font-size: 14px;">${p.descripcion || "Sin descripción disponible."}</span>
            </div>
        </div>
    `;
    document.getElementById("modal-producto").classList.add("activo");
}

// ================= CERRAR MODALES =================

function cerrarModalProducto() {
    document.getElementById("modal-producto").classList.remove("activo");
}

function abrirModalActividad(r) {
    document.getElementById("modal-actividad-detalles").innerHTML = `
        <div style="font-weight:bold; margin-bottom:10px;">Detalles de la Actividad</div>
        <div><strong>Fecha:</strong> ${r.fecha}</div>
        <div><strong>Acción:</strong> ${r.texto}</div>
    `;
    document.getElementById("modal-actividad").classList.add("activo");
}

function cerrarModalActividad() {
    document.getElementById("modal-actividad").classList.remove("activo");
}

// Función auxiliar para guardar el producto con la imagen
function agregarSeguro(codigo, nombre, cantidad, precio, imagen_url, descripcion) {
    fetch(API, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({codigo, nombre, cantidad, precio, imagen_url, descripcion}) 
    }).then(() => {
        alert("✅ PRODUCTO AGREGADO CON ÉXITO");
        agregarRegistro("Producto agregado: " + nombre);
        verInventario();
    });
}

let tipoAccionActual = ""; // Nos dirá si estamos vendiendo, eliminando o editando

// 1. Función para abrir el modal configurado
function abrirModalAccion(tipo) {
    tipoAccionActual = tipo;
    const titulo = document.getElementById("titulo-modal-acciones");
    const contenedor = document.getElementById("contenedor-dinamico-accion");
    const inputCodigo = document.getElementById("accion-codigo");
    
    // Limpiar siempre al abrir
    inputCodigo.value = "";
    contenedor.innerHTML = "";

    if (tipo === "vender") {
        titulo.textContent = "Vender Producto";
        contenedor.innerHTML = `<input type="number" id="accion-cantidad" placeholder="Cantidad a vender" class="input-moderno">`;
    } else if (tipo === "eliminar") {
        titulo.textContent = "Eliminar Producto";
        contenedor.innerHTML = `<p style="color: #666; text-align: center;">Se eliminará permanentemente el producto con este código.</p>`;
    } else if (tipo === "editar") {
        titulo.textContent = "Editar Precio";
        contenedor.innerHTML = `<input type="number" step="0.01" id="accion-precio" placeholder="Nuevo precio (Q)" class="input-moderno">`;
    }

    document.getElementById("modal-acciones").classList.add("activo");
}

// 2. Cerrar modal de acciones
document.getElementById("close-modal-acciones").onclick = () => {
    document.getElementById("modal-acciones").classList.remove("activo");
};

// 3. Lógica del botón CONFIRMAR del modal
document.getElementById("btn-confirmar-accion").onclick = async () => {
    const codigo = document.getElementById("accion-codigo").value;
    if (!codigo) return alert("⚠️ Ingresa el código");

    const r = await fetch(API);
    const data = await r.json();
    const p = data.find(x => String(x.codigo) === String(codigo));

    if (!p) return alert("❌ Producto no encontrado");

    if (tipoAccionActual === "vender") {
        const cant = parseInt(document.getElementById("accion-cantidad").value);
        if (isNaN(cant) || cant <= 0 || cant > p.cantidad) return alert("❌ Cantidad inválida o stock insuficiente");
        
        p.cantidad -= cant;
        dineroActual += p.precio * cant;
        actualizarProductoServidor(p, "Venta: " + p.nombre, true);

    } else if (tipoAccionActual === "eliminar") {
        if (confirm(`¿Seguro que deseas eliminar ${p.nombre}?`)) {
            fetch(API + "/" + p.id, { method: "DELETE" }).then(() => {
                agregarRegistro("Eliminado: " + p.nombre);
                verInventario();
                document.getElementById("modal-acciones").classList.remove("activo");
            });
        }
    } else if (tipoAccionActual === "editar") {
        const nuevoP = parseFloat(document.getElementById("accion-precio").value);
        if (isNaN(nuevoP)) return alert("❌ Precio inválido");
        
        p.precio = nuevoP;
        actualizarProductoServidor(p, "Precio actualizado: " + p.nombre, false);
    }
};

// Función auxiliar para no repetir el FETCH PUT
function actualizarProductoServidor(producto, textoRegistro, actualizarDineroFlag) {
    fetch(API + "/" + producto.id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(producto)
    }).then(() => {
        if (actualizarDineroFlag) actualizarDinero();
        agregarRegistro(textoRegistro);
        verInventario();
        document.getElementById("modal-acciones").classList.remove("activo");
        alert("✅ OPERACIÓN COMPLETADA");
    });
}

let editando = false; // Variable para saber si estamos creando o editando

function editarProducto(p) {
    editando = true;
    document.getElementById("modal-titulo").innerText = "Editar Producto";
    
    // Llenamos los inputs con la info actual
    document.getElementById("form-codigo").value = p.codigo;
    document.getElementById("form-codigo").disabled = true; // El código no se debería cambiar
    document.getElementById("form-nombre").value = p.nombre;
    document.getElementById("form-cantidad").value = p.cantidad;
    document.getElementById("form-precio").value = p.precio;
    document.getElementById("form-descripcion").value = p.descripcion;
    document.getElementById("form-imagen").value = p.imagen_url;

    document.getElementById("modal-agregar").classList.add("activo");
}

// Esta función va en Proyecto.js (Admin)
document.getElementById("btn-guardar-final").onclick = async () => {
    const codigo = document.getElementById("form-codigo").value;
    const nombre = document.getElementById("form-nombre").value;
    const cantidad = parseInt(document.getElementById("form-cantidad").value);
    const precio = parseFloat(document.getElementById("form-precio").value);
    const descripcion = document.getElementById("form-descripcion").value;

    if (!codigo || !nombre || isNaN(cantidad)) return alert("⚠️ Datos incompletos");

    // 1. Buscamos si el código ya existe en el inventario actual
    const res = await fetch(API);
    const productos = await res.json();
    const productoExistente = productos.find(p => String(p.codigo) === String(codigo));

    let metodo = "POST";
    let url = API;
    let mensaje = "✅ Producto Creado";

    // 2. Si existe (o estamos en modo edición manual), usamos PUT
    if (productoExistente || editandoID !== null) {
        metodo = "PUT";
        const idParaActualizar = editandoID || productoExistente.id;
        url = `${API}/${idParaActualizar}`;
        mensaje = "✅ Stock/Producto Actualizado";
    }

    const payload = { 
        codigo, 
        nombre, 
        cantidad, 
        precio, 
        descripcion, 
        imagen_url: urlImagenSubida || (productoExistente ? productoExistente.imagen_url : "") 
    };

    fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(res => {
    if (res.ok) {

        alert(mensaje);

        // 🔥 REGISTRAR ACTIVIDAD
        if (metodo === "POST") {
            agregarRegistro("Producto agregado: " + nombre);
        } else {
            agregarRegistro("Producto editado: " + nombre);
        }

        // Limpiar todo
        editandoID = null;

        document.getElementById("form-codigo").disabled = false;

        document.getElementById("modal-titulo-registro").innerText = "Nuevo Producto";

        document.getElementById("modal-agregar").classList.remove("activo");

        verInventario();
    }
});
};

// Cerrar el modal de agregar
document.getElementById("close-modal-agregar").onclick = () => {
    document.getElementById("modal-agregar").classList.remove("activo");
    // LIMPIEZA CLAVE:
    editandoID = null; 
    document.getElementById("form-codigo").disabled = false;
    document.getElementById("modal-titulo-registro").innerText = "Nuevo Producto";
};


document.getElementById("btn-guardar-vendedor")
.addEventListener("click", () => {

    const nombre = document.getElementById("v-nombre").value;
    const usuario = document.getElementById("v-usuario").value;
    const clave = document.getElementById("v-clave").value;

    if (!nombre || !usuario || !clave) {
        alert("⚠️ Completa todos los campos");
        return;
    }

    fetch("/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre,
            usuario,
            clave,
            rol: "vendedor"
        })
    })
    .then(r => r.json())
    .then(data => {

        if (data.error) {
            alert(data.error);
            return;
        }

        alert("✅ Vendedor creado");

        document.getElementById("modal-crear-vendedor")
        .classList.remove("activo");

        verUsuarios();
    });
});

function verUsuarios() {

    fetch("/usuarios")
    .then(r => r.json())
    .then(data => {

        const tabla = document.getElementById("tabla-usuarios");
        tabla.innerHTML = "";

        data.forEach(u => {

            // 🔒 PROTECCIÓN DEL ADMIN
            let accion = "";

            if (u.rol === "admin") {
                accion = `<span style="color:gray;">Protegido</span>`;
            } else {
                accion = `
                    <button onclick="eliminarUsuario(${u.id})">
                        Eliminar
                    </button>
                `;
            }

            tabla.innerHTML += `
                <tr>
                    <td>${u.id}</td>
                    <td>${u.nombre}</td>
                    <td>${u.usuario}</td>
                    <td>${u.rol}</td>
                    <td>
                        ${accion}
                    </td>
                </tr>
            `;
        });

        document.getElementById("modal-usuarios")
        .classList.add("activo");
    });
}

function eliminarUsuario(id) {

    const confirmar = confirm("⚠️ ¿Seguro que deseas eliminar este vendedor?");

    if (!confirmar) return;

    fetch("/usuarios/" + id, {
        method: "DELETE"
    })
    .then(() => {
        alert("🗑️ Vendedor eliminado");
        verUsuarios();
    });
}

function cerrarModalUsuarios() {

    document.getElementById("modal-usuarios")
    .classList.remove("activo");
}