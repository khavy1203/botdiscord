'use strict';

module.exports = (sequelize, DataTypes) => {
	const userChanels = sequelize.define('userChanels', {
		id: {
			allowNull: false,
			primaryKey: true,
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4
		},
		chanelId: DataTypes.UUID,
		userId: DataTypes.UUID,
	}
		, {
			freezeTableName: true
		});
	userChanels.associate = (db) => {
	};
	return userChanels;
};
