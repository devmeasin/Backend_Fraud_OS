## Fraud OS Backend Api Repo

### <samp>&gt; Hi there👋, I'm Mohammad Easin! 

<!-- PROJECT LOGO -->
<br />


### this starter pack for node app starter kit help your project feel free give star

Add all necessary tool like ["Prettier", "ESlint", "Auto Testing", "git hook action commit before check all code using husky lint-stage" , "API Testing", "Error Handling", "logger"] || setup specially typescript project 🎉

- 🎉 TypeScript.
- 👨‍💻 ESlint, Prettier formating & fix help to write best practices code 
- ⚙️ git hook action commit before check all code using husky lint-stage `.git`
- 🥚 setup logger for application logger `winston`
- ⚡ setup testing using `jest` for automated testing.
- 🚀 setup Express App with global error handler.

- 📫 How to reach me. =>  devmeasin@gmail.com 🥚 [Coder Easin](https://devmeasin.com)


## How to run

Please follow the below instructions to run different branches of this repository in your machine:

1. Clone this repository -
    ```sh
    git clone git@github.com:devmeasin/node_app_starter_kit.git
    ```
2. Go to the cloned project directory
    ```sh
    cd node_app_starter_kit
    ```
3. install all npm dev dependencies
    ```sh
    npm i || npm install
    ```
4. Follow the corresponding branch's README file instruction to run code.

### Dockerize your application following this command.

4. create docker image using this command
    ```sh
    docker build -t fraudos:dev -f docker/dev/Dockerfile .
    ```
    or
    ```sh
    docker build -t fraudos:dev -f your_location/Dockerfile .
    ```
5. Run Docker image run for window system

    ```sh
        docker run --rm -it -v "%cd%":/usr/src/app -v /usr/src/app/node_modules --env-file "%cd%"/.env.dev -p 5001:5001 -e NODE_ENV=dev fraudos:dev
    ```

    Mac or Lunix system

    ```sh
        docker run --rm -it -v "$(pwd)":/usr/src/app -v /usr/src/app/node_modules --env-file "$(pwd)"/.env.dev -p 5001:5001 -e NODE_ENV=dev fraudos:dev
    ```

    Run PG DB in Docker

    ```sh
        docker run --rm --name fraudos-container -e POSTGRES_USER=root -e POSTGRES_PASSWORD=root -v fraudosdata:/var/lib/postgresql/data -p 5432:5432 -d postgres
    ```
    ### After PG DB Run create database manully in pg follow db name in env or env.dev file





## Authors
-   [@devmeasin](https://www.github.com/devmeasin)

<div align="center">

### 🔗 Connected to Me
<div  style="display:flex; align-items: center; justify-content: center;">
    <a href="https://www.facebook.com/devmeasin/">
       <img  alt="FB" width="30px" src="https://img.icons8.com/fluent/2x/facebook-new.png" />
     </a>
     <a href="https://linkedin.com/in/devmeasin">
        <img  alt="Linkdein" width="27px" src="https://avatars.githubusercontent.com/u/357098?s=200&v=4" />
     </a>
       <a href="https://twitter.com/devmeasin">
         <img alt="Twitter" width="27px" src="https://avatars.githubusercontent.com/u/50278?s=200&v=4" />
       </a>
      <a href="https://www.hackerrank.com/devmeasin">
        <img  alt="HackerRank" width="27px" src="https://avatars.githubusercontent.com/u/7596827?s=460&v=4" />
      </a>
      <a href="https://app.codesignal.com/profile/devmeasin">
        <img  alt="CodeSignal" width="27px" src="https://avatars.githubusercontent.com/u/12802966?s=200&v=4" />
      </a>
<div/>

</div>

</div>
