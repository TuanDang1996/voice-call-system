# Run book
Before start running the voice call system, make sure that you've already installed docker, docker compose, npm.

1. Jump to signaling-service folder: cd ./signaling-service
2. Start system by docker-compose: docker-compose -f docker-compose-dev.yml up --build -d
3. After the app is start successfully, here is the url for each service:
   1. Media service: localhost:8899
   2. NAT service: localhost:3478
   3. Signature service: localhost:8444/signaling
   4. Mongodb service: localhost:37017