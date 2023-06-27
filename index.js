const express = require('express');
require('dotenv').config();
const mysql = require('mysql2/promise');
const faker = require('@faker-js/faker');

const { APP_PORT, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } =
  process.env;

const app = express();
const port = APP_PORT;

app.use(express.json());

const createPoolInstance = () => {
  try {
    const pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
    });
    return pool;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
const pool = createPoolInstance();

//CRUD - BDD : firstname, lastname, birthdate

//CREATE

app.post('/create', async (req, res) => {
  const sql =
    'INSERT INTO knight (firstname, lastname, birthdate) VALUES (? , ?, ?)';

  try {
    await pool.query(sql, [
      req.body.firstname,
      req.body.lastname,
      req.body.birthdate,
    ]);
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.post('/generate', async (req, res) => {
  const sql = 'TRUNCATE TABLE knight;';

  try {
    pool.query(sql);
  } catch (error) {
    console.log(err);
  }

  const knights = [];

  for (let i = 0; i < 100; i++) {
    knights.push([
      faker.fakerFR.person.firstName(),
      faker.fakerFR.person.lastName(),
      faker.faker.date.birthdate().toISOString().split('T')[0],
    ]);
  }

  const sqlInsert =
    'INSERT INTO knight (firstname, lastname, birthdate) VALUES ?';

  try {
    await pool.query(sqlInsert, [knights]);
    res.sendStatus(201);
  } catch (error) {
    console.error(err);
    res.sendStatus(500);
  }
});

//READ
app.get('/getAll', async (req, res) => {
  const sql = 'SELECT * FROM knight;';

  try {
    const [knights] = await pool.query(sql);
    res.send(knights);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.get('/getOne/:id', async (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM knight WHERE id= ?';

  try {
    const [knight] = await pool.query(sql, [id]);

    knight.length ? res.send(knight) : res.sendStatus(404);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

//UPDATE
app.put('/update/:id', async (req, res) => {
  const sql =
    'UPDATE knight SET firstname= ?, lastname= ?, birthdate= ? WHERE id=?';

  try {
    await pool.query(sql, [
      req.body.firstname,
      req.body.lastname,
      req.body.birthdate,
      req.params.id,
    ]);

    res.send('knight updated');
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

//DELETE
app.delete('/delete/:id', async (req, res) => {
  const sql = 'DELETE FROM knight WHERE id= ?';

  try {
    await pool.query(sql, [req.params.id]);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.listen(port, (err) => {
  if (err) console.error(err);

  console.log(`Server is running on port ${port}`);
});
