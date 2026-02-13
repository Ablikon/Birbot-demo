import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'

export class UpdateProductWarehouseDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        description: 'ID товара',
    })
    productId: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        required: true,
        description: 'ID Склада',
    })
    storePickupPointId: string

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Остаток',
    })
    amount?: number

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Предзаказ (день)',
    })
    preOrder?: number

    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        description: 'Наличие в складе',
    })
    available?: boolean
}

export class UpdateProductDto {
    @IsString()
    @IsOptional()
    @ApiProperty({
        description: 'ID города',
    })
    cityId?: string

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'цена',
    })
    price?: number

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Мин. цена',
    })
    availableMinPrice?: number

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Макс. цена',
    })
    availableMaxPrice?: number

    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        description: 'Обновить каждую неделю',
    })
    isUpdateEveryWeek?: boolean

    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        description: 'Если цена дошла до мин. цены, бороться за 2-5 места или поставить мин. цену',
    })
    isSetMinPrice?: boolean

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Остаток',
    })
    amount?: number

    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        description: 'Снять с продажи, когда нет в наличии',
    })
    isWithdrawFromSale?: boolean

    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        description: 'Вкл/выкл автоснижение',
    })
    isDemping?: boolean

    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        description: 'Автоподнятие цены',
    })
    isAutoRaise?: boolean

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Шаг снижение цены',
    })
    dempingPrice?: number

    @IsArray()
    @IsOptional()
    @Type(() => UpdateProductWarehouseDto)
    @ValidateNested({
        each: true,
    })
    @ApiProperty({
        type: [UpdateProductWarehouseDto],
    })
    productWarehouses?: [UpdateProductWarehouseDto]

    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        description: 'Автопринятия заказа',
    })
    orderAutoAccept?: boolean

    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        description: 'Снижать только в гл. городе. Да/нет',
    })
    isDempingOnlyMainCity?: boolean

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Закупочная цена',
    })
    purchasePrice?: number

   

    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        description: 'Автопринятие заказа',
    })
    autoacceptOrder?: boolean

    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        description: 'предзаказ',
    })
    isPreOrder?: boolean

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'дни предзаказа',
    })
    preOrderDays?: number

    @IsNumber()
    @IsOptional()
    marginPercent?: number

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Бонус',
    })
    bonus?: number

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Минимальный бонус',
    })
    minBonus?: number

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Максимальный бонус',
    })
    maxBonus?: number

    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        description: 'Бонусный демпинг',
    })
    isBonusDemping?: boolean

    @IsNumber()
    @IsOptional()
    @ApiProperty({
        description: 'Период рассрочки',
    })
    loanPeriod?: number
}
