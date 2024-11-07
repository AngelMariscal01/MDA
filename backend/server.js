const express = require("express");
const postgresql = require("pg");
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


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

/// API REGISTRAR UN NUEVO USUARIO COMO CLIENTE
app.post('/registrarUsuario', async (req, res) => {

    const { nombreCompleto, email, telefono, password } = req.body;
    
    try {
        // Encriptar la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, 10); // 10 es el nivel de "salting"
        
        const query = 'INSERT INTO usuarios(usuario_id, nombre, correo, telefono, contrasena, rol, estado) VALUES ($1, $2, $3, $4, $5, $6, $7)';
        const values = [
            newId(),
            nombreCompleto,
            email,
            telefono,
            hashedPassword, // Guardar la contraseña encriptada
            'cliente',
            'activo'
        ];
        
        db.query(query, values, (err, data) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error', details: err });
            }
            return res.json(data);
        });
    } catch (err) {
        console.error('Error en el proceso de registro:', err);
        return res.status(500).json({ error: 'Error en el proceso de registro' });
    }
});

// API INICIAR SESION
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM usuarios WHERE correo = $1';
    const values = [email];

    try {
        const result = await db.query(query, values);

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Usuario no encontrado' });
        }

        const user = result.rows[0];
        const nombre = user.nombre;
        const rol = user.rol;

        // Comparar la contraseña ingresada con la contraseña en la base de datos
        const isMatch = await bcrypt.compare(password, user.contrasena);

        if (!isMatch) {
            return res.status(400).json({ error: 'Contraseña incorrecta' });
        }

        let token;
        try {
            token = jwt.sign({ nombre, rol }, "Stack", { expiresIn: '3m' });
        } catch (err) {
            console.error("Error al generar el token:", err);
            return res.status(500).json({ error: 'Error al generar el token' });
        }
        
        //return res.send({token});
        // Retornar los datos del usuario, incluyendo el rol
        
        return res.json({
            message: 'Inicio de sesión exitoso',
            user: {
                token: token
            }
        });
    } catch (err) {
        console.error('Error en el inicio de sesión:', err);
        return res.status(500).json({ error: 'Error en el inicio de sesión' });
    }
});


/* Usuarios en UsuariosAdmin */
app.get('/usuarios', async (req, res) => {
    const query = 'SELECT usuario_id, nombre, correo, telefono, rol, estado FROM usuarios';

    try {
        const result = await db.query(query);
        
        // Devolver todos los usuarios en el resultado de la consulta
        console.log(result.rows)
        return res.json({
            message: 'Usuarios obtenidos correctamente',
            usuarios: result.rows
        });
    } catch (err) {
        console.error('Error al obtener usuarios:', err);
        return res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

app.post('/usuarios/actualizarEstado', (req, res) => {
    const { usuarioId, estado } = req.body;
  
    try {
        // Encriptar la contraseña antes de guardarla
        //const hashedPassword = await bcrypt.hash(password, 10); // 10 es el nivel de "salting"
        
        const query = 'UPDATE public.usuarios SET estado=$1 WHERE usuario_id=$2;';
        const values = [
            estado,
            usuarioId
        ];
        
        db.query(query, values, (err, data) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error', details: err });
            }
            return res.json(data);
        });
    } catch (err) {
        console.error('Error en el proceso de actualizacion:', err);
        return res.status(500).json({ error: 'Error en el proceso de actualizacion de estado' });
    }
  });


  app.post('/usuarios/actualizarRol', (req, res) => {
    const { usuarioId, rol } = req.body;
  
    try {
        // Encriptar la contraseña antes de guardarla
        //const hashedPassword = await bcrypt.hash(password, 10); // 10 es el nivel de "salting"
        
        const query = 'UPDATE public.usuarios SET rol=$1 WHERE usuario_id=$2;';
        const values = [
            rol,
            usuarioId
        ];
        
        db.query(query, values, (err, data) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error', details: err });
            }
            return res.json(data);
        });
    } catch (err) {
        console.error('Error en el proceso de actualizacion:', err);
        return res.status(500).json({ error: 'Error en el proceso de actualizacion de rol' });
    }
  });

  app.post('/usuarios/eliminar', (req, res) => {
    const { usuarioId } = req.body;
    console.log(req.body);
    console.log(req.headers)

  
    try {
      // Realizar la consulta DELETE usando el UUID
      const query = 'DELETE FROM public.usuarios WHERE usuario_id = $1 RETURNING *;';
      const values = [usuarioId];  // El UUID se pasa directamente en el array de valores
  
      db.query(query, values, (err, result) => {
        if (err) {
          console.error('Error de base de datos:', err);
          return res.status(500).json({ error: 'Error al eliminar el usuario' });
        }
  
        // Si no se ha eliminado ningún registro, devolver un error o mensaje adecuado
        if (result.rowCount === 0) {
          return res.status(404).json({ error: 'Usuario no encontrado' });
        }
  
        // Si el usuario fue eliminado correctamente, responder con el mensaje de éxito
        return res.status(200).json({ message: 'Usuario eliminado exitosamente', deletedUser: result.rows[0] });
      });
    } catch (err) {
      console.error('Error en el proceso de eliminación:', err);
      return res.status(500).json({ error: 'Error en el proceso de eliminación' });
    }
  });
  

app.listen(8081, () => {
    console.log('listening');
})

function newId() {
    return uuidv4();
}