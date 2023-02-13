'use strict';

module.exports = (sequelize, DataTypes) => {
	const chanels = sequelize.define('chanels', {
		id: {
			allowNull: false,
			primaryKey: true,
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4
		},
		chanelId: DataTypes.UUID,
		guildId: DataTypes.UUID,
		chanelName: DataTypes.STRING,
	}
		, {
			freezeTableName: true
		});
	chanels.associate = (db) => {
	};
	return chanels;
};
