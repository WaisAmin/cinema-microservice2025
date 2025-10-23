# Cinema Frontend Application

A modern, responsive cinema booking application built with React and Vite.

## Features

✅ **Complete Authentication System**
- User registration and login
- JWT token management with localStorage persistence
- Protected routes and authentication state management

✅ **Movie Management**
- Fetch all movies from backend API
- Beautiful movie cards with poster images
- Responsive grid layout

✅ **Booking System**
- View showtimes for each movie
- Interactive seat selection
- Real-time booking with confirmation messages
- Automatic panel closure after successful booking

✅ **Modern UI/UX**
- Dark theme with gradient backgrounds
- Smooth animations and transitions
- Responsive design for all devices
- Loading states and error handling
- Toast notifications for user feedback

## How to Run

### Prerequisites
- Node.js (version 16 or higher)
- Backend API running (gateway on port 8080)

### Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API URL (optional):**
   Create a `.env` file in the root directory:
   ```bash
   VITE_API_URL=http://localhost:8080
   ```
   If not set, defaults to `http://localhost:8080`

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## API Endpoints Used

The application connects to the following backend endpoints:

- `GET /movies` - Fetch all movies
- `GET /movies/:id/showtimes` - Get showtimes for a movie
- `POST /users/register` - User registration
- `POST /users/login` - User login
- `GET /users/me` - Get current user info
- `POST /bookings` - Create a booking

## Key Improvements Made

1. **Fixed App Structure**: Proper React Router setup with authentication routes
2. **Enhanced Authentication**: Token persistence, automatic token validation, and user state management
3. **Improved Booking Flow**: Interactive seat selection and better confirmation messages
4. **Better Error Handling**: Comprehensive error messages and loading states
5. **Modern UI**: Enhanced styling with animations and responsive design
6. **API Integration**: Removed mock delays and improved error handling

## Authentication Flow

1. Users can register or login through dedicated routes
2. JWT tokens are stored in localStorage
3. Tokens are automatically validated on app load
4. Protected features require authentication
5. Users can logout to clear their session

## Booking Process

1. Browse movies on the homepage
2. Click "Book Ticket" to view showtimes
3. Select preferred showtime and seat
4. Click "Book Now" to confirm
5. Receive confirmation message with booking ID

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Development Notes

- The application uses Vite for fast development and building
- CSS is embedded in the HTML file for simplicity
- All components are functional components with hooks
- State management is handled with React's built-in useState and useEffect
