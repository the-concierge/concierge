FROM node:8-wheezy

ADD ./ /concierge
WORKDIR /concierge

RUN mkdir -p archive \
	&& mkdir -p db \
	&& mkdir -p repositories \
	&& yarn	\
	&& yarn build \
	&& yarn bundle

VOLUME /concierge/db /concierge/repositories /concierge/logs
EXPOSE 3141

ENTRYPOINT node .
