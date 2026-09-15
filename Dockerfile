FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 3000

# O client do Prisma é gerado a cada start: o engine é específico do sistema,
# e o que existe no host (macOS/Windows) não roda no container (linux).
CMD ["sh", "-c", "npx prisma generate && npm run dev"]
