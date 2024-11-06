const express = require("express");
const postgresql = require("pg");
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const db = new postgresql.Pool({
    port: 5432,
    host: 'localhost',
    user: 'postgres',
    password: '011102',
    database:'MDA'
})

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Database connected');
});

app.post('/registrarUsuario', (req, res) => {
    console.log('Entre')
    const query = 'INSERT INTO usuarios(usuario_id, nombre, correo, telefono, contrasena, rol, estado) VALUES ($1, $2, $3, $4, $5, $6, $7)'
    const values = [
        newId(),
        req.body.nombreCompleto,
        req.body.email,
        req.body.telefono,
        req.body.password,
        'cliente',
        'activo' //cambiar a inactivo cuando se tenga el confirmar correo electronico
    ]
    db.query(query, values, (err, data) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error', details: err });
        }
        return res.json(data);
    });
})

app.listen(8081, () => {
    console.log('listening');
})

function newId() {
    return uuidv4();
}