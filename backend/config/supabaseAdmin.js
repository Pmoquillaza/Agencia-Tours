const { createClient } = require('@supabase/supabase-js');

const { assertEnv } = require('./env');

let supabaseAdmin;

const getSupabaseAdmin = () => {
    if (!supabaseAdmin) {
        const url = assertEnv('SUPABASE_URL', 'auth-admin');
        const key =
            process.env.SUPABASE_SERVICE_ROLE_KEY ||
            assertEnv('SUPABASE_KEY', 'auth-admin');

        supabaseAdmin = createClient(
            url,
            key,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );
    }

    return supabaseAdmin;
};

module.exports = getSupabaseAdmin;
