import http from 'http';

http.get('http://localhost:5000/api/listings/all', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            const listings = json.listings;
            if (!listings || !listings.length) {
                console.log("No listings found in response.");
                return;
            }

            let found = false;
            const findObj = (obj, path) => {
                if (!obj || typeof obj !== 'object') return;
                if (obj.ropani !== undefined) {
                    if (!path.includes('specs.landArea')) {
                        console.log(`FOUND misplaced object AT: ${path}`);
                        found = true;
                    }
                }
                for (const key in obj) {
                    findObj(obj[key], `${path}.${key}`);
                }
            };

            for (let i = 0; i < listings.length; i++) {
                findObj(listings[i], `listing[${i}]`);
            }

            if (!found) console.log("No misplaced landArea objects found.");
        } catch (e) {
            console.error(e);
        }
    });
});
