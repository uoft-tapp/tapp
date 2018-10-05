# TAPP
TA application, assignment, and matching.

## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. The entire application is Dockerized, using Ruby 2.5.1 and a Postgres database.

### Prerequisties

1. [Docker](https://docs.docker.com/install/#supported-platforms)
2. For Linux users only, [Docker Compose](https://docs.docker.com/compose/install/)

### Running in a Docker Container
Clone this repo, navigate into the cloned directory, and run 
```
docker-compose-up
```

This will launch two containers: a rails app, and a postgres database. Access the rails app by navigating to `http://localhost:3000`

If you have an existing image on your machine that needs to be updated, run
```
docker-compose-up --build
```

## Annotations
To annotate, please run `bundle exec annotate -p bottom`. Make sure you're in the docker container.

## Playbook
To get into an interactive shell of any docker image, do `docker run -it <image_name> /bin/sh` or something like that
  Example: `docker run -it tapp_tapp /bin/sh` will allow you to move into a bash shell of the `tapp` application. From there you can inspect the Gemfile, etc.

To keep the Gemfile.lock synced up with what we have on our host machine, run `docker-compose run <image> bundle install` followed by `docker-compose up --build`.
  Example: `docker-compose run tapp bundle install`.

If you need to modify a migration file, please do the following within the docker image:
`docker run -it <image_name> sh`
`rake db:down VERSION=####` where the #### is the version you want to down from `rake db:migrate:status`.
Modify your file
`rake db:migrate`

This README would normally document whatever steps are necessary to get the
application up and running.

Things you may want to cover:

* Ruby version

* System dependencies

* Configuration

* Database creation

* Database initialization

* How to run the test suite

* Services (job queues, cache servers, search engines, etc.)

* Deployment instructions

* ...
