import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { WalletService } from './wallet.service';
import { GetUser } from 'src/auth/decorator';
import { CreateWalletDto, EditWalletDto } from './dto';

@UseGuards(JwtGuard)
@Controller('wallets')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get()
  getWallets(@GetUser('id') userId: number) {
    return this.walletService.getWallets(userId);
  }

  @Post()
  createWallet(@GetUser('id') userId: number, @Body() dto: CreateWalletDto) {
    return this.walletService.createWallet(userId, dto);
  }

  @Get(':id')
  getWalletById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) walletId: number,
  ) {
    return this.walletService.getWalletById(userId, walletId);
  }

  @Patch(':id')
  editWalletById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) walletId: number,
    @Body() dto: EditWalletDto,
  ) {
    return this.walletService.editWalletById(userId, walletId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteWalletById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) walletId: number,
  ) {
    return this.walletService.deleteWalletById(userId, walletId);
  }
}
