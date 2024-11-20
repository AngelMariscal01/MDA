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

// Endpoint para obtener todos los productos Cliente
app.get('/obtenerProductosCliente', async (req, res) => {
    try {
        const query = 'SELECT * FROM productos where estado = \'activo\'';
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


// Endpoint para agregar producto al carrito
app.post('/agregarAlCarrito', async (req, res) => {
    const { usuario_id, producto_id, cantidad } = req.body;

    try {
        // Verificar si el producto ya está en el carrito del usuario
        const queryCheck = 'SELECT cantidad FROM carrito WHERE usuario_id = $1 AND producto_id = $2';
        const valuesCheck = [usuario_id, producto_id];
        const resultCheck = await db.query(queryCheck, valuesCheck);

        if (resultCheck.rows.length > 0) {
            // Si el producto ya está en el carrito, actualizar la cantidad
            const nuevaCantidad = resultCheck.rows[0].cantidad + cantidad;
            const queryUpdate = 'UPDATE carrito SET cantidad = $1 WHERE usuario_id = $2 AND producto_id = $3';
            await db.query(queryUpdate, [nuevaCantidad, usuario_id, producto_id]);
        } else {
            // Si el producto no está en el carrito, insertarlo como nuevo registro
            const queryInsert = 'INSERT INTO carrito (carrito_id, usuario_id, producto_id, cantidad, fecha_agregado) VALUES ($1, $2, $3, $4, $5)';
            await db.query(queryInsert, [newId(),usuario_id, producto_id, cantidad, new Date()]);
        }

        return res.json({ message: 'Producto agregado al carrito exitosamente.' });
    } catch (err) {
        console.error('Error al agregar el producto al carrito:', err);
        return res.status(500).json({ error: 'Error al agregar el producto al carrito' });
    }
});
// Ruta para obtener el carrito de un usuario
app.get('/obtenerCarrito/:usuario_id', async (req, res) => {
    const {idUsuario} = req.query;
    try {
      // Consultar los productos en el carrito del usuario
        const result = await db.query(`
        SELECT p.nombre, p.cantidad_piezas, p.precio, c.cantidad, p.imagen, p.producto_id, c.usuario_id
        FROM carrito c
        JOIN productos p ON c.producto_id = p.producto_id
        WHERE c.usuario_id = $1
        `, [idUsuario]);
        if (result.rows.length === 0) {
            return res.json({ message: 'No hay productos en el carrito' });
        }
        return res.json({    
            message: 'Carrito exitosamente.',
            carrito: result.rows
        }); 
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error al obtener el carrito' });
    }
});

// Ruta para eliminar un producto del carrito
app.post('/eliminarDelCarrito', async (req, res) => {
    const { producto_id, usuario_id } = req.body;
    try {
      // Eliminar el producto del carrito
        const result = await db.query(`
            DELETE FROM carrito
            WHERE usuario_id = $1 AND producto_id = $2
            RETURNING *
        `, [usuario_id, producto_id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
        }
        return res.json({ message: 'Producto eliminado del carrito con éxito' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al eliminar el producto del carrito' });
    }
});

// Endpoint para realizar un pedido
app.post('/realizarPedido', async (req, res) => {
    try {
        const { usuario_id, direccion, notas, productos } = req.body;

        // Calcular el total del pedido
        const total = productos.reduce((sum, product) => sum + product.precio_unitario * product.cantidad, 0);

        // Crear el ID y registrar el pedido
        const pedido_id =  newId();
        const fecha_pedido = new Date();

        await db.query(`
            INSERT INTO Pedidos (pedido_id, usuario_id, fecha_pedido, direccion, notas, total, estado_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [pedido_id, usuario_id, fecha_pedido, direccion, notas, total, '35d48694-9551-4f0f-aa08-e152356a96bb']); //! Cambiar id de estado si es necesario

        // Agregar detalles de cada producto en el carrito a DetallesPedido
        for (const product of productos) {
            const detalle_pedido_id = newId();
            const subtotal = product.precio_unitario * product.cantidad;

            await db.query(`
                INSERT INTO DetallesPedido (detalle_pedido_id, pedido_id, producto_id, cantidad, precio_unitario, subtotal)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [detalle_pedido_id, pedido_id, product.producto_id, product.cantidad, product.precio_unitario, subtotal]);
        }

        await db.query(`
            DELETE FROM carrito
            WHERE usuario_id = $1
            RETURNING *
        `, [usuario_id]);

        return res.json({ message: 'Pedido realizado con éxito', pedido_id });
    } catch (err) {
        console.error('Error al realizar el pedido:', err);
        res.status(500).json({ error: 'Error al realizar el pedido' });
    }
});


app.get('/obtenerPedidos', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT p.pedido_id, e.estado_nombre, p.fecha_pedido
            FROM pedidos p
            JOIN estadospedidos e ON p.estado_id = e.estado_id
            ORDER BY p.fecha_pedido DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener pedidos:', err);
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
});

app.get('/obtenerPedidosCliente', async (req, res) => {
    try {
        const {idUsuario} = req.query;
        const result = await db.query(`
            SELECT p.pedido_id, e.estado_nombre, p.fecha_pedido, p.fecha_entrega, p.hora_entrega
            FROM pedidos p
            JOIN estadospedidos e ON p.estado_id = e.estado_id
            WHERE p.usuario_id = $1
            ORDER BY p.fecha_pedido DESC
        `, [idUsuario]);
        if (result.rows.length === 0) {
            return res.json({ message: 'No hay pedidos' });
        }
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener pedidos:', err);
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
});
app.get('/obtenerDetallesPedido', async (req, res) => {
    try {
        const { pedido_id } = req.query;
        const result = await db.query(`
            SELECT  dp.pedido_id as pedido_id,
                    p.fecha_pedido as fecha_pedido,
                    p.fecha_entrega as fecha_entrega,
                    p.hora_entrega as hora_entrega,
                    u.nombre as nombre_usuario,
                    u.telefono as telefono,
                    p.estado_id as estado_id,
                    p.direccion as direccion_entrega,
                    p.notas as notas_entrega,
                    dp.producto_id as producto_id,
                    pr.nombre as nombre_producto,
                    pr.cantidad_piezas as pz_producto,
                    pr.imagen as imagen,
                    dp.cantidad as cantidad_pedido,
                    dp.subtotal as subtotal,
                    p.total as total
            FROM DetallesPedido dp
            LEFT JOIN Pedidos p
                ON dp.pedido_id = p.pedido_id
            LEFT JOIN Productos pr
                ON dp.producto_id = pr.producto_id
            LEFT JOIN usuarios u
                ON u.usuario_id = p.usuario_id
            WHERE dp.pedido_id = $1
        `, [pedido_id]);

        // Estructurar el resultado
        const pedidos = {};
        result.rows.forEach(row => {
            if (!pedidos[row.pedido_id]) {
                pedidos[row.pedido_id] = {
                    pedido_id: row.pedido_id,
                    fecha_pedido: row.fecha_pedido,
                    fecha_entrega_estimada: row.fecha_entrega,
                    hora_entrega_estimada: row.hora_entrega,
                    nombre_usuario: row.nombre_usuario,
                    telefono: row.telefono,
                    estado_id: row.estado_id,
                    direccion_entrega: row.direccion_entrega,
                    notas_entrega: row.notas_entrega,
                    total: row.total,
                    productos: []
                };
            }
            pedidos[row.pedido_id].productos.push({
                producto_id: row.producto_id,
                nombre_producto: row.nombre_producto,
                pz_producto: row.pz_producto,
                imagen: row.imagen,
                cantidad_pedido: row.cantidad_pedido,
                subtotal: row.subtotal
            });
        });

        // Convertir el objeto en un array y enviar la respuesta
        res.json(Object.values(pedidos));
    } catch (err) { 
        console.error('Error al obtener detalles de pedido:', err);
        res.status(500).json({ error: 'Error al obtener detalles de pedido' });
    }
});
app.get('/obtenerEstados', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM estadospedidos');
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener estados:', err);
        res.status(500).json({ error: 'Error al obtener estados' });
    }
});
app.post('/actualizarEstadoPedido', (req, res) => {
    const { pedido_id, estado_id } = req.body;

    if (!pedido_id || !estado_id) {
        return res.status(400).json({ message: 'Faltan datos: pedido_id o estado_id.' });
    }

    // Simulación de una actualización en la base de datos
    const query = 'UPDATE pedidos SET estado_id = $1 WHERE pedido_id = $2';
    db.query(query, [estado_id, pedido_id], (err, result) => {
        if (err) {
            console.error('Error al actualizar el estado del pedido:', err);
            return res.status(500).json({ message: 'Error interno del servidor.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }

        res.status(200).json({ message: 'Estado del pedido actualizado con éxito.' });
    });
});


// Endpoint para actualizar la fecha y hora estimada de entrega
app.post('/actualizarFechaHoraEntrega', (req, res) => {
    const { pedido_id, fecha_entrega, hora_entrega } = req.body;

    const query = `
        UPDATE pedidos 
        SET fecha_entrega = $1, hora_entrega = $2 
        WHERE pedido_id = $3;
    `;

    db.query(query, [fecha_entrega, hora_entrega, pedido_id], (err, result) => {
        if (err) {
            console.error('Error al actualizar la fecha y hora de entrega:', err);
            res.status(500).send('Error al actualizar la fecha y hora de entrega.');
            return;
        }
        res.send('Fecha y hora de entrega actualizadas correctamente.');
    });
});

//Endpoint para eliminar un pedido
app.post('/eliminarPedido', (req, res) => {
    const { pedido_id } = req.body;
    console.log(pedido_id);
    const query = 'DELETE FROM pedidos WHERE pedido_id = $1';
    db.query(query, [pedido_id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el pedido:', err);
            res.status(500).send('Error al eliminar el pedido.');
            return;
        }
        res.send('Pedido eliminado correctamente.');
    });
})

app.get('/estadisticasEstados', async (req, res) => {
    try {
        // Consulta a la base de datos para obtener los datos necesarios
        const result  = await db.query(`
                SELECT p.pedido_id, ep.estado_nombre
                FROM pedidos p
                JOIN estadospedidos ep
                ON p.estado_id = ep.estado_id
            `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener datos de estadísticas:', error);
        res.status(500).json({ error: 'Error al obtener datos de estadísticas' });
    }
});

app.get('/estadisticasProductos', async (req, res) => {
    try {
        // Consulta a la base de datos para obtener los datos necesarios
        const result  = await db.query(`
                SELECT p.nombre, dp.cantidad FROM pedidos pe
                JOIN detallespedido dp
                ON pe.pedido_id = dp.pedido_id
                JOIN productos p
                ON dp.producto_id = p.producto_id
                WHERE pe.estado_id != '35d48694-9551-4f0f-aa08-e152356a96bb'
            `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener datos de estadísticas:', error);
        res.status(500).json({ error: 'Error al obtener datos de estadísticas' });
    }
});

app.get('/estadisticasCategorias', async (req, res) => {
    try {
        // Consulta a la base de datos para obtener los datos necesarios
        const result  = await db.query(`
            SELECT p.nombre, dp.cantidad, c.nombre_categoria FROM pedidos pe
            JOIN detallespedido dp
            ON pe.pedido_id = dp.pedido_id
            JOIN productos p
            ON dp.producto_id = p.producto_id
            JOIN productoscategorias pc
            ON p.producto_id = pc.producto_id
            JOIN categorias c
            ON c.categoria_id = pc.categoria_id
            WHERE pe.estado_id != '35d48694-9551-4f0f-aa08-e152356a96bb'
            `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener datos de estadísticas:', error);
        res.status(500).json({ error: 'Error al obtener datos de estadísticas' });
    }
})

app.get('/estadisticasPedidos', async (req, res) => {
    try {
        // Consulta a la base de datos para obtener los datos necesarios
        const result  = await db.query(`
            SELECT pe.pedido_id, u.nombre, pe.fecha_pedido, pe.fecha_entrega, pe.direccion, pe.total FROM pedidos pe
            JOIN usuarios u
            ON pe.usuario_id = u.usuario_id
            WHERE pe.estado_id = 'f01cab50-7ebe-45ed-8f4a-0618b83c9c8f'
            `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener datos de estadísticas:', error);
        res.status(500).json({ error: 'Error al obtener datos de estadísticas' });
    }
})


function newId() {
    return uuidv4();
}

app.listen(8081, () => {
    console.log('listening');
})

