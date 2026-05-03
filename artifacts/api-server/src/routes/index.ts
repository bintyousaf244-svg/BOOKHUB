import { Router, type IRouter } from "express";
import healthRouter from "./health";
import booksRouter from "./books";
import ordersRouter from "./orders";
import adminRouter from "./admin";
import categoriesRouter from "./categories";

const router: IRouter = Router();

router.use(healthRouter);
router.use(booksRouter);
router.use(ordersRouter);
router.use(adminRouter);
router.use(categoriesRouter);

export default router;
