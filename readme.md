# Lumina Auth

A flexible, type-safe authentication system for TypeScript applications.

## Core Concepts

Lumina Auth is designed to be an "auth primitive" system that handles complex authentication flows while giving developers complete control over how they use authenticated profiles in their applications.

### Key Features

- **Provider-based Authentication**: Built-in and third-party providers handle specific auth flows (OAuth, credentials, etc.)
- **Type-safe**: Fully typed with TypeScript, including module augmentation support
- **Framework Agnostic**: Use with any JavaScript/TypeScript framework
- **Zero Opinions**: Complete freedom in how you handle users, sessions, and storage

### Architecture

The system is built around a global namespace that can be extended by providers and customized by developers:

```typescript
declare global {
  namespace AuthNamespace {
    interface ProviderProfileMap {}  // Providers add their profiles here
    interface Session {}            // Developers define their session shape
  }
}
```

## Getting Started

### Installation

```bash
# Install core package
pnpm add @lumina-auth/core

# Install providers you need
pnpm add @lumina-auth/provider-google
pnpm add @lumina-auth/provider-discord
```

### Basic Usage

1. Define your session type:
```typescript
declare global {
  namespace AuthNamespace {
    interface Session {
      userId: string;
      email: string;
      // Add any fields you need
    }
  }
}
```

2. Set up providers:
```typescript
import { AuthSystem } from '@lumina-auth/core'
import { GoogleProvider } from '@lumina-auth/provider-google'

const auth = AuthSystem({
  providers: [
    new GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: 'https://your-app.com/auth/callback'
    })
  ],
  profile_to_session(profile) {
    // Handle different profile types
    switch(profile.provider) {
      case 'google':
        return {
          userId: profile.google_id,
          email: profile.email
        }
    }
  }
})
```

## Creating Custom Providers

You can create custom providers by adding to the global namespace:

```typescript
declare global {
  namespace AuthNamespace {
    interface ProviderProfileMap {
      custom: {
        provider: 'custom';
        id: string;
        // Add provider-specific fields
      }
    }
  }
}
```

## Developer Control

Lumina Auth gives you complete control over:
- How profiles map to sessions
- User data storage
- Account linking
- Session management
- Authentication flow

## Type Safety

The system is designed to be fully type-safe:
- Provider profiles are typed
- Session transformations are typed
- Auth flows are typed

## Contributing

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Build: `pnpm build`
4. Test: `pnpm test`

## License

MIT