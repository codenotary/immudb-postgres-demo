# immudb PostgreSQL demo

Listens to changes in a PostgreSQL Database and broadcasts them into immudb.

**Contents**
- [Introduction](#introduction)
- [Quick start](#quick-start)
- [License](#license)
- [Credits](#credits)


## Introduction

This demo shows a simple workflow of user accounts and bank accounts. Every insert or update is recorded within [immudb](https://www.immudb.io) to guarantee an immutably stored table history.

## Quick start

If you just want to start it up and see it in action: 

1. clone this repo `git clone https://github.com/codenotary/immudb-postgres-demo.git`
2. copy `.env.example` to `.env` and configure the ip or host name the system will be accessed (i. e. localhost, myserver.somewhere.local)
3. Run `docker-compose up`
4. Visit `http://<configured hostname>:3000` (be patient, node_modules will need to install)

## License

This repo is licensed under Apache 2.0.

## Credits

- [https://github.com/codenotary/immudb](https://github.com/codenotary/immudb) - The demo stores all PostgreSQL changes in the immutable database immudb.
- [https://github.com/supabase/realtime](https://github.com/supabase/realtime) - The demo is built with the amazing Supabase PostgreSQL listener.
- [https://github.com/phoenixframework/phoenix](https://github.com/phoenixframework/phoenix) - The server is built with the amazing elixir framework.
- [https://github.com/cainophile/cainophile](https://github.com/cainophile/cainophile) - A lot of this implementation leveraged the work already done on Cainophile.
- [https://github.com/mcampa/phoenix-channels](https://github.com/mcampa/phoenix-channels) - The client library is ported from this library. 
