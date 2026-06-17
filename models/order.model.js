const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'En attente'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false 
  }
});

module.exports = Order;