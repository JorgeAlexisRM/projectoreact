import React, { useEffect, useState } from "react";
import { database, storage } from '../firebase/config';
import { addDoc, collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import './Productos-Index.css';

function ProductosIndex() {
    const [nombre, setNombre] = useState('');
    const [precio, setPrecio] = useState('');
    const [stock, setStock] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [imagen, setImagen] = useState(null);
    const [productos, setProductos] = useState([]);
    const [editingProductId, setEditingProductId] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [modalImagen, setModalImagen] = useState(null);

    const value = collection(database, "productos");

    useEffect(() => {
        const getData = async () => {
            const dbVal = await getDocs(value)
            setProductos(dbVal.docs.map(doc => ({ ...doc.data(), id: doc.id })))
        }
        getData()
    }, [productos])

    const handleCreate = async () => {
        const storageRef = ref(storage, `imagenes/${imagen.name}`);
        await uploadBytes(storageRef, imagen);

        const url = await getDownloadURL(storageRef);

        await addDoc(value, { nombre, precio, stock, descripcion, imagen: url });

        setNombre('');
        setPrecio('');
        setStock('');
        setDescripcion('');
        setImagen(null);
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setImagen(file);
    }

    const handleDelete = async (productId) => {
        try {
            const docRef = doc(database, "productos", productId);

            await deleteDoc(docRef);

            setProductos(productos.filter(producto => producto.id !== productId));
        } catch (error) {
            console.error("Error al eliminar el producto:", error);
        }
    };

    const handleEdit = async (productId) => {
        setEditingProductId(productId);
        const productToEdit = productos.find(producto => producto.id === productId);
        setEditingProduct(productToEdit);
        setModalImagen(productToEdit.imagen);
    };

    const handleCloseModal = () => {
        setEditingProductId(null);
        setEditingProduct(null);
    };

    const handleSaveEdit = async () => {
        try {
            const docRef = doc(database, "productos", editingProductId);

            if (modalImagen) {
                const storageRef = ref(storage, `imagenes/${modalImagen.name}`);
                await uploadBytes(storageRef, modalImagen);
                const imageUrl = await getDownloadURL(storageRef);

                await updateDoc(docRef, {
                    nombre: editingProduct.nombre,
                    precio: editingProduct.precio,
                    descripcion: editingProduct.descripcion,
                    stock: editingProduct.stock,
                    imagen: imageUrl
                });
            } else {
                await updateDoc(docRef, {
                    nombre: editingProduct.nombre,
                    precio: editingProduct.precio,
                    descripcion: editingProduct.descripcion,
                    stock: editingProduct.stock,
                    imagen: editingProduct.imagen
                });
            }
            handleCloseModal();
        } catch (error) {
            console.error("Error al actualizar el producto:", error);
        }
    };

    return (
        <div className="container">
            <div className="form-container">
                <h1>Productos</h1>
                <label>Nombre</label>
                <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                <label>Precio</label>
                <input type="number" placeholder="Precio" value={precio} onChange={(e) => setPrecio(e.target.value)} />
                <label>Descripción</label>
                <textarea placeholder="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)}></textarea>
                <label>Stock</label>
                <input type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} />
                <label>Imagen</label>
                <input type="file" onChange={handleFileChange} />
                <button className="button-add" onClick={handleCreate}>Agregar</button>
            </div>
            <div className="product-grid">
                {productos.map(producto => (
                    <div key={producto.id} className="product-card">
                        <img src={producto.imagen} alt={producto.nombre} />
                        <div className="product-details">
                            <h1>{producto.nombre}</h1>
                            <p>Precio: ${producto.precio}</p>
                            <p>Stock: {producto.stock}</p>
                            <button className="button-edit" onClick={() => handleEdit(producto.id)}>Editar</button>
                            <button className="button-delete" onClick={() => handleDelete(producto.id)}>Eliminar</button>
                        </div>
                    </div>
                ))}
            </div>
            {editingProduct && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Modificar datos del producto</h2>
                        <label>Nombre</label>
                        <input type="text" value={editingProduct.nombre} onChange={(e) => setEditingProduct({ ...editingProduct, nombre: e.target.value })} />
                        <label>Precio</label>
                        <input type="number" value={editingProduct.precio} onChange={(e) => setEditingProduct({ ...editingProduct, precio: e.target.value })} />
                        <label>Descripción</label>
                        <textarea value={editingProduct.descripcion} onChange={(e) => setEditingProduct({ ...editingProduct, descripcion: e.target.value })}></textarea>
                        <label>Stock</label>
                        <input type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })} />
                        <label>Imagen</label>
                        <input type="file" onChange={(e) => setModalImagen(e.target.files[0])} />
                        <button className="button-save" onClick={handleSaveEdit}>Guardar Cambios</button>
                        <button className="button-cancel" onClick={handleCloseModal}>Cancelar</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductosIndex;