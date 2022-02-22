FROM node:17

WORKDIR /usr/src/frontend

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE $PORT

CMD [ "npm", "start" ]