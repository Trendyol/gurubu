ARG RUNTIME_IMAGE=node:20-alpine

FROM $RUNTIME_IMAGE

WORKDIR /app

COPY package*.json ./

RUN yarn

COPY . .

RUN yarn build

EXPOSE 3000

CMD [ "yarn", "start" ]