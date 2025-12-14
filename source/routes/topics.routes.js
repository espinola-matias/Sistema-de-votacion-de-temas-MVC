const ruta = require('express').Router();
const c = require('../controllers/topics.controller');

ruta.get('/', c.home);
ruta.post('/topics', c.create);
ruta.get('/topics/:id/edit', c.editForm);
ruta.put('/topics/:id', c.update);
ruta.post('/topics/:id/vote', c.vote);
ruta.get('/topics/:id', c.detail);
ruta.delete('/topics/:id', c.delete);
ruta.get('/topics', c.orders);

module.exports = ruta;