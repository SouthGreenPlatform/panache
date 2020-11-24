FROM debian
EXPOSE 80 8080

RUN apt update && apt upgrade -y
RUN apt install -y curl nginx sudo

RUN curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash -
RUN apt install -y nodejs

ADD . /app
WORKDIR /app

RUN npm install -g @vue/cli && npm install

CMD npm run serve
