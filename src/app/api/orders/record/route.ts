import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the order data from the request body
    const orderData = await request.json();
    
    // Validate required fields
    const { userId, items, totalAmount, status } = orderData;
    
    if (!userId || !items || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required and cannot be empty' },
        { status: 400 }
      );
    }

    // Validate each item has required fields
    for (const item of items) {
      if (!item.product || !item.quantity) {
        return NextResponse.json(
          { error: 'Each item must have product and quantity' },
          { status: 400 }
        );
      }
    }

    // Prepare the order data for your backend
    const orderPayload = {
      userId,
      items,
      totalAmount,
      status: status || 'pending',
      paymentStatus: 'completed',
      createdAt: new Date().toISOString()
    };

    // Get your backend API URL from environment variables
    const backendApiUrl = process.env.BACKEND_API_URL || 'http://localhost:5000';
    
    // Make API request to your backend server
    const response = await fetch(`${backendApiUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any authentication headers if needed
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderPayload)
    });

    const result = await response.json();
    console.log('result from backend recording:', result);

    if (response.ok) {
      return NextResponse.json({
        success: true,
        orderId: result.orderId || result._id,
        message: 'Order recorded successfully'
      });
    } else {
      console.error('Backend API error:', result);
      return NextResponse.json(
        { error: 'Failed to record order' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Order recording error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
