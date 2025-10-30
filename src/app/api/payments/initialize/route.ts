import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the payment data from the request body
    const paymentData = await request.json();
    
    // Validate required fields
    const { amount, customer, tx_ref } = paymentData;
    
    if (!amount || !customer || !tx_ref) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    console.log('paymentData:', paymentData);

    // Prepare the data for Flutterwave API
    const flutterwaveData = {
      tx_ref,
      amount,
      currency: 'NGN',
      redirect_url: `${request.nextUrl.origin}/payment/callback`,
      customer: {
        email: customer.email,
        phone_number: customer.phone,
        name: customer.name
      },
      customizations: {
        title: 'Flamingo Payment',
        logo: '/assets/icons/logo.png'
      }
    };

    // Get environment variables (server-side only)
    const flutterwaveBaseUrl = process.env.FLUTTERWAVE_BASE_URL || 'https://api.flutterwave.com/v3/payments';
    const flutterwaveSecretKey = process.env.FLW_SECRET_KEY;

    if (!flutterwaveSecretKey) {
      console.error('Flutterwave secret key not configured');
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      );
    }

    // Make API request to Flutterwave
    const response = await fetch(flutterwaveBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${flutterwaveSecretKey}`
      },
      body: JSON.stringify(flutterwaveData)
    });

    const result = await response.json();

    if (result.status === 'success' && result.data.link) {
      return NextResponse.json({
        success: true,
        checkoutUrl: result.data.link,
        tx_ref: tx_ref
      });
    } else {
      console.error('Flutterwave API error:', result);
      return NextResponse.json(
        { error: 'Failed to initialize payment' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
