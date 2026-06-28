# System Architecture

## Overview

The AI-Powered Tours & Travel Booker is a full-stack MERN (MongoDB, Express, React, Node.js) application with AI integration. The system follows a client-server architecture with clear separation between frontend and backend concerns.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  React 18 + Vite (Frontend SPA)                            │ │
│  │  - React Router for routing                                │ │
│  │  - TanStack Query for state management                     │ │
│  │  - Tailwind CSS + Radix UI for styling                    │ │
│  │  - Leaflet for maps                                        │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────────┐
│                         SERVER LAYER                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Express.js (Backend API)                                  │ │
│  │  - RESTful API endpoints                                   │ │
│  │  - JWT + OAuth authentication                              │ │
│  │  - Session management                                      │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
          ┌─────────────────┬──────────────────┬─────────────────┐
          ↓                 ↓                  ↓                 ↓
   ┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
   │ MongoDB  │      │  OpenAI  │      │  Google  │      │   Web    │
   │ Database │      │   API    │      │  OAuth   │      │ Scraping │
   └──────────┘      └──────────┘      └──────────┘      └──────────┘
```

## Frontend Architecture

### Technology Stack
- **React 18**: Component-based UI library
- **Vite**: Build tool and development server
- **React Router v7**: Client-side routing
- **TanStack Query**: Server state management and caching
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Leaflet**: Interactive map library
- **Recharts**: Chart and visualization library

### Directory Structure

```
src/
├── api/                    # API Integration Layer
│   ├── apiClient.js       # Axios client with auth interceptors
│   ├── entities.js        # CRUD operations for entities
│   └── integrations.js    # AI and email service integrations
│
├── components/             # React Components
│   ├── hotels/            # Hotel-specific components
│   │   └── HotelsMap.jsx
│   ├── trip/              # Trip planning components
│   │   ├── CostBreakdown.jsx
│   │   ├── MapWrapper.jsx
│   │   ├── RouteMap.jsx
│   │   ├── TripItinerary.jsx
│   │   └── TripRecommendations.jsx
│   └── ui/                # Reusable UI components (40+ components)
│       ├── button.jsx
│       ├── card.jsx
│       ├── dialog.jsx
│       └── ...
│
├── hooks/                  # Custom React Hooks
│   └── use-mobile.jsx
│
├── pages/                  # Page-level Components
│   ├── Home.jsx           # Landing page
│   ├── Login.jsx          # Authentication
│   ├── Dashboard.jsx      # User dashboard
│   ├── TripPlanner.jsx    # AI trip planning
│   ├── Hotels.jsx         # Hotel search
│   ├── Transport.jsx      # Transport search
│   ├── BookingConfirmation.jsx
│   └── ...
│
├── lib/                    # Utilities
│   └── utils.js           # Helper functions
│
├── App.jsx                 # Root component
└── main.jsx                # Entry point
```

### State Management

**TanStack Query** is used for server state management:
- **Query Keys**: Organized by entity type
- **Automatic Caching**: Reduces API calls
- **Optimistic Updates**: Better UX for mutations
- **Background Refetching**: Keeps data fresh

**Local State**: React hooks (`useState`, `useReducer`)

**Authentication State**: Stored in localStorage + Context API

### Routing

```
Route Structure:
/                         → Home page
/login                    → Login/Register
/dashboard                → User dashboard
/trip-planner             → AI trip planning
/trips/:id                → Trip details
/hotels                   → Hotel search
/hotels/:id               → Hotel details
/transport                → Transport search
/transport/booking        → Transport booking
/packages                 → Package deals
/settings                 → User settings
/ai-assistant             → AI chat interface
```

### API Communication

All API calls go through `apiClient.js`:
- Base URL configuration
- Authentication token injection
- Error handling and retry logic
- Response/request interceptors

## Backend Architecture

### Technology Stack
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM (Object Document Mapper)
- **Passport.js**: Authentication middleware
- **JWT**: Token-based authentication
- **OpenAI SDK**: AI integration
- **Bcrypt**: Password hashing

### Directory Structure

```
backend/
├── config/                 # Configuration
│   └── passport.js        # Passport strategies (Google OAuth)
│
├── middleware/             # Custom Middleware
│   └── auth.js            # JWT verification middleware
│
├── models/                 # Mongoose Models
│   ├── User.js            # User schema
│   ├── Trip.js            # Trip schema
│   ├── Hotel.js           # Hotel schema
│   ├── Flight.js          # Flight schema
│   ├── Booking.js         # Booking schema
│   └── Package.js         # Package schema
│
├── routes/                 # API Routes
│   ├── auth.js            # Authentication endpoints
│   ├── ai.js              # AI/OpenAI endpoints
│   ├── trips.js           # Trip CRUD
│   ├── hotels.js          # Hotel search/booking
│   ├── flights.js         # Flight search/booking
│   ├── bookings.js        # Booking management
│   ├── packages.js        # Package deals
│   ├── search.js          # Unified search
│   └── users.js           # User management
│
├── services/               # Business Logic
│   └── scraperService.js  # Web scraping for travel data
│
├── .env.example            # Environment template
├── seed.js                 # Database seeding
└── server.js               # Application entry point
```

### API Design

**RESTful Principles**:
- HTTP methods: GET, POST, PUT, DELETE
- Resource-based URLs
- Stateless communication
- JSON response format

**Response Format**:
```javascript
// Success
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}

