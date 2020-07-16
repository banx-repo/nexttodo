export default async (req, res) => {
  res.writeHead(200, "Logout Success", {
    "Set-Cookie": "token=; Path=/;",
  });
  res.end();
};
