FROM node:24-slim

WORKDIR /usr/src/app

# Install required dependencies for building better-sqlite3
RUN apt-get update \
    && apt-get install -y \
        python3 \
        make \
        g++ \
        sqlite3 \
        libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*


COPY package*.json ./

COPY . .

EXPOSE 8000

RUN cd /usr/src/app

RUN npm install && npm cache clean --force

RUN npm install -g tsc 

CMD ["npm", "run", "dev"]

