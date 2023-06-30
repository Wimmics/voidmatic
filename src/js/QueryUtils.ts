import sparqljs, { AskQuery, ConstructQuery, DescribeQuery, Query, SelectQuery, SparqlQuery, Update } from "sparqljs";
import * as $rdf from 'rdflib';
import { JSONValue, SPARQLJSONResult } from "./Model";
import * as RDFUtils from "./RDFUtils";

const defaultQueryPaginationSize = 250;

export let defaultQueryTimeout = 60000;

export function fetchPromise(url: string, header: Record<string, string> = {}, method = "GET", query = "", numTry = 0): Promise<any> {
    let myHeaders = {};
    myHeaders["pragma"] = "no-cache";
    myHeaders["cache-control"] = "no-cache";
    Object.keys(header).forEach(key => {
        myHeaders[key] = header[key];
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
            console.error("Error during fetch", error);
        });
}

export function fetchGETPromise(url: string, header: Record<string, string> = {}): Promise<string> {
    return new Promise((resolve, reject) => {
        let request = new XMLHttpRequest();
        request.open("GET", url);
        let myHeaders = {};
        // myHeaders["pragma"] = "no-cache";
        // myHeaders["cache-control"] = "no-cache";
        Object.keys(header).forEach(key => {
            myHeaders[key] = header[key];
        });
        Object.keys(myHeaders).forEach(key => {
            request.setRequestHeader(key, myHeaders[key]);
        });
        request.onreadystatechange = () => {
            if (request.readyState == 4) {
                if (request.status == 200) {
                    resolve(request.responseText);
                } else {
                    reject(request.status);
                }
            }
        };
        request.send();
    });
}

export function fetchPOSTPromise(url, query = "", header: Record<string, string> = {}): Promise<any> {
    return fetchPromise(url, header, "POST", query);
}

export function fetchJSONPromise(url, otherHeaders: Record<string, string> = {}): Promise<any> {
    let header = {};
    header['accept'] = 'application/json';
    Object.keys(otherHeaders).forEach(key => {
        header[key] = otherHeaders[key];
    });
    return fetchGETPromise(url, header).then(response => {
        if (response == null || response == undefined || response == "") {
            return {};
        } else {
            try {
                return JSON.parse(response);
            } catch (error) {
                console.error(url, error, response)
                throw error
            }
        }
    });
}

export function sparqlQueryPromise(endpoint, query, timeout: number = defaultQueryTimeout): Promise<any> {
    let jsonHeaders = {};
    jsonHeaders["Accept"] = "application/sparql-results+json";
    if (isSparqlSelect(query)) {
        return fetchJSONPromise(endpoint + '?query=' + encodeURIComponent(query) + '&format=json&timeout=' + timeout, jsonHeaders).catch(error => { console.error(endpoint, query, error); throw error })
    } else if (isSparqlAsk(query)) {
        return fetchJSONPromise(endpoint + '?query=' + encodeURIComponent(query) + '&format=json&timeout=' + timeout, jsonHeaders).catch(() => { return { boolean: false } })
    } else if (isSparqlConstruct(query)) {
        return fetchGETPromise(endpoint + '?query=' + encodeURIComponent(query) + '&format=turtle&timeout=' + timeout).then(result => {
            let resultStore = RDFUtils.createStore();
            result = RDFUtils.fixCommonTurtleStringErrors(result)
            return RDFUtils.parseTurtleToStore(result, resultStore).catch(error => {
                console.error(endpoint, query, error, result);
                return;
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
        if ((parsedQuery as Query).queryType != undefined) {
            return ((parsedQuery as Query).queryType.localeCompare(queryType) == 0);
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

export function isSelect(query: SparqlQuery): query is SelectQuery {
    return (query as SelectQuery).queryType !== undefined && (query as SelectQuery).queryType === 'SELECT';
}

export function isAsk(query: SparqlQuery): query is AskQuery {
    return (query as AskQuery).queryType !== undefined && (query as AskQuery).queryType === 'ASK';
}

export function isConstruct(query: SparqlQuery): query is ConstructQuery {
    return (query as ConstructQuery).queryType !== undefined && (query as ConstructQuery).queryType === 'CONSTRUCT';
}

export function isDescribe(query: SparqlQuery): query is DescribeQuery {
    return (query as DescribeQuery).queryType !== undefined && (query as DescribeQuery).queryType === 'DESCRIBE';
}

export function isUpdate(query: SparqlQuery): query is Update {
    return (query as Update).type !== undefined && (query as Update).type === 'update';
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

    if (isSelect(queryObject)) {
        // We add the OFFSET and LIMIT to the query
        queryObject.offset = iteration * pageSize;
        queryObject.limit = pageSize;
    }

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