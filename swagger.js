const swaggerAutogen = require('swagger-autogen')();

//host: 'moroni-quest.onrender.com',
const doc = {
    info: {
        title: 'Moroni\'s Quest Application',
        description:
            'API documentation for Moronis Quest event management system. Provides endpoints for youth and leader registration, Book of Mormon challenges, photo gallery, and inquiry management for the Sherwood Park, Alberta stake.',
        version: '1.0.0',
    },
    host: 'localhost:3000', // Change to 'moroni-quest.onrender.com' for production
    schemes: ['http', 'https'],
    tags: [
        {
            name: 'Moroni',
            description: 'Main application endpoints',
        },
        {
            name: 'Authentication',
            description: 'OAuth 2.0 authentication endpoints',
        },
        {
            name: 'Youth',
            description: 'Youth registration endpoints',
        },
        {
            name: 'Leader',
            description: 'Leader registration endpoints',
        },
        {
            name: 'Book of Mormon Challenges',
            description: 'Book of Mormon challenge management',
        },
        {
            name: 'Photos',
            description: 'Photo gallery management',
        },
        {
            name: 'Inquiries',
            description: 'User inquiry management',
        },
    ],
    definitions: {
        Youth: {
            email: 'youth@example.com',
            first_name: 'John',
            last_name: 'Doe',
            ward: 'Sherwood Park 1st Ward',
            birthdate: '2010-05-15',
            address_street: '123 Main St',
            address_city: 'Sherwood Park',
            address_province: 'AB',
            address_postal: 'T8A 1A1',
            emergency_contact_name: 'Jane Doe',
            emergency_contact_primary: '780-555-1234',
            emergency_contact_secondary: '780-555-5678',
            health_number: '1234567890',
            diet_specific: false,
            diet_description: '',
            allergies: false,
            allergies_description: '',
            medications: false,
            medications_self_administer: false,
            medications_administer_description: '',
            medications_description: '',
            health_conditions: false,
            health_conditions_description: '',
            surgery_recent: false,
            surgery_description: '',
            physical_limitations: '',
            other_needs: '',
            parent_guardian_name: 'Jane Doe',
            parent_guardian_relationship: 'Mother',
            permission_granted: true,
            permission_date: '2025-01-15',
            terms_understood: true,
            media_consent_internal: true,
            media_consent_external: false,
            media_release_understood: true,
            form_completed_by: 'Jane Doe',
        },
        Leader: {
            timestamp: '2025-10-08T15:32:00Z',
            email: 'leader.jane@example.com',
            first_name: 'Jane',
            last_name: 'Thompson',
            ward: 'Sherwood Park 2nd Ward',
            birthdate: '1982-05-15T00:00:00Z',
            address_street: '456 Maple Crescent',
            address_city: 'Sherwood Park',
            address_province: 'AB',
            address_postal: 'T8A 2N7',

            emergency_contact_name: 'Tom Thompson',
            emergency_contact_primary: '780-555-8888',
            emergency_contact_secondary: '780-555-9999',

            health_number: '1234567890',

            diet_specific: true,
            diet_description: 'Gluten-free',

            allergies: true,
            allergies_description: 'Peanuts',

            role: 'Ward Leader',
            arrival_date: '2025-07-03T12:00:00Z',
            departure_date: '2025-07-06T15:00:00Z',

            lodging_type: 'assigned',
            lodging_description: 'Assigned on-site lodging',

            terms_understood: true,
            media_consent_internal: true,
            media_consent_external: false,
            media_release_understood: true,

            form_completed_by: 'Jane Thompson',
            date_completed: '2025-05-10T00:00:00Z'
        },
        BOMChallenge: {
            title: 'Read 1 Nephi 1-5',
            description: 'Read about Lehi\'s vision and journey',
            book: '1 Nephi',
            chapters: '1-5',
            verses: '1-20',
            startDate: '2025-07-01',
            endDate: '2025-07-05',
            points: 100,
        },
        Photo: {
            url: 'https://example.com/photo.jpg',
            title: 'Opening Ceremony',
            description: 'Youth gathering for opening activities',
            event: 'Moronis Quest 2025',
            date: '2025-07-05',
            uploadedBy: 'Admin User',
        },
        Inquiry: {
            name: 'John Smith',
            email: 'john@example.com',
            phone: '780-555-9999',
            subject: 'Registration Question',
            message:
                'I have a question about youth registration deadlines.',
            status: 'pending',
        },
    },
};

const outputFile = './swagger.json';
const endpointsFiles = ['./routes/index.js', './routes/auth.js'];

// Generate swagger.json
swaggerAutogen(outputFile, endpointsFiles, doc);