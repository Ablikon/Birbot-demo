import { IsNumber, IsOptional} from 'class-validator';

export class UpdateStoreTaxRegimeDto {
  @IsNumber()
  @IsOptional()
  taxRegime: number;
}