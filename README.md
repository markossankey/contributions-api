# To start development

1. `$ nvm use`
1. `$ yarn`
1. `$ cp .env.example .env`
1. `$ docker run --name contribution-db -p 5432:5432 -e POSTGRES_PASSWORD=mysecretpassword -d postgres`
    - requires docker -- see docker website for installation
1. wait for db container to be up and running, then
    1. `$ yarn db:init`
    1. `$ yarn db:seed`
1. `$ yarn dev`

```bash
nvm use && yarn && cp .env.example .env && docker run --name contribution-db -p 5432:5432 -e POSTGRES_PASSWORD=mysecretpassword -d postgres && yarn db:init && yarn db:seed && yarn dev
```