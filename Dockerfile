FROM node:12

WORKDIR /home/wowjs

COPY . /home/wowjs

RUN npm install

CMD npm run app

EXPOSE 3000

