# Chapa Payment Integration Guide

## Overview
The application now integrates with Chapa's hosted payment page for secure payment processing. This document explains the complete payment flow.

## Payment Flow

### 1. User Initiates Checkout
- User fills out checkout form with contact and delivery information
- Clicks "Place Order" button on `/customer/checkout` page

### 2. Order Creation & Payment Initialization
**Frontend (`Checkout.jsx` - `handlePlaceOrder` function):**
- Validates all form fields
- Sets loading state (`isLoading = true`)
- Creates order payload with customer and cart details
- Makes POST request to `/api/orders` to create order in database
- Order is saved with `status: 'pending'` and `paymentStatus: 'pending'`
- Saves order to localStorage for reference

### 3. Chapa Payment Initialization
**Frontend continues:**
- Prepares Chapa payload with:
  - `amount`: Total order amount
  - `email`: Customer email
  - `first_name` / `last_name`: Parsed from customer full name
  - `tx_ref`: Unique transaction reference (order code)
  - `orderId`: Created order ID
- Makes POST request to `/api/payments/chapa/initiate`

**Backend (Expected endpoint: `/api/payments/chapa/initiate`):**
- Receives payment initialization request
- Calls Chapa API with:
  - Amount, currency (ETB), customer details
  - `callback_url`: Points to frontend payment success page
  - `return_url`: `https://yourdomain.com/payment-success`
- Returns `checkout_url` from Chapa response

### 4. Redirect to Chapa Hosted Page
**Frontend:**
- Receives `checkout_url` from backend
- Redirects browser to Chapa payment page: `window.location.href = checkout_url`
- User sees Chapa's hosted payment interface
- User enters phone number and completes payment

### 5. Payment Completion & Callback
**Chapa:**
- Processes payment
- Redirects user to: `/payment-success?tx_ref=ORDER_CODE&status=success`

### 6. Payment Verification
**Frontend (`PaymentSuccess.jsx`):**
- Extracts `tx_ref` from URL query parameters
- Shows "Verifying Payment..." loading screen
- Makes GET request to `/api/payments/chapa/verify/:tx_ref`

**Backend (Expected endpoint: `/api/payments/chapa/verify/:tx_ref`):**
- Calls Chapa verify API with transaction reference
- Updates order status:
  - `status: 'confirmed'`
  - `paymentStatus: 'completed'`
- Returns verification result with order details

### 7. Success Confirmation
**Frontend:**
- Displays success modal with:
  - Green checkmark icon
  - "Order Placed Successfully!" message
  - Order details (order number, total, delivery time)
- Clears shopping cart
- Auto-redirects to home page after 3 seconds
- User can click "OK" button to navigate immediately

## API Endpoints Required

### Backend Endpoints Needed:

#### 1. POST `/api/payments/chapa/initiate`
**Request Body:**
```json
{
  "amount": 250.00,
  "email": "customer@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "tx_ref": "ORD-00123",
  "orderId": 123
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Payment initialization successful",
  "checkout_url": "https://checkout.chapa.co/checkout/web/payment/...",
  "tx_ref": "ORD-00123"
}
```

**Implementation Notes:**
- Set `callback_url` to: `${FRONTEND_URL}/payment-success`
- Set `currency` to: `ETB`
- Store transaction reference for verification
- Use Chapa API: `https://api.chapa.co/v1/transaction/initialize`

#### 2. GET `/api/payments/chapa/verify/:tx_ref`
**Response:**
```json
{
  "status": "success",
  "message": "Payment verified successfully",
  "order": {
    "id": 123,
    "orderCode": "ORD-00123",
    "total": 250.00,
    "status": "confirmed",
    "paymentStatus": "completed"
  },
  "payment": {
    "amount": 250.00,
    "currency": "ETB",
    "created_at": "2026-07-08T10:30:00Z",
    "status": "success"
  }
}
```

**Implementation Notes:**
- Call Chapa verify API: `https://api.chapa.co/v1/transaction/verify/:tx_ref`
- Update order status in database
- Return updated order details
- Handle failed payments gracefully

## Environment Variables

### Backend `.env`:
```
CHAPA_SECRET_KEY=your_chapa_secret_key
CHAPA_PUBLIC_KEY=your_chapa_public_key
FRONTEND_URL=http://localhost:5173
CHAPA_API_URL=https://api.chapa.co/v1
```

### Frontend `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

## Testing

### Test Mode
Chapa provides test credentials:
- Use test secret key for backend
- Test payment will show "Pay using Test Mode" button
- Any Ethiopian phone number works in test mode
- No real money is charged

### Test Flow:
1. Fill checkout form with test data
2. Click "Place Order"
3. You'll be redirected to Chapa test page
4. Enter any phone number (e.g., 0912345678)
5. Click "Pay using Test Mode"
6. You'll be redirected back to success page
7. Verify payment confirmation appears

## Error Handling

### Common Error Scenarios:

1. **Order Creation Fails:**
   - Error displayed on checkout page
   - User can retry
   - Loading state cleared

2. **Chapa Initialization Fails:**
   - Error message shown
   - Check backend logs
   - Verify Chapa credentials

3. **Payment Verification Fails:**
   - User sees error screen on `/payment-success`
   - Options: "Try Again" or "Go Home"
   - Order remains in pending state

4. **Network Errors:**
   - Proper error messages displayed
   - User can retry from checkout page

## Security Considerations

1. **Never expose Chapa secret key in frontend**
2. **Always verify payments on backend** - never trust frontend
3. **Use HTTPS in production** for callback URLs
4. **Validate all amounts on backend** before initializing payment
5. **Store transaction logs** for audit purposes
6. **Handle duplicate callbacks** from Chapa gracefully

## Files Modified/Created

### Modified:
- `client/src/pages/checkout/Checkout.jsx` - Updated `handlePlaceOrder` function
- `client/src/App.jsx` - Added `/payment-success` route

### Created:
- `client/src/pages/payment/PaymentSuccess.jsx` - Payment success page with verification

## Next Steps for Backend Integration

Backend developers should implement:
1. `/api/payments/chapa/initiate` endpoint
2. `/api/payments/chapa/verify/:tx_ref` endpoint
3. Order status update logic
4. Proper error handling and logging
5. Webhook endpoint for Chapa callbacks (optional but recommended)

## Webhook Setup (Optional but Recommended)

Chapa can send webhooks to notify your backend of payment status changes:

**Endpoint:** `POST /api/payments/chapa/webhook`

**Benefits:**
- More reliable than relying on redirect
- Handles cases where user closes browser
- Allows asynchronous order processing

## Support

For Chapa API documentation:
- https://developer.chapa.co/docs

For implementation help:
- Check Chapa dashboard for API keys
- Review Chapa integration examples
- Contact Chapa support for API issues
