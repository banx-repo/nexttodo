import jwt from "jsonwebtoken";
import formidable from "formidable";
import query from "../../lib/mysql";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req, res) => {
  const tkData = jwt.verify(req.cookies.token, process.env.SECRET_KEY);

  if (!tkData) {
    res.status(403).json({ message: "Not authorized!" });
    return;
  }

  return new Promise((resolve, reject) => {
    switch (req.method) {
      case "POST":
        let fullname;
        const form = new formidable.IncomingForm({
          uploadDir: "public/users",
          keepExtensions: true,
        });

        form.parse(req);

        form
          .on("error", (err) => {
            console.log(err);
            reject();
          })
          .on("field", async (field, value) => {
            if (field === "fullname") {
              await query("UPDATE user SET fullname = ? WHERE id = ?", [
                value,
                tkData.id,
              ]);
            }
          })
          .on("fileBegin", async (name, file) => {
            // file.path = form.uploadDir + "/" + tkData.username + ".png";
            const url = file.path.replace("public/", "");
            await query("UPDATE user SET avatar = ? WHERE id = ?", [
              url,
              tkData.id,
            ]);
          })
          .on("file", (field, file) => {
            resolve({ field, file });
          })
          .on("end", () => {});

        break;

      default:
        res.status(400).json({ message: "Method not allowed!" });
        break;
    }
  })
    .then(({ field, file }) => res.status(200).json({ field, file }))
    .catch((e) => res.status(400).json({ message: "Lỗi rồi!" }));
};
