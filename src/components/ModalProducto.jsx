import React, { useState } from 'react'

const ModalProducto = ({product, cerrarModal}) => {
    const [cantidad, setCantidad] = useState(1);

    const manejarCambioCantidad = (e) =>{
        setCantidad(e.target.value);
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-96">
                <button className="absolute top-2 right-2 text-gray-500" onClick={cerrarModal}>X</button>
                <img src={product.imagen} alt={product.nombre} className="w-full h-48 object-cover rounded" />
                <h2 className="text-2xl font-bold mt-4">{product.nombre}</h2>
                <p className="text-gray-700 mt-2">ID: {product.id}</p>
                <p className="text-gray-700 mt-2">Price: ${product.precio}</p>
                <p className="text-gray-700 mt-2">Description: {product.descripcion}</p>
                <div className="mt-4">
                    <label htmlFor="cantidad" className="block text-gray-700">Cantidad:</label>
                    <input
                        id="cantidad"
                        type="number"
                        value={cantidad}
                        onChange={manejarCambioCantidad}
                        className="w-full border p-2 mt-1 rounded"
                    />
                </div>
                <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded" >
                    Add to cart
                </button>
            </div>
        </div>
    )
}
export default ModalProducto
