const Survey = require('../models/Survey');
const mongoose = require('mongoose');

exports.createSurvey = async (req, res) => {
  try {
    const questions = req.body.questions.map((q) => {
      const answers = q.answers.map((a) => {
        return {
          _id: new mongoose.Types.ObjectId(),
          text: a.text,
        };
      });

      return {
        text: q.text,
        answers: answers,
      };
    });

    const survey = new Survey({
      title: req.body.title,
      description: req.body.description,
      questions: questions,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      createdBy: req.user._id,
      creationFee: 5,
      rewardPerResponse: req.body.reward,
      participantsLimit: req.body.participantsLimit,
      minimumRequiredBalance: req.body.pminbalance,
      minimumRequiredStake: req.body.pminstake,
      minimumAgeInDays: req.body.paccage,
      validatorStatus: req.body.pvalidator,
    });

    await survey.save();
    res.status(201).json({
      surveyId: survey._id
    });
  } catch (err) {
    console.error('Error in createSurvey:', err);
    res.status(400).json({ message: err.message });
  }
};

exports.getSurvey = async (req, res) => {
  try {
    const publicKey = req.headers['x-casper-public-key'];
    if (!publicKey) {
      return res.status(400).json({ message: 'x-casper-public-key header is missing' });
    }
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }
    res.status(200).json(survey);
  } catch (err) {
    console.error('Error in getSurvey:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find().populate('createdBy');
    res.json(surveys);
  } catch (err) {
    console.error('Error in getSurveys:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateSurvey = async (req, res) => {
  //TODO implement core key signed deploys

  // app.post("/deploy", async (req, res) => {
  //   let { deployJSON } = req.body;
  //   const deploy = DeployUtil.deployFromJson(deployJSON).unwrap();
  //   const folder = path.join("./", "casper_keys");
  //   const keyname = "onchainsurveys";
  //   const keyPair = Keys.Ed25519.parseKeyFiles(folder + "/" + keyname + "_public.pem", folder + "/" + keyname + "_private.pem");

  //   try {
  //     const signedDeploy = DeployUtil.signDeploy(deploy, keyPair);

  //     let deploy_hash = await client.speculativeDeploy(signedDeploy);

  //     console.log("deploy_hash is: ", deploy_hash);
  //     res.status(200).send(deploy_hash);
  //   } catch (error) {
  //     console.error(`Error while deploying from server: ${error}`);
  //     res.status(500).send({ error: error.message });
  //   }
  // });

  // app.post('/deployer', async (req, res) => {
  //   let { publicKey } = req.body;
  //   try {
  //     const folder = path.join("./", "casper_keys");
  //     const keyname = "onchainsurveys";
  //     const keyPair = Keys.Ed25519.parseKeyFiles(folder + "/" + keyname + "_public.pem", folder + "/" + keyname + "_private.pem");

  //     res.status(200).send({
  //       deployer: keyPair.publicKey.toHex(),
  //     });
  //   } catch (error) {
  //     console.error(`Error while getting deployer hash: ${error.message}`);
  //     res.status(500).send({ error: error.message });
  //   }
  // });

  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }
    if (req.user._id != survey.createdBy.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const questions = req.body.questions.map((q) => {
      const answers = q.answers.map((a) => {
        return {
          _id: a._id ? a._id : new mongoose.Types.ObjectId(),
          text: a.text,
        };
      });

      return {
        text: q.text,
        answers: answers,
      };
    });

    survey.title = req.body.title;
    survey.description = req.body.description;
    survey.questions = questions;
    survey.reward = req.body.reward;
    survey.endDate = req.body.endDate;
    survey.minimumRequiredBalance = req.body.pminbalance,
      survey.minimumRequiredStake = req.body.pminstake,
      survey.minimumAgeInDays = req.body.paccage,
      survey.validatorStatus = req.body.pvalidator,

      await survey.save();

    res.status(200).json(survey);
  } catch (err) {
    console.error('Error in updateSurvey:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }
    if (req.user._id != survey.createdBy.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await survey.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Survey deleted successfully' });
  } catch (err) {
    console.error('Error in deleteSurvey:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.submitResponse = async (req, res) => {
  // TODO handle update system with buffering as well as standard deploy and transfers


  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    const submittedAnswers = req.body.answers;
    const mappedAnswers = submittedAnswers.map((submittedAnswer, index) => {
      const question = survey.questions[index];
      const answer = question.answers.find(
        (answer) => answer.text === submittedAnswer
      );
      return answer._id;
    });

    const response = {
      user: req.user._id,
      answers: mappedAnswers,
    };
    survey.responses.push(response);
    await survey.save();
    res.status(201).json({ message: 'Response submitted successfully' });
  } catch (err) {
    console.error('Error in submitResponse:', err);
    res.status(500).json({ message: err.message });
  }
};
