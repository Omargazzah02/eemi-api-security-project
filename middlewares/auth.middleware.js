const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Accès refusé. Aucun token fourni." });
  }

  try {
    const decoded = jwt.verify(token, "1234");
    
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalide ou expiré." });
  }
};

exports.restrictToAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: "Accès interdit. Privilèges administrateur requis." });
  }
};

