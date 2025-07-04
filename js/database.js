class TaskDatabase {
    constructor() {
        this.dbName = 'TaskTrackerDB';
        this.version = 1;
        this.db = null;
        this.storeName = 'activities';
    }

    async init() {
        try {
            console.log('Initializing IndexedDB...');
            this.db = await this.openDatabase();
            console.log('IndexedDB initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize IndexedDB:', error);
            throw error;
        }
    }

    openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => {
                reject(new Error('Failed to open IndexedDB'));
            };
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                this.createSchema(db);
            };
        });
    }

    createSchema(db) {
        console.log('Creating database schema...');
        
        // Create activities object store
        const objectStore = db.createObjectStore(this.storeName, {
            keyPath: 'id',
            autoIncrement: true
        });

        // Create indexes for efficient filtering
        objectStore.createIndex('manufacturing_site', 'Manufacturing_site', { unique: false });
        objectStore.createIndex('assignee', 'Assignment', { unique: false });
        objectStore.createIndex('product', 'Product', { unique: false });
        objectStore.createIndex('activity', 'Activity', { unique: false });
        objectStore.createIndex('start_date', 'Start_with', { unique: false });
        objectStore.createIndex('end_date', 'End_with', { unique: false });
        objectStore.createIndex('created_at', 'createdAt', { unique: false });
        objectStore.createIndex('updated_at', 'updatedAt', { unique: false });

        console.log('Database schema created successfully');
    }

    async saveActivity(activity) {
        try {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            // Add timestamps
            const now = new Date().toISOString();
            const activityData = {
                ...activity,
                createdAt: activity.createdAt || now,
                updatedAt: now
            };

            const request = store.add(activityData);
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    console.log('Activity saved successfully:', request.result);
                    resolve(request.result);
                };
                request.onerror = () => {
                    reject(new Error('Failed to save activity'));
                };
            });
        } catch (error) {
            console.error('Error saving activity:', error);
            throw error;
        }
    }

    async updateActivity(id, activity) {
        try {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            // Add updated timestamp
            const activityData = {
                ...activity,
                id: id,
                updatedAt: new Date().toISOString()
            };

            const request = store.put(activityData);
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    console.log('Activity updated successfully:', id);
                    resolve(request.result);
                };
                request.onerror = () => {
                    reject(new Error('Failed to update activity'));
                };
            });
        } catch (error) {
            console.error('Error updating activity:', error);
            throw error;
        }
    }

    async deleteActivity(id) {
        try {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            const request = store.delete(id);
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    console.log('Activity deleted successfully:', id);
                    resolve(true);
                };
                request.onerror = () => {
                    reject(new Error('Failed to delete activity'));
                };
            });
        } catch (error) {
            console.error('Error deleting activity:', error);
            throw error;
        }
    }

    async getActivity(id) {
        try {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            
            const request = store.get(id);
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    resolve(request.result);
                };
                request.onerror = () => {
                    reject(new Error('Failed to get activity'));
                };
            });
        } catch (error) {
            console.error('Error getting activity:', error);
            throw error;
        }
    }

    async getAllActivities() {
        try {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            
            const request = store.getAll();
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    const activities = request.result;
                    console.log('Retrieved activities from database:', activities.length);
                    resolve(activities);
                };
                request.onerror = () => {
                    reject(new Error('Failed to get all activities'));
                };
            });
        } catch (error) {
            console.error('Error getting all activities:', error);
            throw error;
        }
    }

    async getActivitiesByFilter(filterField, filterValue) {
        try {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            
            let request;
            
            // Use index if available
            if (store.indexNames.contains(filterField)) {
                const index = store.index(filterField);
                request = index.getAll(filterValue);
            } else {
                // Fallback to full scan
                request = store.getAll();
            }
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    let results = request.result;
                    
                    // Filter results if index was not available
                    if (!store.indexNames.contains(filterField)) {
                        results = results.filter(item => item[filterField] === filterValue);
                    }
                    
                    console.log(`Retrieved ${results.length} activities with ${filterField} = ${filterValue}`);
                    resolve(results);
                };
                request.onerror = () => {
                    reject(new Error('Failed to filter activities'));
                };
            });
        } catch (error) {
            console.error('Error filtering activities:', error);
            throw error;
        }
    }

    async saveAllActivities(activities) {
        try {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            // Clear existing data
            await new Promise((resolve, reject) => {
                const clearRequest = store.clear();
                clearRequest.onsuccess = () => resolve();
                clearRequest.onerror = () => reject(new Error('Failed to clear activities'));
            });
            
            // Add all activities
            const promises = activities.map(activity => {
                const now = new Date().toISOString();
                const activityData = {
                    ...activity,
                    createdAt: activity.createdAt || now,
                    updatedAt: activity.updatedAt || now
                };
                
                return new Promise((resolve, reject) => {
                    const request = store.add(activityData);
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(new Error('Failed to save activity'));
                });
            });
            
            await Promise.all(promises);
            console.log(`Saved ${activities.length} activities to database`);
            return true;
        } catch (error) {
            console.error('Error saving all activities:', error);
            throw error;
        }
    }

    async clearAllActivities() {
        try {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            const request = store.clear();
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    console.log('All activities cleared from database');
                    resolve(true);
                };
                request.onerror = () => {
                    reject(new Error('Failed to clear activities'));
                };
            });
        } catch (error) {
            console.error('Error clearing activities:', error);
            throw error;
        }
    }

    async getActivitiesCount() {
        try {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            
            const request = store.count();
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    resolve(request.result);
                };
                request.onerror = () => {
                    reject(new Error('Failed to count activities'));
                };
            });
        } catch (error) {
            console.error('Error counting activities:', error);
            throw error;
        }
    }

    async exportActivities() {
        try {
            const activities = await this.getAllActivities();
            
            // Convert to CSV format for compatibility
            const csvData = activities.map(activity => ({
                Manufacturing_site: activity.Manufacturing_site || '',
                Product: activity.Product || '',
                API: activity.API || '',
                Assignment: activity.Assignment || '',
                Note: activity.Note || '',
                Process: activity.Process || '',
                Activity: activity.Activity || '',
                Start_with: activity.Start_with || '',
                End_with: activity.End_with || ''
            }));
            
            return csvData;
        } catch (error) {
            console.error('Error exporting activities:', error);
            throw error;
        }
    }

    async isSupported() {
        return 'indexedDB' in window;
    }

    async getDatabaseInfo() {
        try {
            const count = await this.getActivitiesCount();
            return {
                name: this.dbName,
                version: this.version,
                storeName: this.storeName,
                activitiesCount: count,
                isConnected: this.db !== null
            };
        } catch (error) {
            console.error('Error getting database info:', error);
            return null;
        }
    }
}

// Global database instance
let taskDatabase = null;

// Initialize database
async function initializeDatabase() {
    try {
        if (!taskDatabase) {
            taskDatabase = new TaskDatabase();
            await taskDatabase.init();
        }
        return taskDatabase;
    } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
    }
}

// Export for use in other modules
window.TaskDatabase = TaskDatabase;
window.initializeDatabase = initializeDatabase;
window.getDatabase = () => taskDatabase;