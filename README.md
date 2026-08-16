# WriteChamp

A dictation practice app: listen to a sentence, type what you heard, and check if you got it right. Difficulty can be set to easy, medium, or hard. Speech is synthesized with [Amazon Polly](https://aws.amazon.com/polly/).

## Setup

Create a user with `AmazonPollyFullAccess`. Create a new access key for this user.

- Click Create access key
- Choose Application running outside AWS
- Create a description
- Copy the keys into the .env file in the next step

Create a `.env` file in the project root (it is gitignored) with your AWS credentials:

```
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=
```

These keys need permission to call Polly (`SynthesizeSpeech`) in `eu-west-1`.

Then install dependencies and start the app:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
