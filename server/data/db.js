/*
if (process.env.NODE_ENV !== 'production') {
  const result = require('dotenv').config({ path: './variables.env' });
  if (result.error) {
    throw result.error;
  }
  //console.log(result.parsed);
}
*/
const knex = require('knex');
const knexfile = require('../../knexfile');

const env = process.env.NODE_ENV || 'development';
const configOptions = knexfile[env];

module.exports = knex(configOptions);
