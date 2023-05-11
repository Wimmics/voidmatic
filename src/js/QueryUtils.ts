
import sparqljs from "sparqljs";
import * as $rdf from 'rdflib';
import { JSONValue, SPARQLJSONResult } from "./Model";
import * as RDFUtils from "./RDFUtils";

const defaultQueryPaginationSize = 250;

export let defaultQueryTimeout = 60000;

export function fetchPromise(url, header = new Map(), method = "GET", query = "") {
    let myHeaders = new Headers();
    header.forEach((value, key) => {
        myHeaders.set(key, value);
    });
    let myInit: RequestInit = {
        method: method,
        headers: myHeaders,
        redirect: 'follow',
    };
    if (method.localeCompare("POST") == 0) {
        myInit.body = query;
    }
    return fetch(url, myInit)
        .then(response => {
            if (response.ok) {
                return response.blob().then(blob => blob.text())
            } else {
                throw response;
            }
        }).catch(error => {
            console.error("Fetch ", method, url, query, error.type, error.message)
            throw error;
        })

}

export function fetchGETPromise(url: string, header = new Map()): Promise<string> {
    return fetchPromise(url, header);
}

export function fetchPOSTPromise(url: string, query = "", header = new Map()): Promise<string> {
    return fetchPromise(url, header, "POST", query);
}

export function fetchJSONPromise(url: string, otherHeaders = new Map()): Promise<JSONValue> {
    let header = new Map();
    header.set('Content-Type', 'application/json');
    otherHeaders.forEach((value, key) => {
        header.set(key, value)
    })
    return fetchPromise(url, header).then(response => {
        if (response !== null && response !== undefined && response !== "") {
            try {
                return JSON.parse(response);
            } catch (error) {
                console.error(url, error, response)
                throw error
            }
        } else {
            return {};
        }
    });
}

export function sparqlQueryPromise(endpoint, query, timeout: number = defaultQueryTimeout): Promise<$rdf.Formula | SPARQLJSONResult> {
    let jsonHeaders = new Map();
    jsonHeaders.set("Accept", "application/sparql-results+json")
    if (isSparqlSelect(query)) {
        return fetchJSONPromise(endpoint + '?query=' + encodeURIComponent(query) + '&format=json&timeout=' + timeout, jsonHeaders).catch(error => { console.error(endpoint, query, error); throw error }) as Promise<SPARQLJSONResult>
    } else if (isSparqlAsk(query)) {
        return fetchJSONPromise(endpoint + '?query=' + encodeURIComponent(query) + '&format=json&timeout=' + timeout, jsonHeaders).catch(() => { return { boolean: false } }) as Promise<SPARQLJSONResult>
    } else if (isSparqlConstruct(query)) {
        return fetchGETPromise(endpoint + '?query=' + encodeURIComponent(query) + '&format=turtle&timeout=' + timeout)
            .then(result => {
                result = result.replaceAll("nodeID://", "_:") // Dirty hack to fix nodeID:// from Virtuoso servers for turtle
                return RDFUtils.parseTurtleToStore(result, RDFUtils.createStore()).catch(error => {
                    console.error(endpoint, query, error, result);
                    throw error;
                });
            }).catch(error => { console.error(endpoint, query, error); throw error })
    } else {
        console.error(new Error("Unexpected query type"))
    }
}

export function checkSparqlType(queryString: string, queryType: "CONSTRUCT" | "SELECT" | "ASK" | "DESCRIBE" | "update") {
    let parser = new sparqljs.Parser();
    try {
        const parsedQuery = parser.parse(queryString);
        if (parsedQuery.queryType != undefined) {
            return (parsedQuery.queryType.localeCompare(queryType) == 0);
        } else if (parsedQuery.type != undefined) {
            return (parsedQuery.type.localeCompare(queryType) == 0);
        } else {
            throw new Error("No expected query type property : " + JSON.stringify(parsedQuery));
        }
    } catch (error) {
        console.error(queryString, error)
    }
}

export function isSparqlConstruct(queryString: string): boolean {
    return checkSparqlType(queryString, "CONSTRUCT");
}

export function isSparqlSelect(queryString: string): boolean {
    return checkSparqlType(queryString, "SELECT");
}

export function isSparqlAsk(queryString: string): boolean {
    return checkSparqlType(queryString, "ASK");
}

export function isSparqlDescribe(queryString: string): boolean {
    return checkSparqlType(queryString, "DESCRIBE");
}

export function isSparqlUpdate(queryString: string): boolean {
    return checkSparqlType(queryString, "update");
}


export function paginatedSparqlQueryPromise(endpointUrl: string, query: string, pageSize: number = defaultQueryPaginationSize, iteration?: number, timeout?: number, finalResult?: $rdf.Formula | Array<JSONValue>): Promise<$rdf.Formula | Array<JSONValue>> {
    let generator = new sparqljs.Generator();
    let parser = new sparqljs.Parser();
    if (iteration == undefined) {
        iteration = 0;
    }
    if (timeout == undefined) {
        timeout = defaultQueryTimeout;
    }
    let queryObject = parser.parse(query);
    if (isSparqlSelect(query)) {
        if (finalResult == undefined) {
            finalResult = [] as Array<JSONValue>;
        }
    } else if (isSparqlConstruct(query)) {
        if (finalResult == undefined) {
            finalResult = RDFUtils.createStore() as $rdf.Formula;
        }
    }

    // We add the OFFSET and LIMIT to the query
    queryObject.offset = iteration * pageSize;
    queryObject.limit = pageSize;

    let generatedQuery = generator.stringify(queryObject);

    // We send the paginated CONSTRUCT query
    return sparqlQueryPromise(endpointUrl, generatedQuery, timeout).then(generatedQueryResult => {
        if (generatedQueryResult !== undefined) {
            if (isSparqlSelect(query)) {
                try {
                    let parsedSelectQueryResult: JSONValue = generatedQueryResult as JSONValue;
                    (finalResult as Array<JSONValue>) = (finalResult as Array<JSONValue>).concat(parsedSelectQueryResult["results"].bindings as JSONValue[]);
                    if ((parsedSelectQueryResult as JSONValue)["results"].bindings.length > 0) {
                        return paginatedSparqlQueryPromise(endpointUrl, query, pageSize, iteration + 1, timeout, finalResult);
                    } else {
                        return finalResult;
                    }

                } catch (error) {
                    console.error("Error while parsing the query result as SELECT result: ", error, generatedQueryResult);
                    throw error;
                }
            } else if (isSparqlConstruct(query)) {
                (finalResult as $rdf.Formula).addAll((generatedQueryResult as $rdf.Formula).statements)
                if ((generatedQueryResult as $rdf.Formula).statements.length > 0) {
                    return paginatedSparqlQueryPromise(endpointUrl, query, pageSize, iteration + 1, timeout, finalResult);
                } else {
                    return finalResult;
                }
            } else {
                return finalResult;
            }
        } else {
            return finalResult;
        }
    }).catch(error => {
        console.error("Error while paginating the query: ", error);
        throw error;
    })
        .finally(() => {
            return finalResult;
        });
}

export function extractSettledPromiseValues(settledPromisesResult: PromiseSettledResult<any>[]) {
    return settledPromisesResult.map(promiseResult => {
        if (promiseResult.status === "fulfilled") {
            return promiseResult.value;
        } else {
            return undefined;
        }
    });
}