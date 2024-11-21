// App.js

import '../css/ProductosAdministrador.css';

import React, { useState, useEffect } from 'react';
import { Link} from 'react-router-dom';
import { FaBars} from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';



// Componente de tarjeta de producto
function ProductCard({ product }) {
    const imagen = `http://localhost:8081${product.imagen}`;
    const [cantidad, setCantidad] = useState(1);
    const handleAgregarAlCarrito = (productoId) => {
        toast.error('Inicia sesion para agregar al carrito.');
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

function Inicio() {
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]); // Estado para las categorías
    const [categoriasProducto, setCategoriasProducto] = useState([]); // Estado para las categorías
    const [selectedCategory, setSelectedCategory] = useState(''); // Estado para la categoría seleccionada

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
                    <Link to="/contacto" className="menu-item" onClick={toggleMenu}>Contacto</Link>
                    <Link to="/iniciarSesion" className="menu-item" onClick={toggleMenu}>Iniciar sesión</Link>
                    <Link to="/registrarse" className="menu-item" onClick={toggleMenu}>Registrarse</Link>

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
                <ToastContainer position="bottom-right" autoClose={3000} />
            </main>
        </div>
    );
}

export default Inicio;
