import jwt from "jsonwebtoken";

export function authRequired(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token não informado." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // salva os dados do usuário no request
    next();
  } catch (err) {
    return res.status(401).json({ erro: "Token inválido ou expirado." });
  }
}
