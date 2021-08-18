FROM node:10

WORKDIR /usr/src/webapp

COPY package*.json ./

RUN npm install

COPY . .

RUN cd frontend && npm run build

EXPOSE $PORT
CMD [ "npm", "start" ]