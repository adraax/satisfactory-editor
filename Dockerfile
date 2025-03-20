FROM node:23-alpine As builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN pnpm run build --configuration "production"

FROM nginx:1.27-alpine

COPY --from=builder /usr/src/app/dist/satisfactory-editor/browser /usr/share/nginx/html

