import React, { useState, useEffect } from 'react';
import '../css/RegistrarProducto.css';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ActualizarProducto() {
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [piecesIncluded, setPiecesIncluded] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { producto } = location.state || {};

    useEffect(() => {
        // Cargar información del producto en los campos del formulario
        if (producto) {
            setProductName(producto.nombre);
            setDescription(producto.descripcion);
            setPrice(producto.precio);
            setStock(producto.stock);
            setPiecesIncluded(producto.cantidad_piezas);
        }
    }, [producto]);

    // Obtener las categorías asociadas al producto
    useEffect(() => {
        if (producto && producto.producto_id) {
            axios.get('http://localhost:8081/obtenerCategoriasProducto', { params: { productoId: producto.producto_id } })
                .then((response) => {
                    if (response.data && response.data.categorias) {
                        // Actualiza las categorías seleccionadas con las categorías asociadas al producto
                        const productCategories = response.data.categorias.map(cat => cat.nombre_categoria);
                        console.log(productCategories);
                        setSelectedCategories(productCategories);
                    }
                })
                .catch((err) => {
                    console.log('Error al obtener las categorías del producto:', err);
                });
        }
    }, [producto]);

    // Obtener todas las categorías disponibles
    useEffect(() => {
        axios.get('http://localhost:8081/obtenerCategorias')
            .then((response) => {
                if (response.data && response.data.categorias) {
                    setCategories(response.data.categorias);
                } else {
                    console.log("No se encontraron categorías");
                }
            })
            .catch((err) => {
                console.log('Error al cargar las categorías:', err);
            });
    }, []);

    // Manejo del cambio en la imagen
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    
        const selectedCategoryIds = selectedCategories.map((categoryName) => {
            const category = categories.find(cat => cat.nombre_categoria === categoryName);
            return category ? category.categoria_id : null;
        }).filter(Boolean);
    
        const formData = new FormData();
        formData.append('producto_id', producto.producto_id);
        formData.append('nombre', productName);
        formData.append('descripcion', description);
        formData.append('precio', price);
        formData.append('stock', stock);
        formData.append('categorias', JSON.stringify(selectedCategoryIds));
        formData.append('cantidad_piezas', piecesIncluded);
    
        // Solo agregamos la imagen si se seleccionó una nueva
        if (image) {
            formData.append('imagen', image);
        }
    
        axios.post('http://localhost:8081/actualizarProducto', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
            .then((response) => {
                console.log('Producto actualizado:', response.data);
                toast.success('Producto actualizado correctamente');
                setTimeout(() => {
                    navigate('/gestionProductos');
                }, 1000);
                
            })
            .catch((err) => {
                toast.error('Error al actualizar el producto');
                console.log('Error al actualizar el producto:', err);
            });
    };

    // Manejo de la creación de una nueva categoría
    const handleAddCategory = () => {
        if (newCategory && !categories.some(category => category.nombre_categoria === newCategory)) {
            axios.post('http://localhost:8081/agregarCategoria', { nombre: newCategory })
                .then((response) => {
                    setCategories([...categories, response.data.categoria]);
                    setNewCategory('');
                    window.location.reload();
                })
                .catch((err) => {
                    console.log('Error al crear la categoría:', err);
                });
        }
    };

    // Manejo del cambio de selección de categorías
    const handleCategoryChange = (e) => {
        const category = e.target.value;
        if (e.target.checked) {
            setSelectedCategories(prevSelectedCategories => [...prevSelectedCategories, category]);
        } else {
            setSelectedCategories(prevSelectedCategories => prevSelectedCategories.filter(c => c !== category));
        }
    };
    let categoryOptions = [];   

    try {
        categoryOptions = categories.map((category) => category.nombre_categoria);
    } catch (error) {
        
    }

    return (
        <div className='registrar-producto'>
            <form onSubmit={handleSubmit} className="add-product-form">
                <h2>Editar Producto</h2>

                <label>Nombre:</label>
                <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                />

                <label>Descripción:</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                ></textarea>

                <label>Precio:</label>
                <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                />

                <label>Stock:</label>
                <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                />

                <label>Categoría(s):</label>
                <input
                    type="text"
                    placeholder="Nueva categoría"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                />
                <button type="button" onClick={handleAddCategory}>
                    Agregar Categoría
                </button>
                <br />
                <br />

                <div className="category-selector">
                    <h3 className="category-title">Selecciona las categorías:</h3>
                    {categoryOptions.length > 0 ? (
                        categoryOptions.map((category, index) => (
                            <div key={index} className="checkbox-container">
                                <input
                                    type="checkbox"
                                    value={category}
                                    checked={selectedCategories.includes(category)}
                                    onChange={handleCategoryChange}
                                />
                                <label>{category}</label>
                            </div>
                        ))
                    ) : (
                        <p>Cargando categorías...</p>
                    )}
                </div>

                <label>Cantidad de piezas que incluye:</label>
                <input
                    type="number"
                    value={piecesIncluded}
                    onChange={(e) => setPiecesIncluded(e.target.value)}
                    required
                />

                <label>Subir imagen:</label>
                <input type="file" onChange={handleImageChange} />
                {imagePreview && (
                    <div>
                        <img src={imagePreview} alt="Vista previa" className="image-preview" />
                    </div>
                )}
                <br />
                <br />
            
                <button type="submit">Actualizar Producto</button>
            </form>
            <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
    );
}

export default ActualizarProducto;
