FROM node:20-alpine
WORKDIR /app

# Instalacija dep-ova
COPY package*.json ./
RUN npm ci

# Kod
COPY . .

# Vite port
EXPOSE 5173

# Pokretanje Vite dev servera (HMR)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173", "--strictPort"]
