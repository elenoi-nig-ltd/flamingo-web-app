# Simple Flutterwave Integration

This is a simplified Flutterwave payment integration for your Flamingo app using their hosted checkout.

## What's Included

✅ **Simple Cart Integration** - Payment button in your existing cart  
✅ **Secure Backend API** - Server-side Flutterwave integration  
✅ **Hosted Checkout** - Secure payment page hosted by Flutterwave  
✅ **Payment Callback** - Handles payment redirects  
✅ **Order Recording** - Automatically records orders after successful payment  
✅ **Basic Success/Failure Handling** - Simple alerts for now  

## How It Works

1. **Customer clicks "Proceed to Checkout"** in the cart
2. **Customer information form opens** to collect name, email, and phone
3. **Customer fills form and clicks "Continue to Payment"**
4. **Order data is stored** in session storage for later use
5. **Frontend calls your backend API** with customer data
6. **Backend securely calls Flutterwave API** with secret key
7. **Backend returns checkout URL** to frontend
8. **Customer is redirected** to Flutterwave's secure hosted checkout page
9. **Customer completes payment** on Flutterwave's secure page
10. **Redirects back** to your app with success/failure status
11. **Order is recorded** in your backend after successful payment
12. **Cart clears** and customer is redirected to food page

## Setup Required

### 1. Get Flutterwave Keys
- Sign up at [flutterwave.com](https://flutterwave.com)
- Get your **Secret Key** from the dashboard (not the public key)

### 2. Create Environment File
Create a `.env.local` file in your project root:

```bash
# .env.local
FLUTTERWAVE_BASE_URL=https://api.flutterwave.com/v3/payments
FLW_SECRET_KEY=your_actual_secret_key_here
BACKEND_API_URL=http://localhost:5000
```

Replace `your_actual_secret_key_here` with your actual Flutterwave secret key.
Replace `http://localhost:5000` with your actual backend server URL.

### 3. Restart Development Server
After creating the `.env.local` file, restart your development server:

```bash
npm run dev
# or
yarn dev
```

### 3. Test the Integration
- Add items to cart
- Click "Proceed to Checkout"
- Fill in customer information (name, email, phone)
- Click "Continue to Payment"
- Use Flutterwave's test cards for testing

## Test Cards

Use these test cards in development:
- **Card Number**: 5531886652142950
- **CVV**: 564
- **Expiry**: 09/32
- **Pin**: 3310
- **OTP**: 12345

## Features

✅ **Customer Information Collection** - Collects name, email, and phone number  
✅ **Form Validation** - Ensures all fields are filled before proceeding  
✅ **Secure Backend API** - Server-side Flutterwave integration  
✅ **Secret Key Protection** - Keys never exposed to client-side  
✅ **Hosted Checkout** - Secure payment page hosted by Flutterwave  
✅ **Order Recording** - Automatically records orders after successful payment  
✅ **Transaction Verification** - Verifies payment before recording order  
✅ **Responsive Design** - Works on mobile and desktop  
✅ **Clean UI** - Matches your app's design theme  

## Customization

The customer information is now collected dynamically from the form. You can customize the payment title and logo in the API request:

```typescript
customizations: {
  title: 'Your Store Name',
  logo: '/path/to/your/logo.png'
}
```

## Security Features

✅ **Server-Side Secret Key** - Secret key is only accessible on the server  
✅ **No Client Exposure** - Sensitive data never sent to the browser  
✅ **Input Validation** - Backend validates all payment data  
✅ **Error Handling** - Proper error responses without exposing internals  
✅ **Production Ready** - Secure implementation suitable for production use

## That's It!

The integration is now complete and much simpler. No complex services, hooks, or admin panels - just a straightforward payment flow that works.

## Next Steps (Optional)

If you want to enhance this later:
- Add customer information collection
- Store payment history
- Add admin payment tracking
- Customize the payment modal

But for now, this simple integration will handle payments perfectly!
