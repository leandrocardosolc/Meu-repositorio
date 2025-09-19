const { DataTypes } = require('sequelize');
const db = require('../db/conn');
const User = require('./User');

const Post = db.define('Post', {
  titulo: { type: DataTypes.STRING, allowNull: false },
  conteudo: { type: DataTypes.TEXT, allowNull: false }
});

Post.belongsTo(User, { foreignKey: 'UserId' });
User.hasMany(Post, { foreignKey: 'UserId' });

module.exports = Post;
