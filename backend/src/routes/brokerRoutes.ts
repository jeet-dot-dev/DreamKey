import express from 'express';
import { addNewBroker, getBroker, getBrokerById, updateBroker, deleteBroker } from '../controllers/brokerController.js';
import { verifyToken } from '../middlewares/auth.js';

const brokerRoutes = express.Router();

brokerRoutes.post("/add",verifyToken,addNewBroker);
brokerRoutes.get("/get",verifyToken,getBroker);
brokerRoutes.get("/:id",verifyToken,getBrokerById);
brokerRoutes.put("/:id",verifyToken,updateBroker);
brokerRoutes.delete("/:id",verifyToken,deleteBroker);


export default brokerRoutes ;