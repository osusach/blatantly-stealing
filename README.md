# blatanly stealing stuff

ofertas de la gente del dcc y de getonboard

# tech

- ts
- bun
- tursodb
- playwright
- zod

# setup

create the goodies table, were we keep the goodies

```sql
CREATE TABLE goodies (
    id TEXT PRIMARY KEY,
    date TEXT,
    content TEXT,
    source TEXT
);
```

create a `.env` file in the root of the project with your tursodb credentials

```
TURSO_URL=
TURSO_TOKEN=
```

and that's it

# usage

1. `bun install`
2. `bun start`
3. wait for the magic to happen
