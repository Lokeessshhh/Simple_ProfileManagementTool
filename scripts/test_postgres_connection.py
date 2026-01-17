import os
from urllib.parse import parse_qs, urlparse

import psycopg


def main() -> None:
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        raise SystemExit("DATABASE_URL environment variable is not set")

    parsed = urlparse(database_url)
    query = parse_qs(parsed.query)

    # psycopg requires sslmode separately when using keyword args
    conn_kwargs = {
        "dbname": parsed.path.lstrip("/") or "postgres",
        "user": parsed.username,
        "password": parsed.password,
        "host": parsed.hostname,
        "port": parsed.port or 5432,
    }

    sslmode = query.get("sslmode", [None])[0]
    if sslmode:
        conn_kwargs["sslmode"] = sslmode

    channel_binding = query.get("channel_binding", [None])[0]
    if channel_binding:
        conn_kwargs["channel_binding"] = channel_binding

    print("Connecting to Postgres ...")
    with psycopg.connect(**conn_kwargs) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT version(), current_database(), current_schema();")
            version, database, schema = cur.fetchone()
            print("Connected successfully!")
            print(f"Version   : {version}")
            print(f"Database  : {database}")
            print(f"Schema    : {schema}")

            cur.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = current_schema();")
            (table_count,) = cur.fetchone()
            print(f"Tables in schema: {table_count}")


if __name__ == "__main__":
    main()
