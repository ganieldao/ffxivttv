FROM node:16

WORKDIR /usr/src/webapp

COPY package*.json ./

RUN npm install

COPY . .

RUN cd frontend2 && npm run build

EXPOSE $PORT
CMD [ "npm", "start" ]