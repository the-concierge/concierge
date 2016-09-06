FROM node:6

ADD ./ /concierge
WORKDIR /concierge

RUN apt-get install git -y

RUN rm -rf node_modules \
	&& rm -rf archive \
	&& rm -rf db \
	&& mkdir archive \
	&& mkdir db \
	&& npm install
	&& npm run build

VOLUME ["/concierge/db"]

CMD ["node", "."]
