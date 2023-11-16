const ProductManager = require('./ProductManager.js');
const productManager = new ProductManager('./productos.json');
const express = require('express');
const exphbs = require('express-handlebars');
const http = require('http');
const socketIO = require('socket.io');


const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

app.set('views', __dirname + '/views');

app.get('/', (req, res) => {
    const limit = req.query.limit;
    const products = productManager.getProducts();
    
    if (limit) {
      const limitedProducts = products.slice(0, parseInt(limit, 10));
      res.json({ products: limitedProducts });
    } else {
      res.render('home', { pageTitle: 'Lista de Productos', body: 'Contenido de la vista', productos: products });
    }
  });


app.get('/realtimeproducts', (req, res) => {
    const products = productManager.getProducts();
    res.render('realTimeProducts', { pageTitle: 'Lista de Productos', body: 'Contenido de la vista', productos: products });
});

io.on('connection', (socket) => {
    console.log('Usuario conectado');
  
    const products = productManager.getProducts();
    io.emit('updateProducts', products);
  
    socket.on('addProduct', (product) => {
      productManager.addProduct(product);
      const updatedProducts = productManager.getProducts();
      io.emit('updateProducts', updatedProducts);
    });
  
    socket.on('deleteProduct', (productId) => {
        productManager.deleteProduct(productId);
        const updatedProducts = productManager.getProducts();
        io.emit('updateProducts', updatedProducts);
    });
  
    socket.on('disconnect', () => {
      console.log('Usuario desconectado');
    });
  });

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
