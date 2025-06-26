Here is the `.env` section in English for your `README.md`:

````markdown
## .env File

To ensure the application runs correctly, please create a `.env` file in the root directory of each service and configure the following environment variables.

### General variables:

- **DATABASE_URL**: URL for connecting to the PostgreSQL database.
  ```bash
  DATABASE_URL=postgresql://dev:dev@postgres:5432/events
  # For local database (uncomment if needed):
  # DATABASE_URL="postgresql://dev:dev@localhost:5433/events"
````

### NATS variables:

* **NATS\_URL**: URL for connecting to the NATS server.

  ```bash
  NATS_URL='nats://nats:4222'
  # For local NATS server (uncomment if needed):
  # NATS_URL='nats://localhost:4222'
  ```

* **NATS\_SUBJECT**: The subject to which collectors subscribe to receive events from the `gateway`.

  ```bash
  NATS_SUBJECT="events.facebook.>"
  ```

### HTTP settings:

* **PORT**: The port on which the HTTP service will run.

  ```bash
  PORT=3002
  ```

### Observability settings:

* **LOG\_LEVEL**: The logging level. Possible values: `info`, `debug`, `error`.

  ```bash
  LOG_LEVEL=info
  ```

* **SERVICE\_NAME**: The name of the service, used for logging and monitoring.

  ```bash
  SERVICE_NAME=fb-collector
  ```

Please ensure that all environment variables are correctly configured for your environment (e.g., development, staging, or production).

```

This section is ready to be added to your README.md.
```


To run your project, here are the steps you can follow based on your `package.json` configuration:

### 1. **Install Dependencies**

First, make sure you have `pnpm` installed. If you don't have it yet, you can install it globally:

```bash
npm install -g pnpm
```

After that, navigate to your project directory in the terminal and install all the necessary dependencies by running:

```bash
pnpm install
```

This will install dependencies for the whole workspace (including all services like `gateway`, `fb-collector`, `ttk-collector`, `reporter`, etc.).

### 2. **Set Up Environment Variables**

Before running the application, make sure that your `.env` file is correctly set up in the root of your project, as described in the previous answer.

### 3. **Build the Project**

Once dependencies are installed, you should build the project to ensure all services are compiled and Prisma is generated.

Run the following command to build the project:

```bash
pnpm run build
```

This will:

* Generate Prisma files (`prisma:generate`).
* Build the shared module.
* Build all the services like `gateway`, `fb-collector`, `ttk-collector`, and `reporter`.

### 4. **Start the Services in Development Mode**

To start the application in development mode (with hot-reloading for each service), run:

```bash
pnpm run dev
```

This command will use `concurrently` to start the following services in parallel:

* `gateway`
* `fb-collector`
* `ttk-collector`
* `reporter`

Each of these services will start in development mode, meaning you can test the application while making changes.

### 5. **Start the Application (Production Mode)**

For running the application in production mode, use the following command:

```bash
pnpm run start
```

This will:

1. Prepare everything by running `pnpm run prepare:all` (installing dependencies and building the project).
2. Then, it will start the services as described in `pnpm run dev` but typically for a production-ready environment.

### 6. **Running Tests**

To run the tests for the project, use the following command:

```bash
pnpm run test
```

This will run tests across all the services.

### 7. **Other Scripts**

* **Linting**: To check the code for linting issues:

  ```bash
  pnpm run lint
  ```

* **Formatting**: To format the code with Prettier:

  ```bash
  pnpm run format
  ```

* **Preparing Git hooks** (Husky for pre-commit hooks):

  ```bash
  pnpm run prepare
  ```

### Conclusion

So, the typical flow for starting the project would be:

1. `pnpm install` (install dependencies)
2. `pnpm run build` (build the project)
3. `pnpm run dev` (start the project in development mode)

These commands should get your project up and running, with each service running concurrently.
