const mysql = require("mysql2");

// Conexión dinámica que se adapta a local (XAMPP) o Railway
const conexion = mysql.createConnection({
    host: process.env.MYSQL_HOST || process.env.MYSQLHOST || process.env.DB_HOST || "localhost",
    user: process.env.MYSQL_USER || process.env.MYSQLUSER || process.env.DB_USER || "root",
    password: process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || process.env.DB_NAME || "admin_r12_db",
    port: process.env.MYSQL_PORT || process.env.MYSQLPORT || 3306
});

conexion.connect(err => {
    if (err) {
        console.log("❌ Error de conexión a MySQL:", err.message);
    } else {
        console.log("✅ Conectado exitosamente a MySQL");
    }
});

module.exports = conexion;