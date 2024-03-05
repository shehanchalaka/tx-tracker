import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SyncService } from './sync.service';
import { SyncStatusEntity } from './entities/syncStatus.entity';

@ApiTags('Sync')
@Controller('sync')
export class SyncController {
  constructor(private syncService: SyncService) {}

  @ApiOperation({ summary: 'Get sync status' })
  @ApiResponse({
    status: 200,
    description: 'Returns sync status',
    type: SyncStatusEntity,
  })
  @Get('/status')
  async getSyncStatus() {
    return await this.syncService.getSyncStatus();
  }
}
