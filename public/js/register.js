// public/js/registration-form.js
// Handles:
// - Registration type toggle (youth vs leader)
// - Conditional panels (diet, allergies, meds, self-administer, conditions, surgery, lodging)
// - Scroll to error block when present (supports bfcache on Safari)

(() => {
    function scrollToErrorIfNeeded() {
        const errorBlock = document.getElementById("reg-error-block");
        if (!errorBlock) return;
        if (errorBlock.dataset.scrollOnLoad !== "true") return;
        const errorBlockBefore = document.getElementById("reg-information");
        errorBlockBefore.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function initOnce() {
        const form = document.getElementById("registration-form");
        if (!form) return;

        if (form.dataset.jsInitialized === "true") return;
        form.dataset.jsInitialized = "true";

        const qs = (sel, root = document) => root.querySelector(sel);
        const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

        const youthSection = qs(".reg-card--youth", form);
        const leaderSection = qs(".reg-card--leader", form);

        const panels = {
            diet: qs("#diet-details", form),
            allergies: qs("#allergies-details", form),
            medications: qs("#medications-details", form),
            "self-administer": qs("#administer-details", form),
            "health-conditions": qs("#health-conditions-details", form),
            surgery: qs("#surgery-details", form),
            "medical-background": qs("#medical-background-details", form),
            lodging: qs("#lodging-details", form),
        };

        function setHidden(el, hidden) {
            if (!el) return;
            el.classList.toggle("is-hidden", hidden);
            el.setAttribute("aria-hidden", String(hidden));
        }

        function setConditionalRequiredInside(el, required) {
            if (!el) return;
            qsa("[data-req-when-visible]", el).forEach((c) => {
                c.required = !!required;
            });
        }

        function disableControlsInside(el, disabled) {
            if (!el) return;
            qsa("input, select, textarea, button", el).forEach((c) => {
                if (c.type === "submit") return;
                c.disabled = !!disabled;
            });
        }

        function resetValuesInside(el) {
            if (!el) return;
            qsa("input, textarea, select", el).forEach((c) => {
                if (c.type === "radio" || c.type === "checkbox") c.checked = false;
                else if (c.tagName === "SELECT") c.selectedIndex = 0;
                else c.value = "";
            });
        }

        function showPanel(key, show) {
            const panel = panels[key];
            if (!panel) return;

            setHidden(panel, !show);
            setConditionalRequiredInside(panel, show);

            if (!show) resetValuesInside(panel);
        }

        function handleToggleInput(target) {
            const key = target.getAttribute("data-toggle");
            const val = target.getAttribute("data-toggle-value");
            if (!key || !val) return;
            showPanel(key, val === "yes");
        }

        function handleLodgingSelect(target) {
            if (!target.matches('select[data-toggle="lodging"]')) return;
            const v = target.value;
            showPanel("lodging", !!v && v !== "tent");
        }

        function initConditionalPanelsForVisibleSections() {
            qsa("input[type='radio'][data-toggle][data-toggle-value]", form)
                .filter((r) => !r.disabled && r.checked)
                .forEach(handleToggleInput);

            const lodgingSelect = qs('select[data-toggle="lodging"]', form);
            if (lodgingSelect && !lodgingSelect.disabled) handleLodgingSelect(lodgingSelect);
        }

        function applyRegistrationType(type, { resetOther = false } = {}) {
            const isYouth = type === "youth";
            const isLeader = type === "leader";

            setHidden(youthSection, !isYouth);
            setHidden(leaderSection, !isLeader);

            disableControlsInside(youthSection, !isYouth);
            disableControlsInside(leaderSection, !isLeader);

            if (resetOther) {
                if (isYouth && leaderSection) resetValuesInside(leaderSection);
                if (isLeader && youthSection) resetValuesInside(youthSection);
            }
        }

        function handleAnyEvent(e) {
            const t = e.target;

            if (t.matches('input[name="registration_type"]')) {
                applyRegistrationType(t.value, { resetOther: true });
                initConditionalPanelsForVisibleSections();
                return;
            }

            if (t.matches("input[type='radio'][data-toggle][data-toggle-value]")) {
                handleToggleInput(t);
                return;
            }

            if (t.matches('select[data-toggle="lodging"]')) {
                handleLodgingSelect(t);
                return;
            }
        }

        form.addEventListener("change", handleAnyEvent);

        // Initial state
        const youthDefault = qs('input[name="registration_type"][value="youth"]', form);
        const checkedType = qs('input[name="registration_type"]:checked', form);
        if (!checkedType && youthDefault) youthDefault.checked = true;

        const initialType = qs('input[name="registration_type"]:checked', form)?.value;

        if (initialType) {
            applyRegistrationType(initialType, { resetOther: false });
        } else {
            if (youthSection) { setHidden(youthSection, true); disableControlsInside(youthSection, true); }
            if (leaderSection) { setHidden(leaderSection, true); disableControlsInside(leaderSection, true); }
        }

        initConditionalPanelsForVisibleSections();
    }

    // Main boot
    function boot() {
        initOnce();
        scrollToErrorIfNeeded();
    }

    document.addEventListener("DOMContentLoaded", boot);

    // bfcache restore (Safari/iOS)
    window.addEventListener("pageshow", boot);

    // Permission date helper (kept separate)
    document.addEventListener("DOMContentLoaded", () => {
        const permissionCheckbox = document.getElementById("permission_granted");
        const dateInput = document.getElementById("permission_date");
        if (!permissionCheckbox || !dateInput) return;

        permissionCheckbox.addEventListener("change", () => {
            if (!permissionCheckbox.checked || dateInput.value) return;

            const d = new Date();
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            dateInput.value = d.toISOString().split("T")[0];
        });
    });
})();
