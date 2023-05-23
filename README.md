# Casper Onchain Surveys

Casper Onchain Surveys is a survey platform built on top of the Casper blockchain. This project allows users to create and participate in surveys while ensuring the data is securely stored on the blockchain.

## Project Structure

This project is divided into two parts: a client-side React application and a server-side Node.js application.

## Getting Started

**NOTE: YOU MUST HAVE AN ACTIVE ACCOUNT IN CASPER BLOCK CHAIN TO USE THIS APPLICATION!**

To get started, follow these steps:

1. Clone the repository.
2. Install dependencies for both the client and the server.
3. Create environment file for the server.
4. Launch a MongoDB
5. Run the client and the server.

### Clone the Repository

```bash
git clone https://github.com/yunusem/onchainsurveys.git
cd onchainsurveys
```

### Install Dependencies
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### Create Environment Files
```bash
# Create .env file under server directory
cd server
touch .env
```

Include the following variables in the .env file:

```
MONGODB_URI=mongodb://localhost:27017/onchainsurveys
JWT_SECRET=your_jwt_secret
PORT=3001
RPC=http://3.136.227.9:7777/rpc
```
### Launch a MongoDB
#### Local MongoDB
1. Install MongoDB on your local machine following the official documentation.
2. Start the MongoDB service.
3. Update the MONGODB_URI in the server's .env file with your local MongoDB connection string:
```bash
MONGODB_URI=mongodb://localhost:27017/onchainsurveys
```
#### MongoDB Atlas
1. Create a free account on MongoDB Atlas.
2. Set up a new cluster.
3. Obtain the connection string for your cluster.
4. Update the MONGODB_URI in the server's .env file with the obtained connection string:
```bash
MONGODB_URI=your_mongodb_atlas_connection_string
```

### Run the Client and the Server
Client
```bash
cd client
npm start
```
This will start the client-side React application at http://localhost:3000

Server
```bash
cd ../server
npm start
```
This will start the server-side Node.js application at http://localhost:3001

## Testing

Simply run:

```
npm install --only=dev
npm test
```

for each module inside both `client` and `server` directories.
