ARG RUNTIME_IMAGE=node:20-alpine

FROM $RUNTIME_IMAGE

WORKDIR /app

COPY package*.json ./

RUN yarn

COPY . .

ARG API_URL
ENV NEXT_PUBLIC_API_URL=$API_URL

RUN yarn build

EXPOSE 3000

CMD [ "yarn", "start" ]
