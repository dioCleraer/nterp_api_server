const express = require('express');
const sql = require('mssql');
const app = express();
require('dotenv').config();
app.use(express.json());

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  options: { encrypt: false },
};

app.get('/api/vendors', async (req, res) => {
  try {
    await sql.connect(dbConfig);
    const keyword = req.query.search || '';
    const result = await sql.query\`SELECT TOP 10 VENDOR_NO, VENDOR_NAME FROM S_ST005 WHERE VENDOR_NAME LIKE '%' + \${keyword} + '%'\`;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/inbound/:pono', async (req, res) => {
  try {
    await sql.connect(dbConfig);
    const result = await sql.query\`SELECT * FROM S_PU100_I WHERE PU_PONO = \${req.params.pono}\`;
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/outbound', async (req, res) => {
  const { out_no, in_no, stitm_no, out_qty, out_weight, vendor_code, coil_no, location, user_id } = req.body;
  try {
    await sql.connect(dbConfig);
    await sql.query\`
      INSERT INTO S_PU100_O (OUT_NO, IN_NO, STITM_NO, OUT_QTY, OUT_WEIGHT, STWKC_NO, COIL_NO, MAT_NAME1, CREATE_EMPNO)
      VALUES (\${out_no}, \${in_no}, \${stitm_no}, \${out_qty}, \${out_weight}, \${vendor_code}, \${coil_no}, \${location}, \${user_id})
    \`;
    res.json({ message: '출고 등록 완료' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('API server running...');
});