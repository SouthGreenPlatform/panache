FROM debian
EXPOSE 1337 8080

RUN apt update && apt upgrade -y
RUN apt install -y curl nginx sudo

RUN curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash -
RUN apt install -y nodejs

ADD nginx.conf /etc/nginx/sites-available/panache
RUN ln -s /etc/nginx/sites-available/panache /etc/nginx/sites-enabled/panache


WORKDIR /app

CMD service nginx start && npm install && npm install @vue/cli && npm run build && npm run serve
