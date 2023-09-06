module.exports = {
  NODE_ENV: 'development',
  PORT: '4000',

  /** DATABASE */
  db: {
    DB_HOST: "localhost",
    DB_USER: 'root',
    DB_PASS: '',
    DB_NAME: 'yoshitaka',
    dialect: "mysql",

    // pool is optional, it will be used for Sequelize connection pool configuration
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },

  /** AUTH KEY */
  auth: {
    secret: "our-secret-key"
  }
};
