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
import Home from './pages/Home';
import Listings from './pages/Listings';
import Profile from './pages/Profile';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import DashboardWithS3 from './pages/DashboardWithS3';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<DashboardWithS3 />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);