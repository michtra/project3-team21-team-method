# Project 3
documented with ❤️  by yours truly, michael tran

this is, by definition, the best project since it's self hosted on a VPS.

become a landchad today! https://landchad.net/

## Development Setup Guide
This guide focuses on setting up the development environment. Production deployment details are omitted since they're not needed for general development.
### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm i
   ```

3. Create a `.env` file in the backend directory with the following:
   ```
   # Database configuration
   PSQL_HOST = "database host"
   PSQL_USER = "username"
   PSQL_DATABASE = "database"
   PSQL_PASSWORD = "password"
   PSQL_PORT = "port"

   # Server configuration
   NODE_ENV=development
   
   # Note: No API key is needed for development
   ```
   
   ⚠️ **Important**: 
   - Replace the values in quotes with our actual database information
   - Do NOT include angle brackets (<>) as they cause JavaScript parsing errors

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm i
   ```

3. Create a `.env.development` file in the frontend directory with:
   ```
   REACT_APP_API_URL=http://localhost:8080/api
   ```
   
   ⚠️ **Important**:
   - No API key is needed for development
   - If you make changes to any `.env` file, you must restart the React development server
   - Run `npm start` after any `.env` file changes as React does NOT automatically recompile

### Common Issues

- **Database not loading in frontend**: Check the browser console for errors
- **Environment variables not updating**: Remember to restart the development server after changing any `.env` files
- **JavaScript syntax errors**: Make sure you're using quotes instead of angle brackets in the `.env` files
- **API giving 404:** Make sure you restart the backend after any changes.

### Starting the Application

1. Start the backend:
   ```
   cd backend
   npm start
   ```

2. Start the frontend (in a new terminal):
   ```
   cd frontend
   npm start
   ```

3. The application should now be running at `http://localhost:3000`

---

## Production Setup

For deployment to a VPS, follow these instructions:

### Backend Production Setup
- `cd backend`
- `npm i`
- **.env**:
```
# Database configuration
PSQL_HOST = "database host"
PSQL_USER = "username"
PSQL_DATABASE = "database"
PSQL_PASSWORD = "password"
PSQL_PORT = "port"

# Server configuration
NODE_ENV=production

# single API key
API_MASTER_KEY="accepted api key"
```

### Frontend Production Setup
- `cd frontend`
- `npm i`
- **.env.production:**
```
REACT_APP_API_URL=http://domain.com/api
REACT_APP_API_KEY="api key"
```

### VPS Deployment
Note that API keys are baked into the build; this is just for demoing purposes.

1. Configure the DNS to point to the domain/subdomain
2. Configure Nginx and enable the site
   - Set up SSL with certbot

3. Build the frontend:
   ```
   cd frontend
   npm run build
   cd <root>
   ```

4. Deploy the files:
   ```
   rm -rf /var/www/<domain>/backend/*
   cp -r backend/* /var/www/<domain>/backend
   rm -rf /var/www/<domain>/frontend/*
   cp -r frontend/build/* /var/www/<domain>/frontend/
   ```

5. Start the server:
   ```
   cd /var/www/<domain>/backend
   pm2 start index.js --name "project3-backend"
   ```

6. Navigate to the website. 😎

