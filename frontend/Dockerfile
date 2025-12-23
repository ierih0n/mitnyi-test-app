# Stage 1: Build the React app
FROM node:18-alpine as build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the app
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:stable-alpine

# Copy the build output to replace the default Nginx public folder
COPY --from=build /app/build /usr/share/nginx/html

# Copy the nginx config file and startup script
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY startup.sh /startup.sh
RUN chmod +x /startup.sh

# Expose port 80
EXPOSE 80

# Start Nginx using the startup script
CMD ["/startup.sh"]
