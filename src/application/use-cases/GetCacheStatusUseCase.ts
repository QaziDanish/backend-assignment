import { CacheStats } from "../../domain/entities/CacheStats";
import { ICacheRepository } from "../../domain/ports/ICacheRepository";

export class GetCacheStatusUseCase {
  constructor(private cacheRepository: ICacheRepository) {}

  execute(): CacheStats {
    return this.cacheRepository.getStats();
  }
}
