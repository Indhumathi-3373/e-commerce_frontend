GT Sports e-commerce UI with backend auth and query management.

## Tech
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, bcrypt

## Setup
1. Install dependencies:
   npm install
2. Update `.env`:
   - `MONGO_URI=...`
   - `JWT_SECRET=...`
   - `PORT=3000`
3. Start server:
   npm start
4. Open:
   http://localhost:3000

## Features
- Sign up and login with MongoDB
- Contact query submission saved to DB
- My Queries page to track and resolve submitted queries
- Order flow with confirmation page and ETA
