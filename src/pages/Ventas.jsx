import React, { useEffect, useState } from 'react';
import { database } from '../resource/firebase';
import { collection, query, getDocs,limit, orderBy, startAfter } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Chart } from 'chart.js/auto';
import { Bar } from 'react-chartjs-2';

const Modal = ({ show, onClose, children }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg overflow-hidden w-3/4 max-w-4xl">
                <div className="p-5 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">Previsualización de las ventas de productos</h2>
                </div>
                <div className="p-5 border-b flex justify-between items-center">
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
                </div>
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

const Ventas = () => {
    const [ventas, setVentas] = useState([]);
    const [productCount, setProductCount] = useState({});
    const [topProducts, setTopProducts] = useState([]);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [lastVisible, setLastVisible] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchVentas();
    }, []);

    const fetchVentas = async () => {
        setLoading(true)
        const q = query(collection(database, 'ventas'), orderBy('date'),limit(10))
        const ventasSnapshot = await getDocs(q);
        const lastVisible = ventasSnapshot.docs[ventasSnapshot.docs.length -1]
        setLastVisible(lastVisible)
        const ventasList = ventasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVentas(ventasList);
        setLoading(false)

        const productCountTemp = {};
        ventasList.forEach(venta => {
            venta.products.forEach(product => {
                if (productCountTemp[product.name]) {
                    productCountTemp[product.name] += product.quantity;
                } else {
                    productCountTemp[product.name] = product.quantity;
                }
            });
        });

        setProductCount(productCountTemp);

        const sortedProducts = Object.entries(productCountTemp)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name, count]) => ({ name, count }));
        setTopProducts(sortedProducts);
    };

    const fetchMoreVentas = async () => {
        setLoading(true)
        const q = query(
            collection(database, 'ventas'),
            orderBy('date'),
            startAfter(lastVisible),
            limit(10)
        );
        const documentSnapshots = await getDocs(q);
        const visible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
        setLastVisible(visible);
        const salesArray = documentSnapshots.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setVentas((prevSales) => [...prevSales, ...salesArray]);
        setLoading(false);
    }

    const generatePDF = (venta) => {
        const doc = new jsPDF();
        doc.text('Venta Recibo', 10, 10);
        autoTable(doc, {
            head: [['Producto', 'Cantidad', 'Total']],
            body: venta.products.map(product => [product.name, product.quantity,
            (product.price * product.quantity)]),
        });
        return doc;
    };

    const downloadPDF = (venta) => {
        const doc = generatePDF(venta);
        doc.save(`venta_${venta.id}.pdf`);
    };

    const previewPDF = (venta) => {
        const doc = generatePDF(venta);
        const blobUrl = URL.createObjectURL(doc.output('blob'));
        setPdfUrl(blobUrl);
        setModalContent('pdf');
        setShowModal(true);
    };

    const previewChart = () => {
        setModalContent('chart');
        setShowModal(true);
    };

    const topChartData = {
        labels: topProducts.map(product => product.name),
        datasets: [
            {
                label: 'Cantidad Vendida',
                data: topProducts.map(product => product.count),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const allProductsChartData = {
        labels: Object.keys(productCount),
        datasets: [
            {
                label: 'Cantidad Vendida',
                data: Object.values(productCount),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Ventas</h1>
            <table className="min-w-full bg-white border">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">ID</th>
                        <th className="py-2 px-4 border-b">Fecha</th>
                        <th className="py-2 px-4 border-b">Total</th>
                        <th className="py-2 px-4 border-b">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {ventas.map((venta) => (
                        <tr key={venta.id}>
                            <td className="py-2 px-4 border-b">{venta.id}</td>
                            <td className="py-2 px-4 border-b">{venta.date && venta.date.seconds ? new Date(venta.date.seconds * 1000).toLocaleDateString() : 'Fecha no disponible'}</td>
                            <td className="py-2 px-4 border-b">${venta.total}</td>
                            <td className="py-2 px-4 border-b">

                                <button
                                    onClick={() => previewPDF(venta)}
                                    className="bg-green-500 text-white px-2 py-1 rounded ml-2"
                                >
                                    Previsualizar PDF
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {loading && <p>Cargando..</p>}
            {!loading && lastVisible && (
                <button onClick={fetchMoreVentas} >Cargar mas...</button>
            )}

            <div className="mt-8 flex items-center">
                <h2 className="text-xl font-bold mb-4">Top 3 de Productos Vendidos</h2>

            </div>
            <div className="mt-10 flex items-center">
                <button
                    onClick={previewChart}
                    className="bg-green-500 text-white px-2 py-1 rounded ml-4"
                >
                    Previsualizar Gráfico
                </button>
            </div>
            <Bar data={topChartData} />

            <Modal show={showModal} onClose={() => setShowModal(false)}>
                {modalContent === 'pdf' && pdfUrl && (
                    <iframe src={pdfUrl} style={{ width: '100%', height: '500px' }} />
                )}
                {modalContent === 'chart' && (
                    <Bar data={allProductsChartData} />
                )}
            </Modal>
        </div>
    );
};

export default Ventas;
