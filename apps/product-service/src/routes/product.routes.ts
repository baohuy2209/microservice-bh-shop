import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "../controllers/product.controller";
import { shouldBeAdmin } from "../middleware/authMiddleware";
const router: Router = Router();
router.get("/", getProducts);
router.post("/", shouldBeAdmin, createProduct);
router.put("/:id", shouldBeAdmin, updateProduct);
router.get("/:id", getProduct);
router.delete("/:id", shouldBeAdmin, deleteProduct);
export default router;
