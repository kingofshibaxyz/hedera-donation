# Hedera Donation Platform - Frontend

## Project Overview

This is the React.js frontend for the Hedera Donation platform, providing a user interface for creating and managing blockchain-powered donation campaigns.

## Prerequisites

- Node.js (v18 or later)
- npm (v8 or later)

## Getting Started

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/duysy/hedera-donation.git
   cd frontend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

### Available Scripts

In the project directory, you can run:

#### `npm start`
- Runs the app in development mode
- Open [http://localhost:3000](http://localhost:3000) to view in the browser
- The page will reload if you make edits
- You will also see any lint errors in the console

#### `npm run build`
- Builds the app for production to the `build` folder
- Correctly bundles React in production mode
- Optimizes the build for the best performance

#### `npm run deploy`
- Serves the production build using `serve`
- Useful for testing the production build locally

## Project Structure

```
hedera-donation-ui/
│
├── public/
│   ├── index.html
│   └── ...
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   ├── App.js
│   └── index.js
│
├── package.json
└── README.md
```
## Deployment

1. Build the project
   ```bash
   npm run build
   ```

2. Deploy the contents of the `build` folder to your hosting service

## Technologies Used

- React.js
- react-app-rewired (for custom webpack configuration)
- Tailwind CSS (assumed based on project structure)
- Hedera Hashgraph SDK
- React Router