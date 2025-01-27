# Shikshagrah

## Host App

### shikshagraha-app

Next JS, run:

```sh
nx dev shikshagraha-app --port=3000 --verbose
```

Port : `3000`

##

## Micro Frontend List

### content

Next JS, run:

```sh
nx dev content --port=4301 --verbose
```

basePath : `http://localhost:4301/mfe_content/`
Port : `4301`

##

## NX Command

### View Nx Graph

` nx graph`

### Build All Project

`npx nx run-many --target=build --all`

### Install NX Globally

`npm install -g nx`

## Notes

## use shared library in any project

```sh
import { SharedLib } from '@shared-lib';
```

## Build using docker, use:

```sh
sudo docker build -f Dockerfile -t shikshagraha-app .
```

## Deploy using docker, use:

```sh
sudo docker run -p 3000:3000 -p 4301:4301 shikshagraha-app
```
   