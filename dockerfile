FROM node:14 AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production

FROM node:14-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD [ "node", "./bin/www" ]