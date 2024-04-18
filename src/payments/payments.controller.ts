import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto';
import { Request, Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-session')
  createPaymentSession(@Body() paymentSessionDto: PaymentSessionDto) {
    return this.paymentsService.createPaymentSession(paymentSessionDto);
  }

  @Get('success')
  succes() {
    return {
      ok: true,
      message: 'Payment successful',
    };
  }

  @Get('cancelled')
  cancel() {
    return {
      ok: true,
      message: 'Payment cancelled',
    };
  }

  @Post('webhook')
  async stripeWebHook(@Req() req: Request, @Res() res: Response) {
    return this.paymentsService.stripeWebHook(req, res);
  }
}
