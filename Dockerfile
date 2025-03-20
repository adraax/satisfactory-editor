FROM node:23-alpine As builder

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build --prod

FROM nginx:1.27-alpine

COPY --from=builder /usr/src/app/dist/SampleApp/ /usr/share/nginx/html
