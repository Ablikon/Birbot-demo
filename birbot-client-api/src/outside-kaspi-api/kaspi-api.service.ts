import { forwardRef, HttpException, HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { InjectModel } from 'nestjs-typegoose'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { generate } from 'rand-token'
import axios from 'axios'
import { Agent as HttpsAgent } from 'https';
import { ensureDir, readFileSync, writeFile } from 'fs-extra'
import { path } from 'app-root-path'

import { KaspiAPIPaymentsModel } from './kaspi-api.model'
import { Types } from 'mongoose'


const certificateType = `LETOSTORE`

@Injectable()
export class KaspiAPIService {
  constructor(
    @InjectModel(KaspiAPIPaymentsModel) private readonly kaspiAPIPaymentModel: ModelType<KaspiAPIPaymentsModel>,
  ) { }


  public async getPaymentStatus(paymentId: number, userId: string): Promise<any> {
    try {
      const response = await axios.get(`http://5.35.104.248:7777/api/kaspi-api/status/${certificateType}/${paymentId}`, {
        headers: {
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJ2YWxpZGF0aW9uVG9rZW5TYWxlc2NvdXQxMjMiLCJpYXQiOjE3MjI2MDY4MTV9.NcOhDEGEXSUMkgkQ8t2xy75NL5qtYD34Z5F5u9SA_zY"
        }
      });


      if (response.status === 200) {
        const responseData = response.data;
        if (responseData.StatusCode === 0) {
          const currentPayment = await this.kaspiAPIPaymentModel.findOne({ paymentId });

          if (currentPayment && currentPayment.status !== responseData.Data.Status) {
            await this.kaspiAPIPaymentModel.findOneAndUpdate(
              { paymentId },
              {
                status: responseData.Data.Status,
                loanTerm: responseData.Data.LoanTerm,
                isOffer: responseData.Data.IsOffer,
              },
              { new: true },
            );

          }
          return { error: false, status: responseData.Data.Status };

        } else if (responseData.StatusCode === -1601) {
          throw new HttpException(
            {
              error: true,
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'Покупка не найдена!',
            },
            HttpStatus.BAD_REQUEST,
          );
        } else {
          throw new HttpException(
            {
              error: true,
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              message: 'Что-то пошло не так...',
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      } else {
        throw new HttpException(
          {
            error: true,
            statusCode: response.status,
            message: 'Что-то пошло не так...',
          },
          response.status,
        );
      }
    } catch (error) {
      throw new HttpException(
        {
          error: true,
          statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || 'Что-то пошло не так...',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async createQrToken({ amount, externalId, merchantId, userId }: {
    amount: number,
    externalId: string,
    merchantId: string,
    userId: string,
  }): Promise<any> {
    try {
      const response = await axios.post('http://5.35.104.248:7777/api/kaspi-api/token', {
        "organizationBin": "210140006322",
        "deviceToken": "af19183c-8e2b-4ccb-b247-94972a3b6452",
        "transactionId": externalId,
        "amount": amount,
        "certificateType": certificateType
      }, {
        headers: {
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJ2YWxpZGF0aW9uVG9rZW5TYWxlc2NvdXQxMjMiLCJpYXQiOjE3MjI2MDY4MTV9.NcOhDEGEXSUMkgkQ8t2xy75NL5qtYD34Z5F5u9SA_zY"
        }
      });

      if ((response.status == 200 || response.status == 201) && response.data.StatusCode == 0) {
        await new this.kaspiAPIPaymentModel({
          authorId: new Types.ObjectId(userId),
          merchantId,
          transactionId: externalId,
          amount,
          paymentId: response.data.Data.QrPaymentId,
          paymentLink: response.data.Data.PaymentLink,
          paymentMethods: response.data.Data.PaymentMethods,
          paymentBehaviorOptions: {
            qrCodeScanWaitTimeout: response.data.Data.QrPaymentBehaviorOptions.QrCodeScanWaitTimeout,
            paymentConfirmationTimeout: response.data.Data.QrPaymentBehaviorOptions.PaymentConfirmationTimeout,
            statusPollingInterval: response.data.Data.QrPaymentBehaviorOptions.StatusPollingInterval
          },
          expireDate: response.data.Data.ExpireDate,
          status: "QrTokenCreated"
        }).save()

          .catch((e) => {
            console.log('[^]' + ' kaspi-api.service ' + ' | ' + new Date() + ' | ' + '\n' + e);
          })
        return {
          qrToken: response.data.Data.QrToken,
          paymentId: response.data.Data.QrPaymentId,
          paymentTypes: response.data.Data.PaymentMethods,
          status: 'QrTokenCreated',
          externalId,
          paymentBehaviorOptions: {
            qrCodeScanWaitTimeout: response.data.Data.QrPaymentBehaviorOptions.QrCodeScanWaitTimeout,
            paymentConfirmationTimeout: response.data.Data.QrPaymentBehaviorOptions.PaymentConfirmationTimeout,
            statusPollingInterval: response.data.Data.QrPaymentBehaviorOptions.StatusPollingInterval
          }
        };
      }
      return {
        message: 'Не получилось создать Kaspi QR',
        status: response.status,
        data: response.data
      }

    } catch (error) {
      // console.error('Error creating QR token:', error);
      console.error('[!]' + ' kaspi-api.service ' + ' | ' + 'Error creating QR token' +' | '+ + new Date() + ' | ' + '\n' + error);

      if (axios.isAxiosError(error) && error.response) {
        throw new HttpException({message: error.response.data, statusCode: error.response.status, status: "Error"}, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw new HttpException({message: error.message, statusCode: 500, status: "Error"}, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  public async createQrLink({ amount, externalId, merchantId, userId }: {
    amount: number,
    externalId: string,
    merchantId: string,
    userId: string,
  }): Promise<any> {

    try {
      const response = await axios.post('http://5.35.104.248:7777/api/kaspi-api/link', {
        "organizationBin": "210140006322",
        "deviceToken": "af19183c-8e2b-4ccb-b247-94972a3b6452",
        "transactionId": externalId,
        "amount": amount,
        "certificateType": certificateType
      }, {
        headers: {
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJ2YWxpZGF0aW9uVG9rZW5TYWxlc2NvdXQxMjMiLCJpYXQiOjE3MjI2MDY4MTV9.NcOhDEGEXSUMkgkQ8t2xy75NL5qtYD34Z5F5u9SA_zY"
        }
      });
      if ((response.status == 200 || response.status == 201)&& response.data.StatusCode == 0) {
        await new this.kaspiAPIPaymentModel({
          authorId: new Types.ObjectId(userId),
          merchantId,
          transactionId: externalId,
          amount,
          paymentId: response.data.Data.PaymentId,
          paymentLink: response.data.Data.PaymentLink,
          paymentMethods: response.data.Data.PaymentMethods,
          paymentBehaviorOptions: {
            linkActivationWaitTimeout: response.data.Data.PaymentBehaviorOptions.LinkActivationWaitTimeout,
            paymentConfirmationTimeout: response.data.Data.PaymentBehaviorOptions.PaymentConfirmationTimeout,
            statusPollingInterval: response.data.Data.PaymentBehaviorOptions.StatusPollingInterval
          },
          expireDate: response.data.Data.ExpireDate,
          status: "QrTokenCreated"
        }).save()
          .catch((e) => {
            console.log('[^]' + ' kaspi-api.service ' + ' | ' + new Date() + ' | ' + '\n' + e);
          })

        return {
          paymentLink: response.data.Data.PaymentLink,
          paymentId: response.data.Data.PaymentId,
          paymentTypes: response.data.Data.PaymentMethods,
          externalId: externalId,
          status: 'QrTokenCreated',
          paymentBehaviorOptions: {
            linkActivationWaitTimeout: response.data.Data.PaymentBehaviorOptions.LinkActivationWaitTimeout,
            paymentConfirmationTimeout: response.data.Data.PaymentBehaviorOptions.PaymentConfirmationTimeout,
            statusPollingInterval: response.data.Data.PaymentBehaviorOptions.StatusPollingInterval
          }
        };
      }

      return {
        message: 'Не получилось создать Kaspi ссылку',
        status: response.status,
        data: response.data
      }


    } catch (error) {
      // console.error('Error creating QR token:', error);
      console.error('[!]' + ' kaspi-api.service ' + ' | ' + 'Error creating QR token' +' | '+ + new Date() + ' | ' + '\n' + error);

      if (axios.isAxiosError(error) && error.response) {
        throw new HttpException({message: error.response.data, statusCode: error.response.status, status: "Error"}, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw new HttpException({message: error.message, statusCode: 500, status: "Error"}, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

  }

  public async refundPurchase({paymentId, amount, merchantId, userId}: {
    paymentId: number,
    amount: number, 
    merchantId: string,
    userId: string
  }): Promise<any> {
    try {
      const response = await axios.post('http://5.35.104.248:7777/api/kaspi-api/refund', {
        "organizationBin": "210140006322",
        "deviceToken": "af19183c-8e2b-4ccb-b247-94972a3b6452",
        "paymentId": paymentId,
        "amount": amount,
        "certificateType": certificateType
      }, {
        headers: {
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJ2YWxpZGF0aW9uVG9rZW5TYWxlc2NvdXQxMjMiLCJpYXQiOjE3MjI2MDY4MTV9.NcOhDEGEXSUMkgkQ8t2xy75NL5qtYD34Z5F5u9SA_zY"
        }
      });

      if ((response.status == 200 || response.status == 201) && response.data.StatusCode == 0) {
        const payment = await this.kaspiAPIPaymentModel.findOne({paymentId})

        if (payment) {
          await this.kaspiAPIPaymentModel.updateOne(
            {
              paymentId: paymentId
            },
            {
              $set: {
                refundAmount: amount + (payment.refundAmount || 0),
                status: "Refunded"
              }
            }
          ).catch((e) => {
            console.log('[^]' + ' kaspi-api.service ' + ' | ' + new Date() + ' | ' + '\n' + e);
          })
        }

        if (response.data?.StatusCode === 0) {
          return {
            statusCode: 0,
            returnOperationId: response.data.Data.ReturnOperationId,
            status: 'Refunded',
          };
        } else {
          throw new HttpException({
            status: "Error",
            statusCode: response.data?.StatusCode || 400,
            message: response.data?.Message || "Не удалось оформить возврат"
          }, HttpStatus.BAD_REQUEST);
        }
      }

      throw new HttpException(
        {
          message: response.data?.Message || response.data || "Произошла ошибка при оформлении возврата",
          statusCode: response.data?.StatusCode || response.status,
          status: "Error"
        },
        response.status
      )
    } catch (error) {
      // console.error('Error refunding purchase:', error);
      console.error('[!]' + ' kaspi-api.service ' + ' | ' + 'Error refunding purchase' +' | '+ + new Date() + ' | ' + '\n' + error);

      if (axios.isAxiosError(error) && error.response) {
        throw new HttpException({message: error.response.data, statusCode: error.response.status, status: "Error"}, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw new HttpException({message: error.message, statusCode: 500, status: "Error"}, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
