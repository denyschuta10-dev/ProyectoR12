const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const path = require("path");
const multer = require("multer");
const app = express();


// Middlewares
app.use(cors());
app.use(express.json());

// --- CONFIGURACIÓN DE RUTAS Y ARCHIVOS ESTÁTICOS ---

// A. Servir archivos del Administrador (AdminR12)
app.use(express.static(__dirname));

// B. Servir Tienda y Academia (Un nivel arriba)
app.use('/TiendaR12', express.static(path.join(__dirname, 'TiendaR12')));

app.use('/Imagenes', express.static(path.resolve(__dirname, 'Imagenes')));

console.log("Ruta imágenes:", path.resolve(__dirname, 'Imagenes'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// D. RUTA PRINCIPAL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/producto.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'TiendaR12', 'producto.html'));
});



const conexion = require('./db');
// ================= LOGIN =================

app.post("/login", (req, res) => {

    const { usuario, clave } = req.body;

    const sql = `
        SELECT * FROM usuarios
        WHERE usuario = ? AND clave = ?
    `;

    conexion.query(sql, [usuario, clave], (err, data) => {

        if (err)
            return res.status(500).json({ error: err.message });

        if (data.length === 0) {
            return res.json({ error: "Datos incorrectos" });
        }

        res.json({
            usuario: data[0].usuario,
            nombre: data[0].nombre,
            rol: data[0].rol
        });
    });
});

// ================= USUARIOS =================

// VER USUARIOS
app.get("/usuarios", (req, res) => {

    conexion.query(
        "SELECT id, nombre, usuario, rol FROM usuarios",
        (err, data) => {

            if (err)
                return res.status(500).json({ error: err.message });

            res.json(data);
        }
    );
});

// CREAR VENDEDOR
// CREAR VENDEDOR
app.post("/usuarios", (req, res) => {

    const { nombre, usuario, clave, rol } = req.body;

    const sql = `
        INSERT INTO usuarios
        (nombre, usuario, clave, rol)
        VALUES (?, ?, ?, ?)
    `;

    conexion.query(
        sql,
        [nombre, usuario, clave, rol],
        (err, result) => {

            if (err) {

                console.log(err);

                // Usuario duplicado
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({
                        error: "⚠️ El usuario ya existe"
                    });
                }

                // Otro error
                return res.status(500).json({
                    error: "❌ Error del servidor"
                });
            }

            res.json({
                mensaje: "✅ Vendedor creado correctamente"
            });
        }
    );
});
// ELIMINAR USUARIO
app.delete("/usuarios/:id", (req, res) => {

    conexion.query(
        "DELETE FROM usuarios WHERE id = ?",
        [req.params.id],
        (err) => {

            if (err)
                return res.status(500).json({
                    error: err.message
                });

            res.json({
                mensaje: "Usuario eliminado"
            });
        }
    );
});



// Obtener todos los productos (Para mostrar el inventario)
app.get("/productos", (req, res) => {
    const query = "SELECT * FROM productos WHERE eliminado = 0";
    conexion.query(query, (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
});
// ================= API PRODUCTOS ACTUALIZADA =================

// Agregar nuevo producto (CON DESCRIPCIÓN)
app.post('/productos', (req, res) => {
    const { codigo, nombre, cantidad, precio, imagen_url, descripcion } = req.body; 
    const query = "INSERT INTO productos (codigo, nombre, cantidad, precio, imagen_url, descripcion) VALUES (?, ?, ?, ?, ?, ?)";
    
    conexion.query(query, [codigo, nombre, cantidad, precio, imagen_url, descripcion], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).send("Producto agregado con éxito");
    });
});

