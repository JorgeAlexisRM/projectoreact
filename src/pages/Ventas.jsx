import React, { useEffect, useState } from 'react';
import { database } from '../resource/firebase';
import { collection, getDocs } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Chart } from 'chart.js/auto';
import { Bar } from 'react-chartjs-2';

const Ventas = () => {
    const [ventas, setVentas] = useState([]);
    const [topProducts, setTopProducts] = useState([]);

    useEffect(() => {
        const fetchVentas = async () => {
            const ventasSnapshot = await getDocs(collection(database, 'ventas'));
            const ventasList = ventasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log(ventasList)
            setVentas(ventasList);
            console.log(ventas)

            const productCount = {};
            ventasList.forEach(venta => {
                venta.products.forEach(product => {
                    if (productCount[product.name]) {
                        productCount[product.name] += product.quantity;
                    } else {
                        productCount[product.name] = product.quantity;
                    }
                });
            });

            console.log(productCount)

            const sortedProducts = Object.entries(productCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([id, count]) => ({ id, count }));
            setTopProducts(sortedProducts);
        };

        fetchVentas();
    }, []);

    const downloadPDF = (venta) => {
        const doc = new jsPDF();
        doc.text('Venta Recibo', 10, 10);
        autoTable(doc, {
            head: [['Producto', 'Cantidad', 'Total']],
            body: venta.products.map(product => [product.name, product.quantity, (product.price * product.quantity)]),
        });
        doc.save(`venta_${venta.id}.pdf`);
    };

    const chartData = {
        labels: topProducts.map(product => product.id),
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

    /**{ventas.map((venta) => (
                        <tr key={venta.id}>
                            <td className="py-2 px-4 border-b">{venta.id}</td>
                            <td className="py-2 px-4 border-b">{new Date(venta.date.seconds * 1000).toLocaleDateString()}</td>
                            <td className="py-2 px-4 border-b">${venta.total}</td>
                            <td className="py-2 px-4 border-b">
                                <button
                                    onClick={() => downloadPDF(venta)}
                                    className="bg-blue-500 text-white px-2 py-1 rounded"
                                >
                                    Descargar PDF
                                </button>
                            </td>
                        </tr>
                    ))} */
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
                                    onClick={() => downloadPDF(venta)}
                                    className="bg-blue-500 text-white px-2 py-1 rounded"
                                >
                                    Descargar PDF
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Top 3 Productos Más Vendidos</h2>
                <Bar data={chartData} />
            </div>
        </div>
    );
};

export default Ventas;
