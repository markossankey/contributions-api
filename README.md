# To start development

### TL;DR
```bash
git clone https://github.com/markossankey/contributions-api.git && cd contributions-api && nvm use && yarn && cp .env.example .env && docker run --name contribution-db -p 5432:5432 -e POSTGRES_PASSWORD=mysecretpassword -d postgres 
```

wait a couple of seconds for db to accept queries, then 

```bash
yarn db:init && yarn db:seed && yarn dev
```

1. `$ git clone https://github.com/markossankey/contributions-api.git`
1. `$ cd contributions-api`
1. `$ nvm use`
1. `$ yarn`
1. `$ cp .env.example .env`
1. `$ docker run --name contribution-db -p 5432:5432 -e POSTGRES_PASSWORD=mysecretpassword -d postgres`
   - requires docker -- see docker website for installation
1. wait for db container to be up and running, then
   1. `$ yarn db:init`
   1. `$ yarn db:seed`
1. `$ yarn dev`


# Clean-up

### TL;DR
```bash
docker container rm -f contribution-db &&
cd .. && rm -rf contributions-api
```

1. `$ docker container rm -f contribution-db`
1. `$ cd .. && rm -rf contributions-api`
