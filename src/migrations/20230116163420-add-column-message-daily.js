'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('users', 'messageDaily', {
        type: Sequelize.STRING,
      }),
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('users', 'messageDaily'),
    ])
  }
};

// 'use strict';

// module.exports = {
//   up: (queryInterface, Sequelize) => {
//     return Promise.all([
//       queryInterface.addColumn('publicHolidays', 'year', {
//         type: Sequelize.INTEGER,
//       }),
//       queryInterface.addColumn('publicHolidays', 'isActive', {
//         type: Sequelize.BOOLEAN,
//         defaultValue: true
//       }),
//       queryInterface.addColumn('publicHolidays', 'typeRepeat', {
//         type: Sequelize.ENUM('SYNC', 'ONCE', 'MONTH', 'ANNUALLY')
//       }),
//       queryInterface.addColumn('publicHolidays', 'date', {
//         type: Sequelize.DATE,
//       }),
//       queryInterface.changeColumn('publicHolidays', 'isDefault', {
//         type: Sequelize.BOOLEAN,
//         defaultValue: false
//       })
//     ])
//   },

//   down: (queryInterface, Sequelize) => {
//     return Promise.all([
//       queryInterface.removeColumn('publicHolidays', 'year'),
//       queryInterface.removeColumn('publicHolidays', 'isActive'),
//       queryInterface.removeColumn('publicHolidays', 'typeRepeat'),
//       queryInterface.sequelize.query('drop type enum_publicHolidays_typeRepeat;')
//     ])
//   }
// };