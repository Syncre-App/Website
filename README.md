# Syncre Web

A web-based messaging client for Syncre that mirrors the mobile app experience with end-to-end encryption support.

## Features

### ✅ Implemented

#### Navigation
- **Tab-based navigation** (Chats, Friends, Profile) - matches mobile app layout
- **Responsive design** optimized for mobile and desktop
- **Bottom navigation bar** with notification badges

#### Authentication
- **JWT-based authentication** with secure token storage
- **Login/Register flow** integrated with Syncre API
- **E2EE unlock** for decrypting messages

#### Chats
- **Chat list** with unread message counts
- **Real-time messaging** via WebSocket
- **Online/offline status** indicators
- **Streak indicators** for consecutive messaging
- **Block/unblock users**

#### Friends
- **Search users** by username or email
- **Send/accept/decline** friend requests
- **View pending requests** (incoming and outgoing)
- **User status** display

#### Profile
- **View profile** with avatar and status
- **Edit profile** settings
- **Privacy settings** page
- **Logout functionality**

#### Design
- **iOS-inspired dark theme** matching mobile app
- **Glass morphism** effects
- **Consistent color palette** and typography
- **Smooth animations** and transitions

### 🚧 In Progress

- File attachments and media sharing
- Group chat management
- Voice/Video calls
- Push notifications (web)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: React Icons
- **State**: React Context + Hooks
- **E2EE**: TweetNaCl, @stablelib libraries

## Project Structure

```
Website/
├── app/
│   ├── app/                    # Main app with tab navigation
│   │   ├── layout.tsx          # Tab layout with context
│   │   ├── page.tsx            # Chats list
│   │   ├── friends/
│   │   │   └── page.tsx        # Friends management
│   │   ├── profile/
│   │   │   └── page.tsx        # Profile page
│   │   ├── chat/[id]/
│   │   │   └── page.tsx        # Individual chat
│   │   └── settings/
│   │       ├── page.tsx        # Settings main
│   │       ├── edit-profile/
│   │       │   └── page.tsx    # Edit profile
│   │       └── privacy/
│   │           └── page.tsx    # Privacy settings
│   ├── chat/                   # Existing chat components
│   ├── globals.css             # Global styles with mobile design system
│   └── layout.tsx              # Root layout
├── lib/                        # Utility libraries
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Navigate to Website directory
cd Website

# Install dependencies
npm install

# Run development server
npm run dev
```

### Environment Variables

Create a `.env.local` file:

```env
# API URL (optional, defaults to production)
NEXT_PUBLIC_API_URL=https://api.syncre.xyz
```

## Design System

The web client uses the same design system as the mobile app:

### Colors
- **Background**: `#0B0E14`
- **Surface**: `rgba(255, 255, 255, 0.14)`
- **Accent**: `#0A84FF`
- **Success**: `#34C759`
- **Error**: `#FF453A`
- **Text**: `#F8FAFC`
- **Text Muted**: `rgba(248, 250, 252, 0.72)`

### Typography
- **Display**: 36px, bold
- **Title**: 22px, semibold
- **Body**: 15px, regular
- **Label**: 12px, uppercase

### Spacing
- xs: 8px
- sm: 12px
- md: 16px
- lg: 20px
- xl: 28px

## API Integration

The web client communicates with the Syncre backend API:

- **Base URL**: `https://api.syncre.xyz/v1`
- **WebSocket**: `wss://api.syncre.xyz/ws`
- **Authentication**: JWT Bearer tokens

See the [Backend API Documentation](../Backend/API.md) for complete API reference.

## WebSocket Events

Real-time features use WebSocket for:
- Message delivery
- Typing indicators
- Online status updates
- Friend request notifications

## Security

- **End-to-end encryption** for all messages
- **Secure token storage** in localStorage
- **XSS protection** through React's built-in escaping
- **CSRF protection** through JWT tokens

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari/Chrome

## License

This project is licensed under the GNU GENERAL PUBLIC LICENSE.

## Related

- [Mobile App](../Mobile/) - React Native mobile client
- [Backend](../Backend/) - Node.js API server
