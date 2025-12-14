const sql = require('../lib/data_base');
// crea links dentro de los temas 
exports.create = async (req, res) =>
    {const topicId = Number(req.params.id);
    const topic = await sql.get(`SELECT id FROM topic WHERE id = ?`, [topicId]);
    if (!topic) return res.status(404).send('tema no encontrado');
    const {title, url, author, description} = req.body;
    if (!title || !title.trim() || !url || !url.trim())
    {return res.status(400).send('titulo y url requeridos');}

    const r = await sql.run(
        `INSERT INTO link (title, url, author, description, topicId)
        VALUES (?, ?, ?, ?, ?)`,
        [title.trim(), url.trim(), (author || 'Anonimo').trim(), (description || '').trim(), topicId]
    );

    if (req.accepts('html')) return res.redirect(`/topics/${topicId}`);
    const created = await sql.get(
    `SELECT id, title, url, author, description, votes, createdAt, updatedAt
    FROM link WHERE id = ?`,
    [r.lastID]
    );
    res.status(201).json(created)
    };
// para votar los links 
exports.vote = async (req, res) => {
  const topicId = Number(req.params.id);
  const linkId = Number(req.params.linkId);
  const sid = req.sid;

  // para asegurar que el link exista y sea del mismo tema
  const link = await sql.get(
    `SELECT id, votes FROM link WHERE id = ? AND topicId = ?`,
    [linkId, topicId]
  );
  if (!link) return res.status(404).send('enlace no encontrado');
  // chequeando que ese cookie ya voto o no 
  const existing = await sql.get(
    `SELECT id FROM VoteLink WHERE sid = ? AND linkId = ?`,
    [sid, linkId]);

  if (existing) {
    // si ya voto sacamos el voto cada que intenta votar 
    await sql.run(`DELETE FROM VoteLink WHERE id = ?`, [existing.id]);
    await sql.run(
    `UPDATE link
    SET votes = CASE WHEN votes > 0 THEN votes - 1 ELSE 0 END,
    updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [linkId]);

    const row = await sql.get(`SELECT votes FROM link WHERE id = ?`, [linkId]);
    return res.json({ ok: true, id: linkId, votes: row.votes, voted: false });
  } else {
    // agregar voto
    await sql.run(`INSERT INTO VoteLink (sid, linkId) VALUES (?, ?)`, [sid, linkId]);
    await sql.run(
    `UPDATE link
    SET votes = votes + 1,
    updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [linkId]
    );
    const row = await sql.get(`SELECT votes FROM link WHERE id = ?`, [linkId]);
    return res.json({ ok: true, id: linkId, votes: row.votes, voted: true });
  }
};
// ponemos los campos que pueden completar para editar 
exports.editForm = async (req, res) => {
  const topicId = Number(req.params.id);
  const linkId = Number(req.params.linkId);
  const link = await sql.get(
    `SELECT id, title, url, author, description
    FROM link
    WHERE id = ? AND topicId = ?`,
    [linkId, topicId]
  );
  if (!link) return res.status(404).send('enlace no encontrado');

  res.render('edit-link', { topicId, link });
};
// actualizamos los temas y si no carga un tema usa el anterior o lo que tenemos por defecto 
exports.update = async (req, res) => {
  const topicId = Number(req.params.id);
  const linkId = Number(req.params.linkId);

  const exists = await sql.get(
    `SELECT id FROM link WHERE id = ? AND topicId = ?`,
    [linkId, topicId]);
  if (!exists) return res.status(404).send('enlace no encontrado');

  const {title, url, author, description } = req.body;
  if (title !== undefined && !String(title).trim())
    return res.status(400).send('title requerido');
  if (url !== undefined && !String(url).trim())
    return res.status(400).send('url requerida');

  await sql.run(
    `UPDATE link SET
    title = COALESCE(?, title),
    url = COALESCE(?, url),
    author = COALESCE(?, author),
    description = COALESCE(?, description),
    updatedAt = CURRENT_TIMESTAMP
    WHERE id = ? AND topicId = ?`,
    [
    title !== undefined ? String(title).trim() : null,
    url !== undefined ? String(url).trim()   : null,
    author!== undefined ? (String(author).trim() || 'Anonimo') : null,
    description !== undefined ? String(description).trim() : null,
    linkId, topicId
    ]
  );

  const fromForm =
    (req.headers['content-type'] || '').includes('application/x-www-form-urlencoded') ||
    ('_method' in req.query);
  if (fromForm) return res.redirect(`/topics/${topicId}?message=` + encodeURIComponent('Enlace actualizado'));

  const updated = await sql.get(
    `SELECT id, title, url, author, description, votes, createdAt, updatedAt
    FROM link WHERE id = ?`,
    [linkId]
  );
  res.json(updated);
};
// eliminamos temas 
exports.delete = async (req, res) => {
  const topicId = Number(req.params.id);
  const linkId = Number(req.params.linkId);
  const r = await sql.run(
    `DELETE FROM link WHERE id = ? AND topicId = ?`,
    [linkId, topicId]
  );
  if (r.changes === 0) return res.status(404).send('enlace no encontrado');

  const fromForm =
    (req.headers['content-type'] || '').includes('application/x-www-form-urlencoded') ||
    ('_method' in req.query);

  if (fromForm) return res.redirect(`/topics/${topicId}?message=` + encodeURIComponent('Enlace eliminado'));
  res.json({ ok: true });
};