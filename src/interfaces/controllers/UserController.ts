import { Request, Response } from "express";
import { GetUserUseCase } from "../../application/use-cases/GetUserUseCase";
import { CreateUserUseCase } from "../../application/use-cases/CreateUserUseCase";
import { GetCacheStatusUseCase } from "../../application/use-cases/GetCacheStatusUseCase";
import { ClearCacheUseCase } from "../../application/use-cases/ClearCacheUseCase";

export class UserController {
  constructor(
    private getUserUseCase: GetUserUseCase,
    private createUserUseCase: CreateUserUseCase,
    private getCacheStatusUseCase: GetCacheStatusUseCase,
    private clearCacheUseCase: ClearCacheUseCase
  ) {}

  getUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid ID" });
        return;
      }
      const user = await this.getUserUseCase.execute(id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(user);
    } catch (e) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email } = req.body;
      const user = await this.createUserUseCase.execute(name, email);
      res.status(201).json(user);
    } catch (e) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  getCacheStats = (req: Request, res: Response): void => {
    const stats = this.getCacheStatusUseCase.execute();
    res.json(stats);
  };

  clearCache = (req: Request, res: Response): void => {
    this.clearCacheUseCase.execute();
    res.json({ message: "Cache cleared" });
  };
}
