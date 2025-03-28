# Project 3
documented with ❤️ by yours truly, michael tran

this is, by definition, the best project since it's self hosted on a VPS.

become a landchad today! https://landchad.net/

# Installation
## Backend
- `cd backend`
- `npm i`
- **.env**:
```
# Database configuration
PSQL_HOST = <database host>
PSQL_USER = <username>
PSQL_DATABASE = <database>
PSQL_PASSWORD = <password>
PSQL_PORT = <port>

# Server configuration
NODE_ENV=production

# single API key
API_MASTER_KEY=<accepted api key>
```

## Frontend
- `cd frontend`
- `npm i`
- **.env.development:**
```
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_API_KEY=<api key>
```
- **.env.production:**
```
REACT_APP_API_URL=http://<domain.com>/api
REACT_APP_API_KEY=<api key>
```

# VPS Setup
Note that API keys are baked into the build; this is just for demoing purposes.

- Configure the DNS to point to the domain/subdomain
- Configure Nginx and enable the site
    - Set up SSL with certbot

- `cd frontend`
- `npm run build`
- `cd <root>`

- `rm -rf /var/www/<domain>/backend/*`
- `cp -r backend/* /var/www/<domain/backend`
- `rm -rf /var/www/<domain>/frontend/*`
- `cp -r frontend/build/* /var/www/<domain>/frontend/`

- Start the server:
    - `cd /var/www/<domain>/backend`
    - `pm2 start index.js --name "project3-backend"`

- Navigate to the website. 😎
