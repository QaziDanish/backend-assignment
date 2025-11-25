import { ICacheRepository } from "../../domain/ports/ICacheRepository";

export class ClearCacheUseCase {
  constructor(private cacheRepository: ICacheRepository) {}

  execute(): void {
    this.cacheRepository.clear();
  }
}
