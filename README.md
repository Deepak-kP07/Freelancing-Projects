# Ozonxt - Water Purification E-commerce & Service Platform

Ozonxt is a full-featured, modern web application built for a water purification company. It serves as both an e-commerce platform for selling products and a service portal for customers to book installations, maintenance, and repairs. The application is designed with a clean, responsive interface and includes a robust backend with separate dashboards for users and administrators.


## ✨ Key Features

- **Product Catalog:** Browse and view a grid of water purification products with detailed descriptions, images, and pricing.
- **Shopping Cart:** A fully persistent shopping cart where users can add/remove products, update quantities, and view an order summary.
- **WhatsApp Checkout:** A seamless checkout process that redirects users to WhatsApp with a pre-filled message containing their order details.
- **User Authentication:** Secure sign-up and login functionality using Email/Password and Google OAuth, powered by Firebase Authentication.
- **Service Booking:** A dedicated form for users to book services like installation, maintenance, or repair, with date and time selection.
- **User Dashboard:** A personal space for logged-in users to view their profile information and track the history and status of their service bookings.
- **Admin Dashboard:** A protected route for administrators to:
  - View and manage all service bookings from all users.
  - Update the status of each booking (e.g., 'Scheduled', 'Completed').
  - View customer profile information, including their avatar.
- **Fully Responsive Design:** The UI is optimized for a seamless experience on desktops, tablets, and mobile devices.
- **Dark/Light Mode:** A theme toggler for users to switch between light and dark modes, with their preference saved.
- **Static & Info Pages:** Includes "About Us", "Contact Us", and "Developer Info" pages.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/)
- **Backend & Database:** [Firebase](https://firebase.google.com/) (Authentication, Firestore)
- **Form Management:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation
- **Icons:** [Lucide React](https://lucide.dev/)


## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- `npm`, `yarn`, or `pnpm`
- A [Firebase](https://firebase.google.com/) account and a new project.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  In your project, go to **Authentication** -> **Sign-in method** and enable **Email/Password** and **Google** providers.
3.  Go to **Firestore Database** and create a new database in **Production mode**.
4.  In Firestore, create the following collections:
    - `users`
    - `serviceBookings`
    - `contactSubmissions`
5.  Navigate to **Project Settings** (click the gear icon) -> **General**. Under "Your apps", create a new **Web app**.
6.  Copy the `firebaseConfig` object. You will need these keys for the next step.

### 4. Environment Variables

Create a file named `.env.local` in the root of your project and add your Firebase configuration keys.

```plaintext
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID
```


    // --- Service Bookings Collection ---
    match /serviceBookings/{bookingId} {
      // Anyone authenticated can create a booking
      allow create: if request.auth != null;
      // An admin can read any booking
      allow read: if isAdmin();
      // A user can read their own bookings
      allow read: if request.auth != null && resource.data.userEmail == request.auth.token.email;
      // Only an admin can update the status of a booking
      allow update: if isAdmin();
    }

    // --- Contact Submissions Collection ---
    match /contactSubmissions/{submissionId} {
      // Any authenticated user can create a contact submission
      allow create: if request.auth != null;
      // Only admins can read contact submissions
      allow read, list: if isAdmin();
    }
  }
}
```
**Important:** Don't forget to update the `adminEmails` list in the rules with your own admin email address. After pasting the rules, click **Publish**.

### 6. Run the Development Server

You can now start the development server.

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) (or the port specified in `package.json`) with your browser to see the result.

---

## 📂 Project Structure

-   `src/app/` - Contains all the pages and layouts, following the Next.js App Router structure.
-   `src/components/` - Reusable React components used throughout the application (e.g., Header, Footer, Cards).
    -   `src/components/ui/` - Unmodified UI components from ShadCN UI.
-   `src/lib/` - Utility functions, constants, and Firebase configuration.
-   `src/store/` - Redux Toolkit setup, including slices for cart and authentication state.
-   `src/contexts/` - React Context providers, specifically for Firebase Authentication logic.
-   `public/` - Static assets like images and fonts.

---

## 👨‍💻 Developer

This project was developed by **Deepak KP**.

-   **GitHub:** [@Deepak-kP07](https://github.com/Deepak-kP07)
-   **LinkedIn:** [Deepak KP](https://www.linkedin.com/in/deepak-kp-559a85282/)

Feel free to check out the `/developer` page on the live site for more info.
