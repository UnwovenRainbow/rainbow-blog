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
                          timestamp timestamp with time zone NOT NULL DEFAULT now(),
                          title character varying(100) NOT NULL,
                          content text NOT NULL,
                          CONSTRAINT post_id PRIMARY KEY (post_id)
                        )
                        WITH (
                            OIDS = FALSE
                        )
                        TABLESPACE pg_default;`

createUserTableQuery =  `CREATE TABLE public."User" (
                          user_id SERIAL,
                          username character varying(100) NOT NULL UNIQUE,
                          password text NOT NULL,
                          email character varying(100) NOT NULL UNIQUE,
                          joined timestamp with time zone NOT NULL DEFAULT now(),
                          role character varying(20),
                          CONSTRAINT user_id PRIMARY KEY (user_id)
                        )
                        WITH (
                            OIDS = FALSE
                        )
                        TABLESPACE pg_default;`

createCommentTableQuery =  `CREATE TABLE public."Comment" (
                          comment_id SERIAL,
                          timestamp timestamp with time zone NOT NULL DEFAULT now(),
                          text text NOT NULL,
                          post_id integer references public."Post"(post_id) NOT NULL,
                          user_id integer references public."User"(user_id) NOT NULL,
                          CONSTRAINT comment_id PRIMARY KEY (comment_id)
                        )
                        WITH (
                            OIDS = FALSE
                        )
                        TABLESPACE pg_default;`

createTagTableQuery =  `CREATE TABLE public."Tag" (
                          tag_id SERIAL,
                          name varchar(100) NOT NULL,
                          CONSTRAINT tag_id PRIMARY KEY (tag_id)
                        )
                        WITH (
                            OIDS = FALSE
                        )
                        TABLESPACE pg_default;`

createPostTagTableQuery =  `CREATE TABLE public."Post_Tag" (
                          post_tag_id SERIAL,
                          post_id integer references public."Post"(post_id) NOT NULL,
                          tag_id integer references public."Tag"(tag_id) NOT NULL,
                          CONSTRAINT post_tag_id PRIMARY KEY (post_tag_id)
                        )
                        WITH (
                            OIDS = FALSE
                        )
                        TABLESPACE pg_default;`

async function setupTable(client, tableName, createTableFunction) {
  const res = await client.query(tableExistsQuery('public', tableName))
  if (res.rows[0].exists === false) {
    console.log(`Creating table public."${tableName}"`)
    await client.query(createTableFunction)
    await client.query(`ALTER TABLE public."${tableName}" OWNER to postgres;`)
  }
}

(async () => {
  const client = await pool.connect()
  try {
    await setupTable(client, 'Post', createPostTableQuery)
    await setupTable(client, 'User', createUserTableQuery)
    await setupTable(client, 'Comment', createCommentTableQuery)
    await setupTable(client, 'Tag', createTagTableQuery)
    await setupTable(client, 'Post_Tag', createPostTagTableQuery)
  } finally {
    client.release()
  }
})().catch(e => console.log(e.stack))
