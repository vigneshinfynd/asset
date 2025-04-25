npm install --legacy-peer-deps
npm instll --force
npm install react-day-picker@latest
npm install pg --legacy-peer-deps
npm install pg --force
npm install jade
npm install pug

import data:
npx sequelize-cli seed:generate --name seed-initial-data


To start:
node .\app.js

if db doesn't exist then execute,
CREATE DATABASE asset;


Query:
INSERT INTO transaction_types ("id", "name", "createdAt", "updatedAt")
VALUES (1, 'Default Transaction Type', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

#env

# Database Configuration
DB_USERNAME=postgres
DB_PASSWORD=newpassword
DB_NAME=asset
DB_HOST=localhost

# Application Configuration
PORT=3000
NODE_ENV=development
