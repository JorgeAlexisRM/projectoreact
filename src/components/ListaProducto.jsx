import React, { useEffect, useState } from 'react';
import { database } from '../resource/firebase';
import { collection, getDocs } from 'firebase/firestore';
import CardProducto from './CardProducto';
import ModalProducto from './ModalProducto';

const ListaProducto = () => {
    const [products, setProducts] = useState([]);
    const [selectProducto, setSelectProducto] = useState(null);
    const [isModalAbierto, setIsModalAbierto] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            const querySnapshot = await getDocs(collection(database, 'productos'));
            setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };

        fetchProducts();
    }, []);

    const openModal = (product) => {
        setSelectProducto(product);
        setIsModalAbierto(true);
    }

    const closeModal = () =>{
        setIsModalAbierto(false);
        setSelectProducto(null);
    }

    return (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
                <CardProducto key={product.id} producto={product} openModal={openModal} />
            ))}
            {selectProducto && (
                <ModalProducto
                    isOpen={isModalAbierto}
                    onClose={closeModal}
                    product={selectProducto}
                />
            )}
        </div>
    );
};

export default ListaProducto;
