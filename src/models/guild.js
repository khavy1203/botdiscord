'use strict';

module.exports = (sequelize, DataTypes) => {
	const guilds = sequelize.define('guilds', {
		id: {
			allowNull: false,
			primaryKey: true,
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4
		},
		guildId: DataTypes.UUID,
		guildName: DataTypes.STRING,
		myBotInGuild: DataTypes.BOOLEAN,
	}
		, {
			freezeTableName: true
		});
	guilds.associate = (db) => {
	};
	return guilds;
};
