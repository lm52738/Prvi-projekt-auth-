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

const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4080;

const config = { 
  authRequired : false,
  idpLogout : true, //login not only from the app, but also from identity provider
  secret: process.env.SECRET,
  baseURL: externalUrl || `https://localhost:${port}`,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: 'https://dev-6fv2bjv1.us.auth0.com',
  clientSecret: process.env.CLIENT_SECRET,
  authorizationParams: {
    response_type: 'code' ,
    //scope: "openid profile email"   
   },
};

if (externalUrl) {
  const hostname = '127.0.0.1';
  app.listen(port, hostname, () => {
  console.log(`Server locally running at http://${hostname}:${port}/ and from
  outside on ${externalUrl}`);
  });
} else {
  https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
  }, app)
  .listen(port, function () {
  console.log(`Server running at https://localhost:${port}/`);
  })
}

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// database on Render
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: 'hnlwomen_40ha',
  password: process.env.DB_PASSWORD,
  port: 5432,
  ssl : true
})

app.get('/',  function (req, res) {
  let username : string | undefined;
  if (req.oidc.isAuthenticated()) {
    username = req.oidc.user?.name ?? req.oidc.user?.sub;
  }
  res.render('index', {username});
});

// admin - admin@mailinator.com
// password = 'username-mailinator'
app.get("/sign-up", (req, res) => {
  res.oidc.login({
    returnTo: '/',
    authorizationParams: {      
      screen_hint: "signup",
    },
  });
});


// get results 
app.use('/results', async function (req, res) {       
  let username : string | undefined;
  if (req.oidc.isAuthenticated()) {
    username = req.oidc.user?.name ?? req.oidc.user?.sub;
  }  
  const sql = (await pool.query(`SELECT ROW_NUMBER() OVER(ORDER BY teampoints desc) , team.* FROM team order by teamPoints desc, teamScore desc`)).rows;
  console.log(sql)
  res.render('results', {
    username: username,
    rows: sql
  }); 
});

