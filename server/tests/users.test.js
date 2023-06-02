const { getUser, activateUser } = require('../src/controllers/users');
const User = require('../src/models/User');

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
const opts = { useNewUrlParser: true, useUnifiedTopology: true };

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, opts);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Users Controller', () => {
    afterEach(async () => {
        await User.deleteMany();
    });

    test('getUser should return a specific user', async () => {
        // Prepare a user instance
        const user1 = new User({ publicAddress: '0x1234', email: 'test@asd.com' });
        await user1.save();
      
        // Mock request and response objects
        const req = {
          params: {
            userId: user1._id,
          },
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
      
        // Call the function
        await getUser(req, res);
      
        // Check if the user is returned
        const jsonResponse = res.json.mock.calls[0][0];
        expect(jsonResponse.user).toBeDefined();
      
        // Check if the returned user matches the created user
        expect(jsonResponse.user._id.toString()).toBe(user1._id.toString());
        expect(jsonResponse.user.publicAddress).toBe(user1.publicAddress);
      });
      

    test('activateUser should activate a user successfully', async () => {
        // Prepare a user instance
        const user = new User({ publicAddress: '019692e48866ac2d5c9b6b53794af36848fdc403035dc2d22114850b4d7de90c0c', email: 'test2@asd.com' });
        await user.save();

        // Mock fetchCsprLiveAccountData function to return a page count of 1
        const fetchCsprLiveAccountData = jest.fn(() => 1);

        // Mock request and response objects
        const req = {
            params: {
                userId: user._id,
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Call the function
        await activateUser(req, res, fetchCsprLiveAccountData);

        // Check if the response status is 200
        expect(res.status).toHaveBeenCalledWith(200);

        // Check if the user is activated
        const updatedUser = await User.findById(user._id);
        expect(updatedUser.active).toBe(true);
    });

    test('activateUser should return 201 with message if user has exceeded activation attempts', async () => {
        // Prepare a user instance with 3 attempts
        const user = new User({ publicAddress: '0x1234', attempts: 3 });
        await user.save();

        // Mock fetchCsprLiveAccountData function to return a page count of 1
        const fetchCsprLiveAccountData = jest.fn(() => 1);

        // Mock request and response objects
        const req = {
            params: {
                userId: user._id,
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Call the function
        await activateUser(req, res, fetchCsprLiveAccountData);

        // Check if the response status is 201 and the message matches the expected value
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json.mock.calls[0][0].success).toBe(false);
        expect(res.json.mock.calls[0][0].message).toBe('User has exceeded activation attempts, and got banned permanently');

        // Check if the user is banned and has exceeded the activation attempts
        const updatedUser = await User.findById(user._id);
        expect(updatedUser.active).toBe(false);
        expect(updatedUser.attempts).toBe(3);
    });

    test('activateUser should return success true and message User is already active for an already active user', async () => {
        // Prepare an active user
        const user = new User({ publicAddress: '0x1234', active: true });
        await user.save();
    
        // Mock request and response objects
        const req = {
            params: {
                userId: user._id,
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    
        // Call the function
        await activateUser(req, res);
    
        // Check if the response status is 200 and the message matches the expected value
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json.mock.calls[0][0].success).toBe(true);
        expect(res.json.mock.calls[0][0].message).toBe('User is already active');
    
        // Check if the user is still active and has not exceeded the activation attempts
        const updatedUser = await User.findById(user._id);
        expect(updatedUser.active).toBe(true);
        expect(updatedUser.attempts).toBe(0);
    });

});
