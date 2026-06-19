require('dotenv').config(); 
const express = require('express');
const sequelize = require('./config/database');
const bcrypt = require('bcrypt');

const User = require('./models/user.model');
const Order = require('./models/order.model');

// Import des fichiers de routes
const authRoutes = require('./routes/auth.route');
const orderRoutes = require('./routes/order.route');

const app = express();
app.use(express.json());

// CONFIGURATION DES ROUTES

// Routes d'authentification (Inscriptions / Connexions)
app.use('/api/auth', authRoutes);

// Routes des commandes (Toutes protégées en interne par le middleware JWT)
app.use('/api/orders', orderRoutes);



// Définition des relations (Un utilisateur possède plusieurs commandes)
User.hasMany(Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId' });

const PORT = process.env.PORT || 3000;

sequelize.sync({ force: true }).then(async () => {
  console.log('📦 Base de données SQLite connectée et synchronisée.');



  // 1. Création des utilisateurs
  const admin = await User.create({ username: 'admin', password: "admin123", role: 'admin' });
  const alice = await User.create({ username: 'alice', password: "alice123", role: 'user' });
  const bob = await User.create({ username: 'bob', password: "bob123", role: 'user' });

  // 2. Création de commandes de test liées aux comptes
  await Order.create({ productName: 'Ordinateur Portable Pro', price: 1499.99, status: 'Payé', userId: alice.id });
  await Order.create({ productName: 'Livre - Sécurité des API Web', price: 39.90, status: 'En attente', userId: alice.id });
  await Order.create({ productName: 'Drone de surveillance DJI', price: 899.00, status: 'Livré', userId: bob.id });

  console.log('👥 Données de test injectées avec succès.');
  console.log(`📌 Comptes prêts : \n   - Admin: admin / admin123 \n   - User 1: alice / alice123 \n   - User 2: bob / bob123`);

  // Lancement de l'écoute du serveur
  app.listen(PORT, () => {
    console.log(`🚀 Serveur sain en cours d'exécution sur : http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ Impossible de connecter la base de données SQLite:', err);
});