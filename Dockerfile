FROM node:carbon

RUN apt-get update

ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /usr/src/cd && cp -a /tmp/node_modules /usr/src/cd

WORKDIR /usr/src/cd
ADD . /usr/src/cd

RUN chmod +x ./start.sh
CMD [ "node app.js" ]
