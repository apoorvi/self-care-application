const MOCK_SESSION = {
  session: 'morning',
  total_duration_mins: 10,
  tasks: [
    { category: 'mental', name: 'Box Breathing', duration_mins: 5, instructions: 'Inhale 4, hold 4, exhale 4.', why: 'Good for morning calm.' },
    { category: 'reading', name: 'Read Article', duration_mins: 5, instructions: 'Pick one article. Write 3 takeaways.', why: null }
  ]
};

const MOCK_TASK = {
  category: 'exercise',
  name: 'Bodyweight Squats',
  duration_mins: 3,
  instructions: '3 sets of 10.',
  why: 'Alternative suggested.'
};

jest.mock('@anthropic-ai/sdk', () => {
  const makeStream = (jsonPayload) => {
    let textCb;
    const stream = {
      on: jest.fn((event, cb) => { if (event === 'text') textCb = cb; return stream; }),
      finalMessage: jest.fn().mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(jsonPayload) }]
      })
    };
    setTimeout(() => textCb && textCb(JSON.stringify(jsonPayload)), 0);
    return stream;
  };

  return {
    default: jest.fn().mockImplementation(() => ({
      messages: {
        stream: jest.fn().mockReturnValue(makeStream(MOCK_SESSION)),
        create: jest.fn().mockResolvedValue({
          content: [{ type: 'text', text: JSON.stringify(MOCK_TASK) }]
        })
      }
    }))
  };
});
