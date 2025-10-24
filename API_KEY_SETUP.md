# API Key Authentication Setup

## Overview
Your APIs now require a valid API key for write operations (POST, PUT, DELETE). Read operations (GET) remain public. The system uses two different keys for enhanced security.

## Setup Instructions

### 1. Create Environment File
Create a `.env.local` file in your project root with:

```bash
# Server-side secret key (never exposed to client)
API_SECRET_KEY=your-server-secret-key-here

# Client-side API key (sent with requests)
NEXT_PUBLIC_API_KEY=your-client-api-key-here

# Google reCAPTCHA keys
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key-here
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key-here
```

### 2. Generate Different Keys
Generate two different, strong keys:

```bash
# Generate server secret key
node -e "console.log('API_SECRET_KEY=' + require('crypto').randomBytes(32).toString('hex'))"

# Generate client API key  
node -e "console.log('NEXT_PUBLIC_API_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Get Google reCAPTCHA Keys
1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click "Create" to add a new site
3. Choose reCAPTCHA v2 ("I'm not a robot" Checkbox)
4. Add your domain (e.g., `localhost` for development, your production domain)
5. Copy the **Site Key** and **Secret Key**
6. Add them to your `.env.local` file

### 4. Example Environment File
```bash
# .env.local
API_SECRET_KEY=86086173a23b713a78e7ccb561e38b26d4e6ac3974c3cf2bc834def52e56e842
NEXT_PUBLIC_API_KEY=216e7fd15dd754c16e0232aadc3bdb21b1c59c87883b4424053b9de0b9ff7771

# Google reCAPTCHA keys (replace with your actual keys)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

## How It Works

### Protected Endpoints (Require API Key + reCAPTCHA)
- **POST** `/api/items` - Create new items (requires reCAPTCHA token)
- **PUT** `/api/items` - Update existing items (requires reCAPTCHA token)
- **DELETE** `/api/items` - Delete items (requires reCAPTCHA token)

### Public Endpoints (No API Key Required)
- **GET** `/api/items` - Read items

### Authentication Flow
1. Frontend sends API key in `x-api-key` header
2. Frontend includes reCAPTCHA token in request body
3. Middleware validates the API key against `API_SECRET_KEY`
4. Server validates reCAPTCHA token with Google's API
5. Invalid/missing keys or reCAPTCHA tokens return 401 Unauthorized
6. Valid keys and reCAPTCHA tokens allow access to protected endpoints

## Security Features

- **Dual Key System**: Different keys for client and server
- **reCAPTCHA Protection**: Bot protection on all form submissions
- **Server-Side Validation**: API key and reCAPTCHA validation happens on the server
- **Middleware Protection**: All write requests are validated
- **Environment Variables**: Secure key storage
- **External Blocking**: Tools like Postman cannot access write endpoints without the key and reCAPTCHA token

## Testing

### Valid Request (will work from your app):
Your Next.js app will work normally - the API key is automatically included.

### Invalid Request (will be blocked from external tools like Postman):
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"John","value":"Turkey"}'
```

### Valid Request with API Key (will work):
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -H "x-api-key: 216e7fd15dd754c16e0232aadc3bdb21b1c59c87883b4424053b9de0b9ff7771" \
  -d '{"name":"John","value":"Turkey"}'
```

## Files Modified

1. **`middleware.ts`** - API key validation middleware
2. **`src/lib/api.ts`** - Secure API utility functions  
3. **`src/app/holiday/page.tsx`** - Updated to use secure API calls

## Production Considerations

1. **Use HTTPS**: Always use HTTPS in production
2. **Rotate Keys**: Regularly rotate your API keys
3. **Environment**: Never commit `.env.local` to version control
4. **Strong Keys**: Use cryptographically secure random keys
5. **Monitor**: Set up logging to monitor API access

## Troubleshooting

### Common Issues:
- **401 Unauthorized**: Check that both API keys are set correctly in `.env.local`
- **Environment Variables**: Verify `.env.local` is in the project root
- **Restart Server**: Restart your development server after adding environment variables

### Debug Mode:
Add logging to your middleware to debug authentication issues:

```typescript
console.log('API Key:', request.headers.get('x-api-key'));
console.log('Expected:', process.env.API_SECRET_KEY);
```