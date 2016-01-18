FROM node:0.12.6
MAINTAINER feng "241456911@qq.com"
WORKDIR /dockerone-crawler-docker
RUN \
    rm /etc/localtime && \
    ln -s /usr/share/zoneinfo/Asia/Shanghai /etc/localtime 
ADD ./package.json /dockerone-crawler-docker/
RUN npm install
ADD . /dockerone-crawler-docker
CMD node index.js

