import { PGlite } from '@electric-sql/pglite';
import { worker } from '@electric-sql/pglite/worker';
import { live } from '@electric-sql/pglite/live';

/*
    * This is the worker file for the PGlite database.
    * It is responsible for initializing the database and setting up the worker.
    * we used idb method for filestorage as it supports most browsers
*/

worker({
    async init() {
        return new PGlite({
        dataDir: 'idb://patient-registration-db',
        extensions: { live },
        relaxedDurability: true // For better performance
        });
    }
})