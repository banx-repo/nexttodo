import query from "../../lib/mysql";
import jwt from "jsonwebtoken";

export default async (req, res) => {
    const token = req.cookies.token;
    const tokenData = jwt.verify(token, process.env.SECRET_KEY);

    if (!tokenData) {
        res.status(403).json({ message: "Cút 😵!" });
        return;
    }

    switch (req.method) {
        case "GET":
            var result = await query(
                "SELECT id, content, modified, completed FROM todo WHERE user_id = ? ORDER BY modified DESC",
                tokenData.id
            );

            if (!result) {
                res.status(400).json({
                    message: "Very veryyyy bad request! 😵",
                });
                break;
            }

            res.status(200).json(result);
            break;

        case "POST":
            var content = req.body.todo.replace(/[\u0800-\uFFFF]/g, "");
            if (!content || content.trim().length === 0) {
                res.status(400).json({
                    message: "Very veryyyy bad request! 😵",
                });
                break;
            }

            var result = await query(
                "INSERT INTO todo (content, user_id) VALUE(?, ?)",
                [content, tokenData.id]
            );

            if (!result) {
                res.status(400).json({ message: "Lỗi tùm lum 😵!" });
                break;
            }

            res.status(200).json({ message: "Thêm Ô kê 😘!" });
            break;

        case "PUT":
            var { id, content, completed } = req.body;
            var modified = new Date()
                .toISOString()
                .slice(0, 19)
                .replace("T", " ");

            var result = await query(
                "UPDATE todo SET content = ?, modified = ?, completed = ? WHERE id = ? AND user_id = ?",
                [content, modified, completed, id, tokenData.id]
            );

            if (!result) {
                res.status(400).json({ message: "Lỗi tùm lum 😵!" });
                break;
            }

            res.status(200).json({ message: "Sửa Ô kê 🤓!" });
            break;

        case "DELETE":
            var { id } = req.body;

            var result = await query(
                "DELETE FROM todo WHERE id = ? AND user_id = ?",
                [id, tokenData.id]
            );

            if (!result) {
                res.status(400).json({ message: "Lỗi tùm lum 😵!" });
                break;
            }

            res.status(200).json({ message: "Xóa Ô kê 😭!" });
            break;

        default:
            res.status(400).json({ message: "Method not allowed 😵!" });
            break;
    }
};
