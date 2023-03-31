process.env.JWT_SECRET = 'test-secret';

const {
    createSurvey,
    getSurvey,
    getSurveys,
    updateSurvey,
    deleteSurvey,
    submitResponse,
} = require('../src/controllers/surveys');
const Survey = require('../src/models/Survey');
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

describe('Surveys Controller', () => {
    let userId;

    beforeAll(async () => {
        const user = new User({ publicAddress: '0x1234' });
        await user.save();
        userId = user._id;
    });

    afterAll(async () => {
        await Survey.deleteMany();
    });

    afterEach(async () => {
        await Survey.deleteMany();
        await User.deleteMany();
    });

    test('createSurvey should create a new survey and return it', async () => {
        const req = {
            body: {
                title: 'Test Survey',
                questions: [
                    {
                        text: 'What is your favorite color?',
                        answers: [
                            { text: 'Red' },
                            { text: 'Green' },
                            { text: 'Blue' },
                        ],
                    },
                ],
                startDate: new Date(),
                endDate: new Date(),
                createdBy: userId,
                creationFee: 10,
                rewardPerResponse: 1,
            },
            user: {
                _id: userId,
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await createSurvey(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        const jsonResponse = res.json.mock.calls[0][0];
        expect(jsonResponse.title).toBe(req.body.title);
        expect(jsonResponse.description).toBe(req.body.description);
        expect(jsonResponse.createdBy.toString()).toBe(req.user._id.toString());
    });

    test('getSurvey should return a survey by its ID', async () => {
        // Prepare a survey
        const survey = new Survey({
            title: 'Test Survey',
            questions: [
                {
                    text: 'What is your favorite color?',
                    answers: [
                        { text: 'Red' },
                        { text: 'Green' },
                        { text: 'Blue' },
                    ],
                },
            ],
            startDate: new Date(),
            endDate: new Date(),
            createdBy: userId,
            creationFee: 10,
            rewardPerResponse: 1,
        });
        await survey.save();

        // Mock request and response objects
        const req = {
            headers: {
                'x-casper-public-key': 'sample-public-key',
            },
            params: {
                id: survey._id,
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Call the function
        await getSurvey(req, res);

        // Check if the response status is 200 and the survey is returned
        const jsonResponse = res.json.mock.calls[0][0];
        expect(jsonResponse._id.toString()).toBe(survey._id.toString());
        expect(jsonResponse.title).toBe(survey.title);
    });

    test('getSurveys should return all surveys', async () => {
        // Prepare two survey instances
        const survey1 = new Survey({
            title: 'Test Survey 1',
            questions: [],
            startDate: new Date(),
            endDate: new Date(),
            createdBy: userId,
            creationFee: 10,
            rewardPerResponse: 1,
        });
        await survey1.save();

        const survey2 = new Survey({
            title: 'Test Survey 2',
            questions: [],
            startDate: new Date(),
            endDate: new Date(),
            createdBy: userId,
            creationFee: 10,
            rewardPerResponse: 1,
        });
        await survey2.save();

        // Mock request and response objects
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Call the function
        await getSurveys(req, res);

        // Check if the surveys are returned
        const jsonResponse = res.json.mock.calls[0][0];
        expect(jsonResponse.length).toBe(2);

        // Check if the returned surveys match the created surveys
        expect(jsonResponse[0]._id.toString()).toBe(survey1._id.toString());
        expect(jsonResponse[0].title).toBe(survey1.title);
        expect(jsonResponse[1]._id.toString()).toBe(survey2._id.toString());
        expect(jsonResponse[1].title).toBe(survey2.title);
    });

    test('updateSurvey should update a survey and return it', async () => {
        // Prepare a survey instance
        const survey = new Survey({
            title: 'Test Survey',
            questions: [],
            startDate: new Date(),
            endDate: new Date(),
            createdBy: userId,
            creationFee: 10,
            rewardPerResponse: 1,
        });
        await survey.save();

        // Mock request and response objects
        const req = {
            params: {
                id: survey._id,
            },
            body: {
                title: 'Updated Test Survey',
                questions: [
                    {
                        text: 'Updated question?',
                        answers: [{ text: 'Yes' }, { text: 'No' }],
                    },
                ],
            },
            user: {
                _id: userId,
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Call the function
        await updateSurvey(req, res);

        // Check if the response status is 200
        expect(res.status).toHaveBeenCalledWith(200);

        // Check if the survey is updated
        const jsonResponse = res.json.mock.calls[0][0];
        expect(jsonResponse._id.toString()).toBe(survey._id.toString());
        expect(jsonResponse.title).toBe(req.body.title);
        expect(jsonResponse.questions.length).toBe(1);
        expect(jsonResponse.questions[0].text).toBe(req.body.questions[0].text);
    });

    test('deleteSurvey should delete a survey by its ID', async () => {
        // Create a survey to delete
        const survey = new Survey({
            title: 'Test Survey to Delete',
            questions: [],
            startDate: new Date(),
            endDate: new Date(),
            createdBy: userId,
            creationFee: 10,
            rewardPerResponse: 1,
        });
        await survey.save();

        const req = {
            params: {
                id: survey._id,
            },
            user: {
                _id: userId,
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await deleteSurvey(req, res);

        // Check if the response status is 200 and the survey is deleted
        expect(res.status).toHaveBeenCalledWith(200);
        const jsonResponse = res.json.mock.calls[0][0];
        expect(jsonResponse.message).toBe('Survey deleted successfully');

        // Check if the survey is actually deleted from the database
        const deletedSurvey = await Survey.findById(survey._id);
        expect(deletedSurvey).toBeNull();
    });

    test('submitResponse should submit a response to a survey', async () => {
        // Prepare a survey
        const survey = new Survey({
            title: 'Test Survey',
            questions: [
                {
                    text: 'What is your favorite color?',
                    answers: [
                        { text: 'Red' },
                        { text: 'Green' },
                        { text: 'Blue' },
                    ],
                },
            ],
            startDate: new Date(),
            endDate: new Date(),
            createdBy: userId,
            creationFee: 10,
            rewardPerResponse: 1,
        });
        await survey.save();
    
        // Prepare a user
        const user = new User({
            publicAddress: '0x1234',
        });
        await user.save();
    
        // Prepare a response
        const response = {
            user: user._id,
            answers: [
                 'Red'
            ],
        };
    
        // Mock request and response objects
        const req = {
            params: {
                id: survey._id,
            },
            user: {
                _id: user._id,
            },
            body: {
                answers: response.answers,
            },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    
        // Call the function
        await submitResponse(req, res);
    
        // Check if the response status is 201
        expect(res.status).toHaveBeenCalledWith(201);
    
        // Check if the survey response is created
        const updatedSurvey = await Survey.findById(survey._id);
        const surveyResponse = updatedSurvey.responses[0];
        expect(surveyResponse.user.toString()).toBe(user._id.toString());
        expect(surveyResponse.answers.length).toBe(1);
        expect(surveyResponse.answers[0].questionIndex).toBe(response.answers[0].questionIndex);
        expect(surveyResponse.answers[0].answerIndex).toBe(response.answers[0].answerIndex);
    });
    

});

