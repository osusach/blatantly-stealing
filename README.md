# osusach pegas

ladron de pegas usando bun + ts

# setup

create the goodies table, were we keep the goodies

```sql
CREATE TABLE goodies (
    id TEXT PRIMARY KEY,
    date TEXT,
    content TEXT,
    source TEXT,
    keywords TEXT
);
```

create a `.env` file in the root of the project with your tursodb credentials

```
TURSO_URL=
TURSO_TOKEN=
```

# docker

```zsh
docker build --no-cache --pull -t pegas-osusach .
docker run -p 3000:3000 --rm -it pegas-osusach
```
