# Car Book - Used Car Marketplace App

A mobile application built with React Native and Expo for buying and selling used cars. The app connects dealers with potential buyers and provides a platform for listing vehicles with detailed information, including photos, videos, and audio descriptions.

## Features

- **User Authentication**: Secure sign-up/sign-in for dealers and admins
- **Dealer Listings Management**: Add, update, and manage vehicle listings
- **Media Upload**: Support for images, videos, and audio recordings
- **Admin Dashboard**: Approve dealer registrations and monitor listings
- **Subscription Plans**: Different tiers with listing limits for dealers

## Tech Stack

- **Frontend**: React Native, Expo
- **State Management**: Zustand
- **Backend & Database**: Supabase (Authentication, PostgreSQL, Storage)
- **Navigation**: Expo Router (file-based routing)
- **UI Components**: Custom components with theming support

## Project Structure

```
car-book/
├── app/                    # Expo Router screens and navigation
│   ├── (admin)/            # Admin-specific screens
│   ├── (auth)/             # Authentication screens
│   └── (tabs)/             # Main tab navigation screens
├── assets/                 # Static assets (images, fonts)
├── components/             # Reusable components
│   ├── auth/               # Authentication-related components
│   ├── layout/             # Layout components
│   ├── listings/           # Listing-related components
│   └── ui/                 # Generic UI components
├── constants/              # App constants and configuration
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and services
│   ├── services/           # API service modules
│   └── supabase.ts         # Supabase client configuration
├── store/                  # Zustand state stores
├── supabase/               # Supabase schema and migration files
└── types/                  # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Expo CLI
- Supabase account

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/car-book.git
   cd car-book
   ```

2. Install dependencies

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
