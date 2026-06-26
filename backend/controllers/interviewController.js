import InterviewAnswer from '../models/InterviewAnswer.js';
import Topic from '../models/Topic.js';
import Subject from '../models/Subject.js';
import { generateInterviewQuestions, evaluateInterviewAnswer } from '../services/aiService.js';
import { updateStreakActivity } from '../services/gamificationService.js';

// Fetch interview questions for a topic (generates if not yet created)
export const getTopicQuestions = async (req, res) => {
  const { topicId } = req.params;

  try {
    const topic = await Topic.findOne({ _id: topicId, user: req.user._id });
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    // Check if questions are already generated
    let answers = await InterviewAnswer.find({ topic: topicId, user: req.user._id });

    if (answers.length === 0) {
      // Generate questions via AI service
      const subject = await Subject.findById(topic.subject);
      const questions = await generateInterviewQuestions(topic.name, subject?.name || 'Software Engineering');

      const templates = await Promise.all(
        questions.map(q =>
          InterviewAnswer.create({
            user: req.user._id,
            subject: topic.subject,
            topic: topicId,
            question: q,
            answer: '',
          })
        )
      );
      answers = templates;
    }

    res.json(answers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Save a user's answer and evaluate it
export const saveInterviewAnswer = async (req, res) => {
  const { questionId } = req.params;
  const { answer } = req.body;

  try {
    const qAnswer = await InterviewAnswer.findOne({ _id: questionId, user: req.user._id });
    if (!qAnswer) return res.status(404).json({ message: 'Question not found' });

    const isFirstTimeAnswering = qAnswer.answer === '';
    const topic = await Topic.findOne({ _id: qAnswer.topic, user: req.user._id });

    qAnswer.answer = answer;
    qAnswer.evaluation = {
      ...(await evaluateInterviewAnswer({
        topicName: topic?.name || 'this topic',
        question: qAnswer.question,
        answer,
      })),
      evaluatedAt: new Date(),
    };
    await qAnswer.save();

    // Reward XP/streak on new answer completed
    let xpGained = 0;
    if (isFirstTimeAnswering && answer.trim() !== '') {
      // Award 5 XP for answering a question
      xpGained = 5;
      await updateStreakActivity(req.user._id, 0.1, 0, 0, xpGained);
    }

    res.json({
      message: 'Answer evaluated successfully',
      qAnswer,
      evaluation: qAnswer.evaluation,
      xpGained,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
