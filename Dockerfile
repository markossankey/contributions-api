FROM node:19-alpine

WORKDIR /app
COPY package.json .
COPY yarn.lock .
COPY prisma ./prisma/
RUN yarn install

COPY . .

RUN yarn build

CMD ["yarn", "start"]
EXPOSE 8000