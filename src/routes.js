const authRoutes = require("../src/routes/authRoutes");

module.exports = (app) => {
  app.use('/api/', authRoutes);
};
