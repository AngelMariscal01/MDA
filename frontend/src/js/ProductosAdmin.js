// App.js

import '../css/ProductosAdministrador.css';

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

import axios from 'axios';


// Componente de tarjeta de producto
function ProductCard({ product }) {
    const navigate = useNavigate();
    const imagen = `http://localhost:8081${product.imagen}`;
    const handleEdit = function(producto) {
        // Implementar la acción de editar el producto
        console.log(`Editar producto con ID ${producto.producto_id}`);
        navigate(`/editarProducto/${producto.producto_id}`, {state: {producto}});
    }

    const handleEliminarProducto = (productoId) => {
        if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    
        axios
            .post('http://localhost:8081/eliminarProducto', { producto_id: productoId })
            .then(() => window.location.reload())
            .catch((err) => {
                console.log('Error al eliminar el usuario:', err);
                //mostrarError('Hubo un error al eliminar el usuario.');
            });
    };

    const handleEstadoChange = (productoId, nuevoEstado) => {
        if (!window.confirm('¿Estás seguro de actualizar el estado de este producto?')) return;

        axios
            .post('http://localhost:8081/actualizarEstadoProducto', { producto_id: productoId, estado: nuevoEstado ? 'activo' : 'inactivo' })
            .then(() => window.location.reload())
            .catch((err) => {
                console.log('Error al cambiar el estado del producto:', err);
                //mostrarError('Hubo un error al cambiar el estado del producto.');
            })
    };
    return (
        <div className="product-card">
            <img src={imagen} alt={`Imagen de ${product.nombre}`} className="product-image" />
            <h3 className="product-name">{product.nombre}</h3>
            <button className="edit-btn" onClick={() => handleEdit(product)}>Editar</button>
            
            {/* Botón para cambiar el estado */}
            <div className="actions">
                <button 
                className="visibility-btn"
                onClick={() => handleEstadoChange(product.producto_id, product.estado !== 'activo')}
                >
                {product.estado === 'activo' ? '👁' : '🕳'}
                </button>
                <button className="delete-btn" onClick={() => handleEliminarProducto(product.producto_id)}>🗑</button>
            </div>
        </div>
    );
}


function ProductosAdministrador() {
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]); // Estado para las categorías
    const [categoriasProducto, setCategoriasProducto] = useState([]); // Estado para las categorías
    const [selectedCategory, setSelectedCategory] = useState(''); // Estado para la categoría seleccionada
    const navigate = useNavigate();

    useEffect(() => {
        // Obtener productos
        axios
            .get('http://localhost:8081/obtenerProductos')
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
                    console.log(categoriasProducto);
                } else {
                    console.log("No se encontraron categorías");
                }
            })
            .catch((err) => {
                console.log('Error al cargar las categorías:', err);
            });
    
    }, []);
    
    console.log(productos);

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
                    <Link to="/gestionProductos" className="menu-item" onClick={toggleMenu}>Productos</Link>
                    <Link to="/gestionUsuarios" className="menu-item" onClick={toggleMenu}>Usuarios</Link>
                    <Link to="/gestionPedidos" className="menu-item" onClick={toggleMenu}>Pedidos</Link>
                    <Link to="/estadisticas" className="menu-item" onClick={toggleMenu}>Estadísticas</Link>
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

                    <button className="filter-btn" onClick={() => navigate('/crearProducto')}>+</button>
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

export default ProductosAdministrador;
