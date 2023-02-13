'use strict';

module.exports = (sequelize, DataTypes) => {
	const userGuilds = sequelize.define('userGuilds', {
		id: {
			allowNull: false,
			primaryKey: true,
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4
		},
		guildId: DataTypes.UUID,
		userId: DataTypes.UUID,
	}
		, {
			freezeTableName: true
		});
	userGuilds.associate = (db) => {
	};
	return userGuilds;
};
