# Estágio 1: compila o TypeScript e gera o Prisma Client.
FROM node:20-slim AS builder

# Instala a biblioteca de segurança (OpenSSL) que o Prisma exige
RUN apt-get update -y && apt-get install -y openssl

# Define a pasta de trabalho dentro da imagem.
WORKDIR /usr/src/app

# Copia manifestos e schema antes das fontes para aproveitar cache.
COPY package*.json ./
COPY prisma ./prisma/

# Instala dependências de produção e desenvolvimento para compilar.
RUN npm install

# Gera o cliente Prisma usado pelo backend.
RUN npx prisma generate

# Copia as demais fontes, telas e configurações.
COPY . .

# Transpila TypeScript para JavaScript em dist/.
RUN npm run build

# Estágio 2: imagem final somente com o artefato executável.
FROM node:20-slim

# Instala a biblioteca na versão final também
RUN apt-get update -y && apt-get install -y openssl

# Mantém a mesma pasta de execução do estágio anterior.
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/public ./public

# Documenta a porta HTTP usada pela API.
EXPOSE 3000

# Inicia o JavaScript compilado quando o container sobe.
CMD ["npm", "start"]