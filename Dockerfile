# 1️⃣ Node 20 버전으로 변경
FROM node:20 AS build

# 2️⃣ 작업 디렉토리 설정
WORKDIR /app

# 3️⃣ 패키지 설치
COPY package.json package-lock.json ./
RUN npm install

# 4️⃣ 코드 복사
COPY . .

# 5️⃣ 환경 변수 적용 및 빌드
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# 6️⃣ 배포 이미지 설정
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# 7️⃣ Nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
