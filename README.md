# starting db locally

1. `$ nvm use`
1. `$ yarn`
1. `$ docker run --name contribution-db -e POSTGRES_PASSWORD=mysecretpassword -d postgres`
    - requires docker -- see docker website for installation
1. wait for db container to be up and running, then
