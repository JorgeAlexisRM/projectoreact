import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ProductosIndex from './vistas/Productos-Index';

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path="/" component={ProductosIndex} />
          <Route path="/productos/:id" component={DetalleProducto} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
