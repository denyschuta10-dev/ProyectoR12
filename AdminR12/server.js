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
// Usamos path.join para que funcione tanto en Windows como en Linux (Render/Railway)
app.use('/TiendaR12', express.static(path.join(__dirname, '../TiendaR12')));
app.use('/AcademiaR12', express.static(path.join(__dirname, '../AcademiaR12')));
app.use('/Imagenes', express.static(path.join(__dirname, '../Imagenes')));

// C. Servir la carpeta de subidas de fotos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// D. RUTA PRINCIPAL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// 🔌 Configuración de conexión MySQL (Adaptable a Local y Railway)
const dbConfig = {
    host: process.env.MYSQL_HOST || process.env.MYSQLHOST || process.env.DB_HOST || "localhost",
    user: process.env.MYSQL_USER || process.env.MYSQLUSER || process.env.DB_USER || "root",
    password: process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || process.env.DB_NAME || "admin_r12_db",
    port: process.env.MYSQL_PORT || process.env.MYSQLPORT || 3306
};

const conexion = mysql.createConnection(dbConfig);

conexion.connect(err => {
    if (err) {
        console.error("❌ Error de conexión MySQL:", err.message);
        return;
    }
    console.log("✅ Conectado a la base de datos MySQL");
});


// Obtener todos los productos (Para mostrar el inventario)
app.get("/productos", (req, res) => {
    const query = "SELECT * FROM productos";
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
    conexion.query("DELETE FROM productos WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: "Producto eliminado del sistema" });
    });
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


// Ruta para actualizar (server.js)
app.put("/productos/:id", (req, res) => {
    const { id } = req.params;
    const { codigo, nombre, cantidad, precio, imagen_url, descripcion } = req.body;

    const sql = `UPDATE productos SET codigo=?, nombre=?, cantidad=?, precio=?, imagen_url=?, descripcion=? WHERE id=?`;

    conexion.query(sql, [codigo, nombre, cantidad, precio, imagen_url, descripcion, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: "Producto actualizado" });
    });
});




// ==========================================
//      API CONTROL DE ASISTENCIA (R12)
// ==========================================

// --- RUTAS PARA ASISTENCIA ---

// 1. Obtener lista
app.get("/alumnos", (req, res) => {
    conexion.query("SELECT * FROM alumnos", (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// 2. Inscribir (Agregamos CURDATE() para que nazca en VERDE)
// En server.js
// En server.js
app.post("/alumnos", (req, res) => {
    const { nombre } = req.body;
    // Esto hace que desde el segundo 1 ya tengan fecha de pago
    const sql = "INSERT INTO alumnos (nombre, asistencias, fecha_pago) VALUES (?, 0, CURDATE())";
    conexion.query(sql, [nombre], (err) => {
        if (err) return res.status(500).send(err);
        res.send("Alumno inscrito con éxito");
    });
});

app.put("/alumnos/asistencia/:id", (req, res) => {
    // Ahora el límite es 5 para cubrir los meses largos
    const sql = "UPDATE alumnos SET asistencias = asistencias + 1 WHERE id = ? AND asistencias < 5";
    conexion.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send("Asistencia marcada");
    });
});

// 4. Pagar mensualidad (Actualizamos la fecha a hoy)
app.put("/alumnos/pagar/:id", (req, res) => {
    // IMPORTANTE: asistencias vuelve a 0 y fecha_pago se vuelve HOY
    const sql = "UPDATE alumnos SET asistencias = 0, fecha_pago = CURDATE() WHERE id = ?";
    conexion.query(sql, [req.params.id], (err) => {
        if (err) return res.status(500).send(err);
        res.send("Pago realizado");
    }); 
});

app.get("/alumnos", (req, res) => {
    // Forzamos a que la fecha salga como texto YYYY-MM-DD
    const sql = "SELECT id, nombre, asistencias, DATE_FORMAT(fecha_pago, '%Y-%m-%d') as fecha_pago FROM alumnos";
    conexion.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});