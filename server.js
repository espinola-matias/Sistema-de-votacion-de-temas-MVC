const express = require('express');  // importamos express (commonjs) para levantar el servidor 
const cookieParser = require('cookie-parser'); // lectura de los cookies
const path = require('path'); // nativo de node, me permite redireccionar y modularizar carpetas de codigos 
const crypto = require('crypto'); // para generarle los sid / cookies a los clientes 
const app = express();  // y creamos o instanciamos el servidor 
const methodOverride = require('method-override'); //  para metodos put y delete

// realizamos la configuracion de vista 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'source', 'views'));
 
app.use(express.urlencoded({ extended: true}));     // leer formato de formulario html
app.use(express.json());     // y retornamos la lectura en fromaato json

app.use(methodOverride('_method'));  //  habilitar mis metods put y detele en 
app.use(cookieParser()); // para hacer la lectura o generacion de cookies 
app.use((req, res, next) => {
  let sid = req.cookies.sid;
  if (!sid)
    {sid = (typeof crypto.randomUUID === 'function')
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
    res.cookie('sid', sid, { httpOnly: true, sameSite: 'lax' });
  }
  req.sid = sid;     // guardamos los cookies para usar despues  
  next();
});

// agregamos para mandar a nuestra separacion MVC
const topicsRoutes = require('./source/routes/topics.routes');
app.use('/', topicsRoutes);

const linksRoutes = require('./source/routes/links.routes');
app.use('/', linksRoutes);

// metodo de escucha y puerto donde saldra 
const PORT = 3000;
app.listen(PORT, () => {console.log(`estamos escuchando en http://localhost:${PORT}`);}); 