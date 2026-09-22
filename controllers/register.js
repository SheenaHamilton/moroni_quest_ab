const mongodb = require("../data/database"); // <-- adjust to your actual path
const { appendRegistrationToSheet } = require("../services/googleSheets");

exports.submitRegistration = async (req, res) => {
    try {
        const type = req.body.registration_type; // "youth" | "leader"

        // Build ONE consistent document (same shape for both)
        const doc = {
            // system
            timestamp: new Date(),
            registration_type: type,

            // shared participant fields
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            birthdate: req.body.birthdate,
            gender: req.body.gender,
            email: req.body.email,
            parent_email: type === "youth" ? (req.body.parent_email || "") : "",
            friend_request: req.body.friend_request || "",

            ward: req.body.ward,

            address_street: req.body.address_street,
            address_city: req.body.address_city,
            address_province: req.body.address_province,
            address_postal: req.body.address_postal,

            emergency_contact_name: req.body.emergency_contact_name,
            emergency_contact_primary: req.body.emergency_contact_primary,
            emergency_contact_secondary: req.body.emergency_contact_secondary || "",

            health_number: req.body.health_number || "",

            diet_specific: req.body.diet_specific,
            diet_description: req.body.diet_description || "",

            allergies: req.body.allergies,
            allergies_description: req.body.allergies_description || "",

            // youth_* fields (always present; blank/false for leaders)
            youth_medications: type === "youth" ? req.body.medications : false,
            youth_medications_self_administer: type === "youth" ? req.body.medications_self_administer : false,
            youth_medications_description: type === "youth" ? (req.body.medications_description || "") : "",
            youth_medications_administer_description: type === "youth" ? (req.body.medications_administer_description || "") : "",

            youth_health_conditions: type === "youth" ? req.body.health_conditions : false,
            youth_health_conditions_description: type === "youth" ? (req.body.health_conditions_description || "") : "",

            youth_surgery_recent: type === "youth" ? req.body.surgery_recent : false,
            youth_surgery_description: type === "youth" ? (req.body.surgery_description || "") : "",

            youth_physical_limitations: type === "youth" ? (req.body.physical_limitations || "") : "",
            youth_other_needs: type === "youth" ? (req.body.other_needs || "") : "",

            youth_parent_guardian_name: type === "youth" ? req.body.parent_guardian_name : "",
            youth_parent_guardian_relationship: type === "youth" ? req.body.parent_guardian_relationship : "",

            youth_permission_granted: type === "youth" ? req.body.permission_granted : false,
            youth_permission_granted_privilege: type === "youth" ? req.body.permission_granted_privilege : false,
            youth_permission_date: type === "youth" ? req.body.permission_date : null,

            youth_acknowledgement_privilege: type === "youth" ? (req.body.youth_acknowledgement_privilege || "") : "",
            youth_acknowledgement: type === "youth" ? (req.body.youth_acknowledgement || "") : "",

            // leader_* fields (always present; blank for youth)
            leader_role: type === "leader" ? (req.body.role || "") : "",
            leader_arrival_date: type === "leader" ? (req.body.arrival_date || null) : null,
            leader_departure_date: type === "leader" ? (req.body.departure_date || null) : null,

            leader_lodging_type: type === "leader" ? (req.body.lodging_type || "") : "",
            leader_lodging_description: type === "leader" ? (req.body.lodging_description || "") : "",

            leader_medical_background: type === "leader" ? req.body.medical_background : false,
            leader_medical_background_description: type === "leader" ? (req.body.medical_background_description || "") : "",

            // terms/media (shared)
            terms_understood: req.body.terms_understood,
            media_consent_internal: req.body.media_consent_internal,
            media_consent_external: req.body.media_consent_external,
            media_release_understood: req.body.media_release_understood,

            // completion (shared)
            form_completed_by: req.body.form_completed_by,
            date_completed: new Date(),

            // sheets sync tracking
            sheets_sync: {
                synced: false,
                syncedAt: null,
                error: null,
            },
        };

        // 1) Insert into ONE collection
        const db = mongodb.getDatabase().db();
        const insertResult = await db.collection("registrations").insertOne(doc);

        // Add _id for sheets + any downstream use
        const insertedId = insertResult.insertedId;
        const docForSheets = { ...doc, _id: insertedId };

        // 2) Best-effort append to ONE sheet tab
        try {
            await appendRegistrationToSheet(docForSheets);

            await db.collection("registrations").updateOne(
                { _id: insertedId },
                {
                    $set: {
                        "sheets_sync.synced": true,
                        "sheets_sync.syncedAt": new Date(),
                        "sheets_sync.error": null,
                    },
                }
            );
        } catch (sheetErr) {
            console.error("Sheets append failed:", sheetErr);

            await db.collection("registrations").updateOne(
                { _id: insertedId },
                {
                    $set: {
                        "sheets_sync.synced": false,
                        "sheets_sync.error": String(sheetErr?.message || sheetErr),
                    },
                }
            );
            // We still succeed because MongoDB is the source of truth.
        }

        // Website-friendly response:
        // - If you want JSON (for fetch/AJAX), it supports that too.
        if (req.accepts("json") && !req.accepts("html")) {
            return res.status(201).json({ ok: true, id: insertedId });
        }

        // redirect to a thank-you page (recommended UX)
        return res.redirect(`/register/success?id=${insertedId}`);
    } catch (err) {
        console.error("submitRegistration error:", err);
        return res.status(500).render("registration", {
            errors: {},
            errorSummary: ["Something went wrong while submitting your registration. Please try again."],
            values: req.body || {},
        });
    }
};
