import * as $rdf from 'rdflib';
import ttl_read from "@graphy/content.ttl.read";
import nt_read from "@graphy/content.nt.read";
import nq_read from "@graphy/content.nq.read";
import trig_read from "@graphy/content.trig.read";
import { resolve } from "url";

export var RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
export var RDFS = $rdf.Namespace("http://www.w3.org/2000/01/rdf-schema#");
export var OWL = $rdf.Namespace("http://www.w3.org/2002/07/owl#");
export var XSD = $rdf.Namespace("http://www.w3.org/2001/XMLSchema#");
export var DCAT = $rdf.Namespace("http://www.w3.org/ns/dcat#");
export var FOAF = $rdf.Namespace("http://xmlns.com/foaf/0.1/");
export var PROV = $rdf.Namespace("http://www.w3.org/ns/prov#");
export var SCHEMA = $rdf.Namespace("http://schema.org/");
export var VOID = $rdf.Namespace("http://rdfs.org/ns/void#");
export var SD = $rdf.Namespace("http://www.w3.org/ns/sparql-service-description#");
export var DCE = $rdf.Namespace("http://purl.org/dc/elements/1.1/");
export var DCT = $rdf.Namespace("http://purl.org/dc/terms/");
export var SKOS = $rdf.Namespace("http://www.w3.org/2004/02/skos/core#");
export var PAV = $rdf.Namespace("http://purl.org/pav/");
export var MOD = $rdf.Namespace("https://w3id.org/mod#");
export var DCMITYPE = $rdf.Namespace("http://purl.org/dc/dcmitype/");
export var VANN = $rdf.Namespace("http://purl.org/vocab/vann/");

export var EX = $rdf.Namespace("https://e.g/#");

export const exampleDataset = EX('dataset');
export const exampleDatasetService = EX('dataset-service');

function unicodeToUrlendcode(text) {
    return text.replace(/\\u[\dA-F]{4}/gi,
        function (match) {
            let unicodeMatch = String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
            let urlEncodedMatch = encodeURIComponent(unicodeMatch);
            return urlEncodedMatch;
        });
}

export function urlIsAbsolute(url: string) {
    var regex = new RegExp('^(?:[a-z+]+:)?//', 'i');
    return regex.test(url);
}

export function sanitizeUrl(url: string, baseURI: string, filename?: string): string {
    let result = url;
    if (url.localeCompare("") == 0) {
        result = filename;
    }
    if (!urlIsAbsolute(result)) {
        if (filename != null && filename != undefined && filename != "") {
            result = resolve(filename, result);
        } else {
            result = resolve(baseURI, result);
        }
    }
    if (!(result.startsWith("http://") || result.startsWith("https://") || result.startsWith("file://"))) {
        result = "file://" + result;
    }

    return result;
}

export function createStore() {
    var store = $rdf.graph();
    store.setPrefixForURI("dcat", "http://www.w3.org/ns/dcat#");
    store.setPrefixForURI("ex", "https://e.g/#");
    store.setPrefixForURI("kgi", "https://ns.inria.fr/kg/index#");
    store.setPrefixForURI("sd", "http://www.w3.org/ns/sparql-service-description#");
    store.setPrefixForURI("wimmics", "https://team.inria.fr/wimmics/");
    store.setPrefixForURI("culturefr", "https://www.culture.gouv.fr/");
    store.setPrefixForURI("inria", "https://www.inria.fr/");
    store.setPrefixForURI("dbfr", "http://fr.dbpedia.org/");
    store.setPrefixForURI("cc", "http://creativecommons.org/ns#");
    store.setPrefixForURI("dbo", "http://dbpedia.org/ontology/");
    store.setPrefixForURI("dbfrp", "http://fr.dbpedia.org/property/");
    store.setPrefixForURI("openvoc", "http://open.vocab.org/terms/");
    store.setPrefixForURI("goodrel", "http://purl.org/goodrelations/v1#");
    store.setPrefixForURI("vann", "http://purl.org/vocab/vann/");
    store.setPrefixForURI("voaf", "http://purl.org/vocommons/voaf#");
    store.setPrefixForURI("eclass", "http://www.ebusiness-unibw.org/ontologies/eclass/5.1.4/#");
    store.setPrefixForURI("georss", "http://www.georss.org/georss/");
    store.setPrefixForURI("skos", "http://www.w3.org/2004/02/skos/core#");
    store.setPrefixForURI("powders", "http://www.w3.org/2007/05/powder-s#");
    store.setPrefixForURI("oa", "http://www.w3.org/ns/oa#");
    store.setPrefixForURI("wdentity", "http://www.wikidata.org/entity/");
    store.setPrefixForURI("dbfrg", "http://fr.dbpedia.org/graph/");
    store.setPrefixForURI("localdav", "http://localhost:8890/DAV/");
    store.setPrefixForURI("dbspr", "http://dbpedia.org/schema/property_rules#");
    store.setPrefixForURI("pav", "http://purl.org/pav/");
    store.setPrefixForURI("dce", "http://purl.org/dc/elements/1.1/");
    store.setPrefixForURI("mod", "https://w3id.org/mod#");
    store.setPrefixForURI("dcmitype", "http://purl.org/dc/dcmitype/");
    store.setPrefixForURI("schema", "http://schema.org/");
    store.setPrefixForURI("accessRight", "http://publications.europa.eu/resource/authority/access-right/");
    return store;
}

