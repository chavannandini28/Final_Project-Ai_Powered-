# 🌍 AI Power Tours - Intelligent Travel Booking Platform

<div align="center">

![AI Power Tours Banner](https://img.shields.io/badge/AI%20Power%20Tours-Intelligent%20Travel-blue?style=for-the-badge&logo=airplane)

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-Powered-412991?style=flat&logo=openai)](https://openai.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**A cutting-edge, full-stack travel booking application powered by artificial intelligence**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 About

AI Power Tours is a modern travel booking platform that combines AI-powered trip planning with real-time search for hotels, flights, buses, and trains. Built with the MERN stack and integrated with OpenAI for intelligent recommendations.

### ✨ Key Highlights

- 🤖 **AI Trip Planning** - Generate personalized itineraries in seconds
- 🔍 **Smart Search** - Hotels, flights, buses, trains with real-time data
- 🗺️ **Interactive Maps** - Route visualization with Leaflet.js
- 📧 **Email Notifications** - Password resets & booking confirmations
- 🔐 **Secure Auth** - Google OAuth 2.0 and JWT
- 📱 **Responsive** - Works perfectly on all devices

---

## 🎯 Features

### AI-Powered Trip Planning
- Generate complete travel itineraries using OpenAI
- Personalized recommendations based on preferences
- Hotel, restaurant, and attraction suggestions
- Real-time pricing and availability

### Comprehensive Search
- **Hotels**: Search by city, dates, and guests
- **Flights**: Find flights with pricing
- **Buses**: Discover inter-city routes
- **Trains**: Railway connections and schedules

### User Experience
- Google OAuth and email/password authentication
- Password reset with email verification
- Dashboard with booking management
- Interactive maps for routes and locations
- Beautiful UI with Tailwind CSS and Radix UI

---

## 🛠️ Tech Stack

**Frontend**: React 18, Vite, React Router 7, TanStack Query, Tailwind CSS, Radix UI, Leaflet, Recharts, Framer Motion

**Backend**: Node.js, Express, MongoDB, Mongoose, Passport.js, JWT, OpenAI API, Nodemailer, bcrypt

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/prasadnavale/ai-power-tours.git
cd ai-power-tours

# Install dependencies
npm install --legacy-peer-deps
cd backend && npm install --legacy-peer-deps && cd ..

# Setup environment
cp .env.example .env
cp backend/.env.example backend/.env
# Edit .env files with your credentials

# Seed database
cd backend && npm run seed && cd ..

# Start application (Windows)
.\start.ps1

# Or start manually
# Terminal 1: cd backend && npm run dev
# Terminal 2: npm run dev
```

### Access
- Frontend: http://localhost:5173
- Backend: http://localhost:5000/api

---

## 📚 Documentation

- **[Architecture](ARCHITECTURE.md)** - System design and structure

### Configuration

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
```

**Backend (backend/.env)**
```env
MONGODB_URI=mongodb://localhost:27017/travel-booker
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=your-openai-or-astra-api-key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
PORT=5000
FRONTEND_URL=http://localhost:5173
```

---

## 📂 Project Structure

```
ai-power-tours/
├── backend/                 # Backend API
│   ├── config/              # Configuration
│   ├── middleware/          # Express middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   └── server.js            # Entry point
├── src/                     # Frontend
│   ├── api/                 # API client
│   ├── components/          # React components
│   ├── pages/               # Page components
│   ├── hooks/               # Custom hooks
│   └── utils/               # Utilities
├── .env                     # Frontend config
├── backend/.env             # Backend config
├── start.ps1                # Quick start script
└── README.md                # This file
```

---

## 🔧 API Endpoints

### Authentication
- `GET /api/auth/google` - Google OAuth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request reset
- `POST /api/auth/reset-password` - Reset password

### AI & Trips
- `POST /api/ai/ask` - AI recommendations
- `GET /api/trips` - Get trips
- `POST /api/trips` - Create trip

### Search & Booking
- `GET /api/hotels` - Search hotels
- `GET /api/flights` - Search flights
- `POST /api/bookings` - Create booking

---

## 🤝 Contributing

Contributions are welcome! Please check out [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

---

## 👥 Authors

**Prasad Navale** - [GitHub](https://github.com/prasadnavale) | [LinkedIn](https://linkedin.com/in/prasadnavale) | [Portfolio](https://ngts.tech)

---

## 🙏 Acknowledgments

- OpenAI for AI capabilities
- MongoDB for database
- React team
- All open-source contributors

---

## 📞 Support

- Email: navaleprasad15@gmail.com
- Portfolio: [ngts.tech](https://ngts.tech)

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Payment gateway integration
- [ ] Multi-language support
- [ ] Social login (Facebook, Twitter)
- [ ] Real-time chat support
- [ ] Advanced analytics

---

<div align="center">

**Made with ❤️ by Prasad Navale**

[⬆ Back to Top](#-ai-power-tours---intelligent-travel-booking-platform)

</div>
