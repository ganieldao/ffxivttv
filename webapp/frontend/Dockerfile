FROM node:10

WORKDIR /usr/src/frontend

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE $PORT
CMD [ "npm", "start" ]