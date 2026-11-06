
# Etapa 1: Compilar o Tailwind
FROM node:22-alpine AS build

WORKDIR /app

# Copia os arquivos necessários para instalar as dependências
COPY package.json ./

# Instala as dependências
RUN npm install

# Copia o código do front-end
COPY src ./src

# Compila o CSS do Tailwind
RUN npm run build


# Etapa 2: Disponibilizar o site com Nginx
FROM nginx:alpine

# Configuração personalizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos HTML, CSS e JS já compilados
COPY --from=build /app/src /usr/share/nginx/html/src

# Porta utilizada pelo Nginx dentro do container
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