export function fixCommonTurtleStringErrors(ttlString: string): string {
    const regexBnB = /([ \n])(b[0-9]+) /g;
    const regexNodeB = /([ \n])(node[0-9]+) /g;
    let result = ttlString;
    result = result.replaceAll("nodeID://", "_:"); // Dirty hack to fix nodeID:// from Virtuoso servers for turtle
    result = result.replaceAll("genid-", "_:"); // Dirty hack to fix blank nodes with genid- prefix
    result = result.replaceAll(regexBnB, "$1_:$2 "); // Dirty hack to fix blank nodes with b prefix
    result = result.replaceAll(regexNodeB, "$1_:$2 "); // Dirty hack to fix blank nodes with node prefix
    result = replaceUnicode(result);
    return result;
}

export function replaceUnicode(text: string): string {
    return text.replace(/\\u[\dA-F]{4}/gi,
    function (match) {
        let unicodeMatch = String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
        let urlEncodedMatch = encodeURIComponent(unicodeMatch);
        return urlEncodedMatch;
    });
}

export function serializeStoreToJSONLDPromise(store): Promise<string> {
    return new Promise((accept, reject) => {
        $rdf.serialize(null, store, undefined, 'application/ld+json', function (err, str) {
            if (err != null) {
                reject(err);
            }
            accept(str)
        }, { namespaces: store.namespaces });
    })
}

export function serializeStoreToTurtlePromise(store): Promise<string> {
    return new Promise((accept, reject) => {
        $rdf.serialize(null, store, undefined, 'text/turtle', function (err, str) {
            if (err != null) {
                reject(err);
            }
            accept(str)
        }, { namespaces: store.namespaces });
    })
}

export function serializeStoreToNTriplesPromise(store): Promise<string> {
    return new Promise((accept, reject) => {
        $rdf.serialize(null, store, undefined, 'application/n-triples', function (err, str) {
            if (err != null) {
                reject(err);
            }
            accept(str)
        }, { namespaces: store.namespaces });
    })
}

export function parseNTriplesToStore(content: string, store: $rdf.Store): Promise<$rdf.Formula> {
    return new Promise((accept, reject) => {
        try {
            content = unicodeToUrlendcode(content)
            $rdf.parse(content, store, EX("").value, "application/n-triples", (err, kb) => {
                if (err != null) {
                    reject(err);
                }
                accept(kb);
            })
        } catch (error) {
            reject(error);
        }
    });
}

export function parseN3ToStore(content: string, store: $rdf.Store): Promise<$rdf.Formula> {
    return new Promise((accept, reject) => {
        try {
            content = unicodeToUrlendcode(content)
            $rdf.parse(content, store, EX("").value, "text/n3", (err, kb) => {
                if (err != null) {
                    reject(err);
                }
                accept(kb);
            })
        } catch (error) {
            reject(error);
        }
    });
}

export function parseTurtleToStore(content: string, store: $rdf.Store, base = EX("").value): Promise<$rdf.Formula> {
    return new Promise((accept, reject) => {
        try {
            content = fixCommonTurtleStringErrors(content)
            ttl_read(content, {
                baseIRI: base,
                data(y_quad) {
                    graphyQuadLoadingToStore(store, y_quad, base, "")
                },

                eof(h_prefixes) {
                    accept(store);
                },
                error(error) {
                    console.error("Error while reading RDF Turtle content using graphy reading function, error", error);
                    reject(error)
                }
            });
        } catch (error) {
            console.error("Error while parsing turtle content", content, "error", error);
            reject(error);
        }
    });
}

export function parseJSONLDToStore(content: string, store: $rdf.Store): Promise<$rdf.Formula> {
    return new Promise((accept, reject) => {
        try {
            content = unicodeToUrlendcode(content)
            $rdf.parse(content, store, EX("").value, "application/ld+json", (err, kb) => {
                if (err != null) {
                    reject(err);
                }
                accept(kb);
            })
        } catch (error) {
            reject(error);
        }
    });
}

export function parseNQuadsToStore(content: string, store: $rdf.Store): Promise<$rdf.Formula> {
    return new Promise((accept, reject) => {
        try {
            content = unicodeToUrlendcode(content)
            $rdf.parse(content, store, EX("").value, "application/nquads", (err, kb) => {
                if (err != null) {
                    reject(err);
                }
                accept(kb);
            })
        } catch (error) {
            reject(error);
        }
    });
}

