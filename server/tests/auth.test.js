process.env.JWT_SECRET = 'test-secret';

const { register, loginWithWallet } = require('../src/controllers/auth');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
const opts = { useNewUrlParser: true, useUnifiedTopology: true };

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    try {
        await mongoose.connect(mongoUri, opts);
    } catch (err) {
        console.error(err);
    }
});


afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Auth Controller', () => {

    test('register should update user with email if user exists without email', async () => {
        // Create a user without an email
        const publicAddress = '0x1234';
        const user = new User({ publicAddress });
        await user.save();

        // Mock req and res objects
        const req = {
            body: {
                publicAddress,
                email: 'test@example.com',
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await register(req, res);

        // Check if the response status is 200 and the user's email is updated
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'User updated successfully',
        });

        // Check if the user's email is updated in the database
        const updatedUser = await User.findOne({ publicAddress });
        expect(updatedUser.email).toBe(req.body.email);
    });

    // Add this import at the top of your test file
    const { register, loginWithWallet } = require('../src/controllers/auth');

    // Add this test case in the 'Auth Controller' describe block
    test('loginWithWallet should create a new user if not exists and return a JWT token', async () => {
        const publicAddress = '0x1234';

        const req = {
            body: {
                publicAddress,
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await loginWithWallet(req, res);

        // Check if the response status is 200 and a JWT token is returned
        expect(res.status).toHaveBeenCalledWith(200);
        const jsonResponse = res.json.mock.calls[0][0];
        expect(jsonResponse.message).toBe('Authentication with wallet was successful');
        expect(jsonResponse.token).toBeDefined();
        expect(jsonResponse.userId).toBeDefined();
        expect(jsonResponse.alreadySigned).toBe(false);

        // Check if the user is created in the database
        const user = await User.findOne({ publicAddress });
        expect(user).toBeDefined();
    });


    afterEach(async () => {
        await User.deleteMany();
    });
});
