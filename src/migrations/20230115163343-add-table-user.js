'use strict';

module.exports = {
	up: (queryInterface, Sequelize) =>
		queryInterface.createTable('users', {
			id: {
				allowNull: false,
				primaryKey: true,
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
			},
			userId: Sequelize.UUID,
			guildId: Sequelize.UUID,
			chanelId: Sequelize.UUID,
			userName: Sequelize.STRING,
			avatar: Sequelize.STRING,
			joined_at: Sequelize.DATE,
			roles: {
				type: Sequelize.STRING,
				get: function () {
					return JSON.parse(this.getDataValue('roles'));
				},
				set: function (val) {
					return this.setDataValue('roles', JSON.stringify(val));
				}
			},
			
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE
			}
		}),
	down: (queryInterface) => queryInterface.dropTable('users'),
};