// Error
{
  "success": false,
  "message": "Error message",
  "error": {...}
}
```

### Middleware Chain

```
Request → CORS → Body Parser → Session → Passport → Auth Middleware → Route Handler
```

1. **CORS**: Allow cross-origin requests from frontend
2. **Body Parser**: Parse JSON/URL-encoded data
3. **Session**: Maintain user sessions
4. **Passport**: Handle OAuth authentication
5. **Auth Middleware**: Verify JWT tokens
6. **Route Handler**: Business logic

## Database Schema

### MongoDB Collections

#### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  googleId: String,
  avatar: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Trips Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  title: String,
  destination: String,
  startDate: Date,
  endDate: Date,
  budget: Number,
  travelers: Number,
  itinerary: [{
    day: Number,
    activities: [String],
    hotels: [ObjectId],
    transport: [ObjectId]
  }],
  status: String (planning/booked/completed),
  createdAt: Date,
  updatedAt: Date
}
```

#### Bookings Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  tripId: ObjectId (ref: Trip),
  type: String (hotel/flight/bus/train),
  referenceId: ObjectId,
  status: String (pending/confirmed/cancelled),
  amount: Number,
  bookingDate: Date,
  createdAt: Date
}
```

#### Hotels Collection
```javascript
{
  _id: ObjectId,
  name: String,
  city: String,
  address: String,
  rating: Number,
  price: Number,
  amenities: [String],
  images: [String],
  coordinates: {
    lat: Number,
    lng: Number
  },
  availability: Boolean
}
```

#### Flights Collection
```javascript
{
  _id: ObjectId,
  airline: String,
  flightNumber: String,
  from: String,
  to: String,
  departureTime: Date,
  arrivalTime: Date,
  price: Number,
  seats: Number,
  class: String
}
```

### Relationships

```
User (1) ──→ (Many) Trips
User (1) ──→ (Many) Bookings
Trip (1) ──→ (Many) Bookings
Hotel (1) ──→ (Many) Bookings
Flight (1) ──→ (Many) Bookings
```

## Authentication & Authorization

### Authentication Flow

#### JWT Authentication
```
1. User logs in → POST /api/auth/login
2. Server validates credentials
3. Server generates JWT token
4. Client stores token in localStorage
5. Client includes token in Authorization header
6. Server verifies token on protected routes
```

#### Google OAuth Flow
```
1. User clicks "Sign in with Google"
2. Client redirects to /api/auth/google
3. Google authentication page
4. User approves
5. Callback to /api/auth/google/callback
6. Server creates/updates user
7. Server generates JWT token
8. Redirect to frontend with token
```

### Authorization Levels

- **Public Routes**: Home, Login (no auth required)
- **Authenticated Routes**: Dashboard, Bookings (JWT required)
- **Admin Routes**: User management (admin role required)

## AI Integration

### OpenAI Service Architecture

```
Frontend → API Request → Backend /api/ai/invoke-llm
                             ↓
                    Parse Request & Context
                             ↓
                    Add Web Scraping Data (if requested)
                             ↓
                    Build OpenAI Prompt
                             ↓
                    Call OpenAI API
                             ↓
                    Parse & Format Response
                             ↓
                    Return JSON to Frontend
