/**
 * Set the options as entries of the enum
 *
 * @param {string} tableName
 * @param {string} columnName
 */
const generateSetOptions = (tableName, columnName) => allOptions => async (
  queryInterface,
  Sequelize,
) => {
  await queryInterface.changeColumn(
    tableName,
    columnName,
    {
      allowNull: false,
      defaultValue: allOptions[0],
      type: Sequelize.ENUM(...allOptions),
    },
  );
};

/**
 * Remove options and set new entries as enum
 *
 * @param {string} tableName
 * @param {string} columnName
 * @param {function} setOptions - generated setOptions
 */
const generateRemoveOptions = (tableName, columnName, setOptions) => (
  optionsToKeep,
  optionsToRemove,
) => async (queryInterface, Sequelize) => {
  await queryInterface.bulkDelete(
    tableName,
    {[columnName]: optionsToRemove},
  );
  await setOptions(optionsToKeep)(queryInterface, Sequelize);
};

const generateMigration = (tableName, columnName) => {
  const setOptions = generateSetOptions(tableName, columnName);
  const removeOptions = generateRemoveOptions(tableName, columnName, setOptions);
  return {
    setOptions,
    removeOptions,
    full: (oldOptions, newOptions) => ({
      up: setOptions([...oldOptions, ...newOptions]),
      down: removeOptions(oldOptions, newOptions),
    }),
  };
};

module.exports = generateMigration;
