import React, { useContext, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // Ajusta la ruta según tu estructura de archivos
import { database } from '../../resource/firebase'; // Ajusta la ruta según tu estructura de archivos
import { collection, query, where, getDocs, getDoc, doc, addDoc, deleteDoc, writeBatch } from 'firebase/firestore';
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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (currentUser) {
      console.log(currentUser)
      const fetchCartProducts = async () => {
        const q = query(collection(database, 'carrito_producto'), where('carritoId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            nombre: data.nombre || '',
            quantity: data.quantity || 0,
            precio: data.precio || 0,
            productId: data.productId || ''
          };
        });
        setCartProducts(products);
        console.log(cartProducts)
      };
      fetchCartProducts();
    } else {
      setCartProducts(tempCart);
    }
  }, [currentUser, tempCart]);


  const generatePDF = (products, total, download = false) => {
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
      const productText = `${index + 1}. ${product.name} - Cantidad: ${product.quantity} - Precio: $${product.price}`;
      doc.text(productText, 10, y);
      doc.setLineWidth(0.5);
      doc.setDrawColor("#ccc");
      doc.line(10, y + 5, 200, y + 5);
      y += 10;
    });

    // Añadir línea divisoria
    doc.setLineWidth(0.5);
    doc.setDrawColor("#ccc");
    doc.line(10, y + 2, 200, y + 2);

    // Añadir total
    doc.setTextColor("#333");
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Total: $${total.toFixed(2)}`, 10, y + 12);

    if (download) {
      doc.save('receipt.pdf');
    } else {
      const blobUrl = URL.createObjectURL(doc.output('blob'));
      setPdfUrl(blobUrl);
    }
  };


  // doc.save('receipt.pdf');
  const handleCheckout = async () => {
    setLoading(true)
    if (!currentUser) {
      navigate('/login');
    } else {
      try {
        const stockAvailable = await checkStock(cartProducts)
        if(stockAvailable) {
          await finalizarVenta()
          alert('Venta finalizada')
          navigate('/')
        }else{
          alert('Algunos articulos ya no estan disponibles')
        }
      } catch (error) {
        console.error('Error finalizing purchase: ', error);
      }
    }
    setLoading(false)
  };


  const handlePreview = () => {
    const total = cartProducts.reduce((acc, item) => acc + item.precio * item.quantity, 0);
    generatePDF(cartProducts, total, false); // Generar PDF sin descargar
    setPreviewVisible(true);
  };

  //const shouldRenderPreview = previewVisible && pdfUrl;

  //Comprobar el stock
  const checkStock = async (cartItems) => {
    let inStock = true;
    for (let item of cartItems) {
      const productRef = doc(database, 'productos', item.productId);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const productData = productSnap.data();
        if (productData.stock < item.quantity) {
          inStock = false;
          break;
        }
      } else {
        inStock = false;
        break;
      }
    }
    return inStock;
  };

  const finalizarVenta = async () =>{
    const batch = writeBatch(database)
    let totalPoints = 0;

    //Stock
    for (let item of cartProducts) {
      const productRef = doc(database, 'productos', item.productId);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const productData = productSnap.data();
        const newStock = productData.stock - item.quantity;
        batch.update(productRef, { stock: newStock });
        totalPoints += (Number(item.precio) * item.quantity) * 0.10;
      }
    }

    //Datos
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
    await addDoc(collection(database, 'ventas'), venta);

    // Update user's points
    const userRef = doc(database, 'usuarios', currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const newPoints = Number(userData.points || 0) + Number(totalPoints);
      batch.update(userRef, { points: newPoints });
    }

    await batch.commit()

    // Eliminar productos del carrito
    const carritoProductoRef = collection(database, 'carrito_producto');
    await Promise.all(cartProducts.map(item => deleteDoc(doc(carritoProductoRef, item.id))));

    setCartProducts([]);
    clearTempCart();

    // Descargar PDF
    generatePDF(venta.products, total, true);
  }

  return (
    <div className=''>
      <h2 className='mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl dark:text-white'>Tus Productos</h2>
      <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        {cartProducts.length > 0 ? (
          <ul>
            {cartProducts.map((item, index) => (
              <li key={index} className=' p-2'>
                <div class="flex items-center space-x-4 rtl:space-x-reverse">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate dark:text-white">
                      {item.nombre}
                    </p>
                    <p class="text-sm text-gray-500 truncate dark:text-gray-400">
                      {item.quantity}
                    </p>
                  </div>
                  <div class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                    ${item.precio * item.quantity}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay productos en el carrito.</p>
        )}
        <button onClick={handleCheckout}>
          {loading ? 'Procesando...' : 'Finalizar Compra'}
        </button>
        <button onClick={handlePreview}>Previsualizar</button>

        {previewVisible && pdfUrl && (
          <iframe src={pdfUrl} style={{ width: '100%', height: '500px', marginTop: '20px' }} />
        )}
      </div>
    </div>
  );

};

export default Carrito;
