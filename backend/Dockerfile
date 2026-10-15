FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# NEXT_PUBLIC_* values are inlined at build time, so the backend URL used
# by the Next.js API routes must be passed as a build arg.
ARG NEXT_PUBLIC_API_URL=http://backend:5002/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["npm", "start"]
