'use strict';

module.exports = (sequelize, DataTypes) => {
	const users = sequelize.define('users', {
		id: {
			allowNull: false,
			primaryKey: true,
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4
		},
		userId: DataTypes.UUID,
		userName: DataTypes.STRING,
		avatar: DataTypes.STRING,
		messageDaily: DataTypes.STRING,
		joined_at: DataTypes.DATE,
		roles: DataTypes.STRING,
		isNotifice:DataTypes.BOOLEAN
	}
		, {
			freezeTableName: true
		});
	users.associate = (db) => {
	};
	return users;
};
