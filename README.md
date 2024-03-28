# Deployment instructions for GPT Writing Project

Each folder will need to be run for the project to be successful

## My-ai-app instructions

Initialize the environment and install dependencies

```bash
pnpm i
```

You can use yarn or pnpm if desired (I don't recall the syntax)

After initializing run the following command to start the environment

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result

If you are using the run dev command, `src/app/page.tsx` to modify the webpage. It updates automatically.


## Server Instructions

Initialize the environment and install dependencies

```bash
npm i
```

After initializing go into the server.js and change the client variable to match your client. I used MongoDB but any client should work.

Run the following command to start the environment and connect to the server

```bash
npm start 
```

Your terminal should now show that you are connected


## General Instructions

Once both folders have been run the website should be fully operational. The server folder is only needed if you wish to store to a database. ChatGPT can run without the server folder. 