export function parseRDFXMLToStore(content: string, store: $rdf.Store): Promise<$rdf.Formula> {
    return new Promise((accept, reject) => {
        try {
            content = unicodeToUrlendcode(content)
            $rdf.parse(content, store, EX("").value, "application/rdf+xml", (err, kb) => {
                if (err != null) {
                    reject(err);
                }
                accept(kb);
            })
        } catch (error) {
            reject(error);
        }
    });
}

function graphyQuadLoadingToStore(store: $rdf.Store, y_quad: any, baseURI = EX("").value, filename = EX("").value) {
    function createValidBlankNode(node, baseURI) {
        if (node.termType === "BlankNode") {
            return $rdf.sym(baseURI + "#" + node.value);
        } else {
            throw new Error("Invalid node" + node + " expecting blank node");
        }
    }

    try {
        let s = undefined;
        if (y_quad.subject.termType === "NamedNode") {
            s = $rdf.sym(sanitizeUrl(y_quad.subject.value, baseURI, filename));
        } else if (y_quad.subject.termType === "Literal") {
            if (y_quad.subject.language != null && y_quad.subject.language != undefined && y_quad.subject.language != "") {
                s = $rdf.lit(y_quad.subject.value, y_quad.subject.language)
            } else if (y_quad.subject.datatype != null && y_quad.subject.datatype != undefined && y_quad.subject.datatype != "") {
                s = $rdf.lit(y_quad.subject.value, undefined, $rdf.sym(y_quad.subject.datatype))
            } else {
                s = $rdf.lit(y_quad.subject.value)
            }
        } else {
            s = createValidBlankNode(y_quad.subject, baseURI);
        };
        const p = $rdf.sym(y_quad.predicate.value);
        let o = undefined;
        if (y_quad.object.termType === "NamedNode") {
            o = $rdf.sym(sanitizeUrl(y_quad.object.value, baseURI, filename));
        } else if (y_quad.object.termType === "Literal") {
            if (y_quad.object.language != null && y_quad.object.language != undefined && y_quad.object.language != "") {
                o = $rdf.lit(y_quad.object.value, y_quad.object.language)
            } else if (y_quad.object.datatype != null && y_quad.object.datatype != undefined && y_quad.object.datatype != "") {
                o = $rdf.lit(y_quad.object.value, undefined, $rdf.sym(y_quad.object.datatype))
            } else {
                o = $rdf.lit(y_quad.object.value)
            }
        } else {
            o = createValidBlankNode(y_quad.object, baseURI);
        };

        if (!$rdf.isLiteral(s)) { // The application of RDF reasoning makes appear Literals as subjects, for some reason. We filter them out.
            if (y_quad.graph.value === '') {
                store.add(s, p, o);
            } else {
                const g = $rdf.sym(y_quad.graph);
                store.add(s, p, o, g);
            }
        }
    } catch (error) {
        console.error("Error while loading quad", y_quad, "error", error);
    }
}

export const NTriplesContentType = "application/n-triples" as const
export const NQuadsContentType = "application/nquads" as const
export const TurtleContentType = "text/turtle" as const
export const TrigContentType = "application/trig" as const

export type FileContentType = typeof TurtleContentType | typeof NTriplesContentType | typeof NQuadsContentType | typeof TrigContentType;

function getGraphyReadingFunction(contentType: FileContentType) {
    switch (contentType) {
        case NQuadsContentType:
            return nq_read;
        case NTriplesContentType:
            return nt_read;
        case TrigContentType:
            return trig_read;
        default:
        case TurtleContentType:
            return ttl_read;
    }
}


/**
    Converts an RDF collection represented by the given named node, blank node, or variable into an array of nodes.
    @param {$rdf.NamedNode | $rdf.BlankNode | $rdf.Variable} collection - The node representing the collection to convert.
    @param {$rdf.Store} store - The RDF store containing the collection.
    @returns {$rdf.Node[]} An array of nodes representing the collection.
    */
export function collectionToArray(collection: $rdf.NamedNode | $rdf.BlankNode | $rdf.Variable, store: $rdf.Formula): $rdf.Node[] {
    let result = [];

    store.statementsMatching(collection, RDF("first")).forEach(statement => {
        if (!statement.object.equals(RDF("nil"))) {
            result.push(statement.object);
        }
    });

    store.statementsMatching(collection, RDF("rest")).forEach(statement => {
        if (!statement.object.equals(RDF("nil"))) {
            if ($rdf.isNamedNode(statement.object)) {
                result = result.concat(collectionToArray(statement.object as $rdf.NamedNode, store));
            } else if ($rdf.isBlankNode(statement.object)) {
                result = result.concat(collectionToArray(statement.object as $rdf.BlankNode, store));
            }
        }
    });

    return [...new Set(result)];
}