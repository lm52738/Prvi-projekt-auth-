drop table team cascade;
drop table round cascade;
drop table match cascade;
drop table comment cascade;

CREATE TABLE team
(
  teamName VARCHAR(50) NOT NULL,
  teamID INT NOT NULL,
  teamPoints INT,
  PRIMARY KEY (teamID)
);

CREATE TABLE round
(
  roundID INT NOT NULL,
  roundFinished INT,
  PRIMARY KEY (roundID)
);

CREATE TABLE match
(
  matchID INT NOT NULL,
  matchTimestamp TIMESTAMP NOT NULL,
  firstTeamScore INT,
  secondTeamScore INT,
  matchWinnerID INT,
  firstTeamID INT NOT NULL,
  secondTeamID INT NOT NULL,
  roundID INT NOT NULL,
  PRIMARY KEY (matchID),
  FOREIGN KEY (matchWinnerID) REFERENCES team(teamID),
  FOREIGN KEY (firstTeamID) REFERENCES team(teamID),
  FOREIGN KEY (secondTeamID) REFERENCES team(teamID),
  FOREIGN KEY (roundID) REFERENCES round(roundID)
);

CREATE SEQUENCE comment_sqnc start 0 increment 1;
CREATE TABLE Comment
(
  commentID SERIAL,
  commentText VARCHAR(400) NOT NULL,
  username VARCHAR(100) NOT NULL,
  roundID INT NOT NULL,
  created TIMESTAMP NOT NULL,
  PRIMARY KEY (commentID),
  FOREIGN KEY (roundID) REFERENCES round(roundID)
);

INSERT INTO team (teamID, teamName, teamPoints) VALUES (1,'Osijek W',15);
INSERT INTO team (teamID, teamName, teamPoints) VALUES (4,'ZNK Split W',12);
INSERT INTO team (teamID, teamName, teamPoints) VALUES (5,'Hajduk Split W',9);
INSERT INTO team (teamID, teamName, teamPoints) VALUES (8,'Dinamo Maksimir W',9);
INSERT INTO team (teamID, teamName, teamPoints) VALUES (2,'Agram Zagreb W',6);
INSERT INTO team (teamID, teamName, teamPoints) VALUES (7,'Zadar W',4);
INSERT INTO team (teamID, teamName, teamPoints) VALUES (3,'Rijeka W',4);
INSERT INTO team (teamID, teamName, teamPoints) VALUES (6,'Viktorija Slavonski Brod W',0);

INSERT INTO round ( roundID, roundFinished) VALUES (1,1);
INSERT INTO round ( roundID, roundFinished) VALUES (2,1);
INSERT INTO round ( roundID, roundFinished) VALUES (3,1);
INSERT INTO round ( roundID, roundFinished) VALUES (4,1);
INSERT INTO round ( roundID, roundFinished) VALUES (5,1);
INSERT INTO round ( roundID, roundFinished) VALUES (6,0);
INSERT INTO round ( roundID, roundFinished) VALUES (7,0);
INSERT INTO round ( roundID, roundFinished) VALUES (8,0);
INSERT INTO round ( roundID, roundFinished) VALUES (9,0);
INSERT INTO round ( roundID, roundFinished) VALUES (10,0);

INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamScore, secondTeamScore, 
matchWinnerID, firstTeamID, secondTeamID ) VALUES (1,1,'2022-09-11 14:00',2,1,8,5,8);
INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamScore, secondTeamScore, 
matchWinnerID, firstTeamID, secondTeamID ) VALUES (2,1,'2022-09-11 16:00',10,1,3,3,6);
INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamScore, secondTeamScore, 
matchWinnerID, firstTeamID, secondTeamID ) VALUES (3,1,'2022-09-11 16:00',4,0,1,1,2);
INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamScore, secondTeamScore, 
matchWinnerID, firstTeamID, secondTeamID ) VALUES (4,1,'2022-09-11 17:00',0,7,7,4,7);

INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamScore, secondTeamScore, 
matchWinnerID, firstTeamID, secondTeamID ) VALUES (5,2,'2022-09-18 16:00',0,18,6,1,6);
INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamScore, secondTeamScore, 
matchWinnerID, firstTeamID, secondTeamID ) VALUES (6,2,'2022-09-18 16:00',5,0,4,8,4);
INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamScore, secondTeamScore, 
matchWinnerID, firstTeamID, secondTeamID ) VALUES (7,2,'2022-09-18 14:00',6,1,5,5,3);
INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamScore, secondTeamScore, 
matchWinnerID, firstTeamID, secondTeamID ) VALUES (8,2,'2022-09-18 12:00',0,2,7,7,2);

INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamScore, secondTeamScore, 
matchWinnerID, firstTeamID, secondTeamID ) VALUES (9,3,'2022-09-25 16:00',6,0,2,2,6);
INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamScore, secondTeamScore, 
matchWinnerID, firstTeamID, secondTeamID ) VALUES (10,3,'2022-09-25 16:00',0,7,3,4,3);
INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamScore, secondTeamScore, 
matchWinnerID, firstTeamID, secondTeamID ) VALUES (11,3,'2022-09-25 14:00',3,1,8,8,7);
INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamScore, secondTeamScore, 
matchWinnerID, firstTeamID, secondTeamID ) VALUES (12,3,'2022-09-25 12:00',2,0,1,1,6);


INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamScore, secondTeamScore, 
matchWinnerID, firstTeamID, secondTeamID ) VALUES (13,4,'2022-10-01 14:00',3,1,5,5,2);
INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamScore, secondTeamScore, 
matchWinnerID, firstTeamID, secondTeamID ) VALUES (14,4,'2022-10-01 16:00',11,1,8,3,8);
INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamScore, secondTeamScore, 
matchWinnerID, firstTeamID, secondTeamID ) VALUES (15,4,'2022-10-01 16:00',0,1,4,4,1);
INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamScore, secondTeamScore, 
matchWinnerID, firstTeamID, secondTeamID ) VALUES (16,4,'2022-10-09 14:30',7,0,7,6,7);

INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamScore, secondTeamScore, 
matchWinnerID, firstTeamID, secondTeamID ) VALUES (17,5,'2022-10-16 16:00',2,2,3,3,7);
INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamScore, secondTeamScore, 
matchWinnerID, firstTeamID, secondTeamID ) VALUES (18,5,'2022-10-16 15:30',1,2,2,4,2);
INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamScore, secondTeamScore, 
matchWinnerID, firstTeamID, secondTeamID ) VALUES (19,5,'2022-10-16 15:30',3,1,1,1,8);
INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamScore, secondTeamScore, 
matchWinnerID, firstTeamID, secondTeamID ) VALUES (20,5,'2022-10-16 14:00',0,5,6,5,6);

INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamID, secondTeamID ) 
VALUES (21,6,'2022-10-23 16:00',8,2);
INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamID, secondTeamID ) 
VALUES (22,6,'2022-10-23 16:00',1,3);
INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamID, secondTeamID ) 
VALUES (23,6,'2022-10-23 16:00',7,5);
INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamID, secondTeamID ) 
VALUES (24,6,'2022-10-23 16:00',4,6);

INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamID, secondTeamID ) 
VALUES (25,7,'2022-10-30 16:00',2,3 );
INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamID, secondTeamID ) 
VALUES (26,7,'2022-10-30 16:00',4,5);
INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamID, secondTeamID ) 
VALUES (27,7,'2022-10-30 16:00', 1,7);
INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamID, secondTeamID ) 
VALUES (28,7,'2022-10-30 16:00', 6,8);

INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamID, secondTeamID ) 
VALUES (29,8,'2022-11-06 16:00',1,2 );
INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamID, secondTeamID ) 
VALUES (30,8,'2022-11-06 16:00', 5,8);
INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamID, secondTeamID ) 
VALUES (31,8,'2022-11-06 16:00', 6,3);
INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamID, secondTeamID ) 
VALUES (32,8,'2022-11-06 16:00', 7,4);

INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamID, secondTeamID ) 
VALUES (33,9,'2022-11-20 16:00',2,7 );
INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamID, secondTeamID ) 
VALUES (34,9,'2022-11-20 16:00', 4,8);
INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamID, secondTeamID ) 
VALUES (35,9,'2022-11-20 16:00', 6,1);
INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamID, secondTeamID ) 
VALUES (36,9,'2022-11-20 16:00', 3,5);

INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamID, secondTeamID ) 
VALUES (37,10,'2022-11-27 16:00',1,5 );
INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamID, secondTeamID ) 
VALUES (38,10,'2022-11-27 16:00',6,2);
INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamID, secondTeamID ) 
VALUES (39,10,'2022-11-27 16:00', 8,7);
INSERT INTO match (matchID, roundID, matchTimestamp, firstTeamID, secondTeamID ) 
VALUES (40,10,'2022-11-27 16:00', 4,3);