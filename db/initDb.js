const { Pool } = require('pg')
const credentials = require('./credentials.json')

const pool = new Pool(credentials)

// the pool with emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

function tableExistsQuery(table_schema, table_name) {
  return `SELECT EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_schema = '${table_schema}'
            AND table_name = '${table_name}'
          );`
}

createPostTableQuery =  `CREATE TABLE public."Post" (
                          post_id SERIAL,
                          "timestamp" timestamp with time zone NOT NULL DEFAULT now(),
                          title character varying(100) COLLATE pg_catalog."default" NOT NULL,
                          content text COLLATE pg_catalog."default" NOT NULL,
                          CONSTRAINT post_id PRIMARY KEY (post_id)
                        )
                        WITH (
                            OIDS = FALSE
                        )
                        TABLESPACE pg_default;`

createUserTableQuery =  `CREATE TABLE public."User" (
                          user_id SERIAL,
                          username character varying(100) COLLATE pg_catalog."default" NOT NULL UNIQUE,
                          password text COLLATE pg_catalog."default" NOT NULL,
                          email character varying(100) COLLATE pg_catalog."default" NOT NULL UNIQUE,
                          "joined" timestamp with time zone NOT NULL DEFAULT now(),
                          CONSTRAINT user_id PRIMARY KEY (user_id)
                        )
                        WITH (
                            OIDS = FALSE
                        )
                        TABLESPACE pg_default;`

async function setupPosts(client) {
  const res = await client.query(tableExistsQuery('public', 'Post'))
  if (res.rows[0].exists === false) {
    console.log('Creating table public."Post"')
    await client.query(createPostTableQuery)
    await client.query(`ALTER TABLE public."Post" OWNER to postgres;`)
  }
}

async function setupUsers(client) {
  const res = await client.query(tableExistsQuery('public', 'User'))
  if (res.rows[0].exists === false) {
    console.log('Creating table public."User"')
    await client.query(createUserTableQuery)
    await client.query(`ALTER TABLE public."User" OWNER to postgres;`)
  }
}

(async () => {
  const client = await pool.connect()
  try {
    await setupPosts(client)
    await setupUsers(client)
  } finally {
    client.release()
  }
})().catch(e => console.log(e.stack))
