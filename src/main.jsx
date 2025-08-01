import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
Amplify.configure({
  ...awsExports,
  aws_appsync_apiKey: 'da2-e7rcg3hlendhvfbe63drj6yfxu',
  aws_appsync_graphqlEndpoint: 'https://hdv3e45ocvflnazmmfzfhk7zdq.appsync-api.us-east-1.amazonaws.com/graphql',
});

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/index.css';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Listings from './pages/Listings';
import Profile from './pages/Profile';
import SignInSignUp from './pages/SignInSignUp';
import DashboardWithS3 from './pages/DashboardWithS3';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/signin" element={<SignInSignUp />} />
        <Route path="/dashboard" element={<DashboardWithS3 />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);