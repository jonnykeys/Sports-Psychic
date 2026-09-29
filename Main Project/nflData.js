// Sports Psychic - NFL 2026 Schedule & Team Data (Clean baseline without user data)

const NFL_TEAMS = {
  // AFC West
  KC:  { code: 'KC',  name: 'Kansas City Chiefs',     city: 'Kansas City', conf: 'AFC', div: 'West',  color: '#E31837', alt: '#FFB81C' },
  LV:  { code: 'LV',  name: 'Las Vegas Raiders',      city: 'Las Vegas',   conf: 'AFC', div: 'West',  color: '#000000', alt: '#A5ACAF' },
  DEN: { code: 'DEN', name: 'Denver Broncos',         city: 'Denver',      conf: 'AFC', div: 'West',  color: '#FB4F14', alt: '#002244' },
  LAC: { code: 'LAC', name: 'Los Angeles Chargers',   city: 'Los Angeles', conf: 'AFC', div: 'West',  color: '#0080C6', alt: '#FFC20E' },

  // AFC East
  BUF: { code: 'BUF', name: 'Buffalo Bills',          city: 'Buffalo',     conf: 'AFC', div: 'East',  color: '#00338D', alt: '#C60C30' },
  MIA: { code: 'MIA', name: 'Miami Dolphins',         city: 'Miami',       conf: 'AFC', div: 'East',  color: '#008E97', alt: '#FC4C02' },
  NYJ: { code: 'NYJ', name: 'New York Jets',          city: 'New York',    conf: 'AFC', div: 'East',  color: '#125740', alt: '#000000' },
  NE:  { code: 'NE',  name: 'New England Patriots',    city: 'New England', conf: 'AFC', div: 'East',  color: '#002244', alt: '#C60C30' },

  // AFC North
  BAL: { code: 'BAL', name: 'Baltimore Ravens',       city: 'Baltimore',   conf: 'AFC', div: 'North', color: '#241773', alt: '#000000' },
  CLE: { code: 'CLE', name: 'Cleveland Browns',       city: 'Cleveland',   conf: 'AFC', div: 'North', color: '#311D00', alt: '#FF3C00' },
  PIT: { code: 'PIT', name: 'Pittsburgh Steelers',    city: 'Pittsburgh',  conf: 'AFC', div: 'North', color: '#FFB612', alt: '#101820' },
  CIN: { code: 'CIN', name: 'Cincinnati Bengals',     city: 'Cincinnati',  conf: 'AFC', div: 'North', color: '#FB4F14', alt: '#000000' },

  // AFC South
  HOU: { code: 'HOU', name: 'Houston Texans',         city: 'Houston',     conf: 'AFC', div: 'South', color: '#03202F', alt: '#A71930' },
  JAX: { code: 'JAX', name: 'Jacksonville Jaguars',   city: 'Jacksonville',conf: 'AFC', div: 'South', color: '#006778', alt: '#D7A22A' },
  IND: { code: 'IND', name: 'Indianapolis Colts',     city: 'Indianapolis',conf: 'AFC', div: 'South', color: '#002C5F', alt: '#A2AAAD' },
  TEN: { code: 'TEN', name: 'Tennessee Titans',       city: 'Tennessee',   conf: 'AFC', div: 'South', color: '#0C2340', alt: '#4B92DB' },

  // NFC West
  SF:  { code: 'SF',  name: 'San Francisco 49ers',    city: 'San Francisco',conf: 'NFC', div: 'West', color: '#AA0000', alt: '#B3995D' },
  LAR: { code: 'LAR', name: 'Los Angeles Rams',       city: 'Los Angeles', conf: 'NFC', div: 'West',  color: '#003594', alt: '#FFA300' },
  SEA: { code: 'SEA', name: 'Seattle Seahawks',       city: 'Seattle',     conf: 'NFC', div: 'West',  color: '#002244', alt: '#69BE28' },
  AZ:  { code: 'AZ',  name: 'Arizona Cardinals',      city: 'Arizona',     conf: 'NFC', div: 'West',  color: '#97233F', alt: '#000000' },

  // NFC East
  DAL: { code: 'DAL', name: 'Dallas Cowboys',         city: 'Dallas',      conf: 'NFC', div: 'East',  color: '#041E42', alt: '#869397' },
  PHI: { code: 'PHI', name: 'Philadelphia Eagles',    city: 'Philadelphia',conf: 'NFC', div: 'East',  color: '#004C54', alt: '#A5ACAF' },
  NYG: { code: 'NYG', name: 'New York Giants',        city: 'New York',    conf: 'NFC', div: 'East',  color: '#0B2265', alt: '#A71930' },
  WSH: { code: 'WSH', name: 'Washington Commanders',  city: 'Washington',  conf: 'NFC', div: 'East',  color: '#5A1414', alt: '#FFB612' },

  // NFC North
  DET: { code: 'DET', name: 'Detroit Lions',          city: 'Detroit',     conf: 'NFC', div: 'North', color: '#0076B6', alt: '#B0B7BC' },
  GB:  { code: 'GB',  name: 'Green Bay Packers',      city: 'Green Bay',   conf: 'NFC', div: 'North', color: '#203731', alt: '#FFB612' },
  MIN: { code: 'MIN', name: 'Minnesota Vikings',      city: 'Minnesota',   conf: 'NFC', div: 'North', color: '#4F2683', alt: '#FFC62F' },
  CHI: { code: 'CHI', name: 'Chicago Bears',          city: 'Chicago',     conf: 'NFC', div: 'North', color: '#0B162A', alt: '#C83803' },

  // NFC South
  TB:  { code: 'TB',  name: 'Tampa Bay Buccaneers',   city: 'Tampa Bay',   conf: 'NFC', div: 'South', color: '#D50A0A', alt: '#0A0A08' },
  NO:  { code: 'NO',  name: 'New Orleans Saints',     city: 'New Orleans', conf: 'NFC', div: 'South', color: '#D3BC8D', alt: '#101820' },
  ATL: { code: 'ATL', name: 'Atlanta Falcons',        city: 'Atlanta',     conf: 'NFC', div: 'South', color: '#A71930', alt: '#000000' },
  CAR: { code: 'CAR', name: 'Carolina Panthers',      city: 'Carolina',    conf: 'NFC', div: 'South', color: '#0085CA', alt: '#101820' }
};

const DIVISIONS = {
  'AFC West':  ['KC', 'LV', 'DEN', 'LAC'],
  'AFC East':  ['BUF', 'MIA', 'NYJ', 'NE'],
  'AFC North': ['BAL', 'CLE', 'PIT', 'CIN'],
  'AFC South': ['HOU', 'JAX', 'IND', 'TEN'],
  'NFC West':  ['SF', 'LAR', 'SEA', 'AZ'],
  'NFC East':  ['DAL', 'PHI', 'NYG', 'WSH'],
  'NFC North': ['DET', 'GB', 'MIN', 'CHI'],
  'NFC South': ['TB', 'NO', 'ATL', 'CAR']
};

// Sports supported (with future expansion planned)
const SPORTS_CATALOG = [
  { id: 'nfl', name: 'NFL Football', season: '2026 Season', active: true, icon: 'ðŸˆ' },
  { id: 'nba', name: 'NBA Basketball', season: 'Upcoming', active: false, icon: 'ðŸ€' },
  { id: 'mlb', name: 'MLB Baseball', season: 'Upcoming', active: false, icon: 'âš¾' },
  { id: 'cfb', name: 'College Football', season: 'Upcoming', active: false, icon: 'ðŸŽ“' },
  { id: 'nhl', name: 'NHL Hockey', season: 'Upcoming', active: false, icon: 'ðŸ’' }
];

