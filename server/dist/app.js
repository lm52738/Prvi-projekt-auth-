"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var https_1 = __importDefault(require("https"));
var express_openid_connect_1 = require("express-openid-connect");
var pg_1 = require("pg");
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1["default"].config();
var app = (0, express_1["default"])();
app.set("views", path_1["default"].join(__dirname, "views"));
app.set('view engine', 'ejs');
var port = 4080;
var config = {
    authRequired: false,
    idpLogout: true,
    secret: process.env.SECRET,
    baseURL: "https://localhost:".concat(port),
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: 'https://dev-6fv2bjv1.us.auth0.com',
    clientSecret: process.env.CLIENT_SECRET,
    authorizationParams: {
        response_type: 'code'
    }
};
// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use((0, express_openid_connect_1.auth)(config));
app.use(express_1["default"].json());
app.use(express_1["default"].urlencoded({ extended: true }));
// const pool = new Pool({
// user: process.env.DB_USER,
// host: process.env.DB_HOST,
// database: 'hnlwomen',
// password: process.env.DB_PASSWORD,
// port: 5432,
// ssl : true
// })
var pool = new pg_1.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'hnlwomen',
    password: '60144201',
    port: 5433
});
app.get('/', function (req, res) {
    var _a, _b, _c;
    var username;
    if (req.oidc.isAuthenticated()) {
        username = (_b = (_a = req.oidc.user) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : (_c = req.oidc.user) === null || _c === void 0 ? void 0 : _c.sub;
    }
    res.render('index', { username: username });
});
// admin - mn92833@mailinator.com
// password = username-mailinator 
app.get("/sign-up", function (req, res) {
    res.oidc.login({
        returnTo: '/',
        authorizationParams: {
            screen_hint: "signup"
        }
    });
});
app.get('/edit/:id', (0, express_openid_connect_1.requiresAuth)(), function (req, res) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function () {
        var username, id, sql;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (req.oidc.isAuthenticated()) {
                        username = (_b = (_a = req.oidc.user) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : (_c = req.oidc.user) === null || _c === void 0 ? void 0 : _c.sub;
                    }
                    id = req.params.id;
                    if (!(username == 'admin@mailinator.com')) return [3 /*break*/, 2];
                    return [4 /*yield*/, pool.query("SELECT matchid,firstteamscore, secondteamscore, team1.teamname as team1, team2.teamname as team2, to_char(matchtimestamp,'YYYY-MM-DD HH24:MI:SS') as matchtimestamp\n        FROM match\n        JOIN team team1 ON match.firstteamid = team1.teamid\n        JOIN team team2 ON match.secondteamid = team2.teamid WHERE matchid = " + id + "")];
                case 1:
                    sql = (_d.sent()).rows[0];
                    console.log(sql);
                    _d.label = 2;
                case 2:
                    res.render('edit', {
                        username: username,
                        match: sql
                    });
                    return [2 /*return*/];
            }
        });
    });
});
app.post('/edit/:id', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var id, score1, score2, getsql, winnerid;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = req.params.id;
                    score1 = req.body.score1;
                    score2 = req.body.score2;
                    console.log(id);
                    console.log(score1);
                    console.log(score2);
                    return [4 /*yield*/, pool.query("SELECT firstteamid, secondteamid FROM match WHERE matchid = " + id)];
                case 1:
                    getsql = (_a.sent()).rows[0];
                    winnerid = (score1 >= score2) ? getsql['firstteamid'] : getsql['secondteamid'];
                    console.log(getsql['firstteamid']);
                    console.log(getsql['secondteamid']);
                    return [4 /*yield*/, pool.query("UPDATE match SET matchWinnerID = " + winnerid + ",\n      firstteamscore = " + score1 + ", secondteamscore = " + score2 + " WHERE matchid = " + id)];
                case 2:
                    _a.sent();
                    if (!(score1 == score2)) return [3 /*break*/, 5];
                    return [4 /*yield*/, pool.query("UPDATE team SET teamPoints = (SELECT (teamPoints + 1) FROM team t2 WHERE t2.teamid = " + getsql['firstteamid'] + ")\n      WHERE teamid = " + getsql['firstteamid'])];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, pool.query("UPDATE team SET teamPoints = (SELECT (teamPoints + 1) FROM team t2 WHERE t2.teamid = " + getsql['secondteamid'] + ")\n      WHERE teamid = " + getsql['secondteamid'])];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 5:
                    if (!(score1 > score2)) return [3 /*break*/, 7];
                    return [4 /*yield*/, pool.query("UPDATE team SET teamPoints = (SELECT (teamPoints + 3) FROM team t2 WHERE t2.teamid = " + getsql['firstteamid'] + ")\n      WHERE teamid = " + getsql['firstteamid'])];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, pool.query("UPDATE team SET teamPoints = (SELECT (teamPoints + 3) FROM team t2 WHERE t2.teamid = " + getsql['secondteamid'] + "\n      WHERE teamid = " + getsql['secondteamid'])];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9:
                    res.redirect('/rounds');
                    return [2 /*return*/];
            }
        });
    });
});
app.get('/results', function (req, res) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function () {
        var username, sql;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (req.oidc.isAuthenticated()) {
                        username = (_b = (_a = req.oidc.user) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : (_c = req.oidc.user) === null || _c === void 0 ? void 0 : _c.sub;
                    }
                    return [4 /*yield*/, pool.query("SELECT ROW_NUMBER () OVER (), team.* FROM team order by teamPoints desc")];
                case 1:
                    sql = (_d.sent()).rows;
                    console.log(sql);
                    res.render('results', {
                        username: username,
                        rows: sql
                    });
                    return [2 /*return*/];
            }
        });
    });
});
app.get('/rounds', function (req, res) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function () {
        var username, sql_comments, sql_usercomments, sql_rounds, sql_matches;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (req.oidc.isAuthenticated()) {
                        username = (_b = (_a = req.oidc.user) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : (_c = req.oidc.user) === null || _c === void 0 ? void 0 : _c.sub;
                    }
                    sql_comments = undefined;
                    sql_usercomments = undefined;
                    if (!(username == 'admin@mailinator.com')) return [3 /*break*/, 2];
                    return [4 /*yield*/, pool.query("select commentid, commenttext, to_char(created,'YYYY-MM-DD HH24:MI:SS') as created, username, roundid from comment order by created desc;")];
                case 1:
                    sql_comments = (_d.sent()).rows;
                    return [3 /*break*/, 5];
                case 2: return [4 /*yield*/, pool.query("select commentid, commenttext, to_char(created,'YYYY-MM-DD HH24:MI:SS') as created, username, roundid from comment WHERE username <> '" + username + "' order by created desc;")];
                case 3:
                    sql_comments = (_d.sent()).rows;
                    return [4 /*yield*/, pool.query("select commentid, commenttext, to_char(created,'YYYY-MM-DD HH24:MI:SS') as created, username, roundid from comment WHERE username = '" + username + "' order by created desc;")];
                case 4:
                    sql_usercomments = (_d.sent()).rows;
                    _d.label = 5;
                case 5: return [4 /*yield*/, pool.query("SELECT roundid from round order by roundid desc")];
                case 6:
                    sql_rounds = (_d.sent()).rows;
                    return [4 /*yield*/, pool.query("SELECT roundid, matchid, to_char(matchtimestamp,'YYYY-MM-DD HH24:MI:SS') as matchtimestamp, team1.teamname as team1, team2.teamname as team2, \n            firstteamscore || ':' || secondteamscore AS score\n          FROM match\n          JOIN team team1 ON match.firstteamid =team1.teamid\n          JOIN team team2 ON match.secondteamid = team2.teamid\n          order by matchtimestamp desc")];
                case 7:
                    sql_matches = (_d.sent()).rows;
                    res.render('rounds', {
                        username: username,
                        rounds: sql_rounds,
                        matches: sql_matches,
                        comments: sql_comments,
                        usercomments: sql_usercomments
                    });
                    return [2 /*return*/];
            }
        });
    });
});
app.post('/comment/:id', function (req, res) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function () {
        var username, comment, roundid, sql;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (req.oidc.isAuthenticated()) {
                        username = (_b = (_a = req.oidc.user) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : (_c = req.oidc.user) === null || _c === void 0 ? void 0 : _c.sub;
                    }
                    comment = req.body.comment;
                    roundid = req.params.id;
                    console.log(comment);
                    console.log(roundid);
                    return [4 /*yield*/, pool.query("INSERT INTO comment (commentid,created,commentText,username,roundid) VALUES (nextval('comment_sqnc'),CURRENT_TIMESTAMP,'" + comment + "','" + username + "', " + roundid + ");")];
                case 1:
                    sql = (_d.sent());
                    res.redirect('/rounds');
                    return [2 /*return*/];
            }
        });
    });
});
app.post('/comment/delete/:id', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var id, sql;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = req.params.id;
                    console.log(id);
                    return [4 /*yield*/, pool.query("DELETE FROM comment WHERE commentid = " + id)];
                case 1:
                    sql = (_a.sent());
                    console.log(sql);
                    res.redirect('/rounds');
                    return [2 /*return*/];
            }
        });
    });
});
app.post('/comment/:id', function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var id, text, sql;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = req.params.id;
                    text = req.body.comment;
                    console.log(id);
                    console.log(text);
                    return [4 /*yield*/, pool.query("UPDATE comment SET commenttext = '" + text + "' WHERE commentid = " + id)];
                case 1:
                    sql = (_a.sent());
                    console.log(sql);
                    res.redirect('/rounds');
                    return [2 /*return*/];
            }
        });
    });
});
https_1["default"].createServer({
    key: fs_1["default"].readFileSync('server.key'),
    cert: fs_1["default"].readFileSync('server.cert')
}, app)
    .listen(port, function () {
    console.log("Server running at https://localhost:".concat(port, "/"));
});
