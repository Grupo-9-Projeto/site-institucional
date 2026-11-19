FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx @tailwindcss/cli -i ./src/input.css -o ./src/output.css --minify && \
    mkdir -p ./dist && \
    cp ./src/output.css ./dist/output.css

FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/src/ /usr/share/nginx/html/
COPY --from=build /app/src/ /usr/share/nginx/html/src/
COPY --from=build /app/dist/ /usr/share/nginx/html/dist/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]