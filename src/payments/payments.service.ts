import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeSecret);

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    const { currency, items, orderId } = paymentSessionDto;

    const lineItems = items.map((item) => {
      return {
        price_data: {
          currency: currency,
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    const session = await this.stripe.checkout.sessions.create({
      payment_intent_data: {
        metadata: {
            orderId: orderId
        },
      },
      line_items: lineItems,
      mode: 'payment',
      success_url: envs.stripeSuccessUrl,
      cancel_url: envs.stripeCancelledUrl,
    });

    return session;
  }

  async stripeWebHook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];

    let event: Stripe.Event;

    //Endpoitn secret de strip para desarrollo
    // const endpointSecret =
    //   'whsec_4d627cd2d35c5fb7a10ad9feb405f7b2c4a66f39a961b69e8fc6e843db3b37bc';

    //Endpoint de produccion
    const endpointSecret =
      envs.stripeEndpointSecret;

    try {
      event = this.stripe.webhooks.constructEvent(
        req['rawBody'],
        sig,
        endpointSecret,
      );
    } catch (error) {
      res.status(400).send(`Webhook Error: ${error.message}`);
      return;
    }

    
    switch (event.type) {
      case 'charge.succeeded':
        const chargeSucceeded = event.data.object;
        //TODO: Lammar nuestro microservicio
        console.log({
            metadata: chargeSucceeded.metadata,
        });
        break;

      default:
        console.log(`Event ${event.type} not handled`);
    }

    return res.status(200).send({ sig });
  }
}
