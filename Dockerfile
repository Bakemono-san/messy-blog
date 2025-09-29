FROM node:18-alpine

WORKDIR /usr/src/app

# copy package and install first for better caching
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --production

COPY . .

EXPOSE 4000

CMD ["node", "index.js"]
