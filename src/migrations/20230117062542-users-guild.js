'use strict';

module.exports = {
	up: (queryInterface, Sequelize) =>
		queryInterface.createTable('userGuilds', {
			id: {
				allowNull: false,
				primaryKey: true,
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUID,
			},
			guildId: Sequelize.UUID,
			userId: Sequelize.UUID,
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE
			}
		}),
	down: (queryInterface) => queryInterface.dropTable('userGuilds'),
};