import { IsOptional, IsString } from 'class-validator';

export class EditWalletDto {
  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  blockchain?: string;
}
