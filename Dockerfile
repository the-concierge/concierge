FROM mhart/alpine-node:8

ADD ./ /concierge
WORKDIR /concierge

RUN apk update \
	&& apk add git \
	&& mkdir -p archive \
	&& mkdir -p db \
	&& mkdir -p repositores \
	&& yarn	\
	&& yarn build \
	&& yarn bundle

VOLUME /concierge/db /concierge/repositories /concierge/logs
EXPOSE 3141

ENTRYPOINT node .
