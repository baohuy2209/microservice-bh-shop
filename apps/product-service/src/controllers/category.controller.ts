import { prisma, Prisma } from "@repo/product-db";
import { Request, Response } from "express";

export const createCategory = async (req: Request, res: Response) => {
  const data: Prisma.CategoryCreateInput = req.body;
  const category = await prisma.category.create({ data });
  res.status(201).json(category);
};
export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data: Prisma.CategoryUpdateInput = req.body;
  const category = await prisma.category.update({
    where: {
      id: id as string,
    },
    data,
  });
  return res.status(200).json(category);
};
export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const category = await prisma.category.delete({
    where: {
      id: id as string,
    },
  });
  return res.status(200).json(category);
};
export const getCategories = async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany();
  return res.status(200).json(categories);
};
export const getCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const category = await prisma.category.findUnique({
    where: {
      id: id as string,
    },
  });
  return res.status(200).json(category);
};