const NFL_2026_SCHEDULE = {
    "actuals":  {
                    "Week 13":  [
                                    {
                                        "id":  "w13_g3",
                                        "matchup":  "KC @ LAR",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w13_g4",
                                        "matchup":  "DET @ ATL",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w13_g5",
                                        "matchup":  "JAX @ CHI",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w13_g6",
                                        "matchup":  "CIN @ CLE",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w13_g7",
                                        "matchup":  "GB @ NO",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w13_g8",
                                        "matchup":  "SF @ NYG",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w13_g9",
                                        "matchup":  "LAC @ TB",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w13_g10",
                                        "matchup":  "WSH @ TEN",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w13_g11",
                                        "matchup":  "PHI @ AZ",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w13_g12",
                                        "matchup":  "MIA @ DEN",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w13_g13",
                                        "matchup":  "CAR @ MIN",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w13_g14",
                                        "matchup":  "BUF @ NE",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w13_g15",
                                        "matchup":  "HOU @ PIT",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w13_g16",
                                        "matchup":  "DAL @ SEA",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    }
                                ],
                    "Week 11":  [
                                    {
                                        "id":  "w11_g3",
                                        "matchup":  "IND @ HOU",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w11_g4",
                                        "matchup":  "BAL @ CAR",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w11_g5",
                                        "matchup":  "NO @ CHI",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w11_g6",
                                        "matchup":  "TB @ DET",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w11_g7",
                                        "matchup":  "MIA @ BUF",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w11_g8",
                                        "matchup":  "JAX @ NYG",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w11_g9",
                                        "matchup":  "TEN @ DAL",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w11_g10",
                                        "matchup":  "AZ @ KC",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w11_g11",
                                        "matchup":  "NYJ @ LAC",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w11_g12",
                                        "matchup":  "PIT @ PHI",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w11_g13",
                                        "matchup":  "LV @ DEN",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w11_g14",
                                        "matchup":  "MIN @ SF",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w11_g15",
                                        "matchup":  "CIN @ WSH",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    }
                                ],
                    "Week 3":  [
                                   {
                                       "id":  "w3_g3",
                                       "matchup":  "ATL @ GB",
                                       "homeScore":  14,
                                       "isFinal":  true,
                                       "awayScore":  35,
                                       "winner":  "ATL"
                                   },
                                   {
                                       "id":  "w3_g4",
                                       "matchup":  "LAC @ BUF",
                                       "homeScore":  26,
                                       "isFinal":  true,
                                       "awayScore":  14,
                                       "winner":  "BUF"
                                   },
                                   {
                                       "id":  "w3_g5",
                                       "matchup":  "CAR @ CLE",
                                       "homeScore":  21,
                                       "isFinal":  true,
                                       "awayScore":  18,
                                       "winner":  "CLE"
                                   },
                                   {
                                       "id":  "w3_g6",
                                       "matchup":  "NYJ @ DET",
                                       "homeScore":  31,
                                       "isFinal":  true,
                                       "awayScore":  24,
                                       "winner":  "DET"
                                   },
                                   {
                                       "id":  "w3_g7",
                                       "matchup":  "HOU @ IND",
                                       "homeScore":  27,
                                       "isFinal":  true,
                                       "awayScore":  19,
                                       "winner":  "IND"
                                   },
                                   {
                                       "id":  "w3_g8",
                                       "matchup":  "KC @ MIA",
                                       "homeScore":  10,
                                       "isFinal":  true,
                                       "awayScore":  24,
                                       "winner":  "KC"
                                   },
                                   {
                                       "id":  "w3_g9",
                                       "matchup":  "TEN @ NYG",
                                       "homeScore":  12,
                                       "isFinal":  true,
                                       "awayScore":  7,
                                       "winner":  "NYG"
                                   },
                                   {
                                       "id":  "w3_g10",
                                       "matchup":  "CIN @ PIT",
                                       "homeScore":  30,
                                       "isFinal":  true,
                                       "awayScore":  27,
                                       "winner":  "PIT"
                                   },
                                   {
                                       "id":  "w3_g11",
                                       "matchup":  "SEA @ WSH",
                                       "homeScore":  33,
                                       "isFinal":  true,
                                       "awayScore":  31,
                                       "winner":  "WSH"
                                   },
                                   {
                                       "id":  "w3_g12",
                                       "matchup":  "NE @ JAX",
                                       "homeScore":  35,
                                       "isFinal":  true,
                                       "awayScore":  6,
                                       "winner":  "JAX"
                                   },
                                   {
                                       "id":  "w3_g13",
                                       "matchup":  "AZ @ SF",
                                       "homeScore":  36,
                                       "isFinal":  true,
                                       "awayScore":  30,
                                       "winner":  "SF"
                                   },
                                   {
                                       "id":  "w3_g14",
                                       "matchup":  "MIN @ TB",
                                       "homeScore":  16,
                                       "isFinal":  true,
                                       "awayScore":  23,
                                       "winner":  "MIN"
                                   },
                                   {
                                       "id":  "w3_g15",
                                       "matchup":  "BAL @ DAL",
                                       "homeScore":  31,
                                       "isFinal":  true,
                                       "awayScore":  34,
                                       "winner":  "BAL"
                                   },
                                   {
                                       "id":  "w3_g16",
                                       "matchup":  "LV @ NO",
                                       "homeScore":  27,
                                       "isFinal":  true,
                                       "awayScore":  35,
                                       "winner":  "LV"
                                   },
                                   {
                                       "id":  "w3_g17",
                                       "matchup":  "LAR @ DEN",
                                       "homeScore":   30 ,
                                       "isFinal":   true ,
                                       "awayScore":   26 ,
                                       "winner":   "DEN"
                                   },
                                   {
                                       "id":  "w3_g18",
                                       "matchup":  "PHI @ CHI",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   }
                               ],
                    "Week 1":  [
                                   {
                                       "id":  "w1_g3",
                                       "matchup":  "NE @ SEA",
                                       "homeScore":  13,
                                       "isFinal":  true,
                                       "awayScore":  10,
                                       "winner":  "SEA"
                                   },
                                   {
                                       "id":  "w1_g4",
                                       "matchup":  "SF @ LAR",
                                       "homeScore":  7,
                                       "isFinal":  true,
                                       "awayScore":  27,
                                       "winner":  "SF"
                                   },
                                   {
                                       "id":  "w1_g5",
                                       "matchup":  "TB @ CIN",
                                       "homeScore":  33,
                                       "isFinal":  true,
                                       "awayScore":  27,
                                       "winner":  "CIN"
                                   },
                                   {
                                       "id":  "w1_g6",
                                       "matchup":  "NO @ DET",
                                       "homeScore":  31,
                                       "isFinal":  true,
                                       "awayScore":  30,
                                       "winner":  "DET"
                                   },
                                   {
                                       "id":  "w1_g7",
                                       "matchup":  "NYJ @ TEN",
                                       "homeScore":  10,
                                       "isFinal":  true,
                                       "awayScore":  23,
                                       "winner":  "NYJ"
                                   },
                                   {
                                       "id":  "w1_g8",
                                       "matchup":  "BAL @ IND",
                                       "homeScore":  23,
                                       "isFinal":  true,
                                       "awayScore":  41,
                                       "winner":  "BAL"
                                   },
                                   {
                                       "id":  "w1_g9",
                                       "matchup":  "ATL @ PIT",
                                       "homeScore":  20,
                                       "isFinal":  true,
                                       "awayScore":  13,
                                       "winner":  "PIT"
                                   },
                                   {
                                       "id":  "w1_g10",
                                       "matchup":  "CHI @ CAR",
                                       "homeScore":  37,
                                       "isFinal":  true,
                                       "awayScore":  59,
                                       "winner":  "CHI"
                                   },
                                   {
                                       "id":  "w1_g11",
                                       "matchup":  "CLE @ JAX",
                                       "homeScore":  34,
                                       "isFinal":  true,
                                       "awayScore":  10,
                                       "winner":  "JAX"
                                   },
                                   {
                                       "id":  "w1_g12",
                                       "matchup":  "BUF @ HOU",
                                       "homeScore":  31,
                                       "isFinal":  true,
                                       "awayScore":  36,
                                       "winner":  "BUF"
                                   },
                                   {
                                       "id":  "w1_g13",
                                       "matchup":  "MIA @ LV",
                                       "homeScore":  27,
                                       "isFinal":  true,
                                       "awayScore":  13,
                                       "winner":  "LV"
                                   },
                                   {
                                       "id":  "w1_g14",
                                       "matchup":  "GB @ MIN",
                                       "homeScore":  39,
                                       "isFinal":  true,
                                       "awayScore":  22,
                                       "winner":  "MIN"
                                   },
                                   {
                                       "id":  "w1_g15",
                                       "matchup":  "WSH @ PHI",
                                       "homeScore":  24,
                                       "isFinal":  true,
                                       "awayScore":  22,
                                       "winner":  "PHI"
                                   },
                                   {
                                       "id":  "w1_g16",
                                       "matchup":  "AZ @ LAC",
                                       "homeScore":  14,
                                       "isFinal":  true,
                                       "awayScore":  26,
                                       "winner":  "AZ"
                                   },
                                   {
                                       "id":  "w1_g17",
                                       "matchup":  "DAL @ NYG",
                                       "homeScore":  28,
                                       "isFinal":  true,
                                       "awayScore":  20,
                                       "winner":  "NYG"
                                   },
                                   {
                                       "id":  "w1_g18",
                                       "matchup":  "DEN @ KC",
                                       "homeScore":  31,
                                       "isFinal":  true,
                                       "awayScore":  10,
                                       "winner":  "KC"
                                   }
                               ],
                    "Week 5":  [
                                   {
                                       "id":  "w5_g3",
                                       "matchup":  "TB @ DAL",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w5_g4",
                                       "matchup":  "PHI @ JAX",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w5_g5",
                                       "matchup":  "LV @ NE",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w5_g6",
                                       "matchup":  "CIN @ MIA",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w5_g7",
                                       "matchup":  "MIN @ NO",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w5_g8",
                                       "matchup":  "HOU @ TEN",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w5_g9",
                                       "matchup":  "IND @ PIT",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w5_g10",
                                       "matchup":  "CLE @ NYJ",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w5_g11",
                                       "matchup":  "NYG @ WSH",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w5_g12",
                                       "matchup":  "DEN @ LAC",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w5_g13",
                                       "matchup":  "SF @ SEA",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w5_g14",
                                       "matchup":  "CHI @ GB",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w5_g15",
                                       "matchup":  "DET @ AZ",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w5_g16",
                                       "matchup":  "BAL @ ATL",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w5_g17",
                                       "matchup":  "BUF @ LAR",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   }
                               ],
                    "Week 14":  [
                                    {
                                        "id":  "w14_g3",
                                        "matchup":  "MIN @ NE",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w14_g4",
                                        "matchup":  "TB @ BAL",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w14_g5",
                                        "matchup":  "NO @ CAR",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w14_g6",
                                        "matchup":  "ATL @ CLE",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w14_g7",
                                        "matchup":  "TEN @ DET",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w14_g8",
                                        "matchup":  "CHI @ MIA",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w14_g9",
                                        "matchup":  "DEN @ NYJ",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w14_g10",
                                        "matchup":  "IND @ PHI",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w14_g11",
                                        "matchup":  "HOU @ WSH",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w14_g12",
                                        "matchup":  "LAC @ LV",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w14_g13",
                                        "matchup":  "KC @ CIN",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w14_g14",
                                        "matchup":  "NYG @ SEA",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w14_g15",
                                        "matchup":  "LAR @ SF",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w14_g16",
                                        "matchup":  "BUF @ GB",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w14_g17",
                                        "matchup":  "PIT @ JAX",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    }
                                ],
                    "Week 4":  [
                                   {
                                       "id":  "w4_g3",
                                       "matchup":  "PIT @ CLE",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w4_g4",
                                       "matchup":  "IND @ WSH",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w4_g5",
                                       "matchup":  "NE @ BUF",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w4_g6",
                                       "matchup":  "LAR @ PHI",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w4_g7",
                                       "matchup":  "NYJ @ CHI",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w4_g8",
                                       "matchup":  "JAX @ CIN",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w4_g9",
                                       "matchup":  "GB @ TB",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w4_g10",
                                       "matchup":  "DAL @ HOU",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w4_g11",
                                       "matchup":  "TEN @ BAL",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w4_g12",
                                       "matchup":  "AZ @ NYG",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w4_g13",
                                       "matchup":  "MIA @ MIN",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w4_g14",
                                       "matchup":  "LAC @ SEA",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w4_g15",
                                       "matchup":  "DEN @ SF",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w4_g16",
                                       "matchup":  "KC @ LV",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w4_g17",
                                       "matchup":  "DET @ CAR",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w4_g18",
                                       "matchup":  "ATL @ NO",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   }
                               ],
                    "Week 8":  [
                                   {
                                       "id":  "w8_g3",
                                       "matchup":  "CAR @ GB",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w8_g4",
                                       "matchup":  "TEN @ CIN",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w8_g5",
                                       "matchup":  "ATL @ TB",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w8_g6",
                                       "matchup":  "MIN @ DET",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w8_g7",
                                       "matchup":  "BAL @ BUF",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w8_g8",
                                       "matchup":  "IND @ JAX",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w8_g9",
                                       "matchup":  "CLE @ PIT",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w8_g10",
                                       "matchup":  "LV @ NYJ",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w8_g11",
                                       "matchup":  "AZ @ DAL",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w8_g12",
                                       "matchup":  "LAC @ LAR",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w8_g13",
                                       "matchup":  "NE @ MIA",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w8_g14",
                                       "matchup":  "KC @ DEN",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w8_g15",
                                       "matchup":  "PHI @ WSH",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w8_g16",
                                       "matchup":  "CHI @ SEA",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   }
                               ],
                    "Week 18":  [
                                    {
                                        "id":  "w18_g3",
                                        "matchup":  "SF @ AZ",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w18_g4",
                                        "matchup":  "ATL @ CAR",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w18_g5",
                                        "matchup":  "PIT @ BAL",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w18_g6",
                                        "matchup":  "NYJ @ BUF",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w18_g7",
                                        "matchup":  "CHI @ MIN",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w18_g8",
                                        "matchup":  "CLE @ CIN",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w18_g9",
                                        "matchup":  "DAL @ WSH",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w18_g10",
                                        "matchup":  "LAC @ DEN",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w18_g11",
                                        "matchup":  "DET @ GB",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w18_g12",
                                        "matchup":  "TEN @ HOU",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w18_g13",
                                        "matchup":  "JAX @ IND",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w18_g14",
                                        "matchup":  "LV @ KC",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w18_g15",
                                        "matchup":  "SEA @ LAR",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w18_g16",
                                        "matchup":  "MIA @ NE",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w18_g17",
                                        "matchup":  "TB @ NO",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w18_g18",
                                        "matchup":  "PHI @ NYG",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    }
                                ],
                    "Week 9":  [
                                   {
                                       "id":  "w9_g3",
                                       "matchup":  "JAX @ BAL",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w9_g4",
                                       "matchup":  "CIN @ ATL",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w9_g5",
                                       "matchup":  "LAR @ WSH",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w9_g6",
                                       "matchup":  "DEN @ CAR",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w9_g7",
                                       "matchup":  "DET @ MIA",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w9_g8",
                                       "matchup":  "CLE @ NO",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w9_g9",
                                       "matchup":  "DAL @ IND",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w9_g10",
                                       "matchup":  "NYJ @ KC",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w9_g11",
                                       "matchup":  "NYG @ PHI",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w9_g12",
                                       "matchup":  "LV @ SF",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w9_g13",
                                       "matchup":  "HOU @ LAC",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w9_g14",
                                       "matchup":  "AZ @ SEA",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w9_g15",
                                       "matchup":  "GB @ NE",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w9_g16",
                                       "matchup":  "TB @ CHI",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w9_g17",
                                       "matchup":  "BUF @ MIN",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   }
                               ],
                    "Week 12":  [
                                    {
                                        "id":  "w12_g3",
                                        "matchup":  "GB @ LAR",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w12_g4",
                                        "matchup":  "CHI @ DET",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w12_g5",
                                        "matchup":  "PHI @ DAL",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w12_g6",
                                        "matchup":  "KC @ BUF",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w12_g7",
                                        "matchup":  "DEN @ PIT",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w12_g8",
                                        "matchup":  "NO @ CIN",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w12_g9",
                                        "matchup":  "BAL @ HOU",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w12_g10",
                                        "matchup":  "NYG @ IND",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w12_g11",
                                        "matchup":  "LV @ CLE",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w12_g12",
                                        "matchup":  "ATL @ MIN",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w12_g13",
                                        "matchup":  "NYJ @ MIA",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w12_g14",
                                        "matchup":  "TEN @ JAX",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w12_g15",
                                        "matchup":  "SEA @ SF",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w12_g16",
                                        "matchup":  "WSH @ AZ",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w12_g17",
                                        "matchup":  "NE @ LAC",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w12_g18",
                                        "matchup":  "CAR @ TB",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    }
                                ],
                    "Week 16":  [
                                    {
                                        "id":  "w16_g3",
                                        "matchup":  "HOU @ PHI",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w16_g4",
                                        "matchup":  "GB @ CHI",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w16_g5",
                                        "matchup":  "BUF @ DEN",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w16_g6",
                                        "matchup":  "LAR @ SEA",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w16_g7",
                                        "matchup":  "TB @ ATL",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w16_g8",
                                        "matchup":  "CIN @ IND",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w16_g9",
                                        "matchup":  "WSH @ MIN",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w16_g10",
                                        "matchup":  "CAR @ PIT",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w16_g11",
                                        "matchup":  "LAC @ MIA",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w16_g12",
                                        "matchup":  "AZ @ NO",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w16_g13",
                                        "matchup":  "NE @ NYJ",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w16_g14",
                                        "matchup":  "CLE @ BAL",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w16_g15",
                                        "matchup":  "TEN @ LV",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w16_g16",
                                        "matchup":  "SF @ KC",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w16_g17",
                                        "matchup":  "JAX @ DAL",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w16_g18",
                                        "matchup":  "NYG @ DET",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    }
                                ],
                    "Week 10":  [
                                    {
                                        "id":  "w10_g3",
                                        "matchup":  "WSH @ NYG",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w10_g4",
                                        "matchup":  "NE @ DET",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w10_g5",
                                        "matchup":  "KC @ ATL",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w10_g6",
                                        "matchup":  "HOU @ CLE",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w10_g7",
                                        "matchup":  "MIN @ GB",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w10_g8",
                                        "matchup":  "MIA @ IND",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w10_g9",
                                        "matchup":  "CAR @ NO",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w10_g10",
                                        "matchup":  "BUF @ NYJ",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w10_g11",
                                        "matchup":  "JAX @ TEN",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w10_g12",
                                        "matchup":  "LAR @ AZ",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w10_g13",
                                        "matchup":  "SEA @ LV",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w10_g14",
                                        "matchup":  "SF @ DAL",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w10_g15",
                                        "matchup":  "PIT @ CIN",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w10_g16",
                                        "matchup":  "LAC @ BAL",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    }
                                ],
                    "Week 7":  [
                                   {
                                       "id":  "w7_g3",
                                       "matchup":  "NE @ CHI",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w7_g4",
                                       "matchup":  "PIT @ NO",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w7_g5",
                                       "matchup":  "SF @ ATL",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w7_g6",
                                       "matchup":  "CIN @ BAL",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w7_g7",
                                       "matchup":  "TB @ CAR",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w7_g8",
                                       "matchup":  "NYG @ HOU",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w7_g9",
                                       "matchup":  "IND @ MIN",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w7_g10",
                                       "matchup":  "MIA @ NYJ",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w7_g11",
                                       "matchup":  "CLE @ TEN",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w7_g12",
                                       "matchup":  "DEN @ AZ",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w7_g13",
                                       "matchup":  "GB @ DET",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w7_g14",
                                       "matchup":  "LAR @ LV",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w7_g15",
                                       "matchup":  "KC @ SEA",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w7_g16",
                                       "matchup":  "DAL @ PHI",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   }
                               ],
                    "Week 15":  [
                                    {
                                        "id":  "w15_g3",
                                        "matchup":  "SF @ LAC",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w15_g4",
                                        "matchup":  "SEA @ PHI",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w15_g5",
                                        "matchup":  "CHI @ BUF",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w15_g6",
                                        "matchup":  "CIN @ CAR",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w15_g7",
                                        "matchup":  "NO @ TB",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w15_g8",
                                        "matchup":  "JAX @ HOU",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w15_g9",
                                        "matchup":  "IND @ TEN",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w15_g10",
                                        "matchup":  "BAL @ PIT",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w15_g11",
                                        "matchup":  "CLE @ NYG",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w15_g12",
                                        "matchup":  "ATL @ WSH",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w15_g13",
                                        "matchup":  "MIA @ GB",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w15_g14",
                                        "matchup":  "NYJ @ AZ",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w15_g15",
                                        "matchup":  "DAL @ LAR",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w15_g16",
                                        "matchup":  "DEN @ LV",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w15_g17",
                                        "matchup":  "DET @ MIN",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w15_g18",
                                        "matchup":  "NE @ KC",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    }
                                ],
                    "Week 2":  [
                                   {
                                       "id":  "w2_g3",
                                       "matchup":  "DET @ BUF",
                                       "homeScore":  41,
                                       "isFinal":  true,
                                       "awayScore":  31,
                                       "winner":  "BUF"
                                   },
                                   {
                                       "id":  "w2_g4",
                                       "matchup":  "CAR @ ATL",
                                       "homeScore":  3,
                                       "isFinal":  true,
                                       "awayScore":  34,
                                       "winner":  "CAR"
                                   },
                                   {
                                       "id":  "w2_g5",
                                       "matchup":  "MIN @ CHI",
                                       "homeScore":  3,
                                       "isFinal":  true,
                                       "awayScore":  9,
                                       "winner":  "MIN"
                                   },
                                   {
                                       "id":  "w2_g6",
                                       "matchup":  "PHI @ TEN",
                                       "homeScore":  20,
                                       "isFinal":  true,
                                       "awayScore":  24,
                                       "winner":  "PHI"
                                   },
                                   {
                                       "id":  "w2_g7",
                                       "matchup":  "PIT @ NE",
                                       "homeScore":  20,
                                       "isFinal":  true,
                                       "awayScore":  3,
                                       "winner":  "NE"
                                   },
                                   {
                                       "id":  "w2_g8",
                                       "matchup":  "GB @ NYJ",
                                       "homeScore":  17,
                                       "isFinal":  true,
                                       "awayScore":  20,
                                       "winner":  "GB"
                                   },
                                   {
                                       "id":  "w2_g9",
                                       "matchup":  "CLE @ TB",
                                       "homeScore":  19,
                                       "isFinal":  true,
                                       "awayScore":  23,
                                       "winner":  "CLE"
                                   },
                                   {
                                       "id":  "w2_g10",
                                       "matchup":  "NO @ BAL",
                                       "homeScore":  17,
                                       "isFinal":  true,
                                       "awayScore":  24,
                                       "winner":  "NO"
                                   },
                                   {
                                       "id":  "w2_g11",
                                       "matchup":  "CIN @ HOU",
                                       "homeScore":  6,
                                       "isFinal":  true,
                                       "awayScore":  20,
                                       "winner":  "CIN"
                                   },
                                   {
                                       "id":  "w2_g12",
                                       "matchup":  "JAX @ DEN",
                                       "homeScore":  20,
                                       "isFinal":  true,
                                       "awayScore":  13,
                                       "winner":  "DEN"
                                   },
                                   {
                                       "id":  "w2_g13",
                                       "matchup":  "LV @ LAC",
                                       "homeScore":  14,
                                       "isFinal":  true,
                                       "awayScore":  26,
                                       "winner":  "LV"
                                   },
                                   {
                                       "id":  "w2_g14",
                                       "matchup":  "WSH @ DAL",
                                       "homeScore":  37,
                                       "isFinal":  true,
                                       "awayScore":  20,
                                       "winner":  "DAL"
                                   },
                                   {
                                       "id":  "w2_g15",
                                       "matchup":  "SEA @ AZ",
                                       "homeScore":  7,
                                       "isFinal":  true,
                                       "awayScore":  31,
                                       "winner":  "SEA"
                                   },
                                   {
                                       "id":  "w2_g16",
                                       "matchup":  "MIA @ SF",
                                       "homeScore":  35,
                                       "isFinal":  true,
                                       "awayScore":  13,
                                       "winner":  "SF"
                                   },
                                   {
                                       "id":  "w2_g17",
                                       "matchup":  "IND @ KC",
                                       "homeScore":  33,
                                       "isFinal":  true,
                                       "awayScore":  30,
                                       "winner":  "KC"
                                   },
                                   {
                                       "id":  "w2_g18",
                                       "matchup":  "NYG @ LAR",
                                       "homeScore":  28,
                                       "isFinal":  true,
                                       "awayScore":  6,
                                       "winner":  "LAR"
                                   }
                               ],
                    "Week 6":  [
                                   {
                                       "id":  "w6_g3",
                                       "matchup":  "SEA @ DEN",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w6_g4",
                                       "matchup":  "HOU @ JAX",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w6_g5",
                                       "matchup":  "CHI @ ATL",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w6_g6",
                                       "matchup":  "BAL @ CLE",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w6_g7",
                                       "matchup":  "TEN @ IND",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w6_g8",
                                       "matchup":  "NYJ @ NE",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w6_g9",
                                       "matchup":  "NO @ NYG",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w6_g10",
                                       "matchup":  "CAR @ PHI",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w6_g11",
                                       "matchup":  "PIT @ TB",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w6_g12",
                                       "matchup":  "AZ @ LAR",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w6_g13",
                                       "matchup":  "LAC @ KC",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w6_g14",
                                       "matchup":  "BUF @ LV",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w6_g15",
                                       "matchup":  "DAL @ GB",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   },
                                   {
                                       "id":  "w6_g16",
                                       "matchup":  "WSH @ SF",
                                       "homeScore":  null,
                                       "isFinal":  false,
                                       "awayScore":  null,
                                       "winner":  ""
                                   }
                               ],
                    "Week 17":  [
                                    {
                                        "id":  "w17_g3",
                                        "matchup":  "BAL @ CIN",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w17_g4",
                                        "matchup":  "SEA @ CAR",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w17_g5",
                                        "matchup":  "NO @ ATL",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w17_g6",
                                        "matchup":  "BUF @ MIA",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w17_g7",
                                        "matchup":  "IND @ CLE",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w17_g8",
                                        "matchup":  "PIT @ TEN",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w17_g9",
                                        "matchup":  "MIN @ NYJ",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w17_g10",
                                        "matchup":  "NYG @ DAL",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w17_g11",
                                        "matchup":  "LV @ AZ",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w17_g12",
                                        "matchup":  "DET @ CHI",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w17_g13",
                                        "matchup":  "PHI @ SF",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w17_g14",
                                        "matchup":  "HOU @ GB",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w17_g15",
                                        "matchup":  "DEN @ NE",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w17_g16",
                                        "matchup":  "KC @ LAC",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w17_g17",
                                        "matchup":  "LAR @ TB",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    },
                                    {
                                        "id":  "w17_g18",
                                        "matchup":  "WSH @ JAX",
                                        "homeScore":  null,
                                        "isFinal":  false,
                                        "awayScore":  null,
                                        "winner":  ""
                                    }
                                ]
                },
    "schedule":  {
                     "Week 13":  [
                                     {
                                         "id":  "w13_g3",
                                         "gameNum":  1,
                                         "week":  13,
                                         "dateTime":  "Thu 12/3 @ 7:15pm (TNF)",
                                         "matchup":  "KC @ LAR",
                                         "awayTeam":  "KC",
                                         "homeTeam":  "LAR"
                                     },
                                     {
                                         "id":  "w13_g4",
                                         "gameNum":  2,
                                         "week":  13,
                                         "dateTime":  "Sun 12/6 @ 12:00pm",
                                         "matchup":  "DET @ ATL",
                                         "awayTeam":  "DET",
                                         "homeTeam":  "ATL"
                                     },
                                     {
                                         "id":  "w13_g5",
                                         "gameNum":  3,
                                         "week":  13,
                                         "dateTime":  "Sun 12/6 @ 12:00pm",
                                         "matchup":  "JAX @ CHI",
                                         "awayTeam":  "JAX",
                                         "homeTeam":  "CHI"
                                     },
                                     {
                                         "id":  "w13_g6",
                                         "gameNum":  4,
                                         "week":  13,
                                         "dateTime":  "Sun 12/6 @ 12:00pm",
                                         "matchup":  "CIN @ CLE",
                                         "awayTeam":  "CIN",
                                         "homeTeam":  "CLE"
                                     },
                                     {
                                         "id":  "w13_g7",
                                         "gameNum":  5,
                                         "week":  13,
                                         "dateTime":  "Sun 12/6 @ 12:00pm",
                                         "matchup":  "GB @ NO",
                                         "awayTeam":  "GB",
                                         "homeTeam":  "NO"
                                     },
                                     {
                                         "id":  "w13_g8",
                                         "gameNum":  6,
                                         "week":  13,
                                         "dateTime":  "Sun 12/6 @ 12:00pm",
                                         "matchup":  "SF @ NYG",
                                         "awayTeam":  "SF",
                                         "homeTeam":  "NYG"
                                     },
                                     {
                                         "id":  "w13_g9",
                                         "gameNum":  7,
                                         "week":  13,
                                         "dateTime":  "Sun 12/6 @ 12:00pm",
                                         "matchup":  "LAC @ TB",
                                         "awayTeam":  "LAC",
                                         "homeTeam":  "TB"
                                     },
                                     {
                                         "id":  "w13_g10",
                                         "gameNum":  8,
                                         "week":  13,
                                         "dateTime":  "Sun 12/6 @ 12:00pm",
                                         "matchup":  "WSH @ TEN",
                                         "awayTeam":  "WSH",
                                         "homeTeam":  "TEN"
                                     },
                                     {
                                         "id":  "w13_g11",
                                         "gameNum":  9,
                                         "week":  13,
                                         "dateTime":  "Sun 12/6 @ 3:05pm",
                                         "matchup":  "PHI @ AZ",
                                         "awayTeam":  "PHI",
                                         "homeTeam":  "AZ"
                                     },
                                     {
                                         "id":  "w13_g12",
                                         "gameNum":  10,
                                         "week":  13,
                                         "dateTime":  "Sun 12/6 @ 3:05pm",
                                         "matchup":  "MIA @ DEN",
                                         "awayTeam":  "MIA",
                                         "homeTeam":  "DEN"
                                     },
                                     {
                                         "id":  "w13_g13",
                                         "gameNum":  11,
                                         "week":  13,
                                         "dateTime":  "Sun 12/6 @ 3:25pm",
                                         "matchup":  "CAR @ MIN",
                                         "awayTeam":  "CAR",
                                         "homeTeam":  "MIN"
                                     },
                                     {
                                         "id":  "w13_g14",
                                         "gameNum":  12,
                                         "week":  13,
                                         "dateTime":  "Sun 12/6 @ 3:25pm",
                                         "matchup":  "BUF @ NE",
                                         "awayTeam":  "BUF",
                                         "homeTeam":  "NE"
                                     },
                                     {
                                         "id":  "w13_g15",
                                         "gameNum":  13,
                                         "week":  13,
                                         "dateTime":  "Sun 12/6 @ 7:20pm (SNF)",
                                         "matchup":  "HOU @ PIT",
                                         "awayTeam":  "HOU",
                                         "homeTeam":  "PIT"
                                     },
                                     {
                                         "id":  "w13_g16",
                                         "gameNum":  14,
                                         "week":  13,
                                         "dateTime":  "Mon 12/7 @ 7:15pm (MNF)",
                                         "matchup":  "DAL @ SEA",
                                         "awayTeam":  "DAL",
                                         "homeTeam":  "SEA"
                                     }
                                 ],
                     "Week 11":  [
                                     {
                                         "id":  "w11_g3",
                                         "gameNum":  1,
                                         "week":  11,
                                         "dateTime":  "Thu 11/19 @ 7:15pm (TNF)",
                                         "matchup":  "IND @ HOU",
                                         "awayTeam":  "IND",
                                         "homeTeam":  "HOU"
                                     },
                                     {
                                         "id":  "w11_g4",
                                         "gameNum":  2,
                                         "week":  11,
                                         "dateTime":  "Sun 11/22 @ 12:00pm",
                                         "matchup":  "BAL @ CAR",
                                         "awayTeam":  "BAL",
                                         "homeTeam":  "CAR"
                                     },
                                     {
                                         "id":  "w11_g5",
                                         "gameNum":  3,
                                         "week":  11,
                                         "dateTime":  "Sun 11/22 @ 12:00pm",
                                         "matchup":  "NO @ CHI",
                                         "awayTeam":  "NO",
                                         "homeTeam":  "CHI"
                                     },
                                     {
                                         "id":  "w11_g6",
                                         "gameNum":  4,
                                         "week":  11,
                                         "dateTime":  "Sun 11/22 @ 12:00pm",
                                         "matchup":  "TB @ DET",
                                         "awayTeam":  "TB",
                                         "homeTeam":  "DET"
                                     },
                                     {
                                         "id":  "w11_g7",
                                         "gameNum":  5,
                                         "week":  11,
                                         "dateTime":  "Sun 11/22 @ 12:00pm",
                                         "matchup":  "MIA @ BUF",
                                         "awayTeam":  "MIA",
                                         "homeTeam":  "BUF"
                                     },
                                     {
                                         "id":  "w11_g8",
                                         "gameNum":  6,
                                         "week":  11,
                                         "dateTime":  "Sun 11/22 @ 12:00pm",
                                         "matchup":  "JAX @ NYG",
                                         "awayTeam":  "JAX",
                                         "homeTeam":  "NYG"
                                     },
                                     {
                                         "id":  "w11_g9",
                                         "gameNum":  7,
                                         "week":  11,
                                         "dateTime":  "Sun 11/22 @ 12:00pm",
                                         "matchup":  "TEN @ DAL",
                                         "awayTeam":  "TEN",
                                         "homeTeam":  "DAL"
                                     },
                                     {
                                         "id":  "w11_g10",
                                         "gameNum":  8,
                                         "week":  11,
                                         "dateTime":  "Sun 11/22 @ 12:00pm",
                                         "matchup":  "AZ @ KC",
                                         "awayTeam":  "AZ",
                                         "homeTeam":  "KC"
                                     },
                                     {
                                         "id":  "w11_g11",
                                         "gameNum":  9,
                                         "week":  11,
                                         "dateTime":  "Sun 11/22 @ 3:05pm",
                                         "matchup":  "NYJ @ LAC",
                                         "awayTeam":  "NYJ",
                                         "homeTeam":  "LAC"
                                     },
                                     {
                                         "id":  "w11_g12",
                                         "gameNum":  10,
                                         "week":  11,
                                         "dateTime":  "Sun 11/22 @ 3:25pm",
                                         "matchup":  "PIT @ PHI",
                                         "awayTeam":  "PIT",
                                         "homeTeam":  "PHI"
                                     },
                                     {
                                         "id":  "w11_g13",
                                         "gameNum":  11,
                                         "week":  11,
                                         "dateTime":  "Sun 11/22 @ 3:25pm",
                                         "matchup":  "LV @ DEN",
                                         "awayTeam":  "LV",
                                         "homeTeam":  "DEN"
                                     },
                                     {
                                         "id":  "w11_g14",
                                         "gameNum":  12,
                                         "week":  11,
                                         "dateTime":  "Sun 11/22 @ 7:20pm (SNF)",
                                         "matchup":  "MIN @ SF",
                                         "awayTeam":  "MIN",
                                         "homeTeam":  "SF"
                                     },
                                     {
                                         "id":  "w11_g15",
                                         "gameNum":  13,
                                         "week":  11,
                                         "dateTime":  "Mon 11/23 @ 7:15pm (MNF)",
                                         "matchup":  "CIN @ WSH",
                                         "awayTeam":  "CIN",
                                         "homeTeam":  "WSH"
                                     }
                                 ],
                     "Week 3":  [
                                    {
                                        "id":  "w3_g3",
                                        "gameNum":  1,
                                        "week":  3,
                                        "dateTime":  "Thu 9/24 @ 7:15pm (TNF)",
                                        "matchup":  "ATL @ GB",
                                        "awayTeam":  "ATL",
                                        "homeTeam":  "GB"
                                    },
                                    {
                                        "id":  "w3_g4",
                                        "gameNum":  2,
                                        "week":  3,
                                        "dateTime":  "Sun 9/27 @ 12:00pm",
                                        "matchup":  "LAC @ BUF",
                                        "awayTeam":  "LAC",
                                        "homeTeam":  "BUF"
                                    },
                                    {
                                        "id":  "w3_g5",
                                        "gameNum":  3,
                                        "week":  3,
                                        "dateTime":  "Sun 9/27 @ 12:00pm",
                                        "matchup":  "CAR @ CLE",
                                        "awayTeam":  "CAR",
                                        "homeTeam":  "CLE"
                                    },
                                    {
                                        "id":  "w3_g6",
                                        "gameNum":  4,
                                        "week":  3,
                                        "dateTime":  "Sun 9/27 @ 12:00pm",
                                        "matchup":  "NYJ @ DET",
                                        "awayTeam":  "NYJ",
                                        "homeTeam":  "DET"
                                    },
                                    {
                                        "id":  "w3_g7",
                                        "gameNum":  5,
                                        "week":  3,
                                        "dateTime":  "Sun 9/27 @ 12:00pm",
                                        "matchup":  "HOU @ IND",
                                        "awayTeam":  "HOU",
                                        "homeTeam":  "IND"
                                    },
                                    {
                                        "id":  "w3_g8",
                                        "gameNum":  6,
                                        "week":  3,
                                        "dateTime":  "Sun 9/27 @ 12:00pm",
                                        "matchup":  "KC @ MIA",
                                        "awayTeam":  "KC",
                                        "homeTeam":  "MIA"
                                    },
                                    {
                                        "id":  "w3_g9",
                                        "gameNum":  7,
                                        "week":  3,
                                        "dateTime":  "Sun 9/27 @ 12:00pm",
                                        "matchup":  "TEN @ NYG",
                                        "awayTeam":  "TEN",
                                        "homeTeam":  "NYG"
                                    },
                                    {
                                        "id":  "w3_g10",
                                        "gameNum":  8,
                                        "week":  3,
                                        "dateTime":  "Sun 9/27 @ 12:00pm",
                                        "matchup":  "CIN @ PIT",
                                        "awayTeam":  "CIN",
                                        "homeTeam":  "PIT"
                                    },
                                    {
                                        "id":  "w3_g11",
                                        "gameNum":  9,
                                        "week":  3,
                                        "dateTime":  "Sun 9/27 @ 12:00pm",
                                        "matchup":  "SEA @ WSH",
                                        "awayTeam":  "SEA",
                                        "homeTeam":  "WSH"
                                    },
                                    {
                                        "id":  "w3_g12",
                                        "gameNum":  10,
                                        "week":  3,
                                        "dateTime":  "Sun 9/27 @ 12:00pm",
                                        "matchup":  "NE @ JAX",
                                        "awayTeam":  "NE",
                                        "homeTeam":  "JAX"
                                    },
                                    {
                                        "id":  "w3_g13",
                                        "gameNum":  11,
                                        "week":  3,
                                        "dateTime":  "Sun 9/27 @ 3:05pm",
                                        "matchup":  "AZ @ SF",
                                        "awayTeam":  "AZ",
                                        "homeTeam":  "SF"
                                    },
                                    {
                                        "id":  "w3_g14",
                                        "gameNum":  12,
                                        "week":  3,
                                        "dateTime":  "Sun 9/27 @ 3:05pm",
                                        "matchup":  "MIN @ TB",
                                        "awayTeam":  "MIN",
                                        "homeTeam":  "TB"
                                    },
                                    {
                                        "id":  "w3_g15",
                                        "gameNum":  13,
                                        "week":  3,
                                        "dateTime":  "Sun 9/27 @ 3:25pm (INTL)",
                                        "matchup":  "BAL @ DAL",
                                        "awayTeam":  "BAL",
                                        "homeTeam":  "DAL"
                                    },
                                    {
                                        "id":  "w3_g16",
                                        "gameNum":  14,
                                        "week":  3,
                                        "dateTime":  "Sun 9/27 @ 3:25pm",
                                        "matchup":  "LV @ NO",
                                        "awayTeam":  "LV",
                                        "homeTeam":  "NO"
                                    },
                                    {
                                        "id":  "w3_g17",
                                        "gameNum":  15,
                                        "week":  3,
                                        "dateTime":  "Sun 9/27 @ 7:20pm (SNF)",
                                        "matchup":  "LAR @ DEN",
                                        "awayTeam":  "LAR",
                                        "homeTeam":  "DEN"
                                    },
                                    {
                                        "id":  "w3_g18",
                                        "gameNum":  16,
                                        "week":  3,
                                        "dateTime":  "Mon 9/28 @ 7:15pm (MNF)",
                                        "matchup":  "PHI @ CHI",
                                        "awayTeam":  "PHI",
                                        "homeTeam":  "CHI"
                                    }
                                ],
                     "Week 1":  [
                                    {
                                        "id":  "w1_g3",
                                        "gameNum":  1,
                                        "week":  1,
                                        "dateTime":  "Wed 9/9 @ 7:20pm",
                                        "matchup":  "NE @ SEA",
                                        "awayTeam":  "NE",
                                        "homeTeam":  "SEA"
                                    },
                                    {
                                        "id":  "w1_g4",
                                        "gameNum":  2,
                                        "week":  1,
                                        "dateTime":  "Thu 9/10 @ 7:35pm (INTL)",
                                        "matchup":  "SF @ LAR",
                                        "awayTeam":  "SF",
                                        "homeTeam":  "LAR"
                                    },
                                    {
                                        "id":  "w1_g5",
                                        "gameNum":  3,
                                        "week":  1,
                                        "dateTime":  "Sun 9/13 @ 12:00pm",
                                        "matchup":  "TB @ CIN",
                                        "awayTeam":  "TB",
                                        "homeTeam":  "CIN"
                                    },
                                    {
                                        "id":  "w1_g6",
                                        "gameNum":  4,
                                        "week":  1,
                                        "dateTime":  "Sun 9/13 @ 12:00pm",
                                        "matchup":  "NO @ DET",
                                        "awayTeam":  "NO",
                                        "homeTeam":  "DET"
                                    },
                                    {
                                        "id":  "w1_g7",
                                        "gameNum":  5,
                                        "week":  1,
                                        "dateTime":  "Sun 9/13 @ 12:00pm",
                                        "matchup":  "NYJ @ TEN",
                                        "awayTeam":  "NYJ",
                                        "homeTeam":  "TEN"
                                    },
                                    {
                                        "id":  "w1_g8",
                                        "gameNum":  6,
                                        "week":  1,
                                        "dateTime":  "Sun 9/13 @ 12:00pm",
                                        "matchup":  "BAL @ IND",
                                        "awayTeam":  "BAL",
                                        "homeTeam":  "IND"
                                    },
                                    {
                                        "id":  "w1_g9",
                                        "gameNum":  7,
                                        "week":  1,
                                        "dateTime":  "Sun 9/13 @ 12:00pm",
                                        "matchup":  "ATL @ PIT",
                                        "awayTeam":  "ATL",
                                        "homeTeam":  "PIT"
                                    },
                                    {
                                        "id":  "w1_g10",
                                        "gameNum":  8,
                                        "week":  1,
                                        "dateTime":  "Sun 9/13 @ 12:00pm",
                                        "matchup":  "CHI @ CAR",
                                        "awayTeam":  "CHI",
                                        "homeTeam":  "CAR"
                                    },
                                    {
                                        "id":  "w1_g11",
                                        "gameNum":  9,
                                        "week":  1,
                                        "dateTime":  "Sun 9/13 @ 12:00pm",
                                        "matchup":  "CLE @ JAX",
                                        "awayTeam":  "CLE",
                                        "homeTeam":  "JAX"
                                    },
                                    {
                                        "id":  "w1_g12",
                                        "gameNum":  10,
                                        "week":  1,
                                        "dateTime":  "Sun 9/13 @ 12:00pm",
                                        "matchup":  "BUF @ HOU",
                                        "awayTeam":  "BUF",
                                        "homeTeam":  "HOU"
                                    },
                                    {
                                        "id":  "w1_g13",
                                        "gameNum":  11,
                                        "week":  1,
                                        "dateTime":  "Sun 9/13 @ 3:25pm",
                                        "matchup":  "MIA @ LV",
                                        "awayTeam":  "MIA",
                                        "homeTeam":  "LV"
                                    },
                                    {
                                        "id":  "w1_g14",
                                        "gameNum":  12,
                                        "week":  1,
                                        "dateTime":  "Sun 9/13 @ 3:25pm",
                                        "matchup":  "GB @ MIN",
                                        "awayTeam":  "GB",
                                        "homeTeam":  "MIN"
                                    },
                                    {
                                        "id":  "w1_g15",
                                        "gameNum":  13,
                                        "week":  1,
                                        "dateTime":  "Sun 9/13 @ 3:25pm",
                                        "matchup":  "WSH @ PHI",
                                        "awayTeam":  "WSH",
                                        "homeTeam":  "PHI"
                                    },
                                    {
                                        "id":  "w1_g16",
                                        "gameNum":  14,
                                        "week":  1,
                                        "dateTime":  "Sun 9/13 @ 3:25pm",
                                        "matchup":  "AZ @ LAC",
                                        "awayTeam":  "AZ",
                                        "homeTeam":  "LAC"
                                    },
                                    {
                                        "id":  "w1_g17",
                                        "gameNum":  15,
                                        "week":  1,
                                        "dateTime":  "Sun 9/13 @ 7:20pm (SNF)",
                                        "matchup":  "DAL @ NYG",
                                        "awayTeam":  "DAL",
                                        "homeTeam":  "NYG"
                                    },
                                    {
                                        "id":  "w1_g18",
                                        "gameNum":  16,
                                        "week":  1,
                                        "dateTime":  "Mon 9/14 @ 7:15pm (MNF)",
                                        "matchup":  "DEN @ KC",
                                        "awayTeam":  "DEN",
                                        "homeTeam":  "KC"
                                    }
                                ],
                     "Week 5":  [
                                    {
                                        "id":  "w5_g3",
                                        "gameNum":  1,
                                        "week":  5,
                                        "dateTime":  "Thu 10/8 @ 7:15pm (TNF)",
                                        "matchup":  "TB @ DAL",
                                        "awayTeam":  "TB",
                                        "homeTeam":  "DAL"
                                    },
                                    {
                                        "id":  "w5_g4",
                                        "gameNum":  2,
                                        "week":  5,
                                        "dateTime":  "Sun 10/11 @ 8:30am (INTL)",
                                        "matchup":  "PHI @ JAX",
                                        "awayTeam":  "PHI",
                                        "homeTeam":  "JAX"
                                    },
                                    {
                                        "id":  "w5_g5",
                                        "gameNum":  3,
                                        "week":  5,
                                        "dateTime":  "Sun 10/11 @ 12:00pm",
                                        "matchup":  "LV @ NE",
                                        "awayTeam":  "LV",
                                        "homeTeam":  "NE"
                                    },
                                    {
                                        "id":  "w5_g6",
                                        "gameNum":  4,
                                        "week":  5,
                                        "dateTime":  "Sun 10/11 @ 12:00pm",
                                        "matchup":  "CIN @ MIA",
                                        "awayTeam":  "CIN",
                                        "homeTeam":  "MIA"
                                    },
                                    {
                                        "id":  "w5_g7",
                                        "gameNum":  5,
                                        "week":  5,
                                        "dateTime":  "Sun 10/11 @ 12:00pm",
                                        "matchup":  "MIN @ NO",
                                        "awayTeam":  "MIN",
                                        "homeTeam":  "NO"
                                    },
                                    {
                                        "id":  "w5_g8",
                                        "gameNum":  6,
                                        "week":  5,
                                        "dateTime":  "Sun 10/11 @ 12:00pm",
                                        "matchup":  "HOU @ TEN",
                                        "awayTeam":  "HOU",
                                        "homeTeam":  "TEN"
                                    },
                                    {
                                        "id":  "w5_g9",
                                        "gameNum":  7,
                                        "week":  5,
                                        "dateTime":  "Sun 10/11 @ 12:00pm",
                                        "matchup":  "IND @ PIT",
                                        "awayTeam":  "IND",
                                        "homeTeam":  "PIT"
                                    },
                                    {
                                        "id":  "w5_g10",
                                        "gameNum":  8,
                                        "week":  5,
                                        "dateTime":  "Sun 10/11 @ 12:00pm",
                                        "matchup":  "CLE @ NYJ",
                                        "awayTeam":  "CLE",
                                        "homeTeam":  "NYJ"
                                    },
                                    {
                                        "id":  "w5_g11",
                                        "gameNum":  9,
                                        "week":  5,
                                        "dateTime":  "Sun 10/11 @ 12:00pm",
                                        "matchup":  "NYG @ WSH",
                                        "awayTeam":  "NYG",
                                        "homeTeam":  "WSH"
                                    },
                                    {
                                        "id":  "w5_g12",
                                        "gameNum":  10,
                                        "week":  5,
                                        "dateTime":  "Sun 10/11 @ 3:05pm",
                                        "matchup":  "DEN @ LAC",
                                        "awayTeam":  "DEN",
                                        "homeTeam":  "LAC"
                                    },
                                    {
                                        "id":  "w5_g13",
                                        "gameNum":  11,
                                        "week":  5,
                                        "dateTime":  "Sun 10/11 @ 3:25pm",
                                        "matchup":  "SF @ SEA",
                                        "awayTeam":  "SF",
                                        "homeTeam":  "SEA"
                                    },
                                    {
                                        "id":  "w5_g14",
                                        "gameNum":  12,
                                        "week":  5,
                                        "dateTime":  "Sun 10/11 @ 3:25pm",
                                        "matchup":  "CHI @ GB",
                                        "awayTeam":  "CHI",
                                        "homeTeam":  "GB"
                                    },
                                    {
                                        "id":  "w5_g15",
                                        "gameNum":  13,
                                        "week":  5,
                                        "dateTime":  "Sun 10/11 @ 3:25pm",
                                        "matchup":  "DET @ AZ",
                                        "awayTeam":  "DET",
                                        "homeTeam":  "AZ"
                                    },
                                    {
                                        "id":  "w5_g16",
                                        "gameNum":  14,
                                        "week":  5,
                                        "dateTime":  "Sun 10/11 @ 7:20pm (SNF)",
                                        "matchup":  "BAL @ ATL",
                                        "awayTeam":  "BAL",
                                        "homeTeam":  "ATL"
                                    },
                                    {
                                        "id":  "w5_g17",
                                        "gameNum":  15,
                                        "week":  5,
                                        "dateTime":  "Mon 10/12 @ 7:15pm (MNF)",
                                        "matchup":  "BUF @ LAR",
                                        "awayTeam":  "BUF",
                                        "homeTeam":  "LAR"
                                    }
                                ],
                     "Week 14":  [
                                     {
                                         "id":  "w14_g3",
                                         "gameNum":  1,
                                         "week":  14,
                                         "dateTime":  "Thu 12/10 @ 7:15pm (TNF)",
                                         "matchup":  "MIN @ NE",
                                         "awayTeam":  "MIN",
                                         "homeTeam":  "NE"
                                     },
                                     {
                                         "id":  "w14_g4",
                                         "gameNum":  2,
                                         "week":  14,
                                         "dateTime":  "Sun 12/13 @ 12:00pm",
                                         "matchup":  "TB @ BAL",
                                         "awayTeam":  "TB",
                                         "homeTeam":  "BAL"
                                     },
                                     {
                                         "id":  "w14_g5",
                                         "gameNum":  3,
                                         "week":  14,
                                         "dateTime":  "Sun 12/13 @ 12:00pm",
                                         "matchup":  "NO @ CAR",
                                         "awayTeam":  "NO",
                                         "homeTeam":  "CAR"
                                     },
                                     {
                                         "id":  "w14_g6",
                                         "gameNum":  4,
                                         "week":  14,
                                         "dateTime":  "Sun 12/13 @ 12:00pm",
                                         "matchup":  "ATL @ CLE",
                                         "awayTeam":  "ATL",
                                         "homeTeam":  "CLE"
                                     },
                                     {
                                         "id":  "w14_g7",
                                         "gameNum":  5,
                                         "week":  14,
                                         "dateTime":  "Sun 12/13 @ 12:00pm",
                                         "matchup":  "TEN @ DET",
                                         "awayTeam":  "TEN",
                                         "homeTeam":  "DET"
                                     },
                                     {
                                         "id":  "w14_g8",
                                         "gameNum":  6,
                                         "week":  14,
                                         "dateTime":  "Sun 12/13 @ 12:00pm",
                                         "matchup":  "CHI @ MIA",
                                         "awayTeam":  "CHI",
                                         "homeTeam":  "MIA"
                                     },
                                     {
                                         "id":  "w14_g9",
                                         "gameNum":  7,
                                         "week":  14,
                                         "dateTime":  "Sun 12/13 @ 12:00pm",
                                         "matchup":  "DEN @ NYJ",
                                         "awayTeam":  "DEN",
                                         "homeTeam":  "NYJ"
                                     },
                                     {
                                         "id":  "w14_g10",
                                         "gameNum":  8,
                                         "week":  14,
                                         "dateTime":  "Sun 12/13 @ 12:00pm",
                                         "matchup":  "IND @ PHI",
                                         "awayTeam":  "IND",
                                         "homeTeam":  "PHI"
                                     },
                                     {
                                         "id":  "w14_g11",
                                         "gameNum":  9,
                                         "week":  14,
                                         "dateTime":  "Sun 12/13 @ 12:00pm",
                                         "matchup":  "HOU @ WSH",
                                         "awayTeam":  "HOU",
                                         "homeTeam":  "WSH"
                                     },
                                     {
                                         "id":  "w14_g12",
                                         "gameNum":  10,
                                         "week":  14,
                                         "dateTime":  "Sun 12/13 @ 3:05pm",
                                         "matchup":  "LAC @ LV",
                                         "awayTeam":  "LAC",
                                         "homeTeam":  "LV"
                                     },
                                     {
                                         "id":  "w14_g13",
                                         "gameNum":  11,
                                         "week":  14,
                                         "dateTime":  "Sun 12/13 @ 3:25pm",
                                         "matchup":  "KC @ CIN",
                                         "awayTeam":  "KC",
                                         "homeTeam":  "CIN"
                                     },
                                     {
                                         "id":  "w14_g14",
                                         "gameNum":  12,
                                         "week":  14,
                                         "dateTime":  "Sun 12/13 @ 3:25pm",
                                         "matchup":  "NYG @ SEA",
                                         "awayTeam":  "NYG",
                                         "homeTeam":  "SEA"
                                     },
                                     {
                                         "id":  "w14_g15",
                                         "gameNum":  13,
                                         "week":  14,
                                         "dateTime":  "Sun 12/13 @ 3:25pm",
                                         "matchup":  "LAR @ SF",
                                         "awayTeam":  "LAR",
                                         "homeTeam":  "SF"
                                     },
                                     {
                                         "id":  "w14_g16",
                                         "gameNum":  14,
                                         "week":  14,
                                         "dateTime":  "Sun 12/13 @ 7:20pm (SNF)",
                                         "matchup":  "BUF @ GB",
                                         "awayTeam":  "BUF",
                                         "homeTeam":  "GB"
                                     },
                                     {
                                         "id":  "w14_g17",
                                         "gameNum":  15,
                                         "week":  14,
                                         "dateTime":  "Mon 12/14 @ 7:15pm (MNF)",
                                         "matchup":  "PIT @ JAX",
                                         "awayTeam":  "PIT",
                                         "homeTeam":  "JAX"
                                     }
                                 ],
                     "Week 4":  [
                                    {
                                        "id":  "w4_g3",
                                        "gameNum":  1,
                                        "week":  4,
                                        "dateTime":  "Thu 10/1 @ 7:15pm (TNF)",
                                        "matchup":  "PIT @ CLE",
                                        "awayTeam":  "PIT",
                                        "homeTeam":  "CLE"
                                    },
                                    {
                                        "id":  "w4_g4",
                                        "gameNum":  2,
                                        "week":  4,
                                        "dateTime":  "Sun 10/4 @ 8:30am (INTL)",
                                        "matchup":  "IND @ WSH",
                                        "awayTeam":  "IND",
                                        "homeTeam":  "WSH"
                                    },
                                    {
                                        "id":  "w4_g5",
                                        "gameNum":  3,
                                        "week":  4,
                                        "dateTime":  "Sun 10/4 @ 12:00pm",
                                        "matchup":  "NE @ BUF",
                                        "awayTeam":  "NE",
                                        "homeTeam":  "BUF"
                                    },
                                    {
                                        "id":  "w4_g6",
                                        "gameNum":  4,
                                        "week":  4,
                                        "dateTime":  "Sun 10/4 @ 12:00pm",
                                        "matchup":  "LAR @ PHI",
                                        "awayTeam":  "LAR",
                                        "homeTeam":  "PHI"
                                    },
                                    {
                                        "id":  "w4_g7",
                                        "gameNum":  5,
                                        "week":  4,
                                        "dateTime":  "Sun 10/4 @ 12:00pm",
                                        "matchup":  "NYJ @ CHI",
                                        "awayTeam":  "NYJ",
                                        "homeTeam":  "CHI"
                                    },
                                    {
                                        "id":  "w4_g8",
                                        "gameNum":  6,
                                        "week":  4,
                                        "dateTime":  "Sun 10/4 @ 12:00pm",
                                        "matchup":  "JAX @ CIN",
                                        "awayTeam":  "JAX",
                                        "homeTeam":  "CIN"
                                    },
                                    {
                                        "id":  "w4_g9",
                                        "gameNum":  7,
                                        "week":  4,
                                        "dateTime":  "Sun 10/4 @ 12:00pm",
                                        "matchup":  "GB @ TB",
                                        "awayTeam":  "GB",
                                        "homeTeam":  "TB"
                                    },
                                    {
                                        "id":  "w4_g10",
                                        "gameNum":  8,
                                        "week":  4,
                                        "dateTime":  "Sun 10/4 @ 12:00pm",
                                        "matchup":  "DAL @ HOU",
                                        "awayTeam":  "DAL",
                                        "homeTeam":  "HOU"
                                    },
                                    {
                                        "id":  "w4_g11",
                                        "gameNum":  9,
                                        "week":  4,
                                        "dateTime":  "Sun 10/4 @ 12:00pm",
                                        "matchup":  "TEN @ BAL",
                                        "awayTeam":  "TEN",
                                        "homeTeam":  "BAL"
                                    },
                                    {
                                        "id":  "w4_g12",
                                        "gameNum":  10,
                                        "week":  4,
                                        "dateTime":  "Sun 10/4 @ 12:00pm",
                                        "matchup":  "AZ @ NYG",
                                        "awayTeam":  "AZ",
                                        "homeTeam":  "NYG"
                                    },
                                    {
                                        "id":  "w4_g13",
                                        "gameNum":  11,
                                        "week":  4,
                                        "dateTime":  "Sun 10/4 @ 3:05pm",
                                        "matchup":  "MIA @ MIN",
                                        "awayTeam":  "MIA",
                                        "homeTeam":  "MIN"
                                    },
                                    {
                                        "id":  "w4_g14",
                                        "gameNum":  12,
                                        "week":  4,
                                        "dateTime":  "Sun 10/4 @ 3:25pm",
                                        "matchup":  "LAC @ SEA",
                                        "awayTeam":  "LAC",
                                        "homeTeam":  "SEA"
                                    },
                                    {
                                        "id":  "w4_g15",
                                        "gameNum":  13,
                                        "week":  4,
                                        "dateTime":  "Sun 10/4 @ 3:25pm",
                                        "matchup":  "DEN @ SF",
                                        "awayTeam":  "DEN",
                                        "homeTeam":  "SF"
                                    },
                                    {
                                        "id":  "w4_g16",
                                        "gameNum":  14,
                                        "week":  4,
                                        "dateTime":  "Sun 10/4 @ 3:25pm",
                                        "matchup":  "KC @ LV",
                                        "awayTeam":  "KC",
                                        "homeTeam":  "LV"
                                    },
                                    {
                                        "id":  "w4_g17",
                                        "gameNum":  15,
                                        "week":  4,
                                        "dateTime":  "Sun 10/4 @ 7:20pm (SNF)",
                                        "matchup":  "DET @ CAR",
                                        "awayTeam":  "DET",
                                        "homeTeam":  "CAR"
                                    },
                                    {
                                        "id":  "w4_g18",
                                        "gameNum":  16,
                                        "week":  4,
                                        "dateTime":  "Mon 10/5 @ 7:15pm (MNF)",
                                        "matchup":  "ATL @ NO",
                                        "awayTeam":  "ATL",
                                        "homeTeam":  "NO"
                                    }
                                ],
                     "Week 8":  [
                                    {
                                        "id":  "w8_g3",
                                        "gameNum":  1,
                                        "week":  8,
                                        "dateTime":  "Thu 10/29 @ 7:15pm (TNF)",
                                        "matchup":  "CAR @ GB",
                                        "awayTeam":  "CAR",
                                        "homeTeam":  "GB"
                                    },
                                    {
                                        "id":  "w8_g4",
                                        "gameNum":  2,
                                        "week":  8,
                                        "dateTime":  "Sun 11/1 @ 12:00pm",
                                        "matchup":  "TEN @ CIN",
                                        "awayTeam":  "TEN",
                                        "homeTeam":  "CIN"
                                    },
                                    {
                                        "id":  "w8_g5",
                                        "gameNum":  3,
                                        "week":  8,
                                        "dateTime":  "Sun 11/1 @ 12:00pm",
                                        "matchup":  "ATL @ TB",
                                        "awayTeam":  "ATL",
                                        "homeTeam":  "TB"
                                    },
                                    {
                                        "id":  "w8_g6",
                                        "gameNum":  4,
                                        "week":  8,
                                        "dateTime":  "Sun 11/1 @ 12:00pm",
                                        "matchup":  "MIN @ DET",
                                        "awayTeam":  "MIN",
                                        "homeTeam":  "DET"
                                    },
                                    {
                                        "id":  "w8_g7",
                                        "gameNum":  5,
                                        "week":  8,
                                        "dateTime":  "Sun 11/1 @ 12:00pm",
                                        "matchup":  "BAL @ BUF",
                                        "awayTeam":  "BAL",
                                        "homeTeam":  "BUF"
                                    },
                                    {
                                        "id":  "w8_g8",
                                        "gameNum":  6,
                                        "week":  8,
                                        "dateTime":  "Sun 11/1 @ 12:00pm",
                                        "matchup":  "IND @ JAX",
                                        "awayTeam":  "IND",
                                        "homeTeam":  "JAX"
                                    },
                                    {
                                        "id":  "w8_g9",
                                        "gameNum":  7,
                                        "week":  8,
                                        "dateTime":  "Sun 11/1 @ 12:00pm",
                                        "matchup":  "CLE @ PIT",
                                        "awayTeam":  "CLE",
                                        "homeTeam":  "PIT"
                                    },
                                    {
                                        "id":  "w8_g10",
                                        "gameNum":  8,
                                        "week":  8,
                                        "dateTime":  "Sun 11/1 @ 12:00pm",
                                        "matchup":  "LV @ NYJ",
                                        "awayTeam":  "LV",
                                        "homeTeam":  "NYJ"
                                    },
                                    {
                                        "id":  "w8_g11",
                                        "gameNum":  9,
                                        "week":  8,
                                        "dateTime":  "Sun 11/1 @ 12:00pm",
                                        "matchup":  "AZ @ DAL",
                                        "awayTeam":  "AZ",
                                        "homeTeam":  "DAL"
                                    },
                                    {
                                        "id":  "w8_g12",
                                        "gameNum":  10,
                                        "week":  8,
                                        "dateTime":  "Sun 11/1 @ 3:05pm",
                                        "matchup":  "LAC @ LAR",
                                        "awayTeam":  "LAC",
                                        "homeTeam":  "LAR"
                                    },
                                    {
                                        "id":  "w8_g13",
                                        "gameNum":  11,
                                        "week":  8,
                                        "dateTime":  "Sun 11/1 @ 3:25pm",
                                        "matchup":  "NE @ MIA",
                                        "awayTeam":  "NE",
                                        "homeTeam":  "MIA"
                                    },
                                    {
                                        "id":  "w8_g14",
                                        "gameNum":  12,
                                        "week":  8,
                                        "dateTime":  "Sun 11/1 @ 3:25pm",
                                        "matchup":  "KC @ DEN",
                                        "awayTeam":  "KC",
                                        "homeTeam":  "DEN"
                                    },
                                    {
                                        "id":  "w8_g15",
                                        "gameNum":  13,
                                        "week":  8,
                                        "dateTime":  "Sun 11/1 @ 7:20pm (SNF)",
                                        "matchup":  "PHI @ WSH",
                                        "awayTeam":  "PHI",
                                        "homeTeam":  "WSH"
                                    },
                                    {
                                        "id":  "w8_g16",
                                        "gameNum":  14,
                                        "week":  8,
                                        "dateTime":  "Mon 11/2 @ 7:15pm (MNF)",
                                        "matchup":  "CHI @ SEA",
                                        "awayTeam":  "CHI",
                                        "homeTeam":  "SEA"
                                    }
                                ],
                     "Week 9":  [
                                    {
                                        "id":  "w9_g3",
                                        "gameNum":  1,
                                        "week":  9,
                                        "dateTime":  "Thu 11/5 @ 7:15pm (TNF)",
                                        "matchup":  "JAX @ BAL",
                                        "awayTeam":  "JAX",
                                        "homeTeam":  "BAL"
                                    },
                                    {
                                        "id":  "w9_g4",
                                        "gameNum":  2,
                                        "week":  9,
                                        "dateTime":  "Sun 11/8 @ 8:30am (INTL)",
                                        "matchup":  "CIN @ ATL",
                                        "awayTeam":  "CIN",
                                        "homeTeam":  "ATL"
                                    },
                                    {
                                        "id":  "w9_g5",
                                        "gameNum":  3,
                                        "week":  9,
                                        "dateTime":  "Sun 11/8 @ 12:00pm",
                                        "matchup":  "LAR @ WSH",
                                        "awayTeam":  "LAR",
                                        "homeTeam":  "WSH"
                                    },
                                    {
                                        "id":  "w9_g6",
                                        "gameNum":  4,
                                        "week":  9,
                                        "dateTime":  "Sun 11/8 @ 12:00pm",
                                        "matchup":  "DEN @ CAR",
                                        "awayTeam":  "DEN",
                                        "homeTeam":  "CAR"
                                    },
                                    {
                                        "id":  "w9_g7",
                                        "gameNum":  5,
                                        "week":  9,
                                        "dateTime":  "Sun 11/8 @ 12:00pm",
                                        "matchup":  "DET @ MIA",
                                        "awayTeam":  "DET",
                                        "homeTeam":  "MIA"
                                    },
                                    {
                                        "id":  "w9_g8",
                                        "gameNum":  6,
                                        "week":  9,
                                        "dateTime":  "Sun 11/8 @ 12:00pm",
                                        "matchup":  "CLE @ NO",
                                        "awayTeam":  "CLE",
                                        "homeTeam":  "NO"
                                    },
                                    {
                                        "id":  "w9_g9",
                                        "gameNum":  7,
                                        "week":  9,
                                        "dateTime":  "Sun 11/8 @ 12:00pm",
                                        "matchup":  "DAL @ IND",
                                        "awayTeam":  "DAL",
                                        "homeTeam":  "IND"
                                    },
                                    {
                                        "id":  "w9_g10",
                                        "gameNum":  8,
                                        "week":  9,
                                        "dateTime":  "Sun 11/8 @ 12:00pm",
                                        "matchup":  "NYJ @ KC",
                                        "awayTeam":  "NYJ",
                                        "homeTeam":  "KC"
                                    },
                                    {
                                        "id":  "w9_g11",
                                        "gameNum":  9,
                                        "week":  9,
                                        "dateTime":  "Sun 11/8 @ 12:00pm",
                                        "matchup":  "NYG @ PHI",
                                        "awayTeam":  "NYG",
                                        "homeTeam":  "PHI"
                                    },
                                    {
                                        "id":  "w9_g12",
                                        "gameNum":  10,
                                        "week":  9,
                                        "dateTime":  "Sun 11/8 @ 3:05pm",
                                        "matchup":  "LV @ SF",
                                        "awayTeam":  "LV",
                                        "homeTeam":  "SF"
                                    },
                                    {
                                        "id":  "w9_g13",
                                        "gameNum":  11,
                                        "week":  9,
                                        "dateTime":  "Sun 11/8 @ 3:05pm",
                                        "matchup":  "HOU @ LAC",
                                        "awayTeam":  "HOU",
                                        "homeTeam":  "LAC"
                                    },
                                    {
                                        "id":  "w9_g14",
                                        "gameNum":  12,
                                        "week":  9,
                                        "dateTime":  "Sun 11/8 @ 3:25pm",
                                        "matchup":  "AZ @ SEA",
                                        "awayTeam":  "AZ",
                                        "homeTeam":  "SEA"
                                    },
                                    {
                                        "id":  "w9_g15",
                                        "gameNum":  13,
                                        "week":  9,
                                        "dateTime":  "Sun 11/8 @ 3:25pm",
                                        "matchup":  "GB @ NE",
                                        "awayTeam":  "GB",
                                        "homeTeam":  "NE"
                                    },
                                    {
                                        "id":  "w9_g16",
                                        "gameNum":  14,
                                        "week":  9,
                                        "dateTime":  "Sun 11/8 @ 7:20pm (SNF)",
                                        "matchup":  "TB @ CHI",
                                        "awayTeam":  "TB",
                                        "homeTeam":  "CHI"
                                    },
                                    {
                                        "id":  "w9_g17",
                                        "gameNum":  15,
                                        "week":  9,
                                        "dateTime":  "Mon 11/9 @ 7:15pm (MNF)",
                                        "matchup":  "BUF @ MIN",
                                        "awayTeam":  "BUF",
                                        "homeTeam":  "MIN"
                                    }
                                ],
                     "Week 10":  [
                                     {
                                         "id":  "w10_g3",
                                         "gameNum":  1,
                                         "week":  10,
                                         "dateTime":  "Thu 11/12 @ 7:15pm (TNF)",
                                         "matchup":  "WSH @ NYG",
                                         "awayTeam":  "WSH",
                                         "homeTeam":  "NYG"
                                     },
                                     {
                                         "id":  "w10_g4",
                                         "gameNum":  2,
                                         "week":  10,
                                         "dateTime":  "Sun 11/15 @ 8:30am (INTL)",
                                         "matchup":  "NE @ DET",
                                         "awayTeam":  "NE",
                                         "homeTeam":  "DET"
                                     },
                                     {
                                         "id":  "w10_g5",
                                         "gameNum":  3,
                                         "week":  10,
                                         "dateTime":  "Sun 11/15 @ 12:00pm",
                                         "matchup":  "KC @ ATL",
                                         "awayTeam":  "KC",
                                         "homeTeam":  "ATL"
                                     },
                                     {
                                         "id":  "w10_g6",
                                         "gameNum":  4,
                                         "week":  10,
                                         "dateTime":  "Sun 11/15 @ 12:00pm",
                                         "matchup":  "HOU @ CLE",
                                         "awayTeam":  "HOU",
                                         "homeTeam":  "CLE"
                                     },
                                     {
                                         "id":  "w10_g7",
                                         "gameNum":  5,
                                         "week":  10,
                                         "dateTime":  "Sun 11/15 @ 12:00pm",
                                         "matchup":  "MIN @ GB",
                                         "awayTeam":  "MIN",
                                         "homeTeam":  "GB"
                                     },
                                     {
                                         "id":  "w10_g8",
                                         "gameNum":  6,
                                         "week":  10,
                                         "dateTime":  "Sun 11/15 @ 12:00pm",
                                         "matchup":  "MIA @ IND",
                                         "awayTeam":  "MIA",
                                         "homeTeam":  "IND"
                                     },
                                     {
                                         "id":  "w10_g9",
                                         "gameNum":  7,
                                         "week":  10,
                                         "dateTime":  "Sun 11/15 @ 12:00pm",
                                         "matchup":  "CAR @ NO",
                                         "awayTeam":  "CAR",
                                         "homeTeam":  "NO"
                                     },
                                     {
                                         "id":  "w10_g10",
                                         "gameNum":  8,
                                         "week":  10,
                                         "dateTime":  "Sun 11/15 @ 12:00pm",
                                         "matchup":  "BUF @ NYJ",
                                         "awayTeam":  "BUF",
                                         "homeTeam":  "NYJ"
                                     },
                                     {
                                         "id":  "w10_g11",
                                         "gameNum":  9,
                                         "week":  10,
                                         "dateTime":  "Sun 11/15 @ 12:00pm",
                                         "matchup":  "JAX @ TEN",
                                         "awayTeam":  "JAX",
                                         "homeTeam":  "TEN"
                                     },
                                     {
                                         "id":  "w10_g12",
                                         "gameNum":  10,
                                         "week":  10,
                                         "dateTime":  "Sun 11/15 @ 3:05pm",
                                         "matchup":  "LAR @ AZ",
                                         "awayTeam":  "LAR",
                                         "homeTeam":  "AZ"
                                     },
                                     {
                                         "id":  "w10_g13",
                                         "gameNum":  11,
                                         "week":  10,
                                         "dateTime":  "Sun 11/15 @ 3:05pm",
                                         "matchup":  "SEA @ LV",
                                         "awayTeam":  "SEA",
                                         "homeTeam":  "LV"
                                     },
                                     {
                                         "id":  "w10_g14",
                                         "gameNum":  12,
                                         "week":  10,
                                         "dateTime":  "Sun 11/15 @ 3:25pm",
                                         "matchup":  "SF @ DAL",
                                         "awayTeam":  "SF",
                                         "homeTeam":  "DAL"
                                     },
                                     {
                                         "id":  "w10_g15",
                                         "gameNum":  13,
                                         "week":  10,
                                         "dateTime":  "Sun 11/15 @ 7:20pm (SNF)",
                                         "matchup":  "PIT @ CIN",
                                         "awayTeam":  "PIT",
                                         "homeTeam":  "CIN"
                                     },
                                     {
                                         "id":  "w10_g16",
                                         "gameNum":  14,
                                         "week":  10,
                                         "dateTime":  "Mon 11/16 @ 7:15pm (MNF)",
                                         "matchup":  "LAC @ BAL",
                                         "awayTeam":  "LAC",
                                         "homeTeam":  "BAL"
                                     }
                                 ],
                     "Week 18":  [
                                     {
                                         "id":  "w18_g3",
                                         "gameNum":  1,
                                         "week":  18,
                                         "dateTime":  "Sun 1/10 @ TBD",
                                         "matchup":  "SF @ AZ",
                                         "awayTeam":  "SF",
                                         "homeTeam":  "AZ"
                                     },
                                     {
                                         "id":  "w18_g4",
                                         "gameNum":  2,
                                         "week":  18,
                                         "dateTime":  "Sun 1/10 @ TBD",
                                         "matchup":  "ATL @ CAR",
                                         "awayTeam":  "ATL",
                                         "homeTeam":  "CAR"
                                     },
                                     {
                                         "id":  "w18_g5",
                                         "gameNum":  3,
                                         "week":  18,
                                         "dateTime":  "Sun 1/10 @ TBD",
                                         "matchup":  "PIT @ BAL",
                                         "awayTeam":  "PIT",
                                         "homeTeam":  "BAL"
                                     },
                                     {
                                         "id":  "w18_g6",
                                         "gameNum":  4,
                                         "week":  18,
                                         "dateTime":  "Sun 1/10 @ TBD",
                                         "matchup":  "NYJ @ BUF",
                                         "awayTeam":  "NYJ",
                                         "homeTeam":  "BUF"
                                     },
                                     {
                                         "id":  "w18_g7",
                                         "gameNum":  5,
                                         "week":  18,
                                         "dateTime":  "Sun 1/10 @ TBD",
                                         "matchup":  "CHI @ MIN",
                                         "awayTeam":  "CHI",
                                         "homeTeam":  "MIN"
                                     },
                                     {
                                         "id":  "w18_g8",
                                         "gameNum":  6,
                                         "week":  18,
                                         "dateTime":  "Sun 1/10 @ TBD",
                                         "matchup":  "CLE @ CIN",
                                         "awayTeam":  "CLE",
                                         "homeTeam":  "CIN"
                                     },
                                     {
                                         "id":  "w18_g9",
                                         "gameNum":  7,
                                         "week":  18,
                                         "dateTime":  "Sun 1/10 @ TBD",
                                         "matchup":  "DAL @ WSH",
                                         "awayTeam":  "DAL",
                                         "homeTeam":  "WSH"
                                     },
                                     {
                                         "id":  "w18_g10",
                                         "gameNum":  8,
                                         "week":  18,
                                         "dateTime":  "Sun 1/10 @ TBD",
                                         "matchup":  "LAC @ DEN",
                                         "awayTeam":  "LAC",
                                         "homeTeam":  "DEN"
                                     },
                                     {
                                         "id":  "w18_g11",
                                         "gameNum":  9,
                                         "week":  18,
                                         "dateTime":  "Sun 1/10 @ TBD",
                                         "matchup":  "DET @ GB",
                                         "awayTeam":  "DET",
                                         "homeTeam":  "GB"
                                     },
                                     {
                                         "id":  "w18_g12",
                                         "gameNum":  10,
                                         "week":  18,
                                         "dateTime":  "Sun 1/10 @ TBD",
                                         "matchup":  "TEN @ HOU",
                                         "awayTeam":  "TEN",
                                         "homeTeam":  "HOU"
                                     },
                                     {
                                         "id":  "w18_g13",
                                         "gameNum":  11,
                                         "week":  18,
                                         "dateTime":  "Sun 1/10 @ TBD",
                                         "matchup":  "JAX @ IND",
                                         "awayTeam":  "JAX",
                                         "homeTeam":  "IND"
                                     },
                                     {
                                         "id":  "w18_g14",
                                         "gameNum":  12,
                                         "week":  18,
                                         "dateTime":  "Sun 1/10 @ TBD",
                                         "matchup":  "LV @ KC",
                                         "awayTeam":  "LV",
                                         "homeTeam":  "KC"
                                     },
                                     {
                                         "id":  "w18_g15",
                                         "gameNum":  13,
                                         "week":  18,
                                         "dateTime":  "Sun 1/10 @ TBD",
                                         "matchup":  "SEA @ LAR",
                                         "awayTeam":  "SEA",
                                         "homeTeam":  "LAR"
                                     },
                                     {
                                         "id":  "w18_g16",
                                         "gameNum":  14,
                                         "week":  18,
                                         "dateTime":  "Sun 1/10 @ TBD",
                                         "matchup":  "MIA @ NE",
                                         "awayTeam":  "MIA",
                                         "homeTeam":  "NE"
                                     },
                                     {
                                         "id":  "w18_g17",
                                         "gameNum":  15,
                                         "week":  18,
                                         "dateTime":  "Sun 1/10 @ TBD",
                                         "matchup":  "TB @ NO",
                                         "awayTeam":  "TB",
                                         "homeTeam":  "NO"
                                     },
                                     {
                                         "id":  "w18_g18",
                                         "gameNum":  16,
                                         "week":  18,
                                         "dateTime":  "Sun 1/10 @ TBD",
                                         "matchup":  "PHI @ NYG",
                                         "awayTeam":  "PHI",
                                         "homeTeam":  "NYG"
                                     }
                                 ],
                     "Week 16":  [
                                     {
                                         "id":  "w16_g3",
                                         "gameNum":  1,
                                         "week":  16,
                                         "dateTime":  "Thu 12/24 @ 7:15 PM (TNF)",
                                         "matchup":  "HOU @ PHI",
                                         "awayTeam":  "HOU",
                                         "homeTeam":  "PHI"
                                     },
                                     {
                                         "id":  "w16_g4",
                                         "gameNum":  2,
                                         "week":  16,
                                         "dateTime":  "Fri 12/25 @ 12:00 PM (XMAS)",
                                         "matchup":  "GB @ CHI",
                                         "awayTeam":  "GB",
                                         "homeTeam":  "CHI"
                                     },
                                     {
                                         "id":  "w16_g5",
                                         "gameNum":  3,
                                         "week":  16,
                                         "dateTime":  "Fri 12/25 @ 3:30 PM (XMAS)",
                                         "matchup":  "BUF @ DEN",
                                         "awayTeam":  "BUF",
                                         "homeTeam":  "DEN"
                                     },
                                     {
                                         "id":  "w16_g6",
                                         "gameNum":  4,
                                         "week":  16,
                                         "dateTime":  "Fri 12/25 @ 7:15 PM (XMAS)",
                                         "matchup":  "LAR @ SEA",
                                         "awayTeam":  "LAR",
                                         "homeTeam":  "SEA"
                                     },
                                     {
                                         "id":  "w16_g7",
                                         "gameNum":  5,
                                         "week":  16,
                                         "dateTime":  "Sun 12/27 @ 12:00 PM",
                                         "matchup":  "TB @ ATL",
                                         "awayTeam":  "TB",
                                         "homeTeam":  "ATL"
                                     },
                                     {
                                         "id":  "w16_g8",
                                         "gameNum":  6,
                                         "week":  16,
                                         "dateTime":  "Sun 12/27 @ 12:00 PM",
                                         "matchup":  "CIN @ IND",
                                         "awayTeam":  "CIN",
                                         "homeTeam":  "IND"
                                     },
                                     {
                                         "id":  "w16_g9",
                                         "gameNum":  7,
                                         "week":  16,
                                         "dateTime":  "Sun 12/27 @ 12:00 PM",
                                         "matchup":  "WSH @ MIN",
                                         "awayTeam":  "WSH",
                                         "homeTeam":  "MIN"
                                     },
                                     {
                                         "id":  "w16_g10",
                                         "gameNum":  8,
                                         "week":  16,
                                         "dateTime":  "Sun 12/27 @ 12:00 PM",
                                         "matchup":  "CAR @ PIT",
                                         "awayTeam":  "CAR",
                                         "homeTeam":  "PIT"
                                     },
                                     {
                                         "id":  "w16_g11",
                                         "gameNum":  9,
                                         "week":  16,
                                         "dateTime":  "Sun 12/27 @ 12:00 PM",
                                         "matchup":  "LAC @ MIA",
                                         "awayTeam":  "LAC",
                                         "homeTeam":  "MIA"
                                     },
                                     {
                                         "id":  "w16_g12",
                                         "gameNum":  10,
                                         "week":  16,
                                         "dateTime":  "Sun 12/27 @ 12:00 PM",
                                         "matchup":  "AZ @ NO",
                                         "awayTeam":  "AZ",
                                         "homeTeam":  "NO"
                                     },
                                     {
                                         "id":  "w16_g13",
                                         "gameNum":  11,
                                         "week":  16,
                                         "dateTime":  "Sun 12/27 @ 12:00 PM",
                                         "matchup":  "NE @ NYJ",
                                         "awayTeam":  "NE",
                                         "homeTeam":  "NYJ"
                                     },
                                     {
                                         "id":  "w16_g14",
                                         "gameNum":  12,
                                         "week":  16,
                                         "dateTime":  "Sun 12/27 @ 12:00 PM",
                                         "matchup":  "CLE @ BAL",
                                         "awayTeam":  "CLE",
                                         "homeTeam":  "BAL"
                                     },
                                     {
                                         "id":  "w16_g15",
                                         "gameNum":  13,
                                         "week":  16,
                                         "dateTime":  "Sun 12/27 @ 3:05 PM",
                                         "matchup":  "TEN @ LV",
                                         "awayTeam":  "TEN",
                                         "homeTeam":  "LV"
                                     },
                                     {
                                         "id":  "w16_g16",
                                         "gameNum":  14,
                                         "week":  16,
                                         "dateTime":  "Sun 12/27 @ 3:25 PM",
                                         "matchup":  "SF @ KC",
                                         "awayTeam":  "SF",
                                         "homeTeam":  "KC"
                                     },
                                     {
                                         "id":  "w16_g17",
                                         "gameNum":  15,
                                         "week":  16,
                                         "dateTime":  "Sun 12/27 @ 7:20 PM (SNF)",
                                         "matchup":  "JAX @ DAL",
                                         "awayTeam":  "JAX",
                                         "homeTeam":  "DAL"
                                     },
                                     {
                                         "id":  "w16_g18",
                                         "gameNum":  16,
                                         "week":  16,
                                         "dateTime":  "Mon 12/28 @ 7:15 PM (MNF)",
                                         "matchup":  "NYG @ DET",
                                         "awayTeam":  "NYG",
                                         "homeTeam":  "DET"
                                     }
                                 ],
                     "Week 12":  [
                                     {
                                         "id":  "w12_g3",
                                         "gameNum":  1,
                                         "week":  12,
                                         "dateTime":  "Wed 11/25 @ 7:00pm",
                                         "matchup":  "GB @ LAR",
                                         "awayTeam":  "GB",
                                         "homeTeam":  "LAR"
                                     },
                                     {
                                         "id":  "w12_g4",
                                         "gameNum":  2,
                                         "week":  12,
                                         "dateTime":  "Thu 11/26 @ 12:00pm",
                                         "matchup":  "CHI @ DET",
                                         "awayTeam":  "CHI",
                                         "homeTeam":  "DET"
                                     },
                                     {
                                         "id":  "w12_g5",
                                         "gameNum":  3,
                                         "week":  12,
                                         "dateTime":  "Thu 11/26 @ 3:30pm",
                                         "matchup":  "PHI @ DAL",
                                         "awayTeam":  "PHI",
                                         "homeTeam":  "DAL"
                                     },
                                     {
                                         "id":  "w12_g6",
                                         "gameNum":  4,
                                         "week":  12,
                                         "dateTime":  "Thu 11/26 @ 7:20pm (TNF)",
                                         "matchup":  "KC @ BUF",
                                         "awayTeam":  "KC",
                                         "homeTeam":  "BUF"
                                     },
                                     {
                                         "id":  "w12_g7",
                                         "gameNum":  5,
                                         "week":  12,
                                         "dateTime":  "Fri 11/27 @ 2:00pm",
                                         "matchup":  "DEN @ PIT",
                                         "awayTeam":  "DEN",
                                         "homeTeam":  "PIT"
                                     },
                                     {
                                         "id":  "w12_g8",
                                         "gameNum":  6,
                                         "week":  12,
                                         "dateTime":  "Sun 11/29 @ 12:00pm",
                                         "matchup":  "NO @ CIN",
                                         "awayTeam":  "NO",
                                         "homeTeam":  "CIN"
                                     },
                                     {
                                         "id":  "w12_g9",
                                         "gameNum":  7,
                                         "week":  12,
                                         "dateTime":  "Sun 11/29 @ 12:00pm",
                                         "matchup":  "BAL @ HOU",
                                         "awayTeam":  "BAL",
                                         "homeTeam":  "HOU"
                                     },
                                     {
                                         "id":  "w12_g10",
                                         "gameNum":  8,
                                         "week":  12,
                                         "dateTime":  "Sun 11/29 @ 12:00pm",
                                         "matchup":  "NYG @ IND",
                                         "awayTeam":  "NYG",
                                         "homeTeam":  "IND"
                                     },
                                     {
                                         "id":  "w12_g11",
                                         "gameNum":  9,
                                         "week":  12,
                                         "dateTime":  "Sun 11/29 @ 12:00pm",
                                         "matchup":  "LV @ CLE",
                                         "awayTeam":  "LV",
                                         "homeTeam":  "CLE"
                                     },
                                     {
                                         "id":  "w12_g12",
                                         "gameNum":  10,
                                         "week":  12,
                                         "dateTime":  "Sun 11/29 @ 12:00pm",
                                         "matchup":  "ATL @ MIN",
                                         "awayTeam":  "ATL",
                                         "homeTeam":  "MIN"
                                     },
                                     {
                                         "id":  "w12_g13",
                                         "gameNum":  11,
                                         "week":  12,
                                         "dateTime":  "Sun 11/29 @ 12:00pm",
                                         "matchup":  "NYJ @ MIA",
                                         "awayTeam":  "NYJ",
                                         "homeTeam":  "MIA"
                                     },
                                     {
                                         "id":  "w12_g14",
                                         "gameNum":  12,
                                         "week":  12,
                                         "dateTime":  "Sun 11/29 @ 3:05pm",
                                         "matchup":  "TEN @ JAX",
                                         "awayTeam":  "TEN",
                                         "homeTeam":  "JAX"
                                     },
                                     {
                                         "id":  "w12_g15",
                                         "gameNum":  13,
                                         "week":  12,
                                         "dateTime":  "Sun 11/29 @ 3:25pm",
                                         "matchup":  "SEA @ SF",
                                         "awayTeam":  "SEA",
                                         "homeTeam":  "SF"
                                     },
                                     {
                                         "id":  "w12_g16",
                                         "gameNum":  14,
                                         "week":  12,
                                         "dateTime":  "Sun 11/29 @ 3:25pm",
                                         "matchup":  "WSH @ AZ",
                                         "awayTeam":  "WSH",
                                         "homeTeam":  "AZ"
                                     },
                                     {
                                         "id":  "w12_g17",
                                         "gameNum":  15,
                                         "week":  12,
                                         "dateTime":  "Sun 11/29 @ 7:20pm (SNF)",
                                         "matchup":  "NE @ LAC",
                                         "awayTeam":  "NE",
                                         "homeTeam":  "LAC"
                                     },
                                     {
                                         "id":  "w12_g18",
                                         "gameNum":  16,
                                         "week":  12,
                                         "dateTime":  "Mon 11/30 @ 7:15pm (MNF)",
                                         "matchup":  "CAR @ TB",
                                         "awayTeam":  "CAR",
                                         "homeTeam":  "TB"
                                     }
                                 ],
                     "Week 7":  [
                                    {
                                        "id":  "w7_g3",
                                        "gameNum":  1,
                                        "week":  7,
                                        "dateTime":  "Thu 10/22 @ 7:15pm (TNF)",
                                        "matchup":  "NE @ CHI",
                                        "awayTeam":  "NE",
                                        "homeTeam":  "CHI"
                                    },
                                    {
                                        "id":  "w7_g4",
                                        "gameNum":  2,
                                        "week":  7,
                                        "dateTime":  "Sun 10/25 @ 8:30am (INTL)",
                                        "matchup":  "PIT @ NO",
                                        "awayTeam":  "PIT",
                                        "homeTeam":  "NO"
                                    },
                                    {
                                        "id":  "w7_g5",
                                        "gameNum":  3,
                                        "week":  7,
                                        "dateTime":  "Sun 10/25 @ 12:00pm",
                                        "matchup":  "SF @ ATL",
                                        "awayTeam":  "SF",
                                        "homeTeam":  "ATL"
                                    },
                                    {
                                        "id":  "w7_g6",
                                        "gameNum":  4,
                                        "week":  7,
                                        "dateTime":  "Sun 10/25 @ 12:00pm",
                                        "matchup":  "CIN @ BAL",
                                        "awayTeam":  "CIN",
                                        "homeTeam":  "BAL"
                                    },
                                    {
                                        "id":  "w7_g7",
                                        "gameNum":  5,
                                        "week":  7,
                                        "dateTime":  "Sun 10/25 @ 12:00pm",
                                        "matchup":  "TB @ CAR",
                                        "awayTeam":  "TB",
                                        "homeTeam":  "CAR"
                                    },
                                    {
                                        "id":  "w7_g8",
                                        "gameNum":  6,
                                        "week":  7,
                                        "dateTime":  "Sun 10/25 @ 12:00pm",
                                        "matchup":  "NYG @ HOU",
                                        "awayTeam":  "NYG",
                                        "homeTeam":  "HOU"
                                    },
                                    {
                                        "id":  "w7_g9",
                                        "gameNum":  7,
                                        "week":  7,
                                        "dateTime":  "Sun 10/25 @ 12:00pm",
                                        "matchup":  "IND @ MIN",
                                        "awayTeam":  "IND",
                                        "homeTeam":  "MIN"
                                    },
                                    {
                                        "id":  "w7_g10",
                                        "gameNum":  8,
                                        "week":  7,
                                        "dateTime":  "Sun 10/25 @ 12:00pm",
                                        "matchup":  "MIA @ NYJ",
                                        "awayTeam":  "MIA",
                                        "homeTeam":  "NYJ"
                                    },
                                    {
                                        "id":  "w7_g11",
                                        "gameNum":  9,
                                        "week":  7,
                                        "dateTime":  "Sun 10/25 @ 12:00pm",
                                        "matchup":  "CLE @ TEN",
                                        "awayTeam":  "CLE",
                                        "homeTeam":  "TEN"
                                    },
                                    {
                                        "id":  "w7_g12",
                                        "gameNum":  10,
                                        "week":  7,
                                        "dateTime":  "Sun 10/25 @ 3:05pm",
                                        "matchup":  "DEN @ AZ",
                                        "awayTeam":  "DEN",
                                        "homeTeam":  "AZ"
                                    },
                                    {
                                        "id":  "w7_g13",
                                        "gameNum":  11,
                                        "week":  7,
                                        "dateTime":  "Sun 10/25 @ 3:25pm",
                                        "matchup":  "GB @ DET",
                                        "awayTeam":  "GB",
                                        "homeTeam":  "DET"
                                    },
                                    {
                                        "id":  "w7_g14",
                                        "gameNum":  12,
                                        "week":  7,
                                        "dateTime":  "Sun 10/25 @ 3:25pm",
                                        "matchup":  "LAR @ LV",
                                        "awayTeam":  "LAR",
                                        "homeTeam":  "LV"
                                    },
                                    {
                                        "id":  "w7_g15",
                                        "gameNum":  13,
                                        "week":  7,
                                        "dateTime":  "Sun 10/25 @ 7:20pm (SNF)",
                                        "matchup":  "KC @ SEA",
                                        "awayTeam":  "KC",
                                        "homeTeam":  "SEA"
                                    },
                                    {
                                        "id":  "w7_g16",
                                        "gameNum":  14,
                                        "week":  7,
                                        "dateTime":  "Mon 10/26 @ 7:15pm (MNF)",
                                        "matchup":  "DAL @ PHI",
                                        "awayTeam":  "DAL",
                                        "homeTeam":  "PHI"
                                    }
                                ],
                     "Week 15":  [
                                     {
                                         "id":  "w15_g3",
                                         "gameNum":  1,
                                         "week":  15,
                                         "dateTime":  "Thu 12/17 @ 7:15 PM (TNF)",
                                         "matchup":  "SF @ LAC",
                                         "awayTeam":  "SF",
                                         "homeTeam":  "LAC"
                                     },
                                     {
                                         "id":  "w15_g4",
                                         "gameNum":  2,
                                         "week":  15,
                                         "dateTime":  "Sat 12/19 @ 4:00 PM",
                                         "matchup":  "SEA @ PHI",
                                         "awayTeam":  "SEA",
                                         "homeTeam":  "PHI"
                                     },
                                     {
                                         "id":  "w15_g5",
                                         "gameNum":  3,
                                         "week":  15,
                                         "dateTime":  "Sat 12/19 @ 7:20 PM",
                                         "matchup":  "CHI @ BUF",
                                         "awayTeam":  "CHI",
                                         "homeTeam":  "BUF"
                                     },
                                     {
                                         "id":  "w15_g6",
                                         "gameNum":  4,
                                         "week":  15,
                                         "dateTime":  "Sun 12/20 @ 12:00 PM",
                                         "matchup":  "CIN @ CAR",
                                         "awayTeam":  "CIN",
                                         "homeTeam":  "CAR"
                                     },
                                     {
                                         "id":  "w15_g7",
                                         "gameNum":  5,
                                         "week":  15,
                                         "dateTime":  "Sun 12/20 @ 12:00 PM",
                                         "matchup":  "NO @ TB",
                                         "awayTeam":  "NO",
                                         "homeTeam":  "TB"
                                     },
                                     {
                                         "id":  "w15_g8",
                                         "gameNum":  6,
                                         "week":  15,
                                         "dateTime":  "Sun 12/20 @ 12:00 PM",
                                         "matchup":  "JAX @ HOU",
                                         "awayTeam":  "JAX",
                                         "homeTeam":  "HOU"
                                     },
                                     {
                                         "id":  "w15_g9",
                                         "gameNum":  7,
                                         "week":  15,
                                         "dateTime":  "Sun 12/20 @ 12:00 PM",
                                         "matchup":  "IND @ TEN",
                                         "awayTeam":  "IND",
                                         "homeTeam":  "TEN"
                                     },
                                     {
                                         "id":  "w15_g10",
                                         "gameNum":  8,
                                         "week":  15,
                                         "dateTime":  "Sun 12/20 @ 12:00 PM",
                                         "matchup":  "BAL @ PIT",
                                         "awayTeam":  "BAL",
                                         "homeTeam":  "PIT"
                                     },
                                     {
                                         "id":  "w15_g11",
                                         "gameNum":  9,
                                         "week":  15,
                                         "dateTime":  "Sun 12/20 @ 12:00 PM",
                                         "matchup":  "CLE @ NYG",
                                         "awayTeam":  "CLE",
                                         "homeTeam":  "NYG"
                                     },
                                     {
                                         "id":  "w15_g12",
                                         "gameNum":  10,
                                         "week":  15,
                                         "dateTime":  "Sun 12/20 @ 12:00 PM",
                                         "matchup":  "ATL @ WSH",
                                         "awayTeam":  "ATL",
                                         "homeTeam":  "WSH"
                                     },
                                     {
                                         "id":  "w15_g13",
                                         "gameNum":  11,
                                         "week":  15,
                                         "dateTime":  "Sun 12/20 @ 12:00 PM",
                                         "matchup":  "MIA @ GB",
                                         "awayTeam":  "MIA",
                                         "homeTeam":  "GB"
                                     },
                                     {
                                         "id":  "w15_g14",
                                         "gameNum":  12,
                                         "week":  15,
                                         "dateTime":  "Sun 12/20 @ 3:05 PM",
                                         "matchup":  "NYJ @ AZ",
                                         "awayTeam":  "NYJ",
                                         "homeTeam":  "AZ"
                                     },
                                     {
                                         "id":  "w15_g15",
                                         "gameNum":  13,
                                         "week":  15,
                                         "dateTime":  "Sun 12/20 @ 3:25 PM",
                                         "matchup":  "DAL @ LAR",
                                         "awayTeam":  "DAL",
                                         "homeTeam":  "LAR"
                                     },
                                     {
                                         "id":  "w15_g16",
                                         "gameNum":  14,
                                         "week":  15,
                                         "dateTime":  "Sun 12/20 @ 3:25 PM",
                                         "matchup":  "DEN @ LV",
                                         "awayTeam":  "DEN",
                                         "homeTeam":  "LV"
                                     },
                                     {
                                         "id":  "w15_g17",
                                         "gameNum":  15,
                                         "week":  15,
                                         "dateTime":  "Sun 12/20 @ 7:20 PM (SNF)",
                                         "matchup":  "DET @ MIN",
                                         "awayTeam":  "DET",
                                         "homeTeam":  "MIN"
                                     },
                                     {
                                         "id":  "w15_g18",
                                         "gameNum":  16,
                                         "week":  15,
                                         "dateTime":  "Mon 12/21 @ 7:15 PM (MNF)",
                                         "matchup":  "NE @ KC",
                                         "awayTeam":  "NE",
                                         "homeTeam":  "KC"
                                     }
                                 ],
                     "Week 2":  [
                                    {
                                        "id":  "w2_g3",
                                        "gameNum":  1,
                                        "week":  2,
                                        "dateTime":  {

                                                     },
                                        "matchup":  "DET @ BUF",
                                        "awayTeam":  "DET",
                                        "homeTeam":  "BUF"
                                    },
                                    {
                                        "id":  "w2_g4",
                                        "gameNum":  2,
                                        "week":  2,
                                        "dateTime":  "Sun 9/20 @ 12:00pm",
                                        "matchup":  "CAR @ ATL",
                                        "awayTeam":  "CAR",
                                        "homeTeam":  "ATL"
                                    },
                                    {
                                        "id":  "w2_g5",
                                        "gameNum":  3,
                                        "week":  2,
                                        "dateTime":  "Sun 9/20 @ 12:00pm",
                                        "matchup":  "MIN @ CHI",
                                        "awayTeam":  "MIN",
                                        "homeTeam":  "CHI"
                                    },
                                    {
                                        "id":  "w2_g6",
                                        "gameNum":  4,
                                        "week":  2,
                                        "dateTime":  "Sun 9/20 @ 12:00pm",
                                        "matchup":  "PHI @ TEN",
                                        "awayTeam":  "PHI",
                                        "homeTeam":  "TEN"
                                    },
                                    {
                                        "id":  "w2_g7",
                                        "gameNum":  5,
                                        "week":  2,
                                        "dateTime":  "Sun 9/20 @ 12:00pm",
                                        "matchup":  "PIT @ NE",
                                        "awayTeam":  "PIT",
                                        "homeTeam":  "NE"
                                    },
                                    {
                                        "id":  "w2_g8",
                                        "gameNum":  6,
                                        "week":  2,
                                        "dateTime":  "Sun 9/20 @ 12:00pm",
                                        "matchup":  "GB @ NYJ",
                                        "awayTeam":  "GB",
                                        "homeTeam":  "NYJ"
                                    },
                                    {
                                        "id":  "w2_g9",
                                        "gameNum":  7,
                                        "week":  2,
                                        "dateTime":  "Sun 9/20 @ 12:00pm",
                                        "matchup":  "CLE @ TB",
                                        "awayTeam":  "CLE",
                                        "homeTeam":  "TB"
                                    },
                                    {
                                        "id":  "w2_g10",
                                        "gameNum":  8,
                                        "week":  2,
                                        "dateTime":  "Sun 9/20 @ 12:00pm",
                                        "matchup":  "NO @ BAL",
                                        "awayTeam":  "NO",
                                        "homeTeam":  "BAL"
                                    },
                                    {
                                        "id":  "w2_g11",
                                        "gameNum":  9,
                                        "week":  2,
                                        "dateTime":  "Sun 9/20 @ 12:00pm",
                                        "matchup":  "CIN @ HOU",
                                        "awayTeam":  "CIN",
                                        "homeTeam":  "HOU"
                                    },
                                    {
                                        "id":  "w2_g12",
                                        "gameNum":  10,
                                        "week":  2,
                                        "dateTime":  "Sun 9/20 @ 3:05pm",
                                        "matchup":  "JAX @ DEN",
                                        "awayTeam":  "JAX",
                                        "homeTeam":  "DEN"
                                    },
                                    {
                                        "id":  "w2_g13",
                                        "gameNum":  11,
                                        "week":  2,
                                        "dateTime":  "Sun 9/20 @ 3:05pm",
                                        "matchup":  "LV @ LAC",
                                        "awayTeam":  "LV",
                                        "homeTeam":  "LAC"
                                    },
                                    {
                                        "id":  "w2_g14",
                                        "gameNum":  12,
                                        "week":  2,
                                        "dateTime":  "Sun 9/20 @ 3:25pm",
                                        "matchup":  "WSH @ DAL",
                                        "awayTeam":  "WSH",
                                        "homeTeam":  "DAL"
                                    },
                                    {
                                        "id":  "w2_g15",
                                        "gameNum":  13,
                                        "week":  2,
                                        "dateTime":  "Sun 9/20 @ 3:25pm",
                                        "matchup":  "SEA @ AZ",
                                        "awayTeam":  "SEA",
                                        "homeTeam":  "AZ"
                                    },
                                    {
                                        "id":  "w2_g16",
                                        "gameNum":  14,
                                        "week":  2,
                                        "dateTime":  "Sun 9/20 @ 3:25pm",
                                        "matchup":  "MIA @ SF",
                                        "awayTeam":  "MIA",
                                        "homeTeam":  "SF"
                                    },
                                    {
                                        "id":  "w2_g17",
                                        "gameNum":  15,
                                        "week":  2,
                                        "dateTime":  "Sun 9/20 @ 7:20pm (SNF)",
                                        "matchup":  "IND @ KC",
                                        "awayTeam":  "IND",
                                        "homeTeam":  "KC"
                                    },
                                    {
                                        "id":  "w2_g18",
                                        "gameNum":  16,
                                        "week":  2,
                                        "dateTime":  "Mon 9/21 @ 7:15pm (MNF)",
                                        "matchup":  "NYG @ LAR",
                                        "awayTeam":  "NYG",
                                        "homeTeam":  "LAR"
                                    }
                                ],
                     "Week 6":  [
                                    {
                                        "id":  "w6_g3",
                                        "gameNum":  1,
                                        "week":  6,
                                        "dateTime":  "Thu 10/15 @ 7:15pm (TNF)",
                                        "matchup":  "SEA @ DEN",
                                        "awayTeam":  "SEA",
                                        "homeTeam":  "DEN"
                                    },
                                    {
                                        "id":  "w6_g4",
                                        "gameNum":  2,
                                        "week":  6,
                                        "dateTime":  "Sun 10/18 @ 8:30am (INTL)",
                                        "matchup":  "HOU @ JAX",
                                        "awayTeam":  "HOU",
                                        "homeTeam":  "JAX"
                                    },
                                    {
                                        "id":  "w6_g5",
                                        "gameNum":  3,
                                        "week":  6,
                                        "dateTime":  "Sun 10/18 @ 12:00pm",
                                        "matchup":  "CHI @ ATL",
                                        "awayTeam":  "CHI",
                                        "homeTeam":  "ATL"
                                    },
                                    {
                                        "id":  "w6_g6",
                                        "gameNum":  4,
                                        "week":  6,
                                        "dateTime":  "Sun 10/18 @ 12:00pm",
                                        "matchup":  "BAL @ CLE",
                                        "awayTeam":  "BAL",
                                        "homeTeam":  "CLE"
                                    },
                                    {
                                        "id":  "w6_g7",
                                        "gameNum":  5,
                                        "week":  6,
                                        "dateTime":  "Sun 10/18 @ 12:00pm",
                                        "matchup":  "TEN @ IND",
                                        "awayTeam":  "TEN",
                                        "homeTeam":  "IND"
                                    },
                                    {
                                        "id":  "w6_g8",
                                        "gameNum":  6,
                                        "week":  6,
                                        "dateTime":  "Sun 10/18 @ 12:00pm",
                                        "matchup":  "NYJ @ NE",
                                        "awayTeam":  "NYJ",
                                        "homeTeam":  "NE"
                                    },
                                    {
                                        "id":  "w6_g9",
                                        "gameNum":  7,
                                        "week":  6,
                                        "dateTime":  "Sun 10/18 @ 12:00pm",
                                        "matchup":  "NO @ NYG",
                                        "awayTeam":  "NO",
                                        "homeTeam":  "NYG"
                                    },
                                    {
                                        "id":  "w6_g10",
                                        "gameNum":  8,
                                        "week":  6,
                                        "dateTime":  "Sun 10/18 @ 12:00pm",
                                        "matchup":  "CAR @ PHI",
                                        "awayTeam":  "CAR",
                                        "homeTeam":  "PHI"
                                    },
                                    {
                                        "id":  "w6_g11",
                                        "gameNum":  9,
                                        "week":  6,
                                        "dateTime":  "Sun 10/18 @ 12:00pm",
                                        "matchup":  "PIT @ TB",
                                        "awayTeam":  "PIT",
                                        "homeTeam":  "TB"
                                    },
                                    {
                                        "id":  "w6_g12",
                                        "gameNum":  10,
                                        "week":  6,
                                        "dateTime":  "Sun 10/18 @ 3:05pm",
                                        "matchup":  "AZ @ LAR",
                                        "awayTeam":  "AZ",
                                        "homeTeam":  "LAR"
                                    },
                                    {
                                        "id":  "w6_g13",
                                        "gameNum":  11,
                                        "week":  6,
                                        "dateTime":  "Sun 10/18 @ 3:25pm",
                                        "matchup":  "LAC @ KC",
                                        "awayTeam":  "LAC",
                                        "homeTeam":  "KC"
                                    },
                                    {
                                        "id":  "w6_g14",
                                        "gameNum":  12,
                                        "week":  6,
                                        "dateTime":  "Sun 10/18 @ 3:25pm",
                                        "matchup":  "BUF @ LV",
                                        "awayTeam":  "BUF",
                                        "homeTeam":  "LV"
                                    },
                                    {
                                        "id":  "w6_g15",
                                        "gameNum":  13,
                                        "week":  6,
                                        "dateTime":  "Sun 10/18 @ 7:20pm (SNF)",
                                        "matchup":  "DAL @ GB",
                                        "awayTeam":  "DAL",
                                        "homeTeam":  "GB"
                                    },
                                    {
                                        "id":  "w6_g16",
                                        "gameNum":  14,
                                        "week":  6,
                                        "dateTime":  "Mon 10/19 @ 7:15pm (MNF)",
                                        "matchup":  "WSH @ SF",
                                        "awayTeam":  "WSH",
                                        "homeTeam":  "SF"
                                    }
                                ],
                     "Week 17":  [
                                     {
                                         "id":  "w17_g3",
                                         "gameNum":  1,
                                         "week":  17,
                                         "dateTime":  "Thu 12/31 @ 7:15pm (TNF)",
                                         "matchup":  "BAL @ CIN",
                                         "awayTeam":  "BAL",
                                         "homeTeam":  "CIN"
                                     },
                                     {
                                         "id":  "w17_g4",
                                         "gameNum":  2,
                                         "week":  17,
                                         "dateTime":  "Sun 1/3 @ 12:00pm",
                                         "matchup":  "SEA @ CAR",
                                         "awayTeam":  "SEA",
                                         "homeTeam":  "CAR"
                                     },
                                     {
                                         "id":  "w17_g5",
                                         "gameNum":  3,
                                         "week":  17,
                                         "dateTime":  "Sun 1/3 @ 12:00pm",
                                         "matchup":  "NO @ ATL",
                                         "awayTeam":  "NO",
                                         "homeTeam":  "ATL"
                                     },
                                     {
                                         "id":  "w17_g6",
                                         "gameNum":  4,
                                         "week":  17,
                                         "dateTime":  "Sun 1/3 @ 12:00pm",
                                         "matchup":  "BUF @ MIA",
                                         "awayTeam":  "BUF",
                                         "homeTeam":  "MIA"
                                     },
                                     {
                                         "id":  "w17_g7",
                                         "gameNum":  5,
                                         "week":  17,
                                         "dateTime":  "Sun 1/3 @ 12:00pm",
                                         "matchup":  "IND @ CLE",
                                         "awayTeam":  "IND",
                                         "homeTeam":  "CLE"
                                     },
                                     {
                                         "id":  "w17_g8",
                                         "gameNum":  6,
                                         "week":  17,
                                         "dateTime":  "Sun 1/3 @ 12:00pm",
                                         "matchup":  "PIT @ TEN",
                                         "awayTeam":  "PIT",
                                         "homeTeam":  "TEN"
                                     },
                                     {
                                         "id":  "w17_g9",
                                         "gameNum":  7,
                                         "week":  17,
                                         "dateTime":  "Sun 1/3 @ 12:00pm",
                                         "matchup":  "MIN @ NYJ",
                                         "awayTeam":  "MIN",
                                         "homeTeam":  "NYJ"
                                     },
                                     {
                                         "id":  "w17_g10",
                                         "gameNum":  8,
                                         "week":  17,
                                         "dateTime":  "Sun 1/3 @ 12:00pm",
                                         "matchup":  "NYG @ DAL",
                                         "awayTeam":  "NYG",
                                         "homeTeam":  "DAL"
                                     },
                                     {
                                         "id":  "w17_g11",
                                         "gameNum":  9,
                                         "week":  17,
                                         "dateTime":  "Sun 1/3 @ 3:05pm",
                                         "matchup":  "LV @ AZ",
                                         "awayTeam":  "LV",
                                         "homeTeam":  "AZ"
                                     },
                                     {
                                         "id":  "w17_g12",
                                         "gameNum":  10,
                                         "week":  17,
                                         "dateTime":  "Sun 1/3 @ 3:25pm",
                                         "matchup":  "DET @ CHI",
                                         "awayTeam":  "DET",
                                         "homeTeam":  "CHI"
                                     },
                                     {
                                         "id":  "w17_g13",
                                         "gameNum":  11,
                                         "week":  17,
                                         "dateTime":  "Sun 1/3 @ 7:20pm (SNF)",
                                         "matchup":  "PHI @ SF",
                                         "awayTeam":  "PHI",
                                         "homeTeam":  "SF"
                                     },
                                     {
                                         "id":  "w17_g14",
                                         "gameNum":  12,
                                         "week":  17,
                                         "dateTime":  "Mon 1/4 @ 7:15pm (MNF)",
                                         "matchup":  "HOU @ GB",
                                         "awayTeam":  "HOU",
                                         "homeTeam":  "GB"
                                     },
                                     {
                                         "id":  "w17_g15",
                                         "gameNum":  13,
                                         "week":  17,
                                         "dateTime":  "Sun 1/3 @ 12:00pm",
                                         "matchup":  "DEN @ NE",
                                         "awayTeam":  "DEN",
                                         "homeTeam":  "NE"
                                     },
                                     {
                                         "id":  "w17_g16",
                                         "gameNum":  14,
                                         "week":  17,
                                         "dateTime":  "Date/Time TBD",
                                         "matchup":  "KC @ LAC",
                                         "awayTeam":  "KC",
                                         "homeTeam":  "LAC"
                                     },
                                     {
                                         "id":  "w17_g17",
                                         "gameNum":  15,
                                         "week":  17,
                                         "dateTime":  "Date/Time TBD",
                                         "matchup":  "LAR @ TB",
                                         "awayTeam":  "LAR",
                                         "homeTeam":  "TB"
                                     },
                                     {
                                         "id":  "w17_g18",
                                         "gameNum":  16,
                                         "week":  17,
                                         "dateTime":  "Date/Time TBD",
                                         "matchup":  "WSH @ JAX",
                                         "awayTeam":  "WSH",
                                         "homeTeam":  "JAX"
                                     }
                                 ]
                 }
};


