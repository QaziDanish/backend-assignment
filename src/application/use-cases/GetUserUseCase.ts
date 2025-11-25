import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/ports/IUserRepository";
import { ICacheRepository } from "../../domain/ports/ICacheRepository";
import { IMonitoringService } from "../../domain/ports/IMonitoringService";

export class GetUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private cacheRepository: ICacheRepository,
    private monitoringService: IMonitoringService
  ) {}

  async execute(id: number): Promise<User | null> {
    const start = Date.now();
    const cacheKey = `user_${id}`;

    // 1. Try Cache
    const cachedUser = this.cacheRepository.get<User>(cacheKey);
    if (cachedUser) {
      this.monitoringService.incrementCacheHit();
      this.cacheRepository.recordResponseTime(Date.now() - start);
      return cachedUser;
    }

    this.monitoringService.incrementCacheMiss();

    // 2. Fetch from Repo (handles queue/concurrency internally)
    const user = await this.userRepository.findById(id);

    // 3. Update Cache if found
    if (user) {
      this.cacheRepository.set(cacheKey, user);
    }

    this.cacheRepository.recordResponseTime(Date.now() - start);
    return user;
  }
}
