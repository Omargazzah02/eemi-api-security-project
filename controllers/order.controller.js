const Order = require('../models/order.model');

exports.createOrder = async (req, res) => {
  const { productName, price } = req.body;

  // Validation des entrées
  if (!productName || typeof productName !== 'string' || productName.trim() === '') {
    return res.status(400).json({ error: "Le nom du produit est requis et doit être valide." });
  }
  if (price === undefined || isNaN(price) || Number(price) < 0) {
    return res.status(400).json({ error: "Le prix doit être un nombre positif." });
  }

  try {
    const newOrder = await Order.create({
      productName,
      price,
      status: 'En attente',
      userId: req.user.id
    });


    return res.status(201).json({
      message: "Commande créée avec succès !",
      order: newOrder
    });
  } catch (err) {
    return res.status(500).json({ error: "Erreur lors de la création de la commande." });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    let orders;

    if (req.user.role === 'admin') {
      orders = await Order.findAll();
    } else {
      orders = await Order.findAll({ where: { userId: req.user.id } });
    }

    return res.json(orders);
  } catch (err) {
    return res.status(500).json({ error: "Erreur lors de la récupération des commandes." });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Commande introuvable." });
    }

    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Accès refusé. Vous n'êtes pas autorisé à voir cette commande." });
    }

    return res.json(order);
  } catch (err) {
    return res.status(500).json({ error: "Erreur lors de la récupération de la commande." });
  }
};

exports.updateOrder = async (req, res) => {
  const { productName, price, status } = req.body;

  // Validation des entrées
  if (!productName || typeof productName !== 'string' || productName.trim() === '') {
    return res.status(400).json({ error: "Le nom du produit est requis et doit être valide." });
  }
  if (price === undefined || isNaN(price) || Number(price) < 0) {
    return res.status(400).json({ error: "Le prix doit être un nombre positif." });
  }

  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Commande introuvable." });
    }

    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Accès refusé. Vous n'êtes pas autorisé à modifier cette commande." });
    }


    if (status && status !== order.status && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Accès refusé. Seul un administrateur peut modifier le statut d'une commande." });
    }

    order.productName = productName || order.productName;
    order.price = price || order.price;
    if (req.user.role === 'admin') {
      order.status = status || order.status;
    }

    await order.save();

    return res.json({
      message: "Commande mise à jour avec succès !",
      order
    });
  } catch (err) {
    return res.status(500).json({ error: "Erreur lors de la modification de la commande." });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Commande introuvable." });
    }

    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Accès refusé. Vous n'êtes pas autorisé à supprimer cette commande." });
    }

    await order.destroy();

    return res.json({ message: "Commande supprimée avec succès !" });
  } catch (err) {
    return res.status(500).json({ error: "Erreur lors de la suppression de la commande." });
  }
};