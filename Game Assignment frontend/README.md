# Game Portal - Frontend (Assignment)

A modern, interactive Bootstrap-based frontend for the Game Portal assignment with comprehensive game management, progression tracking, leaderboards, and event management features.

## Features

### Authentication
- **Login System** - Secure user authentication with username and password
- **Registration** - New user registration with device information and country selection
- **Token Management** - JWT token-based authentication with local storage persistence
- **Session Management** - Automatic session expiration handling with redirect to login

### Dashboard
- **Progression Tracking** - Real-time display of player level, gold, cash, and gems
- **Game Management** - View all available games and manage game progression
- **Save Progress** - Save game progression with level, resources, and rewards
- **Score Submission** - Submit game scores with leaderboard integration
- **Leaderboards** - View global and country-specific leaderboards
- **Event Management** - Create, edit, and track game events with rewards
- **Interactive UI** - Smooth animations and transitions for better user experience

## File Structure

```
├── index.html              # Landing page with login/register links
├── login.html              # User login form
├── register.html           # User registration form
├── dashboard.html          # Main dashboard after login
├── README.md               # This file
└── assets/
    ├── css/
    │   └── styles.css      # Complete styling with animations
    └── js/
        ├── auth.js         # Authentication handlers
        └── dashboard.js    # Dashboard functionality
```

## API Endpoints

### Authentication

**Login**
```
POST http://localhost:8080/api/auth/login
Request: { "username": "string", "password": "string" }
Response: { "jwtToken": "string", "refreshToken": "string", "username": "string", "id": "number" }
```

**Register**
```
POST http://localhost:8080/api/players/register
Request: { 
  "username": "string", 
  "password": "string", 
  "deviceId": "string", 
  "platform": "string", 
  "country": "string" 
}
Response: { "message": "User registered successfully" }
```

### Progression

**Get Progression**
```
GET http://localhost:8080/api/progression/{playerId}
Headers: Authorization: Bearer {jwtToken}
Response: {
  "id": "number",
  "playerId": "number",
  "gameId": "number",
  "level": "number",
  "rank": "number",
  "gold": "number",
  "cash": "number",
  "gem": "number",
  "rewards": "string (JSON array)",
  "lastActiveAt": "ISO datetime",
  "updatedAt": "ISO datetime"
}
```

**Save Progression**
```
POST http://localhost:8080/api/progression/save
Headers: Authorization: Bearer {jwtToken}
Request: {
  "playerId": "number",
  "gameId": "number",
  "level": "number",
  "rank": "number",
  "gold": "number",
  "cash": "number",
  "gem": "number",
  "rewards": "string (JSON array)" [optional]
}
Response: { "message": "Progression saved successfully" }
```

### Games

**Get All Games**
```
GET http://localhost:8080/api/games/all
Headers: Authorization: Bearer {jwtToken}
Response: [ { "id": "number", "name": "string", "description": "string" } ]
```

**Add Game**
```
POST http://localhost:8080/api/games/add
Headers: Authorization: Bearer {jwtToken}
Request: { "name": "string", "description": "string" }
Response: { "id": "number", "name": "string", "description": "string" }
```

### Scores

**Submit Score**
```
POST http://localhost:8080/api/scores/submit
Headers: Authorization: Bearer {jwtToken}
Request: { "playerId": "number", "gameId": "number", "score": "number" }
Response: { "id": "number", "score": "number" }
```

**Get Leaderboard**
```
GET http://localhost:8080/api/leaderboards/{gameId}?country={country}
Headers: Authorization: Bearer {jwtToken}
Response: [
  { "playerId": "number", "username": "string", "score": "number", "rank": "number" }
]
```

### Events

**Get Events by Game**
```
GET http://localhost:8080/api/events/game/{gameId}
Headers: Authorization: Bearer {jwtToken}
Response: [
  {
    "id": "number",
    "name": "string",
    "gameId": "number",
    "status": "SCHEDULED|ACTIVE|FINISHED",
    "startTime": "ISO datetime",
    "endTime": "ISO datetime",
    "eventConfig": { "maxScore": "number", "reward": "string" }
  }
]
```

