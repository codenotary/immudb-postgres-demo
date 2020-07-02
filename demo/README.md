# immudb - Postgres Presentation Demo 

Requires Postgres 10+ as it uses logical replication:
- Set up your DB for replication: it must have the `wal_level` set to `logical`. To set the wal_level, you can call `ALTER SYSTEM SET wal_level = logical;`
- You must set max_replication_slots to at least 1: `ALTER SYSTEM SET max_replication_slots = 5;`
- Create a PUBLICATION for this server to listen to: `CREATE PUBLICATION supabase_realtime FOR ALL TABLES;`
- [OPTIONAL] If you want to recieve the old record (previous values) on UDPATE and DELETE, you can set the REPLICA IDENTITY to FULL like this: `ALTER TABLE your_table REPLICA IDENTITY FULL;`. This has to be set for each table unfortunately.

## Installation

```bash
npm install
npm run dev
```

```bash
docker-compose up
```


## Deployment 

Deploy it to the cloud with [now](https://zeit.co/now) ([download](https://zeit.co/download)):

```bash
now
```
