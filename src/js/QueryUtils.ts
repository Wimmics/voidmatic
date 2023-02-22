const queryPaginationSize = 500;



export function fetchPromise(url, header = new Map<string, string>(), method: "POST" | "GET" = "GET", body = "") {
    let myHeaders = new Headers();
    myHeaders.set('pragma', 'no-cache');
    myHeaders.set('cache-control', 'no-cache');
    header.forEach((value, key) => {
        myHeaders.set(key, value);
    });
    let myInit: RequestInit = {
        method: method,
        headers: myHeaders,
        redirect: 'follow',
    };
    if (method.localeCompare("POST") == 0) {
        myInit.body = body;
    }
        return fetch(url, myInit)
            .then(response => {
                if (response.ok) {
                    return response.blob().then(blob => blob.text())
                } else {
                    throw response;
                }
            }).catch(error => {
                    console.log(error)
                    throw error;
            }).finally(() => {
                return;
            });

}

export function fetchJSONPromise(url) {
    var header = new Map();
    header.set('Content-Type', 'application/json');
    header.set("Accept", "application/sparql-results+json")
    return fetchPromise(url, header).then(response => {
        return JSON.parse(response);
    });
}

export function sparqlQueryPromise(endpoint, query) {
    if (query.includes("SELECT") || query.includes("ASK")) {
        return fetchJSONPromise(endpoint + '?query=' + encodeURIComponent(query) + '&format=json&timeout=60000')
    }
    else {
        throw new Error("Query type not supported: " + query);
    }
}

export function paginatedSparqlQueryPromise(endpoint, query, limit = queryPaginationSize, offset = 0, finalResult = []) {
    var paginatedQuery = query + " LIMIT " + limit + " OFFSET " + offset;
    return sparqlQueryPromise(endpoint, paginatedQuery)
        .then(queryResult => {
            queryResult.results.bindings.forEach(resultItem => {
                var finaResultItem = {};
                queryResult.head.vars.forEach(variable => {
                    finaResultItem[variable] = resultItem[variable];
                })
                finalResult.push(finaResultItem);
            })
            if (queryResult.results.bindings.length > 0) {
                return paginatedSparqlQueryPromise(endpoint, query, limit + queryPaginationSize, offset + queryPaginationSize, finalResult)
            }
        })
        .then(() => {
            return finalResult;
        })
        .catch(error => {
            console.error(error)
            return finalResult;
        })
        .finally(() => {
            return finalResult;
        })
}