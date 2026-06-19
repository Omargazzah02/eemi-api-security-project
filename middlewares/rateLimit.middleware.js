const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 8, 
  message: {
    error: "Trop de requêtes détectées. Veuillez patienter 15 minutes avant de réessayer."
  },
  standardHeaders: true, 
  legacyHeaders: false,  
});

module.exports = loginLimiter;