**Create Event**
```
POST http://localhost:8080/api/events/create
Headers: Authorization: Bearer {jwtToken}
Request: {
  "name": "string",
  "gameId": "number",
  "startTime": "ISO datetime",
  "endTime": "ISO datetime",
  "eventConfig": { "maxScore": "number", "reward": "string" }
}
Response: { "id": "number", "name": "string", ... }
```

**Update Event**
```
PUT http://localhost:8080/api/events/{eventId}
Headers: Authorization: Bearer {jwtToken}
Request: { "name": "string", "startTime": "ISO datetime", "endTime": "ISO datetime", "eventConfig": {...} }
Response: { "id": "number", "name": "string", ... }
```

**Delete Event**
```
DELETE http://localhost:8080/api/events/{eventId}
Headers: Authorization: Bearer {jwtToken}
Response: { "message": "Event deleted successfully" }
```

## Setup & Installation

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Backend API server running on `http://localhost:8080`
- Backend must allow CORS for browser requests

### Quick Start

1. **Open directly in browser** (basic testing):
   ```bash
   # Simply open index.html in your browser
   ```

2. **Using Live Server** (recommended for development):
   ```bash
   # VS Code: Install "Live Server" extension, then right-click index.html > "Open with Live Server"
   ```

3. **Using http-server**:
   ```bash
   npm install -g http-server
   http-server . -p 5500
   # Open http://localhost:5500/index.html
   ```

## Local Storage

The frontend stores the following data in browser's localStorage:

| Key | Type | Purpose |
|-----|------|---------|
| `jwtToken` | string | JWT authentication token |
| `refreshToken` | string | Refresh token for token renewal |
| `username` | string | Current logged-in username |
| `player_id` | number | Current player's ID |
| `userCountry` | string | Player's country for leaderboard filtering |

## UI Features

### Interactive Components
- **Progress Tiles** - Animated cards showing level, gold, cash, and gems with smooth hover effects
- **Game Cards** - Clickable cards displaying available games with interactive animations
- **Event Cards** - Detailed event information with edit functionality and status badges
- **Modals** - Compact, responsive modals for forms (Save Progress, Submit Score, Create/Edit Events)
- **Leaderboards** - Country-filtered leaderboard view with player rankings
- **Alerts** - Animated success/error/warning messages with smooth transitions

### Styling Enhancements
- **Gradient Backgrounds** - Modern gradient colors for visual appeal
- **Smooth Animations** - Subtle hover effects (lift and scale) for tactile feedback
- **Responsive Design** - Bootstrap grid system for mobile and desktop compatibility
- **Shadow Effects** - Depth and elevation through shadow variations
- **Typography** - Clean, readable fonts with consistent hierarchy

### Form Features
- **Form Validation** - Client-side validation with helpful error messages
- **Loading States** - Disabled buttons with loading text during submission
- **JSON Input** - Support for complex JSON data (e.g., rewards in save progression)
- **Dropdown Lists** - Dynamic game and event selection in forms

## Authentication Flow

1. **Registration** → Redirect to Login
2. **Login** → Store tokens & user info in localStorage → Redirect to Dashboard
3. **Dashboard** → Verify token → Display player progression
4. **Session Expiry** → Clear localStorage → Redirect to Login

## Error Handling

- **Network Errors** - User-friendly messages for connectivity issues
- **Authentication Errors** - Session expiration detection with automatic redirect
- **Validation Errors** - Form validation with specific error messages
- **API Errors** - Backend error messages displayed in alerts

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Notes

- The backend must support CORS to allow browser requests
- JWT tokens should be included in the `Authorization: Bearer <token>` header
- All timestamps should be in ISO 8601 format
- Rewards should be stringified JSON arrays
- Modal sizes are optimized for desktop viewing

## Future Enhancements

- Responsive modals for mobile devices
- Progress indicators for form submissions
- Real-time notifications for events
- Advanced filtering for leaderboards
- User profile customization
- Game analytics and statistics
- Social features (friends, achievements)

---

**Created for Game Portal Assignment** | Frontend Version 1.0

