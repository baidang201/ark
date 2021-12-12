# noahs ark

# Project Description
A early warning system to save life

we can submit the emergencies situation will happen in 2 hours, every one in the district will get this information, then they can talk together in meeting room, people decide to evacuate or prepare for rescue.maybe save more life in 911.

In the future, we can introduce DAOs and digital identities. Users must mortgage to submit. When submitting, people near the incident are drawn to confirm that this matter is true.

# Features
1 submit
```
submit the emergencies situation
```

2 close
```
The danger is over, close situation
```

3 thank
```
If one situation help you, you can send some token to uploader
```

4 up_vote
```
vote the situation info,if the situation info is true
```

5 down_vote
```
vote the situation info, if the situation info is fake
```
# Run
## 1 install docker

mac environment：
```
https://docs.docker.com/docker-for-mac/install/
```

ubuntu environment：
```
https://docs.docker.com/engine/install/ubuntu/
```

## 2、install docker-compose
```
curl -L https://get.daocloud.io/docker/compose/releases/download/1.26.0/docker-compose-`uname -s-uname -m` > /usr/local/bin/docker-compose

chmod +x /usr/local/bin/docker-compose
```

## 3、Compile image
```
cd substrate-front-end-template
docker build -t baidang201/noahs-ark-front .

cd ../substrate-node-template
docker build -t baidang201/noahs-ark-node .
```

## 4、Start service
```
cd ..
./up.sh
```

## 5、Close service
```
./down.sh
```
