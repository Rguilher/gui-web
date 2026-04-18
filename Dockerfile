
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build -- --configuration=production

FROM nginx:alpine

COPY --from=build /app/dist/frontend-salao/browser /usr/share/nginx/html

# Expor a porta 80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
