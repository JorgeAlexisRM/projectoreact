import React, { useContext, useState } from 'react'
import { useAuth } from '../context/AuthContext'; // Ajusta la ruta según tu estructura de archivos
import {database} from '../resource/firebase'
import { collection, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { CartContext } from '../context/CartContext'; // Ajusta la ruta según tu estructura de archivos

const ModalProducto = ({product, isOpen, onClose}) => {
    const [quantity, setCantidad] = useState(1);
    const {currentUser} = useAuth()
    const {addCarritoTemp} = useContext(CartContext)

    const mantenerAddCarrito = async () => {
        if (currentUser) {
          // Usuario logueado
          const carritoRef = collection(database, 'carritos');
          const carritoProductoRef = collection(database, 'carrito_producto');
    
          try {
            // Verificar si el usuario ya tiene un carrito
            const carritoSnapshot = await getDoc(doc(carritoRef, currentUser.uid));
            let carritoId;
    
            if (carritoSnapshot.exists()) {
              carritoId = carritoSnapshot.id;
            } else {
              // Crear nuevo carrito para el usuario
              const newCarrito = await setDoc(doc(database,'carritos',currentUser.uid),{userId:currentUser.uid});
              carritoId = newCarrito.id;
            }
    
            // Añadir producto al carrito
            await addDoc(carritoProductoRef, {
              carritoId,
              productId: product.id,
              nombre:product.nombre,
              precio:product.precio,
              quantity
            });
          } catch (error) {
            console.error('Error adding to cart: ', error);
          }
        } else {
          // Usuario no logueado
          addCarritoTemp(product.nombre,product.precio,product.id, quantity);
        }
        onClose();
    };

    if(!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" id="my-modal">
            <div className="bg-white p-6 rounded-lg w-96">
                <img src={product.imagen} alt={product.nombre} className="w-full h-48 object-cover rounded" />
                <h2 className="text-2xl font-bold mt-4">{product.nombre}</h2>
                <p className="text-gray-700 mt-2">ID: {product.id}</p>
                <p className="text-gray-700 mt-2">Price: ${product.precio}</p>
                <p className="text-gray-700 mt-2">Description: {product.descripcion}</p>
                <div className="mt-4">
                    <label htmlFor="quantity" className="block text-gray-700">Cantidad:</label>
                    <input
                        id="quantity"
                        type="number"
                        name="quantity"
                        value={quantity}
                        onChange={(e) => setCantidad(Number(e.target.value))}
                        className="w-full border p-2 mt-1 rounded"
                    />
                </div>
                <div className="mt-4 flex justify-end">
                  <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded" 
                  onClick={mantenerAddCarrito}>
                      Add to cart
                  </button>
                  <button
                    onClick={onClose}
                    className="ml-2 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
            </div>
        </div>
    )
}
export default ModalProducto
