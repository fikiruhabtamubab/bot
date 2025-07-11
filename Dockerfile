# Use an official lightweight Node.js runtime
FROM node:18-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# The command to start your bot
CMD [ "node", "bot.js" ]