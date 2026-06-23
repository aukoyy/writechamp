'use client';

import { Button, Dropdown, Input } from 'antd';
import english from './language-examples/english.json';
import {
  PollyClient,
  SynthesizeSpeechCommand,
  Engine,
  OutputFormat,
  TextType,
  VoiceId,
} from '@aws-sdk/client-polly';
import { useEffect, useState } from 'react';

enum Difficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
}

const { TextArea } = Input;

const Home = () => {
  const [difficulty, setDifficulty] = useState(Difficulty.Easy);
  /* const sentences = useMemo(() => {
    if (difficulty === Difficulty.Easy) return english.easySentences;
    if (difficulty === Difficulty.Medium) return english.mediumSentences;
    return english.hardSentences;
  }, [difficulty]); */

  const [userAnswer, setUserAnswer] = useState('');
  const [currentSentence, setCurrentSentence] = useState('Some sentence to start with.');
  const [feedback, setFeedback] = useState('');

  const pollyClient = new PollyClient({
    region: 'eu-west-1',
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
    },
  });

  const setNextSentence = (diff = difficulty) => {
    if (diff === Difficulty.Easy) {
      const randomSentenceIndex = Math.floor(Math.random() * english.easySentences.length);
      setCurrentSentence(english.easySentences[randomSentenceIndex]);
    } else if (diff === Difficulty.Medium) {
      const randomSentenceIndex = Math.floor(Math.random() * english.mediumSentences.length);
      setCurrentSentence(english.mediumSentences[randomSentenceIndex]);
    } else {
      const randomSentenceIndex = Math.floor(Math.random() * english.hardSentences.length);
      setCurrentSentence(english.hardSentences[randomSentenceIndex]);
    }
    setUserAnswer('');
    setFeedback('');
  };

  const changeDifficulty = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    setNextSentence(newDifficulty);
  };

  const readSentence = async () => {
    const command = new SynthesizeSpeechCommand({
      Text: currentSentence,
      OutputFormat: OutputFormat.MP3,
      VoiceId: VoiceId.Joanna, // or e.g. VoiceId.Mathieu for French
      Engine: Engine.NEURAL, // neural sounds much better than standard
      TextType: TextType.TEXT,
    });

    const response = await pollyClient.send(command);

    const byteArray = await response.AudioStream!.transformToByteArray();
    const audioBlob = new Blob([new Uint8Array(byteArray)], {
      type: 'audio/mpeg',
    });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();

    audio.onended = () => URL.revokeObjectURL(audioUrl);
  };

  const evaluateAnswer = () => {
    if (userAnswer.trim().toLowerCase() === currentSentence.trim().toLowerCase()) {
      setFeedback('Correct! Well done.');
    } else {
      setFeedback(`Incorrect. The correct sentence was: "${currentSentence}"`);
    }
  };

  return (
    <div className="flex justify-center">
      <main className="w-full max-w-2xl mt-24">
        <div>
          <h1 className="text-2xl font-bold text-center">Write like a champ!</h1>
          <Dropdown
            menu={{
              items: [
                {
                  label: 'Easy',
                  key: Difficulty.Easy,
                },
                {
                  label: 'Medium',
                  key: Difficulty.Medium,
                },
                {
                  label: 'Hard',
                  key: Difficulty.Hard,
                },
              ],
              onClick: (e) => changeDifficulty(e.key as Difficulty),
            }}
            trigger={['click']}
          >
            <Button type="text">Difficulty: {difficulty}</Button>
          </Dropdown>
        </div>
        <div className="flex justify-center mt-4 space-x-4">
          <Button type="dashed" className="mb-4 w-full" onClick={() => setNextSentence()}>
            Next Sentence
          </Button>
          <Button type="dashed" className="mb-4 w-full" onClick={readSentence}>
            Listen
          </Button>
        </div>
        <TextArea
          rows={8}
          placeholder="Write your sentence"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onPressEnter={(e) => {
            e.preventDefault();
            evaluateAnswer();
          }}
        />
        <Button type="primary" className="mt-4 w-full" onClick={evaluateAnswer}>
          Answer
        </Button>
        <p className="mt-4 text-center">{feedback}</p>
      </main>
    </div>
  );
};

export default Home;
