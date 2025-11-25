"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserUseCase = void 0;
class CreateUserUseCase {
    constructor(userRepository, cacheRepository) {
        this.userRepository = userRepository;
        this.cacheRepository = cacheRepository;
    }
    async execute(name, email) {
        // ID generation logic (mock)
        const id = Math.floor(Math.random() * 10000) + 4;
        const newUser = { id, name, email };
        await this.userRepository.save(newUser);
        this.cacheRepository.set(`user_${id}`, newUser); // Write-through cache
        return newUser;
    }
}
exports.CreateUserUseCase = CreateUserUseCase;
