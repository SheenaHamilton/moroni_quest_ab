const router = require('express').Router();
const { requireLeader } = require("../middleware/pageAuth");
const inquiriesService = require('../services/inquiriesService');

router.get("/", requireLeader, async (req, res) => {
    const resources = {
        documents: [
            {
                title: "Administrative Grid",
                description: "Overview of Committees and Responsibilities",
                url: "https://docs.google.com/document/d/1pMOEGDHHZW-rAaYG_SFltTHh5uOwAatkAL90h0egZAg/edit?usp=sharing"
            },
            {
                title: "Personnel Directory",
                description: "Administration, Tribe Leaders, Actors",
                url: "https://docs.google.com/spreadsheets/d/12QBAm9YQ4URiGGQttkspGjoK49NAfENCHAXh31U_cGY/edit?usp=sharing"
            },
            {
                title: "Program Guide",
                description: "Schedules, Activities, Sets",
                url: "https://docs.google.com/spreadsheets/d/1lwBc5oUHqbNCxd97FQZbjxjVsCMX4-FO8csQ2YN9X8I/edit?usp=sharing"
            },
            {
                title: "Logistics",
                description: "For support, expectations and requests",
                url: "https://docs.google.com/spreadsheets/d/1u3bvdSgWn9Na3qznM8KwBW7y_J27OTpv_xpxyREMEzs/edit?usp=sharing"
            }
        ],
        images: [
            {
                type: "map",
                title: "Camp Map (Satellite)",
                embedUrl: "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d2125.5861455691597!2d-114.59592145019744!3d53.57029453795703!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sca!4v1766310249398!5m2!1sen!2sca"
            },
            {
                type: "image",
                title: "Quest Map",
                src: "img/questMap.jpg"
            },
            {
                type: "image",
                title: "Drop-off Map",
                src: "img/Dropoff.jpg"
            }
        ]
    };

    const newInquiryCount = await inquiriesService.countByStatus('new');

    res.render("leaders/resources", {
        resources,
        newInquiryCount
    });
});

module.exports = router;