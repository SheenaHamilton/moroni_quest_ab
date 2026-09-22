const { google } = require("googleapis");

exports.debugSheetsAccess = async () => {
    const sheets = getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    console.log("Sheets OK. Title:", meta.data.properties.title);
    console.log("Tabs:", meta.data.sheets.map(s => s.properties.title));
};

function getSheetsClient() {
    const clientEmail = process.env.GOOGLE_SA_CLIENT_EMAIL;
    const privateKey = (process.env.GOOGLE_SA_PRIVATE_KEY || "").replace(/\\n/g, "\n");

    if (!clientEmail || !privateKey) {
        throw new Error("Google Sheets credentials are not configured.");
    }

    const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    return google.sheets({ version: "v4", auth });
}

const asISODate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");
const asISO = (d) => (d ? new Date(d).toISOString() : "");
const boolCell = (v) => (v === true ? "TRUE" : v === false ? "FALSE" : "");

/**
 * One-tab, consistent columns for both youth + leaders
 * Prefix type-specific fields with youth_ / leader_
 */
exports.appendRegistrationToSheet = async (doc) => {
    const sheets = getSheetsClient();

    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    const tabName = process.env.GOOGLE_SHEETS_TAB || "Registrations";

    if (!spreadsheetId) throw new Error("GOOGLE_SHEETS_ID is not set.");

    // IMPORTANT: keep this order stable
    const values = [
        // system
        asISO(doc.timestamp),
        String(doc._id || ""),
        doc.registration_type || "",

        // participant (shared)
        doc.first_name || "",
        doc.last_name || "",
        doc.ward || "",
        asISODate(doc.birthdate),
        doc.gender || "",
        doc.email || "",
        doc.parent_email || "",
        doc.friend_request || "",

        doc.address_street || "",
        doc.address_city || "",
        doc.address_province || "",
        doc.address_postal || "",

        doc.emergency_contact_name || "",
        doc.emergency_contact_primary || "",
        doc.emergency_contact_secondary || "",

        doc.health_number || "",
        boolCell(doc.diet_specific),
        doc.diet_description || "",
        boolCell(doc.allergies),
        doc.allergies_description || "",

        // youth_*
        boolCell(doc.youth_medications),
        doc.youth_medications_description || "",
        boolCell(doc.youth_medications_self_administer),
        doc.youth_medications_administer_description || "",

        boolCell(doc.youth_health_conditions),
        doc.youth_health_conditions_description || "",

        boolCell(doc.youth_surgery_recent),
        doc.youth_surgery_description || "",

        doc.youth_physical_limitations || "",
        doc.youth_other_needs || "",

        doc.youth_parent_guardian_name || "",
        doc.youth_parent_guardian_relationship || "",

        boolCell(doc.youth_permission_granted),
        boolCell(doc.youth_permission_granted_privilege),
        asISODate(doc.youth_permission_date),
        boolCell(doc.youth_acknowledgement_privilege),
        boolCell(doc.youth_acknowledgement),

        // leader_*
        doc.leader_role || "",
        asISODate(doc.leader_arrival_date),
        asISODate(doc.leader_departure_date),

        boolCell(doc.leader_medical_background),
        doc.leader_medical_background_description || "",

        doc.leader_lodging_type || "",
        doc.leader_lodging_description || "",

        // terms/media (shared)
        boolCell(doc.media_consent_internal),
        boolCell(doc.media_consent_external),
        boolCell(doc.media_release_understood),

        // completion (shared)
        doc.form_completed_by || "",
        boolCell(doc.terms_understood),
        asISO(doc.date_completed),
    ];

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${tabName}!A1`,
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: [values] },
    });
};
