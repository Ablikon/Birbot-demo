FROM node:20

# делаем каталог 'app' текущим рабочим каталогом
WORKDIR /app

# копируем файлы и каталоги проекта в текущий рабочий каталог (т.е. в каталог 'app')
COPY . .

# устанавливаем зависимости проекта
RUN apt-get install python3 -y

RUN PYTHON=/usr/bin/python3 npm install --legacy-peer-deps

RUN npm run build

EXPOSE 30080
CMD npm run start:prod --trace-gc

# to build: docker build -t imageName .
# to start: docker run -e ENVIRONMENT="staging" imageName
