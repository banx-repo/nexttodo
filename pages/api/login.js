import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import query from "../../lib/mysql";

export default async (req, res) => {
  switch (req.method) {
    case "POST":
      const { username, password } = req.body;

      const result = await query(
        "SELECT id, fullname, username, password, avatar FROM user WHERE username = ?",
        username
      );

      if (!result) {
        res.status(400).json({ message: "Lỗi nghiêm trọng!" });
        break;
      }

      if (result.length === 0) {
        res.status(401).json({ message: "Tài khoản không tồn tại!" });
        break;
      }

      const user = result[0];
      const compare = await bcrypt.compare(password, user.password);

      if (!compare) {
        res.status(401).json({ message: "Mật khẩu không đúng!" });
        break;
      }

      const payload = {
        id: user.id,
        fullname: user.fullname,
        username: user.username,
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
      res.status(405).json({ message: "Method not supported!" });
      break;
  }
};
