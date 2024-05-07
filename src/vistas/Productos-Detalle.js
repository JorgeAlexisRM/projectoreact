import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { database } from '../firebase/config';
import {getDoc, doc} from "firebase/firestore";

function DetalleProducto() {
    const { id } = useParams(); // Obtener el ID del producto de los parámetros de la URL
    const [producto, setProducto] = useState(null); // Estado para almacenar los detalles del producto

    useEffect(() => {
        const getProduct = async () => {
            try {
                const productRef = doc(database, 'productos', id);
                const productSnap = await getDoc(productRef);
                if (productSnap.exists()) {
                    setProducto({ ...productSnap.data(), id: productSnap.id });
                } else {
                    console.log('No such document!');
                }
            } catch (error) {
                console.error('Error fetching document:', error);
            }
        };

        getProduct();
    }, [id]);

    if (!producto) {
        return <div>Cargando...</div>; // Muestra "Cargando..." mientras se obtienen los detalles del producto
    }

    return (
        <div>
            <h1>{producto.nombre}</h1>
            <p>Precio: ${producto.precio}</p>
            <p>Stock: {producto.stock}</p>
            <p>Descripción: {producto.descripcion}</p>
            <img src={producto.imagen} alt={producto.nombre} />
        </div>
    );
}

export default DetalleProducto;
