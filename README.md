# 🌟 Post Away API

## Overview

Welcome to the **Post Away API**! 🚀 This RESTful web service is designed for a social media platform that allows users to register, log in, create posts, comment on posts, and manage friendships. Built with Node.js and Express, this API provides seamless integration with front-end applications and offers efficient data management using MongoDB. 📱💬

## Features

### User Management
- **User Registration**: Create a new account! (`/api/users/signup`) 📝
- **User Login**: Securely log in to your account! (`/api/users/signin`) 🔑
- **User Logout**: Say goodbye for now! (`/api/users/logout`) 👋
- **Get User Details**: Retrieve your profile information! (`/api/users/get-details/{userId}`) 👤
- **Update User Details**: Keep your profile up to date! (`/api/users/update-details`) 🔄

### Post Management
- **Create New Posts**: Share your thoughts! (`/api/posts`) 🖊️
- **Retrieve All Posts**: Browse the latest updates! (`/api/posts/all`) 📜
- **Manage Specific Posts**: Get, update, or delete your posts! (`/api/posts/{postId}`) 🗑️

### Comment Management
- **Add Comments**: Join the conversation! (`/api/comments/{postId}`) 💬
- **Update or Delete Comments**: Keep your comments relevant! (`/api/comments/{commentId}`) ✏️

### Like Management
- **Get Likes**: See how much love your post is getting! (`/api/likes/{id}`) ❤️
- **Toggle Likes**: Like or un-like a post with ease! (`/api/likes/toggle/{id}`) 👍👎

### Friendship Management
- **Get Friends List**: Check out your friends! (`/api/friends/get-friends/{userId}`) 👯
- **Pending Friendship Requests**: See who’s waiting to connect! (`/api/friends/get-pending-requests`) ⏳
- **Toggle Friendship Status**: Make or break friendships! (`/api/friends/toggle-friendship/{friendId}`) 🤝
- **Respond to Requests**: Accept or decline friendship requests! (`/api/friends/response-to-request/{friendId}`) 📩

### OTP Management
- **Send OTP**: Verify your identity! (`/api/otp/send`) 📧
- **Verify OTP**: Confirm your OTP for security! (`/api/otp/verify`) 🔐
- **Reset Password**: Easily recover your account! (`/api/otp/reset-password`) 🔄

## Technologies Used

- **Node.js**: JavaScript runtime for server-side development. 🟢
- **Express.js**: Web application framework for building RESTful APIs. 🌐
- **MongoDB**: NoSQL database for storing user, post, and comment data. 📊
- **JWT (JSON Web Tokens)**: Authentication for secure user sessions. 🔒
- **Mongoose**: ODM for MongoDB to manage relationships and validations. 📚
