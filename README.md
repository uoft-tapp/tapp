# README

## Local Installation:
To start, we need `rvm` to install ruby. For Ubuntu, follow the instructions here: `https://github.com/rvm/ubuntu_rvm`

Then, with `rvm`, get ruby version 2.4.1 with `rvm install ruby-2.4.1`. To make sure you're always using version 2.4.1 if you have multiple versions of ruby, please do `echo 2.4.1 > .ruby-version`.

Next is the bundler for our Gemfile. Install it with `gem install bundler`.

We'll need Postgres in order to run `bundle install`, so we install Postgres
Now for our database, we use Postgres version 10.5.

To install on Ubuntu, run
```
sudo apt-get install postgresql
sudo apt-get install libpq-dev
```

For Mac, look [here](https://wikimatze.de/installing-postgresql-gem-under-ubuntu-and-mac/)

Once that finishes, run `bundle install`.

## Running Locally
Do `rails server -p 3000`. You can access the service with `http://localhost:3000`

## Docker installation
Follow the instructions for installing docker onto your OS [here](https://docs.docker.com/install/#supported-platforms)

## Running in a Docker Container
Build the image first with `docker build`

Then, once you have the image, run `docker-compose up`, and you should have a running version of the rails app.
Access it with `http://localhost:3000`

## Playbook
To get into an interactive shell of any docker image, do `docker run -it <image_name> /bin/sh` or something like that
  Example: `docker run -it tapp_tapp /bin/sh` will allow you to move into a bash shell of the `tapp` application. From there you can inspect the Gemfile, etc.

To keep the Gemfile.lock synced up with what we have on our host machine, run `docker-compose run <image> bundle install` followed by `docker-compose up --build`.
  Example: `docker-compose run tapp bundle install`.

## Known issues
GWu: Upon `docker-compose up --build`, the postgres messages show up, but not for our rails app. It's not until I hit `localhost:3000` that the messages pop up. Point is that I can't seem to know when rails goes up, unless I just assume that it's always up.

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
