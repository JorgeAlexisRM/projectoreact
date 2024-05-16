import React, { useContext, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // Ajusta la ruta según tu estructura de archivos
import { database } from '../../resource/firebase'; // Ajusta la ruta según tu estructura de archivos
import { collection, query, where, getDocs,doc, addDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext'; // Ajusta la ruta según tu estructura de archivos
import { jsPDF } from 'jspdf'

const Carrito = () => {
  const { currentUser } = useAuth();
  const { tempCart, clearTempCart } = useContext(CartContext);
  const [cartProducts, setCartProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      //console.log(currentUser);

      const fetchCartProducts = async () => {
        const q = query(collection(database, 'carrito_producto'), where('carritoId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        //const products = querySnapshot.docs.map(doc => doc.data());
        const products = querySnapshot.docs.map(doc => ({id:doc.id, ...doc.data() }));
        console.log(products)
        setCartProducts(products);
      };
      fetchCartProducts();
    } else {
      setCartProducts(tempCart);
    }
  }, [currentUser, tempCart]);

  const generatePDF = (products, total) => {
    const doc = new jsPDF();
    doc.text('Purchase Receipt', 10, 10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, 20);
    doc.text(`Total: $${total}`, 10, 30);
    doc.text('Products:', 10, 40);

    let y = 50;
    products.forEach((product, index) => {
      doc.text(`${index + 1}. ${product.nombre} - Quantity: ${product.quantity} - Price: $${product.precio}`, 10, y);
      y += 10;
    });

    doc.save('receipt.pdf');
  };

  const handleCheckout = async () => {
    if (!currentUser) {
      navigate('/login');
    } else {
      try {
        const total = cartProducts.reduce((acc, item) => acc + item.precio * item.quantity, 0);
        const venta = {
          userId: currentUser.uid,
          products: cartProducts.map(item => ({
            productId: item.productId,
            name: item.nombre,
            quantity: item.quantity,
            price: item.precio
          })),
          total,
          date: new Date()
        };

        // Guardar venta en la colección "ventas"
        console.log(venta)
        await addDoc(collection(database, 'ventas'), venta);
        console.log(cartProducts.map(item => item.id))
        // Eliminar productos del carrito
        const carritoProductoRef = collection(database, 'carrito_producto');
        await Promise.all(cartProducts.map(item => deleteDoc(doc(carritoProductoRef, item.id))));

        setCartProducts([]);
        clearTempCart();
        generatePDF(venta.products, total);
      } catch (error) {
        console.error('Error finalizing purchase: ', error);
      }
    }
  };

  return (
    <div>
      <h2>Your Cart</h2>
      {cartProducts.length > 0 ? (
        <ul>
          {cartProducts.map((item, index) => (
            <li key={index}>
              {item.nombre} - Quantity: {item.quantity}
            </li>
          ))}
        </ul>
      ) : (
        <p>No products in cart.</p>
      )}
      <button onClick={handleCheckout}>
        Finalize Purchase
      </button>
    </div>
  );
};

export default Carrito;
