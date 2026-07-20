const getSupabaseAdmin = require('../config/supabaseAdmin');

const normalizeMetadata = (metadata) => {
    if (!metadata) {
        return {};
    }

    if (
        typeof metadata === 'object' &&
        !Array.isArray(metadata)
    ) {
        return metadata;
    }

    return {
        value: metadata
    };
};

const logAudit = async ({
    actorId = null,
    actorEmail = null,
    action,
    entity,
    entityId = null,
    status = 'success',
    metadata = {}
}) => {

    try {
        if (!action || !entity) {
            console.warn(
                'AUDIT LOG NO REGISTRADO: action y entity son obligatorios'
            );

            return false;
        }

        const auditClient = getSupabaseAdmin();

        const { error } = await auditClient
            .from('audit_logs')
            .insert([
                {
                    actor_id:
                        actorId !== null
                            ? String(actorId)
                            : null,
                    actor_email: actorEmail,
                    action,
                    entity,
                    entity_id:
                        entityId !== null
                            ? String(entityId)
                            : null,
                    status,
                    metadata: normalizeMetadata(metadata)
                }
            ]);

        if (error) {

            console.warn(
                'AUDIT LOG NO REGISTRADO:',
                error.code || '',
                error.message,
                error.details || '',
                error.hint || ''
            );

            return false;

        }

        console.log(
            'AUDIT LOG REGISTRADO:',
            action,
            entity,
            status
        );

        return true;

    } catch (error) {

        console.warn(
            'AUDIT SERVICE ERROR:',
            error.message
        );

        return false;

    }

};

module.exports = {
    logAudit
};
