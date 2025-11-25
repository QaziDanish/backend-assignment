"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
class UserController {
    constructor(getUserUseCase, createUserUseCase, getCacheStatusUseCase, clearCacheUseCase) {
        this.getUserUseCase = getUserUseCase;
        this.createUserUseCase = createUserUseCase;
        this.getCacheStatusUseCase = getCacheStatusUseCase;
        this.clearCacheUseCase = clearCacheUseCase;
        this.getUser = async (req, res) => {
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
            }
            catch (e) {
                res.status(500).json({ error: "Internal Server Error" });
            }
        };
        this.createUser = async (req, res) => {
            try {
                const { name, email } = req.body;
                const user = await this.createUserUseCase.execute(name, email);
                res.status(201).json(user);
            }
            catch (e) {
                res.status(500).json({ error: "Internal Server Error" });
            }
        };
        this.getCacheStats = (req, res) => {
            const stats = this.getCacheStatusUseCase.execute();
            res.json(stats);
        };
        this.clearCache = (req, res) => {
            this.clearCacheUseCase.execute();
            res.json({ message: "Cache cleared" });
        };
    }
}
exports.UserController = UserController;
