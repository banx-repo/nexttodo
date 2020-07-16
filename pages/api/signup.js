import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import query from "../../lib/mysql";

export default async (req, res) => {
  switch (req.method) {
    case "POST":
      const { fullname, username, password, rePassword } = req.body;

      if (
        !/^[a-zA-Z][a-zA-Z0-9]{4,9}$/.test(username) ||
        fullname === "" ||
        !/^.{6,20}$/.test(password) ||
        password !== rePassword
      ) {
        res.status(400).json({ message: "Thông tin đăng ký không hợp lệ!" });
        break;
      }

      const result = await query(
        "SELECT username FROM user WHERE username = ?",
        username
      );

      if (!result) {
        res.status(400).json({ message: "Lỗi nghiêm trọng!" });
        break;
      }

      if (result.length > 0) {
        res.status(401).json({ message: "Người dùng đã tồn tại!" });
        break;
      }

      const hash = await bcrypt.hash(password, 10);

      if (!hash) {
        res.status(400).json({ message: "Lỗi băm mật khẩu!" });
        break;
      }

      const data = await query(
        "INSERT INTO user(fullname, username, password) VALUE(?, ?, ?)",
        [fullname, username, hash]
      );

      if (!data) {
        res.status(400).json({ message: "Lỗi Database!" });
        break;
      }

      const payload = {
        id: data.insertId,
        fullname,
        username,
      };

      const token = jwt.sign(payload, process.env.SECRET_KEY, {
        algorithm: "HS256",
        expiresIn: "365 days",
      });

      res.status(200);
      res.setHeader("Location", "/");
      res.setHeader(
        "Set-Cookie",
        `token=${token}; Path=/; HttpOnly; Expires=${new Date(
          new Date().getTime() + 31536000000
        ).toUTCString()}`
      );
      res.end();

      break;

    default:
      res.status(405).send({ message: "Method not allowed!" });
      break;
  }
};
