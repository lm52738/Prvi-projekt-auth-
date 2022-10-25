import express from 'express';
import fs from 'fs';
import path from 'path'
import https from 'https';
import { auth, requiresAuth } from 'express-openid-connect'; 
import { Pool } from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set('view engine', 'ejs');

const port = 4080;

const config = { 
  authRequired : false,
  idpLogout : true, //login not only from the app, but also from identity provider
  secret: process.env.SECRET,
  baseURL: `https://localhost:${port}`,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: 'https://dev-6fv2bjv1.us.auth0.com',
  clientSecret: process.env.CLIENT_SECRET,
  authorizationParams: {
    response_type: 'code' ,
    //scope: "openid profile email"   
   },
};
// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// const pool = new Pool({
// user: process.env.DB_USER,
// host: process.env.DB_HOST,
// database: 'hnlwomen',
// password: process.env.DB_PASSWORD,
// port: 5432,
// ssl : true
// })

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'hnlwomen',
  password: '60144201',
  port: 5433,
});

app.get('/',  function (req, res) {
  let username : string | undefined;
  if (req.oidc.isAuthenticated()) {
    username = req.oidc.user?.name ?? req.oidc.user?.sub;
  }
  res.render('index', {username});
});

// admin - mn92833@mailinator.com
// password = username-mailinator 
app.get("/sign-up", (req, res) => {
  res.oidc.login({
    returnTo: '/',
    authorizationParams: {      
      screen_hint: "signup",
    },
  });
});

app.get('/edit/:id', requiresAuth(), async function (req, res) {       
    let username : string | undefined;
    if (req.oidc.isAuthenticated()) {
      username = req.oidc.user?.name ?? req.oidc.user?.sub;
    }  

    const id = req.params.id;

    var sql;
    if (username == 'admin@mailinator.com') {
      sql = (await pool.query(`SELECT matchid,firstteamscore, secondteamscore, team1.teamname as team1, team2.teamname as team2, to_char(matchtimestamp,'YYYY-MM-DD HH24:MI:SS') as matchtimestamp
        FROM match
        JOIN team team1 ON match.firstteamid = team1.teamid
        JOIN team team2 ON match.secondteamid = team2.teamid WHERE matchid = ` + id + ``)).rows[0];
      console.log(sql)
    }

    res.render('edit', {
      username: username,
      match: sql
    }); 
});

app.post('/edit/:id',  async function (req,res) {
  const id = req.params.id;
  const score1 = req.body.score1;
  const score2 = req.body.score2;

  console.log(id);
  console.log(score1);
  console.log(score2);

  const getsql = (await pool.query(`SELECT firstteamid, secondteamid FROM match WHERE matchid = ` + id)).rows[0];
  const winnerid = (score1 >= score2) ?  getsql['firstteamid'] : getsql['secondteamid']
  console.log(getsql['firstteamid'])
  console.log(getsql['secondteamid'])

  await pool.query(`UPDATE match SET matchWinnerID = ` + winnerid + `,
      firstteamscore = ` + score1 + `, secondteamscore = ` + score2 + ` WHERE matchid = ` + id);
  
  if (score1 == score2) {
    await pool.query(`UPDATE team SET teamPoints = (SELECT (teamPoints + 1) FROM team t2 WHERE t2.teamid = ` + getsql['firstteamid'] + `)
      WHERE teamid = ` + getsql['firstteamid']);
    await pool.query(`UPDATE team SET teamPoints = (SELECT (teamPoints + 1) FROM team t2 WHERE t2.teamid = ` + getsql['secondteamid'] + `)
      WHERE teamid = ` + getsql['secondteamid']);

  } else if (score1 > score2 ){
    await pool.query(`UPDATE team SET teamPoints = (SELECT (teamPoints + 3) FROM team t2 WHERE t2.teamid = ` + getsql['firstteamid'] + `)
      WHERE teamid = ` + getsql['firstteamid']);
    
  } else {
    await pool.query(`UPDATE team SET teamPoints = (SELECT (teamPoints + 3) FROM team t2 WHERE t2.teamid = ` + getsql['secondteamid'] + `
      WHERE teamid = ` + getsql['secondteamid']);
  }

  res.redirect('/rounds'); 
})

