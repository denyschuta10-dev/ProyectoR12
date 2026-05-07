document.addEventListener('DOMContentLoaded', () => {
    cargarAlumnos();
    document.getElementById('fechaDisplay').innerText = new Date().toLocaleDateString('es-ES', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
});

// FUNCIÓN CLAVE: Cuenta cuántos sábados tiene el mes actual
function obtenerSabadosDelMes() {
    const hoy = new Date();
    const mes = hoy.getMonth();
    const año = hoy.getFullYear();
    let contador = 0;
    let fecha = new Date(año, mes, 1);
    while (fecha.getMonth() === mes) {
        if (fecha.getDay() === 6) contador++; // 6 es Sábado
        fecha.setDate(fecha.getDate() + 1);
    }
    return contador;
}

async function cargarAlumnos() {
    try {
        const res = await fetch(`/alumnos?t=${Date.now()}`);
        const alumnos = await res.json();
        const contenedor = document.getElementById('contenedorAlumnos');
        contenedor.innerHTML = '';

        const hoy = new Date();
        const mesActualCalculado = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
        const nombreMes = hoy.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
        
        // El tope cambia solo: Mayo = 5, Junio = 4
        const topeSabados = obtenerSabadosDelMes(); 

        alumnos.forEach(al => {
            const mesAlumno = al.fecha_pago ? al.fecha_pago.substring(0, 7) : "";
            const pagadoEsteMes = (mesAlumno === mesActualCalculado);
            
            // Un alumno está al día si pagó este mes Y no ha gastado todos sus sábados
            const tieneClases = al.asistencias < topeSabados; 
            const estaAlDia = pagadoEsteMes && tieneClases;

            const porcentaje = (al.asistencias / topeSabados) * 100;
            const card = document.createElement('div');
            card.className = 'card-alumno';
            
            // Lógica de bloqueo del botón Cobrar
            const botonBloqueado = estaAlDia ? 'disabled style="opacity: 0.5; cursor: not-allowed; background: #999;"' : '';
            const textoBoton = estaAlDia ? 'YA PAGÓ' : 'Cobrar Q85';

            card.innerHTML = `
                <span class="status-badge ${estaAlDia ? 'badge-ok' : 'badge-deuda'}">
                    ${estaAlDia ? 'MES DE ' + nombreMes : 'PENDIENTE / VENCIDO'}
                </span>
                <h3>${al.nombre}</h3>
                <div class="progress-box">
                    <div class="progress-text">
                        <span>Sábados: ${al.asistencias} / ${topeSabados}</span>
                    </div>
                    <div class="bar-container">
                        <div class="bar-fill ${!estaAlDia ? 'bar-deuda' : ''}" 
                             style="width: ${Math.min(porcentaje, 100)}%"></div>
                    </div>
                </div>
                <div class="actions" onclick="event.stopPropagation()">
                    <button class="btn-card btn-sabado" onclick="marcar(${al.id})">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn-card btn-pago" onclick="pagar(${al.id})" ${botonBloqueado}>
                        ${textoBoton}
                    </button>
                </div>
            `;
            card.onclick = () => verDetalle(al);
            contenedor.appendChild(card);
        });
    } catch (err) {
        console.error("Error cargando alumnos:", err);
    }
}

async function pagar(id) {
    if(confirm("¿Confirmas cobro de Q85.00?")) {
        const res = await fetch(`/alumnos/pagar/${id}`, { method: 'PUT' });
        if(res.ok) {
            alert("¡Pago realizado con éxito!");
            setTimeout(cargarAlumnos, 500); // Pausa para que la DB actualice
        }
    }
}

async function marcar(id) {
    const res = await fetch(`/alumnos/asistencia/${id}`, { method: 'PUT' });
    if(res.ok) {
        setTimeout(cargarAlumnos, 300);
    }
}

async function mostrarReporte() {
    const res = await fetch('/alumnos');
    const data = await res.json();
    const hoy = new Date();
    const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;

    const pagados = data.filter(al => {
        const mesAlumno = al.fecha_pago ? al.fecha_pago.substring(0, 7) : "";
        return mesAlumno === mesActual;
    }).length;

    document.getElementById('datosReporte').innerHTML = `
        <p>Pagos recibidos en <strong>${hoy.toLocaleString('es-ES', {month:'long'})}</strong>: <strong>${pagados}</strong></p>
        <hr>
        <p style="font-size:1.6em; color:#34c759; font-weight:bold;">Total Caja: Q${pagados * 85}.00</p>
    `;
    abrirModal('modalReporte');
}

function verDetalle(al) {
    console.log("Revisando a:", al); // Para que vos veas los datos reales en consola
    
    document.getElementById('detalleNombre').innerText = al.nombre;
    const tope = obtenerSabadosDelMes();
    
    let fechaTexto = "No hay pagos este mes"; // Texto más limpio

    // Validamos que la fecha exista y no sea nula
    if (al.fecha_pago && al.fecha_pago !== "null") {
        // Cortamos la fecha para evitar problemas de zona horaria (YYYY-MM-DD)
        const soloFecha = al.fecha_pago.split('T')[0];
        const partes = soloFecha.split('-');
        
        // Creamos la fecha manualmente para que no falle (Año, Mes-1, Día)
        const dateObj = new Date(partes[0], partes[1] - 1, partes[2]);
        
        if (!isNaN(dateObj)) {
            fechaTexto = dateObj.toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric'     
            });
        }
    }

    document.getElementById('detalleInfo').innerHTML = `
        <p><strong>Sábados asistidos:</strong> ${al.asistencias} de ${tope}</p>
        <p><strong>Último pago:</strong> <span style="color: #34c759; font-weight: bold;">${fechaTexto}</span></p>
        <p><strong>Monto:</strong> Q85.00</p>
    `;
    abrirModal('modalDetalle');
}


async function guardarAlumno() {
    const nombre = document.getElementById('nombreInput').value;
    if(!nombre) return alert("Escribe el nombre");
    const res = await fetch('/alumnos', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ nombre })
    });
    if(res.ok) {
        document.getElementById('nombreInput').value = '';
        cerrarModal('modalNuevo');
        setTimeout(cargarAlumnos, 500); 
    }
}

function abrirModal(id) { document.getElementById(id).style.display = 'flex'; }
function cerrarModal(id) { document.getElementById(id).style.display = 'none'; }