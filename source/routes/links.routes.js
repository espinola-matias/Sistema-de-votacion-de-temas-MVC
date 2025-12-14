const ruta = require('express').Router();
const c = require('../controllers/links.controller');
// ponemos la ruta que va a usar 
ruta.post('/topics/:id/links', c.create);
ruta.post('/topics/:id/links/:linkId/vote', c.vote);
ruta.get('/topics/:id/links/:linkId/edit', c.editForm);
ruta.put('/topics/:id/links/:linkId', c.update);
ruta.delete('/topics/:id/links/:linkId', c.delete);

module.exports = ruta;