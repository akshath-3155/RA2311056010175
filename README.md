# RA2311056010175 (Frontend)

A clean and concise React-based Notification System built with Vite and TypeScript. It securely fetches, prioritizes, and displays real-time notifications with filtering and pagination capabilities.

## Screenshots

### API (Postman)
**1. Register**  
![Registration](./Screenshots/Registration.png)

**2. Auth (Access Token)**  
![Auth Token](./Screenshots/Access-Token.png)

**3. Notifications**  
![Get Notifications](./Screenshots/get-notification.png)

### Frontend (UI)
**UI, Filter, and Pagination**  
![Notification UI](./Screenshots/Notification-test-ui.png)

## Features

- Fetch notifications using Bearer token
- Display notifications
- Unread first sorting
- Filter by type
- Pagination
- Logging middleware

## Tech Stack

- React (Vite + TypeScript)
- Fetch API

## Project Structure

```text
├── Screenshots/          # Project screenshots
├── src/
│   ├── components/       # Reusable UI components (NotificationCard, PriorityInbox, etc.)
│   ├── services/         # API integration, Token management, and Logger
│   ├── types/            # TypeScript interfaces
│   ├── App.tsx           # Main application entry point
│   └── main.tsx          # React DOM rendering
├── .env                  # Environment variables (not tracked in git)
├── index.html            # Vite HTML entry point
├── package.json          # Dependencies and scripts
└── vite.config.ts        # Vite configuration
```

## Setup Instructions

To get this running on your local machine, just clone the repo and run `npm install` to grab all the dependencies. After that, create a `.env` file in the root folder and add your access token inside it like this: `VITE_API_TOKEN=your_token_here`. Once that's done, you can just run `npm run dev` and it will start the local development server.

## How I Created the Solution

Step 1:
I used Postman to register and got the client ID and client secret, then used them to generate the access token.

Step 2:
I created the basic folder structure for the frontend using React, Vite, and TypeScript.

Step 3:
I built the main components like NotificationList, NotificationCard, and FilterBar to display and manage the data.

Step 4:
I integrated the API using the access token and connected it to the frontend to fetch notifications.

Step 5:
I added features like filtering, sorting unread notifications first, and pagination.

Step 6:
I implemented a simple logging middleware to track API calls and actions.

## API Usage

- **Endpoint:** `http://20.207.122.201/evaluation-service/notifications`
- **Method:** `GET`
- **Authorization:** `Bearer <token>`

## Notes

- Token not hardcoded for security
- Must be added via `.env`
