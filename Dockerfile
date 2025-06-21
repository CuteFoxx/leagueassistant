FROM node:24-alpine

WORKDIR /usr/src/app

COPY package*.json ./

COPY . .

EXPOSE 8000

RUN cd /usr/src/app

RUN npm install

RUN npm install -g tsc 

CMD ["npm", "run", "dev"]

