'use strict';

module.exports = {
	up: (queryInterface, Sequelize) =>
		queryInterface.createTable('userChanels', {
			id: {
				allowNull: false,
				primaryKey: true,
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUID,
			},
			chanelId: Sequelize.UUID,
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
	down: (queryInterface) => queryInterface.dropTable('userChanels'),
};