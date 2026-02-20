import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWalletDto, EditWalletDto } from './dto';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}
  async getWallets(userId: number) {
    return await this.prisma.wallet.findMany({
      where: {
        userId,
      },
    });
  }

  async createWallet(userId: number, dto: CreateWalletDto) {
    const wallet = await this.prisma.wallet.create({
      data: {
        userId,
        ...dto,
      },
    });

    return wallet;
  }

  async getWalletById(userId: number, walletId: number) {
    const wallet = await this.prisma.wallet.findFirst({
      where: {
        id: walletId,
        userId,
      },
    });

    return wallet;
  }

  async editWalletById(userId: number, walletId: number, dto: EditWalletDto) {
    const wallet = await this.prisma.wallet.findUnique({
      where: {
        id: walletId,
      },
    });

    if (!wallet || wallet.userId !== userId) {
      throw new ForbiddenException('Acces to resourse denide');
    }

    return this.prisma.wallet.update({
      where: {
        id: walletId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteWalletById(userId: number, walletId: number) {
    const wallet = await this.prisma.wallet.findUnique({
      where: {
        id: walletId,
      },
    });

    if (!wallet || wallet.userId !== userId) {
      throw new ForbiddenException('Acces to resourse denide');
    }

    await this.prisma.wallet.delete({
      where: {
        id: walletId,
      },
    });
  }
}
