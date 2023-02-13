'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('users', 'guildId'),
      queryInterface.removeColumn('users', 'chanelId'),
    ])
  },

};