```

### AI Features

1. **Trip Planning**: Generate complete itineraries
2. **Hotel Recommendations**: Personalized suggestions
3. **Transport Options**: Smart route planning
4. **Cost Estimation**: Budget breakdown
5. **Chat Assistant**: Natural language queries

### Prompt Engineering

- **System Prompt**: Defines AI behavior as a JSON API
- **User Prompt**: Includes user request + context + web data
- **Response Format**: JSON schema for structured output
- **Temperature**: 0.7 for creative yet consistent results

## Web Scraping Service

### Purpose
Fetch real-time travel data when available, fallback to mock data.

### Supported Data Sources
- Hotels (via search engines)
- Flights (via airline APIs)
- Buses (via transport portals)
- Trains (via railway APIs)

### Scraping Strategy
```
1. Parse user query
2. Identify data type (hotel/flight/bus/train)
3. Construct search parameters
4. Fetch data from sources
5. Parse and normalize data
6. Return standardized format
7. On failure → generate mock data
```

## Security Measures

### Backend Security
- **Password Hashing**: bcrypt with salt rounds
- **JWT Secrets**: Environment variables
- **CORS**: Whitelist frontend domain
- **Input Validation**: Sanitize all inputs
- **Rate Limiting**: Prevent abuse
- **HTTPS**: SSL/TLS in production
- **Environment Variables**: Sensitive data isolation

### Frontend Security
- **XSS Prevention**: React's built-in escaping
- **CSRF Protection**: SameSite cookies
- **Token Storage**: localStorage (HTTP-only cookies in production)
- **Input Sanitization**: Validate before submission

## Performance Optimization

### Frontend
- **Code Splitting**: Lazy loading routes
- **Image Optimization**: Responsive images
- **Caching**: TanStack Query automatic caching
- **Memoization**: React.memo, useMemo, useCallback
- **Bundle Size**: Tree shaking with Vite

### Backend
- **Database Indexing**: On frequently queried fields
- **Connection Pooling**: Mongoose connection reuse
- **Caching**: In-memory cache for static data
- **Compression**: gzip responses
- **Query Optimization**: Lean queries, field selection

## Deployment Architecture

### Production Setup

```
┌─────────────────────────────────────────┐
│  CDN (Cloudflare/AWS CloudFront)       │
│  - Static assets                        │
│  - Frontend build                       │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│  Frontend Hosting (Vercel/Netlify)     │
│  - React SPA                            │
│  - Environment: VITE_API_URL            │
└─────────────────────────────────────────┘
                ↓ HTTPS
┌─────────────────────────────────────────┐
│  Load Balancer (AWS ALB/NGINX)         │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│  Backend Servers (Heroku/Railway)      │
│  - Node.js + Express                    │
│  - Multiple instances                   │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│  MongoDB Atlas (Cloud Database)         │
│  - Replica Set                          │
│  - Automatic backups                    │
└─────────────────────────────────────────┘
```

### Environment Variables

**Development**:
- `NODE_ENV=development`
- Local MongoDB
- Local API endpoints

**Production**:
- `NODE_ENV=production`
- MongoDB Atlas
- HTTPS endpoints
- Secure secrets

## Monitoring & Logging

### Backend Logging
- Request/Response logging
- Error tracking
- Performance metrics
- Database query logs

### Frontend Monitoring
- Error boundaries
- Analytics tracking
- Performance monitoring
- User behavior tracking

## Scalability Considerations

### Horizontal Scaling
- Stateless backend allows multiple instances
- Load balancer distributes traffic
- Session stored in database

### Database Scaling
- MongoDB sharding for large datasets
- Read replicas for read-heavy operations
- Indexing for query performance

### Caching Strategy
- Redis for session storage (future)
- CDN for static assets
- Browser caching headers
- API response caching

## Testing Strategy

### Frontend Testing
- **Unit Tests**: Component testing with Jest
- **Integration Tests**: API integration tests
- **E2E Tests**: User flow testing with Playwright

### Backend Testing
- **Unit Tests**: Route and service tests
- **Integration Tests**: Database operations
- **API Tests**: Endpoint testing with Supertest

## Future Enhancements

1. **Real-time Features**: WebSocket for live updates
2. **Mobile App**: React Native version
3. **Payment Integration**: Stripe/Razorpay
4. **Advanced AI**: Multi-modal AI with images
5. **Social Features**: Trip sharing, reviews
6. **Analytics Dashboard**: Admin insights
7. **Multi-language**: i18n support
8. **Progressive Web App**: Offline support

## Conclusion

This architecture provides a solid foundation for a scalable, maintainable travel booking application. The separation of concerns, use of modern technologies, and focus on security and performance make it production-ready while allowing for future growth and feature additions.