app.get('/results', async function (req, res) {       
  let username : string | undefined;
  if (req.oidc.isAuthenticated()) {
    username = req.oidc.user?.name ?? req.oidc.user?.sub;
  }  
  const sql = (await pool.query(`SELECT ROW_NUMBER () OVER (), team.* FROM team order by teamPoints desc`)).rows;
  console.log(sql)
  res.render('results', {
    username: username,
    rows: sql
  }); 
});

app.get('/rounds', async function (req, res) {       
  let username : string | undefined;
  if (req.oidc.isAuthenticated()) {
    username = req.oidc.user?.name ?? req.oidc.user?.sub;
  }  

  let sql_comments = undefined; 
  let sql_usercomments = undefined;

  if (username == 'admin@mailinator.com') {
    sql_comments = (await pool.query(`select commentid, commenttext, to_char(created,'YYYY-MM-DD HH24:MI:SS') as created, username, roundid from comment order by created desc;`)).rows;

  } else {
    sql_comments = (await pool.query(`select commentid, commenttext, to_char(created,'YYYY-MM-DD HH24:MI:SS') as created, username, roundid from comment WHERE username <> '` + username + `' order by created desc;`)).rows;
    sql_usercomments = (await pool.query(`select commentid, commenttext, to_char(created,'YYYY-MM-DD HH24:MI:SS') as created, username, roundid from comment WHERE username = '` + username + `' order by created desc;`)).rows;

  }
  
  const sql_rounds = (await pool.query(`SELECT roundid from round order by roundid desc`)).rows;
  const sql_matches = (await pool.query(`SELECT roundid, matchid, to_char(matchtimestamp,'YYYY-MM-DD HH24:MI:SS') as matchtimestamp, team1.teamname as team1, team2.teamname as team2, 
            firstteamscore || ':' || secondteamscore AS score
          FROM match
          JOIN team team1 ON match.firstteamid =team1.teamid
          JOIN team team2 ON match.secondteamid = team2.teamid
          order by matchtimestamp desc`)).rows;
          
  res.render('rounds', {
    username: username,
    rounds: sql_rounds,
    matches: sql_matches,
    comments: sql_comments,
    usercomments: sql_usercomments
  }); 
});

app.post('/comment/:id', async function (req, res) {       
  let username : string | undefined;
  if (req.oidc.isAuthenticated()) {
    username = req.oidc.user?.name ?? req.oidc.user?.sub;
  }  

  const comment = req.body.comment;
  const roundid = req.params.id;

  console.log(comment);
  console.log(roundid);

  const sql = (await pool.query(`INSERT INTO comment (commentid,created,commentText,username,roundid) VALUES (nextval('comment_sqnc'),CURRENT_TIMESTAMP,'` + comment + `','`+ username + `', ` + roundid + `);`));

  res.redirect('/rounds'); 
});

app.post('/comment/delete/:id', async function (req, res) {   
  const id = req.params.id;
  console.log(id);

  const sql = (await pool.query(`DELETE FROM comment WHERE commentid = ` + id));
  console.log(sql)
  res.redirect('/rounds');
});

app.post('/comment/:id', async function (req, res) {   
  const id = req.params.id;
  const text = req.body.comment;
  console.log(id);
  console.log(text);

  const sql = (await pool.query(`UPDATE comment SET commenttext = '` + text + `' WHERE commentid = ` + id));
  console.log(sql)
  res.redirect('/rounds');
});

https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app)
.listen(port, function () {
  console.log(`Server running at https://localhost:${port}/`);
});