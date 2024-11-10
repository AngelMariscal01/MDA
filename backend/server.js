import express from "express";
import pkg from "pg";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Resend } from "resend";
import multer from "multer";
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
// Definir __filename y __dirname manualmente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve();

// Luego puedes usar __dirname como normalmente
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const { Client } = pkg;


const resend = new Resend("re_UhMkMWfG_DG5LP28YShEAZQX4yWdbwEXL"); // Asegúrate de tener tu API key en las variables de entorno


app.use(cors());
app.use(express.json());


const db = new Client({
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
        const estado = user.estado;
        const usuario_id = user.usuario_id;

        // Comparar la contraseña ingresada con la contraseña en la base de datos
        const isMatch = await bcrypt.compare(password, user.contrasena);

        if (!isMatch) {
            return res.status(400).json({ error: 'Contraseña incorrecta' });
        }

        let token;
        try {
            token = jwt.sign({ nombre, rol, estado, usuario_id }, "Stack", { expiresIn: '60m' });
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
        return res.json({
            message: 'Usuarios obtenidos correctamente',
            usuarios: result.rows
        });
    } catch (err) {
        console.error('Error al obtener usuarios:', err);
        return res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

// API ACTUALIZAR ESTADO DEL USUARIO
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

// API ACTUALIZAR ROL DEL USUARIO
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

// API ELIMINAR USUARIO
app.post('/usuarios/eliminar', (req, res) => {
    const { usuarioId } = req.body;
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

// API OBTENER USUARIO POR ID
app.get('/obtenerUsuario', async (req, res) => {
    const { usuarioId } = req.query;

    const query = 'SELECT nombre, correo, telefono FROM usuarios WHERE usuario_id = $1';
    const values = [usuarioId];

    try {
        const result = await db.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        return res.json({ usuario: result.rows[0] });
    } catch (err) {
        console.error('Error al obtener usuario:', err);
        return res.status(500).json({ error: 'Error al obtener usuario' });
    }
});


/// API ACTUALIZAR USUARIO
app.post('/actualizarUsuario', async (req, res) => {

    const { nombre, email, telefono, password, usuarioId } = req.body;
    
    try {
        // Encriptar la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, 10); // 10 es el nivel de "salting"
        
        const query = 'UPDATE public.usuarios SET nombre=$1, correo=$2, telefono=$3, contrasena=$4 WHERE usuario_id=$5;';
        const values = [
            nombre,
            email,
            telefono,
            hashedPassword, // Guardar la contraseña encriptada
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
        console.error('Error en el proceso de actualización:', err);
        return res.status(500).json({ error: 'Error en el proceso de actualización' });
    }
});




// Endpoint para recuperación de contraseña
app.post('/recuperarContrasena', async (req, res) => {
    const { email } = req.body;
    
    try {
        // Verificar si el correo electrónico está registrado
        const query = 'SELECT * FROM usuarios WHERE correo = $1';
        const values = [email];
        const result = await db.query(query, values);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Correo no encontrado' });
        }

        // Crear un token para el restablecimiento de contraseña
        const user = result.rows[0];
        console.log(user)
        const resetToken = jwt.sign({ usuarioId: user.usuario_id }, "Stack", { expiresIn: '15m' });

        // URL de restablecimiento de contraseña
        const resetUrl = `http://localhost:3000/restablecerContrasena?token=${resetToken}`;

        // Enviar correo electrónico de restablecimiento de contraseña
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Recuperación de Contraseña',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #007BFF;">Recuperación de Contraseña MiniDonasArenita</h2>
                    <p>Hola,</p>
                    <p>Hemos recibido una solicitud para restablecer tu contraseña. Si realizaste esta solicitud, por favor haz clic en el enlace de abajo para cambiar tu contraseña:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${resetUrl}" style="display: inline-block; background-color: #007BFF; color: #fff; padding: 10px 20px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
                    </div>
                    <p style="font-size: 14px; color: #555;">Este enlace expirará en 15 minutos.</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="font-size: 12px; color: #888;">Si no solicitaste restablecer tu contraseña, puedes ignorar este correo electrónico. Tu contraseña permanecerá segura.</p>
                    <p style="font-size: 12px; color: #888;">Gracias,</p>
                    <p style="font-size: 12px; color: #888;">El equipo de soporte MiniDonasArenita</p>
                </div>
            `
        });

        return res.json({ message: 'Correo de recuperación enviado. Revisa tu bandeja de entrada.' });
    } catch (err) {
        console.error('Error al enviar correo de recuperación:', err);
        return res.status(500).json({ error: 'Error al enviar correo de recuperación' });
    }
});

// Endpoint para actualizar la contraseña una vez que el usuario hace clic en el enlace
app.post('/restablecerContrasena', async (req, res) => {
    const { token, password } = req.body;
    console.log(password)

    try {
        // Verificar el token
        const decoded = jwt.verify(token, "Stack");
        const usuarioId = decoded.usuarioId;
        console.log(usuarioId)

        // Encriptar la nueva contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Actualizar la contraseña en la base de datos
        const query = 'UPDATE usuarios SET contrasena = $1 WHERE usuario_id = $2';
        const values = [hashedPassword, usuarioId];
        
        await db.query(query, values);

        return res.json({ message: 'Contraseña actualizada exitosamente.' });
    } catch (err) {
        console.error('Error al restablecer la contraseña:', err);
        return res.status(500).json({ error: 'Error al restablecer la contraseña' });
    }
});


/*AGREGAR CATEGORIA*/
app.post('/agregarCategoria', async (req, res) => {
    const { nombre } = req.body;

    try {
        const query = 'INSERT INTO categorias (categoria_id, nombre_categoria) VALUES ($1, $2)';
        const values = [newId(), nombre];
        await db.query(query, values);

        return res.json({ message: 'Categoria agregada exitosamente.' });
    } catch (err) {
        console.error('Error al agregar la categoria:', err);
        return res.status(500).json({ error: 'Error al agregar la categoria' });
    }
});

/*Obtener categorias*/
app.get('/obtenerCategorias', async (req, res) => {
    try {
        const query = 'SELECT * FROM categorias';
        const result = await db.query(query);
        return res.json({
            message: 'Categorias obtenidas exitosamente.',
            categorias: result.rows});
    } catch (err) {
        console.error('Error al obtener las categorias:', err);
        return res.status(500).json({ error: 'Error al obtener las categorias' });
    }
}) 

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Endpoint para agregar un producto //!LA IMAGEN URL SE CAMBIARA CUANDO ESTE S3
app.post('/agregarProducto', upload.single('imagen'), async (req, res) => {
    const { nombre, descripcion, precio, stock, categorias, cantidad_piezas } = req.body;
    const categoriasArray = JSON.parse(categorias); // Parsear el string recibido a un array
    const imagenUrl = req.file ? `/uploads/${req.file.filename}` : null; // URL de la imagen guardada

    try {
        // Insertar el producto en la base de datos
        const queryProducto = 'INSERT INTO productos (producto_id, nombre, descripcion, precio, stock, cantidad_piezas, imagen, estado) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING producto_id';
        const valuesProducto = [newId(), nombre, descripcion, precio, stock, cantidad_piezas, imagenUrl, 'activo'];
        const result = await db.query(queryProducto, valuesProducto);
        const productoId = result.rows[0].producto_id;

        // Insertar las categorías en la tabla de relación
        for (const categoriaId of categoriasArray) {
            const queryCategoria = 'INSERT INTO productoscategorias (producto_id, categoria_id) VALUES ($1, $2)';
            await db.query(queryCategoria, [productoId, categoriaId]);
        }

        return res.json({ message: 'Producto agregado exitosamente.' });
    } catch (err) {
        console.error('Error al agregar el producto:', err);
        return res.status(500).json({ error: 'Error al agregar el producto' });
    }
});

// Endpoint para obtener todos los productos
app.get('/obtenerProductos', async (req, res) => {
    try {
        const query = 'SELECT * FROM productos';
        const result = await db.query(query);
        return res.json({
            message: 'Productos obtenidos exitosamente.',
            productos: result.rows
        });
    } catch (err) {
        console.error('Error al obtener los productos:', err);
        return res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

//Endpoint para obtener las categorias de un producto
app.get('/obtenerCategoriasProducto', async (req, res) => {
    const { productoId } = req.query;

    try {
        const query = 'SELECT productoscategorias.categoria_id, categorias.nombre_categoria FROM productoscategorias INNER JOIN categorias ON productoscategorias.categoria_id = categorias.categoria_id WHERE producto_id = $1';
        const values = [productoId];
        const result = await db.query(query, values);
        return res.json({    
            message: 'Categorias obtenidas exitosamente.',
            categorias: result.rows
        }); 
    } catch (err) {
        console.error('Error al obtener las categorias del producto:', err);
        return res.status(500).json({ error: 'Error al obtener las categorias del producto' });
    }
})

app.post('/actualizarProducto', upload.single('imagen'), async (req, res) => {
    const { producto_id, nombre, descripcion, precio, stock, categorias, cantidad_piezas } = req.body;
    const categoriasArray = JSON.parse(categorias); // Parsear las categorías a un array
    const imagenUrl = req.file ? `/uploads/${req.file.filename}` : null; // Si hay nueva imagen, usarla

    try {
        // Actualizar producto en la base de datos
        const queryProducto = `
            UPDATE productos 
            SET nombre = $1, descripcion = $2, precio = $3, stock = $4, cantidad_piezas = $5, 
                imagen = COALESCE($6, imagen), estado = 'activo' 
            WHERE producto_id = $7
            RETURNING producto_id;
        `;
        const valuesProducto = [nombre, descripcion, precio, stock, cantidad_piezas, imagenUrl, producto_id];
        await db.query(queryProducto, valuesProducto);

        // Actualizar las categorías del producto en la relación
        // Primero, eliminamos las categorías existentes
        await db.query('DELETE FROM productoscategorias WHERE producto_id = $1', [producto_id]);

        // Luego, insertamos las nuevas categorías
        for (const categoriaId of categoriasArray) {
            const queryCategoria = 'INSERT INTO productoscategorias (producto_id, categoria_id) VALUES ($1, $2)';
            await db.query(queryCategoria, [producto_id, categoriaId]);
        }

        return res.json({ message: 'Producto actualizado exitosamente.' });
    } catch (err) {
        console.error('Error al actualizar el producto:', err);
        return res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

//Endpoint para obtener las categorias de todos los productos
app.get('/obtenerCategoriasProductos', (req, res) => {
    // Query para obtener las categorías con el producto_id y nombre de la categoría
    const query = `
        SELECT p.producto_id, c.categoria_id, c.nombre_categoria
        FROM productos p
        JOIN productoscategorias pc ON p.producto_id = pc.producto_id
        JOIN categorias c ON pc.categoria_id = c.categoria_id
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al obtener las categorías de productos' });
        }
        res.json({ categorias: results.rows });
    });
});

//Endpoint para eliminar un producto
app.post('/eliminarProducto', async (req, res) => {
    const { producto_id } = req.body;
    try {
        const query = 'DELETE FROM productos WHERE producto_id = $1';
        await db.query(query, [producto_id]);
        return res.json({ message: 'Producto eliminado exitosamente.' });
    } catch (err) {
        console.error('Error al eliminar el producto:', err);    
        return res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});
// Endpoint para actualizar estado de un producto
app.post('/actualizarEstadoProducto', async (req, res) => {
    const { producto_id, estado } = req.body;
    try {
        const query = 'UPDATE productos SET estado = $1 WHERE producto_id = $2';
        await db.query(query, [estado, producto_id]);
        return res.json({ message: 'Estado del producto actualizado exitosamente.' });
    } catch (err) {
        console.error('Error al actualizar el estado del producto:', err);
        return res.status(500).json({ error: 'Error al actualizar el estado del producto' });
    }
});


app.listen(8081, () => {
    console.log('listening');
})

function newId() {
    return uuidv4();
}