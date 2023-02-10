import * as $rdf from 'rdflib';

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
    return store;
}

export function serializeStoreToTurtlePromise(store) {
    return new Promise((accept, reject) => {
        $rdf.serialize(null, store, undefined, 'text/turtle', function (err, str) {
            if (err != null) {
                reject(err);
            }
            accept(str)
        }, { namespaces: store.namespaces });
    })
}

export function serializeStoreToNTriplesPromise(store) {
    return new Promise((accept, reject) => {
        $rdf.serialize(null, store, undefined, 'application/n-triples', function (err, str) {
            if (err != null) {
                reject(err);
            }
            accept(str)
        }, { namespaces: store.namespaces });
    })
}