FROM node:20-alpine AS css
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY src ./src
RUN npx @tailwindcss/cli -i ./src/input.css -o ./src/output.css --minify

FROM nginx:alpine
COPY --from=css /app/src /usr/share/nginx/html/src
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  location = / { return 302 /src/index.html; }\n}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 80