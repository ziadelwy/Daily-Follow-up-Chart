// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBCnGstVO756i6gm_kJER8kwBlLsUf4tdI",
    authDomain: "zamzam-ef804.firebaseapp.com",
    databaseURL: "https://zamzam-ef804-default-rtdb.firebaseio.com",
    projectId: "zamzam-ef804",
    storageBucket: "zamzam-ef804.firebasestorage.app",
    messagingSenderId: "411153577585",
    appId: "1:411153577585:web:908e7e809e569321a94dd0",
    measurementId: "G-46BHRGQFPR"
};

// Initialize Firebase
let app;
let database;
let db;

try {
    // Check if Firebase is already initialized
    if (!firebase.apps.length) {
        app = firebase.initializeApp(firebaseConfig);
    } else {
        app = firebase.app();
    }
    
    // Initialize database
    database = firebase.database();
    
    // Create database operations object
    db = {
        // Children operations
        saveChild: async (childData) => {
            try {
                console.log('Attempting to save child data:', childData);
                const newChildRef = database.ref('children').push();
                await newChildRef.set(childData);
                console.log('Child data saved successfully with ID:', newChildRef.key);
                return newChildRef.key;
            } catch (error) {
                console.error('Error saving child:', error);
                throw new Error('حدث خطأ أثناء حفظ بيانات الطفل: ' + error.message);
            }
        },

        getChildren: async () => {
            try {
                console.log('Attempting to fetch children data');
                const snapshot = await database.ref('children').once('value');
                const data = snapshot.val() || {};
                console.log('Successfully fetched children data:', data);
                return data;
            } catch (error) {
                console.error('Error fetching children:', error);
                throw new Error('حدث خطأ أثناء جلب بيانات الأطفال: ' + error.message);
            }
        },

        updateChild: async (childId, childData) => {
            try {
                console.log('Attempting to update child:', childId);
                await database.ref(`children/${childId}`).update(childData);
                console.log('Child data updated successfully');
            } catch (error) {
                console.error('Error updating child:', error);
                throw new Error('حدث خطأ أثناء تحديث بيانات الطفل: ' + error.message);
            }
        },

        deleteChild: async (childId) => {
            try {
                console.log('Attempting to delete child:', childId);
                await database.ref(`children/${childId}`).remove();
                console.log('Child deleted successfully');
            } catch (error) {
                console.error('Error deleting child:', error);
                throw new Error('حدث خطأ أثناء حذف بيانات الطفل: ' + error.message);
            }
        },

        // Medicine operations
        saveMedicine: async (medicineData) => {
            try {
                const medicineRef = database.ref('medicines').push();
                await medicineRef.set(medicineData);
                return medicineRef.key;
            } catch (error) {
                console.error('Error saving medicine:', error);
                throw error;
            }
        },

        getMedicines: async () => {
            try {
                const snapshot = await database.ref('medicines').once('value');
                return snapshot.val() || {};
            } catch (error) {
                console.error('Error getting medicines:', error);
                throw error;
            }
        },

        updateMedicine: async (medicineId, medicineData) => {
            try {
                await database.ref(`medicines/${medicineId}`).update(medicineData);
            } catch (error) {
                console.error('Error updating medicine:', error);
                throw error;
            }
        },

        deleteMedicine: async (medicineId) => {
            try {
                await database.ref(`medicines/${medicineId}`).remove();
            } catch (error) {
                console.error('Error deleting medicine:', error);
                throw error;
            }
        },

        // Diagnosis operations
        saveDiagnosis: async (diagnosis) => {
            try {
                const diagnosisRef = database.ref('diagnosis').push();
                await diagnosisRef.set({ name: diagnosis });
                return diagnosisRef.key;
            } catch (error) {
                console.error('Error saving diagnosis:', error);
                throw error;
            }
        },

        getDiagnosis: async () => {
            try {
                const snapshot = await database.ref('diagnosis').once('value');
                return snapshot.val() || {};
            } catch (error) {
                console.error('Error getting diagnosis:', error);
                throw error;
            }
        },

        // Problems operations
        saveProblem: async (problem) => {
            try {
                const problemRef = database.ref('problems').push();
                await problemRef.set({ name: problem });
                return problemRef.key;
            } catch (error) {
                console.error('Error saving problem:', error);
                throw error;
            }
        },

        getProblems: async () => {
            try {
                const snapshot = await database.ref('problems').once('value');
                return snapshot.val() || {};
            } catch (error) {
                console.error('Error getting problems:', error);
                throw error;
            }
        },

        // Birth places operations
        saveBirthPlace: async (place) => {
            try {
                console.log('Attempting to save birth place:', place);
                const placeRef = database.ref('birthPlaces').push();
                await placeRef.set({ name: place });
                console.log('Birth place saved successfully with ID:', placeRef.key);
                return placeRef.key;
            } catch (error) {
                console.error('Error saving birth place:', error);
                throw error;
            }
        },

        getBirthPlaces: async () => {
            try {
                console.log('Attempting to fetch birth places');
                const snapshot = await database.ref('birthPlaces').once('value');
                const data = snapshot.val() || {};
                console.log('Successfully fetched birth places');
                return data;
            } catch (error) {
                console.error('Error getting birth places:', error);
                throw error;
            }
        },

        // Session operations
        saveSession: async (sessionData) => {
            try {
                const sessionRef = database.ref('sessions').push();
                await sessionRef.set(sessionData);
                return sessionRef.key;
            } catch (error) {
                console.error('Error saving session:', error);
                throw error;
            }
        },

        getSessions: async (childId) => {
            try {
                const snapshot = await database.ref('sessions').orderByChild('childId').equalTo(childId).once('value');
                return snapshot.val() || {};
            } catch (error) {
                console.error('Error getting sessions:', error);
                throw error;
            }
        },

        // Main page data operations
        saveMainPageData: async (fileNo, mainData) => {
            try {
                const timestamp = Date.now();
                await database.ref(`mainPageData/${fileNo}/${timestamp}`).set({...mainData, timestamp});
            } catch (error) {
                throw error;
            }
        },
        getMainPageData: async (fileNo) => {
            try {
                const snapshot = await database.ref(`mainPageData/${fileNo}`).once('value');
                const data = snapshot.val() || null;
                if (!data) return null;
                // If data is an object of records, get the latest
                if (typeof data === 'object' && !Array.isArray(data)) {
                    const allRecords = Object.values(data);
                    return allRecords.reduce((a, b) => (a.timestamp > b.timestamp ? a : b), {});
                }
                return data;
            } catch (error) {
                throw error;
            }
        },

        // Dropdown options operations
        saveDropdownOption: async (selectId, value) => {
            try {
                const dropdownRef = database.ref(`dropdownOptions/${selectId}`).push();
                await dropdownRef.set({ value });
                return dropdownRef.key;
            } catch (error) {
                console.error('Error saving dropdown option:', error);
                throw error;
            }
        },

        getDropdownOptions: async (selectId) => {
            try {
                const snapshot = await database.ref(`dropdownOptions/${selectId}`).once('value');
                return snapshot.val() || {};
            } catch (error) {
                console.error('Error getting dropdown options:', error);
                throw error;
            }
        },

        // File number operations
        getLastFileNumber: async () => {
            try {
                const snapshot = await database.ref('lastFileNumber').once('value');
                return snapshot.val() || 0;
            } catch (error) {
                console.error('Error getting last file number:', error);
                throw error;
            }
        },

        updateLastFileNumber: async (newNumber) => {
            try {
                await database.ref('lastFileNumber').set(newNumber);
            } catch (error) {
                console.error('Error updating last file number:', error);
                throw error;
            }
        },

        // Follow-up data operations
        getAllFollowupData: async () => {
            try {
                const snapshot = await database.ref('mainPageData').once('value');
                const data = snapshot.val() || {};
                // For each fileNo, get the record with the latest timestamp
                const latestData = {};
                Object.entries(data).forEach(([fileNo, records]) => {
                    if (typeof records === 'object') {
                        const allRecords = Object.values(records);
                        const latestRecord = allRecords.reduce((a, b) => (a.timestamp > b.timestamp ? a : b), {});
                        latestData[fileNo] = latestRecord;
                    }
                });
                return latestData;
            } catch (error) {
                console.error('Error getting all followup data:', error);
                throw error;
            }
        },

        getHistoryForFileNo: async (fileNo) => {
            try {
                const snapshot = await database.ref(`mainPageData/${fileNo}`).once('value');
                const data = snapshot.val() || {};
                // Return all records sorted by timestamp descending
                return Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
            } catch (error) {
                console.error('Error getting history for fileNo:', error);
                throw error;
            }
        },

        deleteFollowupRecord: async (fileNo, timestamp) => {
            try {
                await database.ref(`mainPageData/${fileNo}`).remove();
            } catch (error) {
                console.error('Error deleting followup record:', error);
                throw error;
            }
        },

        // User authentication operations
        saveUser: async (userData) => {
            try {
                const userRef = database.ref('users').push();
                await userRef.set(userData);
                return userRef.key;
            } catch (error) {
                console.error('Error saving user:', error);
                throw error;
            }
        },

        getUsers: async () => {
            try {
                const snapshot = await database.ref('users').once('value');
                return snapshot.val() || {};
            } catch (error) {
                console.error('Error getting users:', error);
                throw error;
            }
        }
    };

    // Make db globally available
    window.db = db;
    console.log('Database initialized successfully');

} catch (error) {
    console.error('Error initializing Firebase:', error);
    throw new Error('حدث خطأ أثناء تهيئة قاعدة البيانات: ' + error.message);
} 
