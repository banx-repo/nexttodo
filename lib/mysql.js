import mysql from "mysql";

const db = mysql.createPool({
  connectionLimit: 1000,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

export default async function query(query, options) {
  const { conErr, con } = await new Promise((resolve) =>
    db.getConnection((conErr, con) => resolve({ conErr, con }))
  );

  if (conErr) {
    console.log(conErr);
    return;
  }

  const { queErr, result } = await new Promise((resolve) =>
    con.query(query, options, (queErr, result) => resolve({ queErr, result }))
  );

  if (queErr) {
    console.log(queErr);
  }

  con.release();
  return result;
}