// get rounds and comments 
app.use('/rounds', async function (req, res) {       
  let username : string | undefined;
  if (req.oidc.isAuthenticated()) {
    username = req.oidc.user?.name ?? req.oidc.user?.sub;
  }  

  const sql_comments = (await pool.query(`select commentid, commenttext, to_char(created,'YYYY-MM-DD HH24:MI:SS') as created, username, roundid from comment WHERE username <> '` + username + `' order by created desc;`)).rows;
  const sql_usercomments = (await pool.query(`select commentid, commenttext, to_char(created,'YYYY-MM-DD HH24:MI:SS') as created, username, roundid from comment WHERE username = '` + username + `' order by created desc;`)).rows;
  
  const sql_rounds = (await pool.query(`SELECT DISTINCT roundid from match order by roundid desc`)).rows;
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


// get data for edit match
app.get('/edit/:id', requiresAuth(), async function (req, res) {       
  let username : string | undefined;
  if (req.oidc.isAuthenticated()) {
    username = req.oidc.user?.name ?? req.oidc.user?.sub;
  }  

  const id = req.params.id;

  // ako user nije admin => 401
  if (username != 'admin@mailinator.com') {
    res.status(401);
  }

  const sql_match = (await pool.query(`SELECT matchid,firstteamscore, secondteamscore, team1.teamname as team1, team2.teamname as team2, to_char(matchtimestamp,'YYYY-MM-DD HH24:MI:SS') as matchtimestamp
      FROM match JOIN team team1 ON match.firstteamid = team1.teamid JOIN team team2 ON match.secondteamid = team2.teamid WHERE matchid = ` + id + ``)).rows[0];

  res.render('edit', {
    username: username,
    match: sql_match
  }); 

  
});

// edit match
app.post('/edit/:id',  async function (req,res) {
  const id = req.params.id;
  const score1 = req.body.score1;
  const score2 = req.body.score2;

  console.log(id);
  console.log(score1);
  console.log(score2);

  const getsql = (await pool.query(`SELECT firstteamid,firstteamscore, secondteamid,secondteamscore FROM match WHERE matchid = ` + id)).rows[0];

  console.log(getsql);
  // add score
  await pool.query(`UPDATE team SET teamScore = (SELECT (teamScore + ` + score1 + `) FROM team t2 WHERE t2.teamid = ` + getsql['firstteamid'] + `) WHERE teamid = ` + getsql['firstteamid']);
  await pool.query(`UPDATE team SET teamScore = (SELECT (teamScore + ` + score2 + `) FROM team t2 WHERE t2.teamid = ` + getsql['secondteamid'] + `) WHERE teamid = ` + getsql['secondteamid']);

  // delete old points for this match
  if (getsql['firstteamscore'] != null && getsql['secondteamscore'] != null) {
    if (getsql['firstteamscore'] == getsql['secondteamscore']) {
      await pool.query(`UPDATE team SET teamPoints = (SELECT (teamPoints - 1) FROM team t2 WHERE t2.teamid = ` + getsql['firstteamid'] + `) WHERE teamid = ` + getsql['firstteamid']);
      await pool.query(`UPDATE team SET teamPoints = (SELECT (teamPoints - 1) FROM team t2 WHERE t2.teamid = ` + getsql['secondteamid'] + `) WHERE teamid = ` + getsql['secondteamid']);
  
    } else if (getsql['firstteamscore']  > getsql['secondteamscore'] ){
      await pool.query(`UPDATE team SET teamPoints = (SELECT (teamPoints - 3) FROM team t2 WHERE t2.teamid = ` + getsql['firstteamid'] + `) WHERE teamid = ` + getsql['firstteamid']);
      
    } else {
      await pool.query(`UPDATE team SET teamPoints = (SELECT (teamPoints - 3) FROM team t2 WHERE t2.teamid = ` + getsql['secondteamid'] + `) WHERE teamid = ` + getsql['secondteamid']);
    }
  }

  // get winner from score
  const winnerid = (score1 >= score2) ?  getsql['firstteamid'] : getsql['secondteamid']

  // update match
  await pool.query(`UPDATE match SET matchWinnerID = ` + winnerid + `,firstteamscore = ` + score1 + `, secondteamscore = ` + score2 + ` WHERE matchid = ` + id);
  
  // update team points
  if (score1 == score2) {
    await pool.query(`UPDATE team SET teamPoints = (SELECT (teamPoints + 1) FROM team t2 WHERE t2.teamid = ` + getsql['firstteamid'] + `) WHERE teamid = ` + getsql['firstteamid']);
    await pool.query(`UPDATE team SET teamPoints = (SELECT (teamPoints + 1) FROM team t2 WHERE t2.teamid = ` + getsql['secondteamid'] + `) WHERE teamid = ` + getsql['secondteamid']);

  } else if (score1 > score2 ){
    await pool.query(`UPDATE team SET teamPoints = (SELECT (teamPoints + 3) FROM team t2 WHERE t2.teamid = ` + getsql['firstteamid'] + `) WHERE teamid = ` + getsql['firstteamid']);
    
  } else {
    await pool.query(`UPDATE team SET teamPoints = (SELECT (teamPoints + 3) FROM team t2 WHERE t2.teamid = ` + getsql['secondteamid'] + ` WHERE teamid = ` + getsql['secondteamid']);
  }


  res.redirect('/rounds'); 
})


// add comment
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

// delete comment
app.post('/comment/delete/:id', async function (req, res) {   
  const id = req.params.id;
  console.log(id);

  const sql = (await pool.query(`DELETE FROM comment WHERE commentid = ` + id));
  console.log(sql)
  res.redirect('/rounds');
});

// edit comment
app.post('/comment/edit/:id', async function (req, res) { 
  let username : string | undefined;
  if (req.oidc.isAuthenticated()) {
    username = req.oidc.user?.name ?? req.oidc.user?.sub;
  }  
    
  const id = req.params.id;
  const text = req.body.comment;
  console.log(id);
  console.log(text);

  await pool.query(`UPDATE comment SET commenttext = '` + text + `' WHERE commentid = ` + id);
  res.redirect('/rounds');
});