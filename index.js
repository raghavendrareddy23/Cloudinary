const express = require('express');
require('dotenv').config()
const uploadRoute = require('./controller/routeUpload');
const cors = require('cors');
const connectDB = require('./utils/db');

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());


app.use("/api/users" , uploadRoute);

 
app.listen(PORT, () => {
  connectDB();
  
  console.log(`listening at http://localhost:${PORT}`);
});
