# Utilise une image Node.js légère
FROM node:20-alpine

# Définit le répertoire de travail
WORKDIR /app

# Copie les fichiers de dépendances
COPY package*.json ./

# Installe toutes les dépendances
RUN npm install

# Copie le reste du code de l'application
COPY . .

# Expose le port 3000 (port par défaut de l'API)
EXPOSE 3000

# Volume pour la persistance des données
VOLUME ["/app/data"]

# Commande de démarrage
CMD ["npm", "start"]
