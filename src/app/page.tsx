'use client';

import { Button, Input } from 'antd';

const { TextArea } = Input;

const Home = () => {
  return (
    <div className="flex justify-center">
      <main className="w-full max-w-2xl mt-24">
        <TextArea rows={8} placeholder="Write your sentence" />
        <Button type="primary" className="mt-4">
          Answer
        </Button>
      </main>
    </div>
  );
};

export default Home;
