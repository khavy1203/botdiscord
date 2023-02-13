'use strict';

module.exports = {
	up: (queryInterface, Sequelize) =>
		queryInterface.createTable('chanels', {
			id: {
				allowNull: false,
				primaryKey: true,
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUID,
			},
			chanelId: Sequelize.UUID,
			guildId: Sequelize.UUID,
			chanelName: Sequelize.STRING,
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE
			}
		}),
	down: (queryInterface) => queryInterface.dropTable('chanels'),
};