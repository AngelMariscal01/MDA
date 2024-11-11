// App.js

import '../css/ProductosAdministrador.css';

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

import axios from 'axios';


// Componente de tarjeta de producto
function ProductCard({ product }) {
    const navigate = useNavigate();
    const imagen = `http://localhost:8081${product.imagen}`;
    const [cantidad, setCantidad] = useState(1);
    const location = useLocation();
    const  {usuarioId, rol}  = location.state || {};
    const handleAgregarAlCarrito = (productoId) => {
        axios
        .post('http://localhost:8081/agregarAlCarrito', {
            usuario_id: usuarioId,
            producto_id: productoId,
            cantidad: cantidad,
        })
        .then(() => {
            alert('Producto agregado al carrito exitosamente');
        })
        .catch((err) => {
            console.error('Error al agregar al carrito:', err);
            alert('Hubo un problema al agregar el producto al carrito');
        });    
    };

    const incrementarCantidad = () => {
        setCantidad(cantidad + 1)
    };
    const disminuirCantidad = () => {
        if (cantidad > 1){ 
            setCantidad(cantidad - 1);
            
        }
    };
    
    return (
        <div className="product-card">
            <img src={imagen} alt={`Imagen de ${product.nombre}`} className="product-image" />
            <h3 className="product-name">{product.nombre} ({product.cantidad_piezas} pz)</h3>
            <p className="product-description">{product.descripcion}</p>
            <p className="product-price">${parseFloat(product.precio) * cantidad}</p>
            <div className='producto-actions'>
                <button className="cantidad-btn" onClick={disminuirCantidad}>-</button>
                <span>{cantidad}</span>
                <button className="cantidad-btn" onClick={incrementarCantidad}>+</button>
            </div>
            <div className="producto-actions">
                <button className="carrito-btn" onClick={() => handleAgregarAlCarrito(product.producto_id)}>
                    Agregar al carrito 🛒
                </button>
            </div>
        </div>
    );
}

function ProductosCliente() {
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]); // Estado para las categorías
    const [categoriasProducto, setCategoriasProducto] = useState([]); // Estado para las categorías
    const [selectedCategory, setSelectedCategory] = useState(''); // Estado para la categoría seleccionada
    const location = useLocation();
    const  {usuarioId, rol}  = location.state || {};
    
    const navigate = useNavigate();

    useEffect(() => {
        // Obtener productos
        axios
            .get('http://localhost:8081/obtenerProductosCliente')
            .then((response) => {
                if (response.data && response.data.productos) {
                    setProductos(response.data.productos);
                } else {
                    console.log("No se encontraron productos");
                }
            })
            .catch((err) => {
                console.log('Error al cargar los productos:', err);
            });

        // Obtener categorías
        axios
            .get('http://localhost:8081/obtenerCategorias') // Asumiendo que tienes este endpoint
            .then((response) => {
                if (response.data && response.data.categorias) {
                    setCategorias(response.data.categorias);
                } else {
                    console.log("No se encontraron categorías");
                }
            })
            .catch((err) => {
                console.log('Error al cargar las categorías:', err);
            });
        
        axios
            .get('http://localhost:8081/obtenerCategoriasProductos') // Asumiendo que tienes este endpoint
            .then((response) => {
                if (response.data && response.data.categorias) {
                    setCategoriasProducto(response.data.categorias);
                } else {
                    console.log("No se encontraron categorías");
                }
            })
            .catch((err) => {
                console.log('Error al cargar las categorías:', err);
            });
    
    }, []);

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        navigate('/');
        window.location.reload();
    };
    


    productos.forEach((product) => {
        product.categorias = categoriasProducto.filter((categoria) => categoria.producto_id === product.producto_id);
    });
    // Filtrar los productos en función del término de búsqueda y la categoría seleccionada
    const filteredProductos = productos.filter((product) => {
        const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? product.categorias.some(categoria => categoria.nombre_categoria === selectedCategory) : true; // Asegúrate de que las categorías estén estructuradas correctamente
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="inicio-cliente">
            <header className="header">
                <div className="menu-icon" onClick={toggleMenu}>
                    <FaBars size={24} />
                </div>

                <nav className={`dropdown-menu ${isMenuOpen ? 'open' : ''}`}>
                    <Link to="/productos" state={{ usuarioId, rol }} className="menu-item" onClick={toggleMenu}>Productos</Link>
                    <Link to="/pedidos" state={{ usuarioId, rol }} className="menu-item" onClick={toggleMenu}>Pedidos</Link>
                    <Link to="/carrito" state={{ usuarioId, rol }} className="menu-item" onClick={toggleMenu}>Carrito</Link>
                    <Link to={`/perfil/${usuarioId}`} state={{ usuarioId, rol }} className="menu-item" onClick={toggleMenu}>Perfil</Link>
                    <Link to="/contacto" className="menu-item" onClick={toggleMenu}>Contacto</Link>
                    {/* Botón de Cerrar sesión */}
                    <button className="menu-item" onClick={cerrarSesion}>Cerrar sesión</button>
                </nav>
            </header>
            <main className="main-content-productos-admin">
                <h1>Productos:</h1>

                <section className="search-bar-productos-admin">
                    <input
                        type="text"
                        placeholder="Buscar por nombre del producto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input-productos-admin"
                    />
                    {/* Filtro por categorías */}
                    <select
                        className="category-filter"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">Seleccionar categoría</option>
                        {categorias.map((categoria) => (
                            <option key={categoria.categoria_id} value={categoria.id}>
                                {categoria.nombre_categoria}
                            </option>
                        ))}
                    </select>
                </section>

                <div className="product-grid">
                    {filteredProductos.map((product) => (
                        <ProductCard key={product.producto_id} product={product} />
                    ))}
                </div>
            </main>
        </div>
    );
}

export default ProductosCliente;
