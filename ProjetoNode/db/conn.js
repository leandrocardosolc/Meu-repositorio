const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('studiobeleza', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

module.exports = sequelize;
