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

Then either run locally, or use Docker (see below).

### Local (without Docker)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docker

This repo ships a **production** image: it runs `next build` inside Docker, then starts the compiled server. Day-to-day coding with hot reload is still `npm run dev` on your machine.

Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) once, keep the `.env` file from Setup, then from the project root:

```bash
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000). Stop with `Ctrl+C`, then `docker compose down` to remove the container.

`--build` rebuilds the image so code or env-var changes are picked up. The first build is slow (npm install + Next.js compile); later builds reuse cached layers when `package.json` / `package-lock.json` have not changed.

### What the files do

| File | Role |
| --- | --- |
| `Dockerfile` | Recipe: install deps, build Next.js, copy the small standalone server into a final image |
| `.dockerignore` | Files *not* sent into the build (e.g. `node_modules`, `.env`, `.git`) |
| `docker-compose.yml` | One-command wrapper around `docker build` + `docker run` |
| `next.config.ts` | `output: "standalone"` makes Next.js emit `.next/standalone` (tiny production server) |

`NEXT_PUBLIC_*` variables are **inlined into the client JavaScript at build time**. They must be passed as Docker **build args**, not only as runtime `-e` flags. Compose reads your existing `.env` and forwards those two keys into the build. `.dockerignore` still keeps `.env` from being copied into the image as a file.

If you change the AWS keys, rebuild (`docker compose up --build`). Restarting the container is not enough.

### Equivalent commands without Compose

```bash
docker build \
  --build-arg NEXT_PUBLIC_AWS_ACCESS_KEY_ID="$NEXT_PUBLIC_AWS_ACCESS_KEY_ID" \
  --build-arg NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY="$NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY" \
  -t writechamp .

docker run --rm -p 3000:3000 writechamp
```

Load the keys into your shell first (`source .env` or export them). `-p 3000:3000` maps host port 3000 to container port 3000. `--rm` deletes the container when it stops.
