import InterviewAnswer from '../models/InterviewAnswer.js';
import Topic from '../models/Topic.js';
import { generateInterviewQuestions } from '../services/aiService.js';
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
      const questions = await generateInterviewQuestions(topic.name, topic.subject.name || 'Software Engineering');

      const templates = await Promise.all(
        questions.map(q =>
          InterviewAnswer.create({
            user: req.user._id,
            subject: topic.subject,
            topic: topicId,
            question: q,
            answer: '',
            confidence: 3,
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

// Save a user's answer and set confidence level
export const saveInterviewAnswer = async (req, res) => {
  const { questionId } = req.params;
  const { answer, confidence } = req.body;

  try {
    const qAnswer = await InterviewAnswer.findOne({ _id: questionId, user: req.user._id });
    if (!qAnswer) return res.status(404).json({ message: 'Question not found' });

    const isFirstTimeAnswering = qAnswer.answer === '';

    qAnswer.answer = answer;
    qAnswer.confidence = confidence;
    await qAnswer.save();

    // Reward XP/streak on new answer completed
    let xpGained = 0;
    if (isFirstTimeAnswering && answer.trim() !== '') {
      // Award 5 XP for answering a question
      xpGained = 5;
      await updateStreakActivity(req.user._id, 0.1, 0, 0, xpGained);
    }

    res.json({ message: 'Answer saved successfully', qAnswer, xpGained });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
