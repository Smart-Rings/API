import express, { Express } from "express";
import cors from "cors"; // Import the CORS package


const app: Express = express();


import sign from "./routes/sign";
import verify from "./routes/verify";
import status from "./routes/status";
const corsOptions = {
    origin: 'http://89.58.41.130:3000', // This should be the domain you want to allow connections from
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  };
  
app.use(cors(corsOptions)); // Use the CORS middleware with the specified options
app.use("/api/sign", sign);
app.use("/api/verify", verify);
app.use("/api/status", status);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server running on port ${port}`));