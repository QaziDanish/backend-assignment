import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/ports/IUserRepository";
import { ICacheRepository } from "../../domain/ports/ICacheRepository";

export class CreateUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private cacheRepository: ICacheRepository
  ) {}

  async execute(name: string, email: string): Promise<User> {
    // ID generation logic (mock)
    const id = Math.floor(Math.random() * 10000) + 4;
    const newUser: User = { id, name, email };

    await this.userRepository.save(newUser);
    this.cacheRepository.set(`user_${id}`, newUser); // Write-through cache
    return newUser;
  }
}
