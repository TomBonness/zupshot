# Zupshot 📸

Zupshot is a marketplace connecting beginner photographers with clients for affordable photoshoots, featuring profile creation, portfolio galleries, and feedback systems. Built with React, AWS Amplify, Tailwind CSS, and shadcn/ui for a clean, responsive design.

## Features
- **Profile Creation & Editing**: Photographers can create profiles with a hero image, portfolio gallery, pricing, and availability, all stored in AWS DynamoDB and S3 (check out `DashboardWithS3.jsx`).
- **Photo Uploads**: Drag-and-drop uploads for profile and portfolio images, powered by AWS S3 and `react-dropzone` with reordering support (`DndProvider`).
- **Search & Filter**: Browse photographers by name, location, or price (free/paid) in a responsive grid (`Listings.jsx`).
- **Feedback System**: Clients can leave ratings and comments on photographer profiles, stored via GraphQL (`Profile.jsx`).
- **Auth & Security**: User sign-in/up with AWS Amplify Cognito, including email verification (`SignInSignUp.jsx`).
- **Responsive UI**: Clean, modern design with Tailwind CSS and shadcn components, using olive drab, tan yellow, and red for a sleek vibe.

## Tech Stack
- **Frontend**: React, React Router, Tailwind CSS, shadcn/ui
- **Backend**: AWS Amplify (Cognito for auth, AppSync for GraphQL, S3 for storage, DynamoDB for data)
- **Libraries**: `react-hot-toast` for notifications, `react-dropzone` for uploads, `react-dnd` for drag-and-drop
- **Tools**: Vite for build

## Development Notes
This project is a work in progress, and I've been iterating on it to make it better! If you find anything wrong please open an issue! Check the commit history for my process. Learned a ton debugging S3 uploads and GraphQL queries!

## Future Plans
- Add star rating UI for feedback
- Implement category filters (e.g., portrait, landscape) for listings
- Add loading spinners for S3 uploads
- Integrate social sharing for profiles

## Feedback
I'm always looking to improve! Check out the code and let me know your thoughts via [LinkedIn](https://www.linkedin.com/in/tombonness) or open an issue.
