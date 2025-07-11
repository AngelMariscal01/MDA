import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import '../css/Estadisticas.css';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import 'chartjs-plugin-datalabels'; // Para etiquetas en las barras
import WordCloud from 'react-wordcloud-fork';
import DataTable from 'react-data-table-component';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Para versiones más antiguas, usa ChartJS de manera automática sin registro explícito
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

function Estadisticas() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const [pedidos, setPedidos] = useState([]);
    const [productos, setProductos] = useState([]);
    const [pedidosTabla, setPedidosTabla] = useState([]);
    const [wordCloudData, setWordCloudData] = useState([]);

    const [barChartData, setBarChartData] = useState({
        labels: [],
        datasets: [],
    });
    const [pieChartData, setPieChartData] = useState({
        labels: [],
        datasets: [],
    });

    useEffect(() => {
        axios.get('http://localhost:8081/estadisticasEstados')
        .then(response => {
            setPedidos(response.data);
            setPieChartData(calcularDatosGraficos(response.data));
        })
        .catch(error => {
            console.error('Error al obtener los datos de las estadísticas:', error);
        });
        axios.get('http://localhost:8081/estadisticasProductos')
        .then(response => {
            setProductos(response.data);
            setBarChartData(calcularDatosGraficosProductos(response.data));
        })
        .catch(error => {
            console.error('Error al obtener los datos de las estadísticas:', error);
        });
        axios.get('http://localhost:8081/estadisticasCategorias')
        .then(response => {
            setWordCloudData(calcularDatosWordCloud(response.data));
        })
        .catch(error => {
            console.error('Error al obtener los datos de las estadísticas:', error);
        })
        axios.get('http://localhost:8081/estadisticasPedidos')
        .then(response => {
            setPedidosTabla(response.data);
        })
        .catch(error => {
            console.error('Error al obtener los datos de las estadísticas:', error);
        });
    }, []);

    const calcularDatosGraficos = (pedidos) => {
        const pedidosPorEstado = {};
        pedidos.forEach(pedido => {
            pedidosPorEstado[pedido.estado_nombre] = (pedidosPorEstado[pedido.estado_nombre] || 0) + 1;
        });

        return {
            labels: Object.keys(pedidosPorEstado),
            datasets: [
                {
                    label: 'Pedidos por estado',
                    data: Object.values(pedidosPorEstado),
                    backgroundColor: ['red', 'blue', 'green', 'orange', 'purple'],
                },
            ],
        };
    };
    const calcularDatosGraficosProductos = (productos) => {
        const productosPorCantidad = {};
    
        // Agrupar productos por nombre y sumar la cantidad
        productos.forEach(producto => {
            productosPorCantidad[producto.nombre] = (productosPorCantidad[producto.nombre] || 0) + producto.cantidad;
        });
    
        // Convertir el objeto a un array de [nombre, cantidad]
        const productosArray = Object.entries(productosPorCantidad);
    
        // Ordenar los productos por cantidad de mayor a menor y tomar los primeros 10
        const top10Productos = productosArray
            .sort((a, b) => b[1] - a[1]) // Ordenar de mayor a menor cantidad
            .slice(0, 10); // Tomar solo los 10 primeros
    
        // Preparar los datos para el gráfico
        return {
            labels: top10Productos.map(producto => producto[0]), // Obtener los nombres
            datasets: [
                {
                    label: 'Productos por cantidad',
                    data: top10Productos.map(producto => producto[1]), // Obtener las cantidades
                    backgroundColor: ['red', 'blue', 'green', 'orange', 'purple', 'yellow', 'pink', 'brown', 'gray', 'black'],
                },
            ],
        };
    };
    const calcularDatosWordCloud = (productos) => {
        const categoriasPorCantidad = {};
        
        productos.forEach(producto => {
            categoriasPorCantidad[producto.nombre_categoria] = (categoriasPorCantidad[producto.nombre_categoria] || 0) + producto.cantidad;
        });

        return Object.entries(categoriasPorCantidad).map(([categoria, cantidad]) => ({
            text: categoria,
            value: cantidad,
        }));
    };


    const columns = [
        {
            name: 'ID Pedido',
            selector: row => row.pedido_id,
            sortable: true,
        },
        {
            name: 'Usuario',
            selector: row => row.nombre,
            sortable: true,
        },
        {
            name: 'Fecha Pedido',
            selector: row => row.fecha_pedido,
            sortable: true,
        },
        {
            name: 'Fecha Entrega',
            selector: row => row.fecha_entrega,
            sortable: true,
        },
        {
            name: 'Dirección',
            selector: row => row.direccion,
            sortable: true,
        },
        {
            name: 'Total',
            selector: row => row.total,
            sortable: true,
        },
    ];
    const customStyles = {
        table: {
            style: {
                minWidth: '100%',
                overflowX: 'auto', // Para permitir el desplazamiento horizontal
            },
        },
        headRow: {
            style: {
                backgroundColor: '#f4f4f4',
            },
        },
        cells: {
            style: {
                padding: '10px',
                textAlign: 'center',
            },
        },
    };
        // Función para exportar a PDF
    const exportToPDF = (filterType) => {
        const doc = new jsPDF();
        let filteredPedidos;
    
        const today = new Date();
        today.setHours(0, 0, 0, 0);
    
        if (filterType === 'today') {
            // Filtrar pedidos del día de hoy
            filteredPedidos = pedidosTabla.filter((pedido) => {
                const pedidoDate = new Date(pedido.fecha_pedido);
                return pedidoDate.toDateString() === today.toDateString();
            });
        } else if (filterType === 'lastWeek') {
            // Filtrar pedidos de la última semana
            const lastWeek = new Date();
            lastWeek.setDate(today.getDate() - 7);
    
            filteredPedidos = pedidosTabla.filter((pedido) => {
                const pedidoDate = new Date(pedido.fecha_pedido);
                return pedidoDate >= lastWeek && pedidoDate <= today;
            });
        } else if (filterType === 'lastMonth') {
            // Filtrar pedidos del último mes
            const lastMonth = new Date();
            lastMonth.setMonth(today.getMonth() - 1);
    
            filteredPedidos = pedidosTabla.filter((pedido) => {
                const pedidoDate = new Date(pedido.fecha_pedido);
                return pedidoDate >= lastMonth && pedidoDate <= today;
            });
        } else {
            // Sin filtro (todos los pedidos)
            filteredPedidos = pedidosTabla;
        }
    
        // Agregar título y encabezado del reporte
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(150, 75, 100); // Color rosa pastel
        doc.text('Reporte de Mini Donas Arenita', 105, 20, { align: 'center' });
    
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        const reportDate = new Date().toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        doc.text(`Fecha de Generación: ${reportDate}`, 14, 30);
    
        // Personalizar la tabla
        doc.autoTable({
            startY: 40,
            headStyles: { fillColor: [255, 182, 193] }, // Rosa pastel
            bodyStyles: { textColor: [80, 80, 80] },
            alternateRowStyles: { fillColor: [255, 240, 245] }, // Rosa más claro
            head: [['ID Pedido', 'Usuario', 'Fecha Pedido', 'Fecha Entrega', 'Dirección', 'Total']],
            body: filteredPedidos.map((pedido) => [
                pedido.pedido_id,
                pedido.nombre,
                new Date(pedido.fecha_pedido).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                new Date(pedido.fecha_entrega).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                pedido.direccion,
                `$${parseFloat(pedido.total).toFixed(2)}`,
            ]),
        });
    
        // Calcular total
        let total = 0;
        filteredPedidos.forEach((pedido) => {
            total += parseFloat(pedido.total);
        });
    
        // Agregar total al final del PDF
        doc.setFontSize(14);
        doc.setTextColor(150, 75, 100); // Rosa pastel
        doc.text(`Total: $${parseFloat(total).toFixed(2)}`, 14, doc.lastAutoTable.finalY + 20);
    
        // Guardar el PDF con un nombre descriptivo
        doc.save(`reporte_minidonas_${filterType}.pdf`);
    };
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        navigate('/');
        window.location.reload();
    };

    return (
        <div className="inicio-cliente">
            <header className="header">
                <div className="menu-icon" onClick={toggleMenu}>
                    <FaBars size={24} />
                </div>
                <nav className={`dropdown-menu ${isMenuOpen ? 'open' : ''}`}>
                    <Link to="/gestionProductos" className="menu-item" onClick={toggleMenu}>
                        Productos
                    </Link>
                    <Link to="/gestionUsuarios" className="menu-item" onClick={toggleMenu}>
                        Usuarios
                    </Link>
                    <Link to="/gestionPedidos" className="menu-item" onClick={toggleMenu}>
                        Pedidos
                    </Link>
                    <Link to="/estadisticas" className="menu-item" onClick={toggleMenu}>Estadísticas</Link>
                    <button className="menu-item" onClick={cerrarSesion}>Cerrar sesión</button>
                </nav>
            </header>
            <main className="main-content">
            <h1>Estadísticas:</h1>
            <div className="chart-container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
            <div className="chart" style={{ flex: '1 1 300px', maxWidth: '400px', margin: '10px' }}>
                <Pie
                    data={pieChartData}
                    redraw={true}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Pedidos por estado',
                            },
                        },
                    }}
                />
            </div>
            <div className="chart" style={{ flex: '1 1 300px', maxWidth: '400px', margin: '10px' }}>
                <Bar
                    data={barChartData}
                    redraw={true}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Productos por cantidad',
                            },
                        },
                    }}
                />
            </div>
            <div className="chart" style={{ flex: '1 1 300px', maxWidth: '400px', margin: '10px' }}>
                <WordCloud
                    words={wordCloudData}
                    options={{
                        rotations: 2,
                        fontSizes: [20, 100],
                        fontFamily: 'sans-serif',
                        disableSelection: true,
                    }}
                />
            </div>
        </div>
        <div className="table-container">
            <DataTable
                title="Pedidos"
                columns={columns}
                data={pedidosTabla}
                responsive
                customStyles={customStyles}
                pagination
            />
        </div>
        <div className='buttons-pdf'>
            <button onClick={() => exportToPDF('today')} className="btn-pdf">Reporte de hoy</button>
            <button onClick={() => exportToPDF('lastWeek')} className="btn-pdf">Reporte de ultima semana</button>
            <button onClick={() => exportToPDF('lastMonth')} className="btn-pdf">Reporte de ultimo mes</button>
            <button onClick={() => exportToPDF()} className="btn-pdf">Reporte de todos los pedidos</button>
        </div>
        </main>
        </div>
    );
}



export default Estadisticas;
