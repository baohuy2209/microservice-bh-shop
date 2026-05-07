import { Router } from "express";
import clerkClient from "../utils/clerk";
const router: Router = Router();
router.get("/", async (req, res) => {
  const users = await clerkClient.users.getUserList();
  return res.status(200).json(users);
});
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const user = await clerkClient.users.getUser(id);
  return res.status(200).json(user);
});
router.post("/", async (req, res) => {
  type CreateUserParams = Parameters<typeof clerkClient.users.createUser>[0];
  const newUser: CreateUserParams = req.body;
  const users = await clerkClient.users.createUser(newUser);
  return res.status(200).json(users);
});
router.post("/:id", async (req, res) => {
  const { id } = req.params;
  const user = await clerkClient.users.deleteUser(id);
  return res.status(200).json(user);
});
export default router;
