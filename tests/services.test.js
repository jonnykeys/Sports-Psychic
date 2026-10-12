/**
 * @fileoverview Unit tests for Supabase Auth, Leagues, and Pick Sheets Services.
 */

const {
  createAuthService,
  createLeaguesService,
  createPickSheetsService
} = require("../src/services/supabase.js");

function runServicesTests(assert) {
  // 1. Mock Supabase Client
  const mockUser = { id: "user-123", email: "jon@test.com" };
  const mockSession = { access_token: "jwt-token-xyz", user: mockUser };

  const mockSupabase = {
    auth: {
      async signInWithPassword({ email, password }) {
        if (email === "jon@test.com" && password === "pass123") {
          return { data: { user: mockUser, session: mockSession }, error: null };
        }
        return { data: { user: null, session: null }, error: { message: "Invalid credentials" } };
      },
      async signUp({ email, password, options }) {
        return {
          data: {
            user: { id: "new-user-456", email, user_metadata: options?.data },
            session: mockSession
          },
          error: null
        };
      },
      async signOut() {
        return { error: null };
      },
      async getSession() {
        return { data: { session: mockSession }, error: null };
      },
      onAuthStateChange(cb) {
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
    },
    from(table) {
      let filterCol = null;
      let filterVal = null;
      let insertedPayload = null;

      const chain = {
        select(cols) { return chain; },
        eq(col, val) {
          filterCol = col;
          filterVal = val;
          return chain;
        },
        order(col, opts) { return chain; },
        insert(payload) {
          insertedPayload = payload;
          return chain;
        },
        update(payload) {
          insertedPayload = payload;
          return chain;
        },
        async single() {
          if (table === "leagues" && filterVal === "OG2026") {
            return { data: { id: "league-og", name: "OG League", invite_code: "OG2026" }, error: null };
          }
          if (table === "league_members") {
            return { data: { id: "member-1", ...insertedPayload }, error: null };
          }
          if (table === "pick_sheets") {
            return { data: { id: "sheet-1", ...insertedPayload }, error: null };
          }
          return { data: null, error: { message: "Not found" } };
        },
        then(resolve) {
          if (table === "league_members") {
            resolve({
              data: [{ league_id: "league-og", role: "COMMISH", joined_at: "2026-09-01", leagues: { id: "league-og", name: "OG League" } }],
              error: null
            });
          } else if (table === "pick_sheets") {
            resolve({
              data: [{ id: "sheet-1", sheet_title: "Week 5 Sheet", week_number: 5 }],
              error: null
            });
          } else {
            resolve({ data: [], error: null });
          }
        }
      };
      return chain;
    }
  };

  // Test AuthService
  const authService = createAuthService(mockSupabase);

  // Successful login
  authService.signInWithPassword("jon@test.com", "pass123").then(res => {
    assert.equal(res.error, null, "AuthService: Successful login returns no error");
    assert.equal(res.user?.id, "user-123", "AuthService: Returns correct user ID");
  });

  // Failed login
  authService.signInWithPassword("bad@test.com", "wrong").then(res => {
    assert.equal(Boolean(res.error), true, "AuthService: Invalid credentials return error");
    assert.equal(res.user, null, "AuthService: Failed login returns null user");
  });

  // Sign up with username metadata
  authService.signUp({ email: "new@test.com", password: "p", username: "JonnyKeys" }).then(res => {
    assert.equal(res.user?.email, "new@test.com", "AuthService: Sign up creates user email");
  });

  // Test LeaguesService
  const leaguesService = createLeaguesService(mockSupabase);
  leaguesService.findLeagueByCode("og2026").then(res => {
    assert.equal(res.league?.name, "OG League", "LeaguesService: Finds league by normalized invite code");
  });

  leaguesService.joinLeague({ leagueId: "league-og", userId: "user-123" }).then(res => {
    assert.equal(res.membership?.league_id, "league-og", "LeaguesService: Joins league successfully");
  });

  // Test PickSheetsService
  const pickSheetsService = createPickSheetsService(mockSupabase);
  pickSheetsService.savePickSheet({
    userId: "user-123",
    weekNum: 5,
    title: "Championship Sheet",
    picks: { "BUF@MIA": { awayScore: 31, homeScore: 24 } }
  }).then(res => {
    assert.equal(res.sheet?.sheet_title, "Championship Sheet", "PickSheetsService: Saves pick sheet with custom title");
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { runServicesTests };
}
