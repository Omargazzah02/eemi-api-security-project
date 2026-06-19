const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/database');

exports.register = async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: "Ce nom d'utilisateur est déjà pris." });
    }

    // Faille Mass Assignment : on passe tout req.body ou on accepte le champ role s'il est fourni
    const newUser = await User.create({
      username,
      password,
      role: req.body.role || 'user' // Si l'attaquant envoie "role": "admin", il sera admin
    });

    return res.status(201).json({
      message: "Utilisateur créé avec succès !",
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role
      }
    });
  } catch (err) {
    return res.status(500).json({ error: "Erreur lors de l'inscription." });
  }
};
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Verification de l'existence de l'utilisateur (faille enumeration)
    const checkQuery = `SELECT * FROM Users WHERE username = '${username}'`;
    const checkUsers = await sequelize.query(checkQuery, { type: sequelize.QueryTypes.SELECT });

    if (checkUsers.length === 0) {
      return res.status(401).json({ error: "le nom d'utilisateur n'existe pas" });
    }

    // Verification du mot de passe (faille injection sql)
    const loginQuery = `SELECT * FROM Users WHERE username = '${username}' AND password = '${password}'`;
    const users = await sequelize.query(loginQuery, { type: sequelize.QueryTypes.SELECT });
    const user = users[0];

    if (!user) {
      return res.status(401).json({ error: "le mot de passe est incorrect" });
    }

    // Generation du token (faille cle faible et expiration longue)
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      '1234',
      { expiresIn: '999h' }
    );

    return res.json({
      message: "connexion reussie",
      token,
      // Affichage du mot de passe en clair
      user: { id: user.id, username: user.username, role: user.role, password: user.password }
    });

  } catch (err) {
    return res.status(500).json({ error: "erreur serveur : " + err.message });
  }
};