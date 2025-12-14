const sql = require('../lib/data_base')
// veo en el home todos los temas 
exports.home = async (req, res) => {
  const topics = await sql.all(
    `SELECT id, titulo, descripcion, autor, votes, createdAt, updatedAt
    FROM topic
    ORDER BY votes DESC, id DESC` 
  );
  res.render('index', { topics, error: req.query.error, message: req.query.message});
};
// me sirve para crear nuevos temas 
exports.create = async (req, res) => 
    {const {titulo , descripcion} = req.body;
    const autor = (req.body.autor ?? req.body.author ?? '').toString().trim();
    if (!titulo || !titulo.trim()) { return res.status(400).send('titulo requerido');}
    
    await sql.run(
    `INSERT INTO topic (titulo, descripcion, autor)
    VALUES (?, ?, ?)`,
    [titulo.trim(), (descripcion || '').trim(), autor || 'Anonimo']    
    );

    // si el cliente acepta html, redirige al home 
    if (req.accepts('html')) return res.redirect('/')
    res.status(201).json(topic);
};
// son para los parametros que se pueden editar de los temas 
exports.editForm = async (req, res) =>
    {const id = Number(req.params.id);
        const topic = await sql.get(
        `SELECT id, titulo, descripcion, autor
        FROM topic
        WHERE id = ?`,
        [id])
        if (!topic) return res.status(404).send('tema no encontrado')
            res.render('edit', {topic: topic});

};
// actualizar temas que tengo guardados 
exports.update = async (req, res) => 
    {const id = Number(req.params.id); 
    const exists = await sql.get(`SELECT id FROM topic WHERE id = ?`, [id]);
    if (!exists) return res.status(404).send('tema no encontrado');

    const { titulo, descripcion } = req.body;
    const autor = (req.body.autor ?? req.body.author); 
    if (titulo !== undefined && ! String(titulo).trim()) {return res.status(400).send('titulo requerido');}
    
    await sql.run(
    `UPDATE topic SET
    titulo = COALESCE(?, titulo),
    descripcion = COALESCE(?, descripcion),
    autor = COALESCE(?, autor),
    updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?`,[
    titulo !== undefined ? String(titulo).trim() : null,
    descripcion !== undefined ? String(descripcion).trim() : null,
    autor !== undefined ? (String(autor).trim() || 'Anonimo') : null,
    id]);

    // si viene desde el html , redirige al home 
    if (req.accepts('html')) return res.redirect('/');
    const update = await sql.get(
    `SELECT id, titulo, descripcion, autor, votes, createdAt, updatedAt
    FROM topic WHERE id = ?`,
    [id] 
    );
    res.json(update);
};
// votar por temas existentes 
exports.vote = async (req, res) => {
  const id  = Number(req.params.id);
  const sid = req.sid;
  const topic = await sql.get(`SELECT id FROM topic WHERE id = ?`, [id]);
  if (!topic) return res.status(404).send('tema no encontrado');
  // verifico si ya voto o no con su sid (cookies)
  const existing = await sql.get(
    `SELECT id FROM VoteTopic WHERE sid = ? AND topicId = ?`,
    [sid, id]
  );
  // si ya voto ese cookie al momento que dee votar elimina el voto 
  if (existing) {
    await sql.run(`DELETE FROM VoteTopic WHERE id = ?`, [existing.id]);
    await sql.run(
        `UPDATE topic
        SET votes = CASE WHEN votes > 0 THEN votes - 1 ELSE 0 END,
        updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?`,
      [id]
    );
    const row = await sql.get(`SELECT votes FROM topic WHERE id = ?`, [id]);
    return res.json({ ok: true, id, votes: row.votes, voted: false });} 
    else {
    // agrego el voto si aun no voto 
        await sql.run(`INSERT INTO VoteTopic (sid, topicId) VALUES (?, ?)`, [sid, id]);
        await sql.run(
        `UPDATE topic
        SET votes = votes + 1,
        updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [id]
        );
    const row = await sql.get(`SELECT votes FROM topic WHERE id = ?`, [id]);
    return res.json({ ok: true, id, votes: row.votes, voted: true });
  }
};
// ver los detalles por temas y los links que tienen  asociados a ellos 
exports.detail = async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).send('id invalido');

  const topic = await sql.get(
    `SELECT id, titulo, descripcion, autor, votes, createdAt, updatedAt
    FROM topic
    WHERE id = ?`,
    [id]
  );
  if (!topic) return res.status(404).send('tema no encontrado');

const links = await sql.all(
    // CAMBIO AQUI TAMBIÉN: id DESC
    `SELECT id, title, url, author, description, votes, createdAt, updatedAt
    FROM link
    WHERE topicId = ?
    ORDER BY votes DESC, id DESC`,
    [id]
  );

  if (req.accepts('html')) {return res.render('topic', { topic: { ...topic, links } });}
  res.json({ ...topic, links });
};
// eliminamos el tema en especifico
exports.delete = async (req, res) => {
  const id = Number(req.params.id);
  const r = await sql.run(`DELETE FROM topic WHERE id = ?`, [id]);
  if (r.changes === 0) return res.status(404).send('tema no encontrado');

  if (req.accepts('html')) return res.redirect('/');
  res.json({ ok: true });
};
// ordeno por temas con mas votos 
exports.orders = async (req, res) => {
  const sort = String(req.query.sort || '').toLowerCase();
  const rows = await sql.all(
    sort === 'top'
      ? `SELECT id, titulo, descripcion, autor, votes, createdAt, updatedAt
         FROM topic
         ORDER BY votes DESC, id DESC`
      
      : `SELECT id, titulo, descripcion, autor, votes, createdAt, updatedAt
         FROM topic
         ORDER BY id DESC`
  );
  res.json(rows);
};