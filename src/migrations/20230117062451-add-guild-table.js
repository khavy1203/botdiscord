'use strict';

module.exports = {
	up: (queryInterface, Sequelize) =>
		queryInterface.createTable('guilds', {
			id: {
				allowNull: false,
				primaryKey: true,
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUID,
			},
			guildId:Sequelize.UUID,
			guildName: Sequelize.STRING,
			myBotInGuild: Sequelize.BOOLEAN,
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE
			}
		}),
	down: (queryInterface) => queryInterface.dropTable('guilds'),
};