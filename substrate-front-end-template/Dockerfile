# docker build -t baidang201/noahs-ark-front .
FROM node:14

ADD . /front

WORKDIR /front
RUN yarn install
ARG ENDPOINT
ARG PORT

ENV ENDPOINT ${ENDPOINT}
ENV PORT ${PORT}

CMD yarn start