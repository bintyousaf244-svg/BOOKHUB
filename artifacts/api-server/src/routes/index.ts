import { Router, type IRouter } from "express";
import healthRouter from "./health";
import booksRouter from "./books";
import ordersRouter from "./orders";
import adminRouter from "./admin";
import categoriesRouter from "./categories";
import storageRouter from "./storage";
import discountCodesRouter from "./discountCodes";
import paymentSettingsRouter from "./paymentSettings";
import websiteContentRouter from "./websiteContent";

const router: IRouter = Router();

router.use(healthRouter);
router.use(booksRouter);
router.use(ordersRouter);
router.use(adminRouter);
router.use(categoriesRouter);
router.use(storageRouter);
router.use(discountCodesRouter);
router.use(paymentSettingsRouter);
router.use(websiteContentRouter);

export default router;
