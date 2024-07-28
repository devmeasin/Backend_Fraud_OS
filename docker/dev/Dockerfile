# Use the official Node.js image as our base
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# install nodemon globally
RUN npm install nodemon -g

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install app dependencies
RUN npm i

# Copy the rest of our app's source code into the container
COPY . .

# Expose the port the app will run on
EXPOSE 5001

# The command to run our app
CMD ["npm", "run", "dev"]