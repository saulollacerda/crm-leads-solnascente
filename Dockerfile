FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 3000

# O que roda ao subir (migrations, client do Prisma, next dev) está no
# `command` do docker-compose.yml, junto das variáveis de que depende.
CMD ["npm", "run", "dev"]
