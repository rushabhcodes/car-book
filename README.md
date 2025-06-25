# CarBook B2B Car Dealer App

CarBook is a modern B2B platform for car dealers and administrators to manage vehicle listings, subscriptions, and dealer accounts with ease. Built using Expo, React Native, Zustand, and Supabase, it delivers a seamless and secure experience for both admins and dealers.

---

## 🚀 Overview

CarBook streamlines the workflow for car dealerships, providing robust tools for inventory management, dealer onboarding, and subscription control. With real-time updates and secure media storage, it empowers both admins and dealers to focus on what matters most—growing their business.

---

## ✨ Features

- **Dealer Registration & Approval**: Dealers register and await admin approval before accessing the platform.
- **Admin Dashboard**: View platform stats, manage dealers, approve users, and monitor subscriptions.
- **Car Listings**: Dealers can list vehicles, upload images, and manage their inventory.
- **Subscription Management**: Flexible plans for dealers, with listing limits and plan upgrades.
- **Real-time Updates**: Live notifications for pending approvals and listing status.
- **Secure Storage**: Car images, videos, and audio stored securely with Supabase Storage.
- **Role-based Access**: Separate experiences for Admins and Dealers.
- **Modern UI**: Clean, intuitive interface for both web and mobile.

---

## 📸 Screenshots

### 👤 User (Dealer) Experience
<div style="display: flex; flex-wrap: wrap; gap: 10px;">
  <img src="assets/ui/user_all_listing.jpg" alt="User All Listings" width="320"/>
  <img src="assets/ui/user_list_vechile.jpg" alt="List Vehicle" width="320"/>
  <img src="assets/ui/user_profile.jpg" alt="User Profile" width="320"/>
  <img src="assets/ui/user_useer_listing.jpg" alt="User Listings" width="320"/>
</div>

### 🛡️ Admin Experience
<div style="display: flex; flex-wrap: wrap; gap: 10px;">
  <img src="assets/ui/admin_dashboard.jpg" alt="Admin Dashboard" width="320"/>
  <img src="assets/ui/admin_manage_dealers.jpg" alt="Manage Dealers" width="320"/>
  <img src="assets/ui/admin_pending_users.jpg" alt="Pending Users" width="320"/>
  <img src="assets/ui/admin_manage_subscription.jpg" alt="Manage Subscriptions" width="320"/>
  <img src="assets/ui/admin_listing.jpg" alt="Admin Listings" width="320"/>
  <img src="assets/ui/admin_edit_subscription.jpg" alt="Edit Subscription" width="320"/>
</div>

---

## 🛠️ Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/car-book.git
cd car-book
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Supabase
- Create a project on [Supabase](https://supabase.com/)
- Copy your Project URL and anon key
- Update `.env`:
  ```env
  EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
  EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```
- Run the SQL scripts in `supabase/schema.sql` and `supabase/storage.sql` via Supabase SQL Editor

### 4. Start the App
```bash
npm start
```

---

## 📂 Folder Structure

- `app/` — Main app screens and navigation
- `components/` — Reusable UI components
- `store/` — Zustand stores for state management
- `lib/` — Supabase client setup
- `constants/` — App-wide constants
- `assets/` — Fonts and images
- `supabase/` — Database and storage SQL
- `types/` — TypeScript types

---

## 🔒 Security & Real-time Features
- Row Level Security (RLS) on all tables
- Admins can approve/reject dealers
- Real-time notifications for pending users and listings
- Secure file storage for car media

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

---

## 🙏 Credits

- Built with [Expo](https://expo.dev/), [React Native](https://reactnative.dev/), [Supabase](https://supabase.com/), and [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction).
