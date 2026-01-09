require('dotenv').config();
const app = require('./src/app');
const logger = require('./src/middlewares/logger.middleware');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    logger.info("Server is running on PORT No." + PORT + ' !');
});