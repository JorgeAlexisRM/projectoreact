import React, { useEffect, useState } from 'react';
import { database } from '../resource/firebase';
import { collection, getDocs, limit, orderBy, query, startAfter } from 'firebase/firestore';
import CardProducto from './CardProducto';
import ModalProducto from './ModalProducto';

const ListaProducto = () => {
    const [products, setProducts] = useState([]);
    const [selectProducto, setSelectProducto] = useState(null);
    const [isModalAbierto, setIsModalAbierto] = useState(false);
    const [lastVisible, setLastVisible] = useState(null);
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true)
        const q = query(collection(database,'productos'), orderBy('nombre'),limit(10))
        const documentSnapshots = await getDocs(q)
        const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1]
        setLastVisible(lastVisible)
        const productsArray = documentSnapshots.docs.map(doc => ({ ...doc.data(),id: doc.id }))
        setProducts(productsArray)
        setLoading(false)
    };

    const fetchMoreProducts = async () => {
        setLoading(true);
        const q = query(
            collection(database,'productos'),
            orderBy('nombre'),
            startAfter(lastVisible),
            limit(10)
        )
        const documentSnapshots = await getDocs(q)
        const visible = documentSnapshots.docs[documentSnapshots.docs.length -1 ]
        setLastVisible(visible)
        const productsArray = documentSnapshots.docs.map(doc => ({ ...doc.data(),id: doc.id}))
        setProducts((prevProducts) => [...prevProducts, ...productsArray])
        setLoading(false)
    }

    const openModal = (product) => {
        setSelectProducto(product);
        setIsModalAbierto(true);
    }

    const closeModal = () =>{
        setIsModalAbierto(false);
        setSelectProducto(null);
    }

    return (
        <>
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
            {loading && <p>Cargando...</p>}
            {!loading && lastVisible && (
                <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center"
                    onClick={fetchMoreProducts}>Cargar mas</button>
            )}
        </>
    );
};

export default ListaProducto;
