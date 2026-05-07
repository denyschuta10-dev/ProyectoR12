const mysql = require("mysql2");

// Esta configuración jala los datos automáticos de Railway
const dbConfig = {
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306
};

const conexion = mysql.createConnection(dbConfig);

conexion.connect(err => {
    if (err) {
        console.log("❌ Error:", err.message);
    } else {
        console.log("✅ Conexión lista");
    }
});

module.exports = conexion;