// Actualizar producto (CON DESCRIPCIÓN)
app.put("/productos/:id", (req, res) => {
    const { codigo, nombre, cantidad, precio, imagen_url, descripcion } = req.body;
    const { id } = req.params;

    const sql = `
        UPDATE productos 
        SET codigo = ?, nombre = ?, cantidad = ?, precio = ?, imagen_url = ?, descripcion = ?
        WHERE id = ?
    `;

    conexion.query(sql, [codigo, nombre, cantidad, precio, imagen_url, descripcion, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: "Producto actualizado correctamente" });
    });
});

// Eliminar producto
app.delete("/productos/:id", (req, res) => {

    const { id } = req.params;

    conexion.query(
        "UPDATE productos SET eliminado = 1 WHERE id = ?",
        [id],
        (err) => {

            if (err)
                return res.status(500).json({
                    error: err.message
                });

            res.json({
                mensaje: "Producto eliminado"
            });
        }
    );
});

// ================= RUTAS DE BALANCE (DINERO) =================

app.get("/balance", (req, res) => {
    conexion.query("SELECT dinero_actual FROM balance WHERE id = 1", (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data[0] || { dinero_actual: 0 });
    });
});

app.put("/balance", (req, res) => {
    const { dinero } = req.body;
    conexion.query("UPDATE balance SET dinero_actual = ? WHERE id = 1", [dinero], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: "Caja actualizada" });
    });
});

// ================= REGISTRO DE ACTIVIDADES =================

app.get("/actividades", (req, res) => {
    conexion.query("SELECT * FROM actividades ORDER BY id DESC LIMIT 30", (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(data);
    });
});

app.post("/actividades", (req, res) => {
    const { texto } = req.body;
    conexion.query("INSERT INTO actividades (texto, fecha) VALUES (?, NOW())", [texto], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: "Actividad registrada" });
    });
});

// ================= LANZAMIENTO DEL SERVIDOR =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor R12 activo en el puerto ${PORT}`);
});


// Configuración de dónde y cómo se guardan los archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Asegúrate de crear esta carpeta en adminr12
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nombre único
    }
});

const upload = multer({ storage: storage });

// RUTA NUEVA: Para subir la imagen
// Busca esta parte en tu server.js y cámbiala:
app.post('/upload-image', upload.single('imagen'), (req, res) => {
    if (!req.file) return res.status(400).send('No se subió ninguna imagen');
    
    // Esto hace que la URL sea relativa y funcione en cualquier link (local o nube)
    const urlImagen = `/uploads/${req.file.filename}`;
    res.json({ url: urlImagen });
});




// ==========================================
//      API CONTROL DE ASISTENCIA (R12)
// ==========================================

// --- RUTAS PARA ASISTENCIA ---


// ================= CONTROL DE ASISTENCIA =================

// 1. Obtener alumnos
app.get("/alumnos", (req, res) => {
    const sql = "SELECT id, nombre, asistencias, DATE_FORMAT(fecha_pago, '%Y-%m-%d') as fecha_pago FROM alumnos";
    conexion.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// 2. Inscribir alumno
app.post("/alumnos", (req, res) => {
    const { nombre } = req.body;

    const sql = "INSERT INTO alumnos (nombre, asistencias, fecha_pago) VALUES (?, 0, CURDATE())";

    conexion.query(sql, [nombre], (err) => {
        if (err) return res.status(500).send(err);
        res.send("Alumno inscrito con éxito");
    });
});

// 3. Marcar asistencia
app.put("/alumnos/asistencia/:id", (req, res) => {
    const sql = "UPDATE alumnos SET asistencias = asistencias + 1 WHERE id = ? AND asistencias < 5";

    conexion.query(sql, [req.params.id], (err) => {
        if (err) return res.status(500).send(err);
        res.send("Asistencia marcada");
    });
});

// 4. Pagar mensualidad
app.put("/alumnos/pagar/:id", (req, res) => {
    const sql = "UPDATE alumnos SET asistencias = 0, fecha_pago = CURDATE() WHERE id = ?";

    conexion.query(sql, [req.params.id], (err) => {
        if (err) return res.status(500).send(err);
        res.send("Pago realizado");
    });
});