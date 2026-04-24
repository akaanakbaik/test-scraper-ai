FROM node:20-bookworm

RUN apt-get update && apt-get install -y python3 python3-pip curl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /sandbox

CMD ["bash"]