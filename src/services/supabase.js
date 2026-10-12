/**
 * @fileoverview Supabase Cloud Persistence & Authentication Service Adapter
 * Encapsulates authentication, league membership queries, and pick sheets CRUD
 * away from the UI and DOM layers.
 * @module services/supabase
 */

/**
 * Creates an Authentication Service bound to a Supabase client instance.
 * 
 * @param {object} supabaseClient Initialized Supabase client instance
 * @returns {object} Auth service methods
 */
function createAuthService(supabaseClient) {
  if (!supabaseClient) {
    throw new Error("Supabase client is required to initialize AuthService.");
  }

  return {
    /**
     * Signs in an existing user with email and password.
     * @param {string} email
     * @param {string} password
     * @returns {Promise<{ user: object|null, session: object|null, error: object|null }>}
     */
    async signInWithPassword(email, password) {
      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        });
        if (error) return { user: null, session: null, error };
        return { user: data.user, session: data.session, error: null };
      } catch (err) {
        return { user: null, session: null, error: err };
      }
    },

    /**
     * Registers a new user account with email, password, and chosen username.
     * @param {{ email: string, password: string, username: string }} params
     * @returns {Promise<{ user: object|null, session: object|null, error: object|null }>}
     */
    async signUp({ email, password, username }) {
      try {
        const { data, error } = await supabaseClient.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: { username: username.trim() }
          }
        });
        if (error) return { user: null, session: null, error };
        return { user: data.user, session: data.session, error: null };
      } catch (err) {
        return { user: null, session: null, error: err };
      }
    },

    /**
     * Signs out the currently authenticated user.
     * @returns {Promise<{ error: object|null }>}
     */
    async signOut() {
      try {
        const { error } = await supabaseClient.auth.signOut();
        return { error: error || null };
      } catch (err) {
        return { error: err };
      }
    },

    /**
     * Retrieves the current active user session.
     * @returns {Promise<{ session: object|null, error: object|null }>}
     */
    async getCurrentSession() {
      try {
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) return { session: null, error };
        return { session: data.session, error: null };
      } catch (err) {
        return { session: null, error: err };
      }
    },

    /**
     * Subscribes to auth state lifecycle changes (SIGN_IN, SIGN_OUT, TOKEN_REFRESHED).
     * @param {function(string, object): void} callback
     * @returns {{ unsubscribe: function(): void }}
     */
    onAuthStateChange(callback) {
      const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event, session) => {
        callback(event, session);
      });
      return {
        unsubscribe: () => subscription?.unsubscribe?.()
      };
    }
  };
}

/**
 * Creates a Leagues Service bound to a Supabase client instance.
 * 
 * @param {object} supabaseClient Initialized Supabase client instance
 * @returns {object} Leagues service methods
 */
function createLeaguesService(supabaseClient) {
  if (!supabaseClient) {
    throw new Error("Supabase client is required to initialize LeaguesService.");
  }

  return {
    /**
     * Fetches all leagues that a user is a member of.
     * @param {string} userId User UUID
     * @returns {Promise<{ leagues: Array<object>, error: object|null }>}
     */
    async getUserLeagues(userId) {
      try {
        const { data, error } = await supabaseClient
          .from("league_members")
          .select("league_id, role, joined_at, leagues(*)")
          .eq("user_id", userId);

        if (error) return { leagues: [], error };
        const leagues = (data || []).map(row => ({
          ...row.leagues,
          role: row.role,
          joinedAt: row.joined_at
        }));
        return { leagues, error: null };
      } catch (err) {
        return { leagues: [], error: err };
      }
    },

    /**
     * Finds a league by its 6-character alphanumeric invite code.
     * @param {string} code Invite code
     * @returns {Promise<{ league: object|null, error: object|null }>}
     */
    async findLeagueByCode(code) {
      try {
        const cleanCode = (code || "").trim().toUpperCase();
        const { data, error } = await supabaseClient
          .from("leagues")
          .select("*")
          .eq("invite_code", cleanCode)
          .single();

        if (error) return { league: null, error };
        return { league: data, error: null };
      } catch (err) {
        return { league: null, error: err };
      }
    },

    /**
     * Joins a user to a league with a specified role.
     * @param {{ leagueId: string, userId: string, role?: string }} params
     * @returns {Promise<{ membership: object|null, error: object|null }>}
     */
    async joinLeague({ leagueId, userId, role = "MEMBER" }) {
      try {
        const { data, error } = await supabaseClient
          .from("league_members")
          .insert({
            league_id: leagueId,
            user_id: userId,
            role
          })
          .select()
          .single();

        if (error) return { membership: null, error };
        return { membership: data, error: null };
      } catch (err) {
        return { membership: null, error: err };
      }
    }
  };
}

/**
 * Creates a Pick Sheets Service bound to a Supabase client instance.
 * 
 * @param {object} supabaseClient Initialized Supabase client instance
 * @returns {object} Pick sheets service methods
 */
function createPickSheetsService(supabaseClient) {
  if (!supabaseClient) {
    throw new Error("Supabase client is required to initialize PickSheetsService.");
  }

  return {
    /**
     * Fetches all personal pick sheets for a user in a specific week.
     * @param {string} userId User UUID
     * @param {number} weekNum NFL week number
     * @returns {Promise<{ sheets: Array<object>, error: object|null }>}
     */
    async getUserPickSheets(userId, weekNum) {
      try {
        let query = supabaseClient
          .from("pick_sheets")
          .select("*")
          .eq("user_id", userId);

        if (weekNum !== undefined && weekNum !== null) {
          query = query.eq("week_number", weekNum);
        }

        const { data, error } = await query.order("created_at", { ascending: false });
        if (error) return { sheets: [], error };
        return { sheets: data || [], error: null };
      } catch (err) {
        return { sheets: [], error: err };
      }
    },

    /**
     * Creates or updates a pick sheet.
     * @param {{ id?: string, userId: string, weekNum: number, title: string, picks: object, lockGameId?: string|null }} params
     * @returns {Promise<{ sheet: object|null, error: object|null }>}
     */
    async savePickSheet({ id, userId, weekNum, title, picks, lockGameId = null }) {
      try {
        const payload = {
          user_id: userId,
          week_number: weekNum,
          sheet_title: title || `Week ${weekNum} Picks`,
          picks_data: picks || {},
          lock_game_id: lockGameId,
          updated_at: new Date().toISOString()
        };

        let response;
        if (id) {
          response = await supabaseClient
            .from("pick_sheets")
            .update(payload)
            .eq("id", id)
            .eq("user_id", userId)
            .select()
            .single();
        } else {
          response = await supabaseClient
            .from("pick_sheets")
            .insert(payload)
            .select()
            .single();
        }

        if (response.error) return { sheet: null, error: response.error };
        return { sheet: response.data, error: null };
      } catch (err) {
        return { sheet: null, error: err };
      }
    }
  };
}

// Module export compatibility (Node.js CommonJS + ES Module fallback)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    createAuthService,
    createLeaguesService,
    createPickSheetsService
  };
}
if (typeof window !== "undefined") {
  window.SupabaseServices = {
    createAuthService,
    createLeaguesService,
    createPickSheetsService
  };
}
