FROM mhart/alpine-node:8

ADD ./ /concierge
WORKDIR /concierge

RUN apk update \
	&& apk add git \
	&& mkdir archive \
	&& mkdir db \
	&& mkdir repositores \
	&& yarn	\
	&& yarn build \
	&& yarn bundle

VOLUME /concierge/db concierge/repositories concierge/logs

ENTRYPOINT node .
