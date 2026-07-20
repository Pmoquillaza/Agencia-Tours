const { createClient } = require('@supabase/supabase-js');

const { assertEnv } = require('./env');

const supabase = createClient(

    assertEnv('SUPABASE_URL', 'supabase'),
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
        assertEnv('SUPABASE_KEY', 'supabase'),
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }

);

module.exports = supabase;
