import React, { useContext, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // Ajusta la ruta según tu estructura de archivos
import { database } from '../../resource/firebase'; // Ajusta la ruta según tu estructura de archivos
import { collection, query, where, getDocs, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext'; // Ajusta la ruta según tu estructura de archivos
import { jsPDF } from 'jspdf'

const Carrito = () => {
  const { currentUser } = useAuth();
  const { tempCart, clearTempCart } = useContext(CartContext);
  const [cartProducts, setCartProducts] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null); // URL de objeto para el PDF
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      //console.log(currentUser);

      const fetchCartProducts = async () => {
        const q = query(collection(database, 'carrito_producto'), where('carritoId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        //const products = querySnapshot.docs.map(doc => doc.data());
        const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
     
    // Añadir título
    doc.setFont("courier");
    doc.setFontSize(14);
    doc.setTextColor("#333");
    doc.text('Ticket de Venta', 70, 20, { align: 'center', fontSize: 20 });
  
    // Añadir fecha
    doc.setFontSize(10);
    doc.setTextColor("#666");
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 70, 35, { align: 'center' });
  
    // Añadir párrafos de texto
    doc.setTextColor("#333");
    doc.setFontSize(12);
    const paragraph1 = "Este es el primer párrafo de texto. Puedes agregar aquí la información que desees.";
    const paragraph2 = "Este es el segundo párrafo de texto. Puedes agregar aquí más detalles sobre la venta.";
    doc.text(paragraph1, 10, 70, { maxWidth: 150 });
    doc.text(paragraph2, 10, 90, { maxWidth: 150 });
  
    // Añadir lista de productos
    let y = 120;
    products.forEach((product, index) => {
      const productText = `${index + 1}. ${product.nombre} - Quantity: ${product.quantity} - Precio: $${product.precio}`;
      doc.text(productText, 10, y);
      // Dibujar línea de puntos suspensivos debajo de cada producto
      doc.setLineWidth(0.5);
      doc.setDrawColor("#ccc");
      doc.line(10, y + 5, 200, y + 5); // Ajusta las coordenadas según sea necesario
      y += 10; // Ajusta el espacio entre líneas
    });
  
    // Añadir línea divisoria
    doc.setLineWidth(0.5);
    doc.setDrawColor("#ccc");
    doc.line(10, y + 2, 200, y + 2);
  
    // Añadir total
    doc.setTextColor("#333");
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Total: ${total}`, 10, y + 12);
  
    doc.save('receipt.pdf');

    // Guardar el documento como PDF
    const blobUrl = URL.createObjectURL(doc.output('blob'));
    setPdfUrl(blobUrl);
  };  

// doc.save('receipt.pdf');
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
        console.log("Total:", total);
        generatePDF(venta.products, total);
      } catch (error) {
        console.error('Error finalizing purchase: ', error);
      }
    }
  };

  const handlePreview = () => {
    const total = cartProducts.reduce((acc, item) => acc + item.precio * item.quantity, 0);
    generatePDF(cartProducts,total); // Generar el PDF antes de mostrar la previsualización
    setPreviewVisible(true);
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
      <button onClick={handlePreview}>Preview</button>
     
      {previewVisible && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setPreviewVisible(false)}>&times;</span>
            <h2>Preview</h2>
            {pdfUrl && <iframe src={pdfUrl} style={{ width: '100%', height: '500px' }} />}
          </div>
        </div>
      )}

    </div>
  );
};

export default Carrito;
