
import { Statement } from 'rdflib';
import * as $rdf from 'rdflib';

import * as suggestions from "./suggestions.json";
import * as Validation from "./Validation.js";
import * as RDFUtils from "./RDFUtils.js";
import * as Query from "./QueryUtils.js";
import { SingleFieldCore, MultipleFieldCore } from './Model.js';
import { exampleDataset } from './RDFUtils.js';
import { controlInstance } from "./Control.js";

export var inputMetadata = [
    {
        recommended: true,
        categoryTitle: "Title",
        legend: "Short title for the knowledge base and its content.",
        idPrefix: "title",
        minArity: 1,
        maxArity: Infinity,
        computable: false,
        fields: [
            new MultipleFieldCore({
                placeholder: ["Short title for the knowledge base", "Language tag (optional)"],
                advice: "The short title must be non-empty",
                defaultValue: ["", "en"],
                bootstrapFieldColWidth: [8, 2],
                dataCreationFunction: argArray => {
                    var inputVal = argArray[0];
                    var inputTag = argArray[1];
                    if (inputTag.length > 0) {
                        return [new Statement(exampleDataset, RDFUtils.DCT('title'), $rdf.lit(inputVal, inputTag))];
                    } else {
                        return [new Statement(exampleDataset, RDFUtils.DCT('title'), $rdf.lit(inputVal))];
                    }
                },
                dataValidationFunction: valuesArray => {
                    var inputVal = valuesArray[0];
                    var inputTag = valuesArray[1];
                    var result = Validation.isLiteral(inputVal) && (Validation.isLiteral(inputTag) || inputTag.length == 0);
                    return result;
                }
            })
        ]
    },
    {
        recommended: true,
        categoryTitle: "Description",
        legend: "Long description of the knowledge base and its content.",
        idPrefix: "description",
        minArity: 1,
        maxArity: Infinity,
        computable: false,
        fields: [
            new MultipleFieldCore({
                placeholder: ["Long description of the knowledge base", "Language tag (optional)"],
                defaultValue: ["", "en"],
                advice: "The description must be non-empty",
                bootstrapFieldColWidth: [8, 2],
                dataCreationFunction: argArray => {
                    var inputVal = argArray[0];
                    var inputLang = argArray[1];
                    if (inputLang.length > 0) {
                        return [new Statement(exampleDataset, RDFUtils.DCT('description'), $rdf.lit(inputVal, inputLang))];
                    } else {
                        return [new Statement(exampleDataset, RDFUtils.DCT('description'), $rdf.lit(inputVal))];
                    }
                },
                dataValidationFunction: valuesArray => {
                    var inputVal = valuesArray[0];
                    var inputTag = valuesArray[1];
                    var result = Validation.isLiteral(inputVal) && (Validation.isLiteral(inputTag) || inputTag.length == 0);
                    return result;
                }
            })
        ]
    },
    {
        recommended: true,
        categoryTitle: "Endpoint URL",
        legend: "URL of the SPARQL endpoint.",
        idPrefix: "endpoint",
        minArity: 1,
        maxArity: Infinity,
        computable: false,
        fields: [
            new SingleFieldCore({
                placeholder: "Endpoint's URL",
                defaultValue: "",
                dataValidationFunction: (inputVal) => {
                    return Validation.isURI(inputVal);
                },
                dataCreationFunction: (inputVal) => {
                    return [
                        new Statement(exampleDataset, RDFUtils.VOID('sparqlEndpoint'), $rdf.sym(inputVal))
                    ];
                }
            })
        ]
    },
    {
        recommended: true,
        categoryTitle: "Creator",
        legend: "Represents the different actors involved in the creation of the dataset.",
        idPrefix: "creator",
        minArity: 1,
        maxArity: Infinity,
        computable: false,
        fields: [
            new SingleFieldCore({
                placeholder: "Creator's name or URI",
                defaultValue: "",
                advice: "The creator must be non-empty",
                dataValidationFunction: (inputVal) => {
                    return Validation.isLiteral(inputVal) || Validation.isURI(inputVal);
                },
                dataCreationFunction: (inputVal) => {
                    if (Validation.isURI(inputVal)) {
                        return [new Statement(exampleDataset, RDFUtils.DCT('creator'), $rdf.sym(inputVal))];
                    }
                    if (Validation.isLiteral(inputVal)) {
                        return [new Statement(exampleDataset, RDFUtils.DCT('creator'), $rdf.lit(inputVal))];
                    }
                    return null;
                }
            })
        ]
    },
    {
        recommended: true,
        categoryTitle: "Publication date",
        legend: "Publication date of the knowledge base. A standard <a href='https://en.wikipedia.org/wiki/ISO_8601'>ISO 8601</a> date is expected, e.g YYYY-MM, YYYY-MM-DD, YYYY-MM-DDThh:mm:ss, etc. ",
        idPrefix: "publication",
        minArity: 1,
        maxArity: 1,
        computable: false,
        fields: [
            new SingleFieldCore({
                placeholder: "Publication date of the knowledge base.",
                defaultValue: "",
                advice: "The date must be non-empty and in the correct format",
                dataCreationFunction: (inputVal) => {
                    return [new Statement(exampleDataset, RDFUtils.DCT('issued'), $rdf.lit(inputVal, RDFUtils.XSD("dateTime")))];
                },
                dataValidationFunction: (inputVal) => {
                    return Validation.isLiteral(inputVal) && Validation.isDatetime(inputVal);
                }
            })
        ]
    },
    {
        recommended: true,
        categoryTitle: "Keywords",
        legend: "Keywords describing the content of the knowledge base.",
        idPrefix: "keyword",
        minArity: 1,
        maxArity: Infinity,
        computable: false,
        fields: [
            new SingleFieldCore({
                placeholder: "Keyworks used to describe the knowledge base",
                defaultValue: "",
                advice: "The keyword must be non empty",
                dataCreationFunction: (inputVal) => {
                    if (Validation.isURI(inputVal)) {
                        return [new Statement(exampleDataset, RDFUtils.DCAT('theme'), $rdf.sym(inputVal))];
                    }
                    if (Validation.isLiteral(inputVal)) {
                        return [new Statement(exampleDataset, RDFUtils.DCAT('keyword'), $rdf.lit(inputVal))];
                    }
                    return null;
                },
                dataValidationFunction: (inputVal) => {
                    return Validation.isLiteral(inputVal) || Validation.isURI(inputVal);
                }
            })
        ]
    },
    {
        recommended: true,
        categoryTitle: "Version",
        legend: "Current version number of the knowledge base.",
        idPrefix: "version",
        minArity: 1,
        maxArity: 1,
        computable: false,
        fields: [
            new SingleFieldCore({
                placeholder: "Current version of the knowledge base",
                defaultValue: "1.0",
                advice: "The version must be non empty",
                dataCreationFunction: (inputVal) => {
                    return [new Statement(exampleDataset, RDFUtils.DCAT('version'), $rdf.lit(inputVal))];
                },
                dataValidationFunction: (inputVal) => {
                    return Validation.isLiteral(inputVal);
                }
            })
        ]
    },
    {
        recommended: true,
        categoryTitle: "License",
        legend: "License of the knowledge base. Use an URI to refer to a license, or a literal to describe the license.",
        idPrefix: "license",
        minArity: 1,
        maxArity: Infinity,
        computable: false,
        fields: [
            new SingleFieldCore({
                placeholder: "Reference to the license of the knowledge base",
                defaultValue: "",
                advice: "The license must be non empty",
                dataCreationFunction: (inputVal) => {
                    if (Validation.isURI(inputVal)) {
                        return [new Statement(exampleDataset, RDFUtils.DCT('license'), $rdf.sym(inputVal))];
                    }
                    if (Validation.isLiteral(inputVal)) {
                        return [new Statement(exampleDataset, RDFUtils.DCT('license'), $rdf.lit(inputVal))];
                    }
                    return null;
                },
                dataValidationFunction: (inputVal) => {
                    return Validation.isLiteral(inputVal) || Validation.isURI(inputVal);
                },
                dataSuggestionFunction: (inputVal) => {
                    return suggestions.license;
                }
            })
        ]
    },
    {
        recommended: true,
        categoryTitle: "Vocabularies",
        legend: "URIs of the vocabularies used in the knowledge base.",
        idPrefix: "vocabulary",
        minArity: 1,
        maxArity: Infinity,
        computable: true,
        fields: [
            new SingleFieldCore({
                placeholder: "Vocabularies used in the knowledge base",
                defaultValue: "",
                advice: "The vocabulary must be an URI",
                dataCreationFunction: (inputVal) => {
                    return [new Statement(exampleDataset, RDFUtils.VOID('vocabulary'), $rdf.sym(inputVal))];
                },
                dataValidationFunction: (inputVal) => {
                    return Validation.isURI(inputVal);
                },
                dataExtractionFunction: () => {
                    var endpointArray = controlInstance.listNodesStore(exampleDataset, RDFUtils.VOID("sparqlEndpoint"), null);
                    if (endpointArray.length == 0) {
                        throw new Error("No endpoint found.")
                    }
                    var promiseArray = [];
                    endpointArray.forEach(endpointNode => {
                        var endpointString = endpointNode.value;
                        endpointString = controlInstance.standardizeEndpointURL(endpointString);
                        promiseArray.push(Query.sparqlQueryPromise(endpointString, 'SELECT DISTINCT ?ns WHERE { { SELECT DISTINCT ?elem { ?s ?elem ?o . } } BIND(IRI(REPLACE( str(?elem), "(#|/)[^#/]*$", "$1")) AS ?ns) . }'));
                        promiseArray.push(Query.sparqlQueryPromise(endpointString, 'SELECT DISTINCT ?ns WHERE { { SELECT DISTINCT ?elem { ?s a ?elem . } } BIND(IRI(REPLACE( str(?elem), "(#|/)[^#/]*$", "$1")) AS ?ns) . }'));
                    });
                    return Promise.all(promiseArray)
                        .then(bindingsArray => {
                            var unifiedBindings = [];
                            bindingsArray.forEach(bindings => {
                                if (bindings != undefined) {
                                    unifiedBindings = unifiedBindings.concat(bindings.results.bindings);
                                }
                            });
                            unifiedBindings = [...(new Set(unifiedBindings))];
                            return unifiedBindings.map(binding =>
                                binding.ns.value
                            );
                        })
                }
            })
        ]
    },
    {
        recommended: true,
        categoryTitle: "Languages",
        legend: "Language tags used in the literals of the knowledge base. It is recommended to use the tags used in the language tagged literal, or to follow the <a href='https://www.rfc-editor.org/info/bcp47#section-2.2.9'>RDF1.1 standard</a>.",
        idPrefix: "language",
        minArity: 1,
        maxArity: Infinity,
        computable: true,
        fields: [
            new SingleFieldCore({
                placeholder: "Language tags used in the literals of the knowledge base.",
                defaultValue: "",
                advice: "The vocabulary must be non empty",
                dataCreationFunction: (inputVal) => {
                    return [new Statement(exampleDataset, RDFUtils.DCT('language'), $rdf.lit(inputVal))];
                },
                dataValidationFunction: (inputVal) => {
                    return Validation.isLiteral(inputVal);
                },
                dataExtractionFunction: () => {
                    var endpointArray = controlInstance.listNodesStore(exampleDataset, RDFUtils.VOID("sparqlEndpoint"), null);
                    if (endpointArray.length == 0) {
                        throw new Error("No endpoint found.")
                    }
                    var promiseArray = [];
                    endpointArray.forEach(endpointNode => {
                        var endpointString = endpointNode.value;
                        endpointString = controlInstance.standardizeEndpointURL(endpointString);
                        promiseArray.push(Query.sparqlQueryPromise(endpointString, 'SELECT DISTINCT (lang(?o) AS ?tag) WHERE { ?s ?p ?o . FILTER(isLiteral(?o)) FILTER( lang(?o) != "" ) }'));
                    });
                    return Promise.all(promiseArray)
                        .then(bindingsArray => {
                            var unifiedBindings = [];
                            bindingsArray.forEach(bindings => {
                                if (bindings != undefined) {
                                    unifiedBindings = unifiedBindings.concat(bindings.results.bindings);
                                }
                            });
                            unifiedBindings = [...(new Set(unifiedBindings))];
                            return unifiedBindings.map(binding =>
                                binding.tag.value
                            );
                        })
                        .catch(error => {
                            console.error(error);
                        })
                },
                dataSuggestionFunction: (inputVal) => {
                    return suggestions.lang;
                }
            })
        ]
    },
    // {
    //     recommended: false,
    //     categoryTitle: "Distributions",
    //     legend: "Means of distribution of the dataset, other than an endpoint",
    //     idPrefix: "distribution",
    //     minArity: 0,
    //     maxArity: Infinity,
    //     computable: false,
    //     fields: [
    //         new MultipleFieldCore({
    //             placeholder: ["Name", "URL", "Type"],
    //             defaultValue: ["", "", "text/turtle"],
    //             bootstrapFieldColWidth: [4, 5, 2],
    //             advice: "The name of the distribution must be a literal. The URL must be an URI. The type must be a literal, preferably from <a href='https://www.iana.org/assignments/media-types/'>here</a>. None of the fields can be empty.",
    //             dataCreationFunction: (inputVal) => {
    //                 var nameVal = inputVal[0];
    //                 var urlVal = inputVal[1];
    //                 var typeVal = inputVal[2];
    //                 var distribBN = $rdf.sym("https://e.g/#distribution" + uniqueIdCounter++);
    //                 return [ 
    //                     new Statement(exampleDataset, DCAT('distribution'), distribBN), 
    //                     new Statement(distribBN, RDF("type"), DCAT("Distribution")), 
    //                     new Statement(distribBN, DCAT('accessURL'), $rdf.sym(urlVal)), 
    //                     new Statement(distribBN, DCT("title"), $rdf.lit(nameVal)),
    //                     new Statement(distribBN, DCAT("mediaType"), $rdf.lit(typeVal))  
    //                 ];
    //             },
    //             dataValidationFunction: (inputVal) => {
    //                 var nameVal = inputVal[0];
    //                 var urlVal = inputVal[1];
    //                 var typeVal = inputVal[2];
    //                 return nameVal != undefined && urlVal != undefined && typeVal != undefined && isLiteral(nameVal) && isURI(urlVal) && isLiteral(typeVal);
    //             }
    //         })
    //     ]
    // },
    {
        recommended: false,
        categoryTitle: "Graph",
        legend: "Graphs present in the dataset",
        idPrefix: "graph",
        minArity: 0,
        maxArity: Infinity,
        computable: true,
        fields: [
            new SingleFieldCore({
                placeholder: "Uri of the graph",
                defaultValue: "",
                advice: "The name of the graph must be an URI",
                dataCreationFunction: (inputVal) => {
                    var graphBN = $rdf.blankNode();
                    return [
                        new Statement(exampleDataset, RDFUtils.SD('namedGraph'), graphBN),
                        new Statement(graphBN, RDFUtils.SD('name'), $rdf.sym(inputVal)),
                        new Statement(exampleDataset, RDFUtils.RDF("type"), RDFUtils.SD("Dataset")),
                        new Statement(graphBN, RDFUtils.RDF("type"), RDFUtils.SD("NamedGraph"))
                    ];
                },
                dataValidationFunction: (inputVal) => {
                    return Validation.isURI(inputVal);
                },
                dataExtractionFunction: () => {
                    var endpointArray = controlInstance.listNodesStore(exampleDataset, RDFUtils.VOID("sparqlEndpoint"), null);
                    if (endpointArray.length == 0) {
                        throw new Error("No endpoint found.")
                    }
                    var promiseArray = [];
                    endpointArray.forEach(endpointNode => {
                        var endpointString = endpointNode.value;
                        endpointString = controlInstance.standardizeEndpointURL(endpointString);
                        promiseArray.push(Query.sparqlQueryPromise(endpointString, 'SELECT DISTINCT ?graph WHERE { GRAPH ?graph { ?s ?p ?o . } }'));
                    });
                    return Promise.all(promiseArray)
                        .then(bindingsArray => {
                            var unifiedBindings = [];
                            bindingsArray.forEach(bindings => {
                                if (bindings != undefined) {
                                    unifiedBindings = unifiedBindings.concat(bindings.results.bindings);
                                }
                            });
                            unifiedBindings = [...(new Set(unifiedBindings))];
                            return unifiedBindings.map(binding =>
                                binding.graph.value
                            );
                        })
                        .catch(error => {
                            throw error;
                        })
                }
            })
        ]
    },
    {
        recommended: false,
        categoryTitle: "Triples",
        legend: "Number of triples present in the dataset",
        idPrefix: "triples",
        minArity: 0,
        maxArity: 1,
        computable: true,
        fields: [
            new SingleFieldCore({
                placeholder: "Number of triples",
                defaultValue: "",
                advice: "The number of triples must be a positive integer number.",
                dataCreationFunction: (inputVal) => {
                    var parsedIntValue = Number.parseInt(inputVal);
                    return [new Statement(exampleDataset, RDFUtils.VOID('triples'), $rdf.literal(parsedIntValue, RDFUtils.XSD("integer")))];
                },
                dataValidationFunction: (inputVal) => {
                    return Validation.isLiteral(inputVal) && Validation.isPositiveInteger(inputVal);
                },
                dataExtractionFunction: () => {
                    var endpointArray = controlInstance.listNodesStore(exampleDataset, RDFUtils.VOID("sparqlEndpoint"), null);
                    if (endpointArray.length == 0) {
                        throw new Error("No endpoint found.")
                    }
                    var promiseArray = [];
                    endpointArray.forEach(endpointNode => {
                        var endpointString = endpointNode.value;
                        endpointString = controlInstance.standardizeEndpointURL(endpointString);
                        promiseArray.push(Query.sparqlQueryPromise(endpointString, 'SELECT (count(*) AS ?count) { SELECT DISTINCT ?s ?p ?o WHERE { ?s ?p ?o . } }'));
                    });
                    return Promise.all(promiseArray)
                        .then(bindingsArray => {
                            var unifiedBindings = [];
                            bindingsArray.forEach(bindings => {
                                if (bindings != undefined) {
                                    unifiedBindings = unifiedBindings.concat(bindings.results.bindings);
                                }
                            });
                            unifiedBindings = [...(new Set(unifiedBindings))];
                            return unifiedBindings.map(binding =>
                                binding.count.value
                            );
                        })
                        .catch(error => {
                            console.error(error);
                        })
                }
            })
        ]
    },
    {
        recommended: false,
        categoryTitle: "Classes",
        legend: "Number of classes present in the dataset",
        idPrefix: "classes",
        minArity: 0,
        maxArity: 1,
        computable: true,
        fields: [
            new SingleFieldCore({
                placeholder: "Number of classes",
                defaultValue: "",
                advice: "The number of classes must be a positive integer number.",
                dataCreationFunction: (inputVal) => {
                    var parsedIntValue = Number.parseInt(inputVal);
                    return [new Statement(exampleDataset, RDFUtils.VOID('classes'), $rdf.literal(parsedIntValue, RDFUtils.XSD("integer")))];
                },
                dataValidationFunction: (inputVal) => {
                    return Validation.isLiteral(inputVal) && Validation.isPositiveInteger(inputVal);
                },
                dataExtractionFunction: () => {
                    var endpointArray = controlInstance.listNodesStore(exampleDataset, RDFUtils.VOID("sparqlEndpoint"), null);
                    if (endpointArray.length == 0) {
                        throw new Error("No endpoint found.")
                    }
                    var promiseArray = [];
                    endpointArray.forEach(endpointNode => {
                        var endpointString = endpointNode.value;
                        endpointString = controlInstance.standardizeEndpointURL(endpointString);
                        promiseArray.push(Query.sparqlQueryPromise(endpointString, 'SELECT (COUNT(DISTINCT ?c) AS ?count) WHERE { ?s a ?c . FILTER(isURI(?c)) }'));
                    });
                    return Promise.all(promiseArray)
                        .then(bindingsArray => {
                            var unifiedBindings = [];
                            bindingsArray.forEach(bindings => {
                                if (bindings != undefined) {
                                    unifiedBindings = unifiedBindings.concat(bindings.results.bindings);
                                }
                            });
                            unifiedBindings = [...(new Set(unifiedBindings))];
                            return unifiedBindings.map(binding =>
                                binding.count.value
                            );
                        })
                        .catch(error => {
                            console.error(error);
                        })
                }
            })
        ]
    },
    {
        recommended: false,
        categoryTitle: "Properties",
        legend: "Number of properties present in the dataset",
        idPrefix: "properties",
        minArity: 0,
        maxArity: 1,
        computable: true,
        fields: [
            new SingleFieldCore({
                placeholder: "Number of properties",
                defaultValue: "",
                advice: "The number of properties must be a positive integer number.",
                dataCreationFunction: (inputVal) => {
                    var parsedIntValue = Number.parseInt(inputVal);
                    return [new Statement(exampleDataset, RDFUtils.VOID('properties'), $rdf.literal(parsedIntValue, RDFUtils.XSD("integer")))];
                },
                dataValidationFunction: (inputVal) => {
                    return Validation.isLiteral(inputVal) && Validation.isPositiveInteger(inputVal);
                },
                dataExtractionFunction: () => {
                    var endpointArray = controlInstance.listNodesStore(exampleDataset, RDFUtils.VOID("sparqlEndpoint"), null);
                    if (endpointArray.length == 0) {
                        throw new Error("No endpoint found.")
                    }
                    var promiseArray = [];
                    endpointArray.forEach(endpointNode => {
                        var endpointString = endpointNode.value;
                        endpointString = controlInstance.standardizeEndpointURL(endpointString);
                        promiseArray.push(Query.sparqlQueryPromise(endpointString, 'SELECT (COUNT(DISTINCT ?p) AS ?count) WHERE { ?s ?p ?o . FILTER(isURI(?p)) }'));
                    });
                    return Promise.all(promiseArray)
                        .then(bindingsArray => {
                            var unifiedBindings = [];
                            bindingsArray.forEach(bindings => {
                                if (bindings != undefined) {
                                    unifiedBindings = unifiedBindings.concat(bindings.results.bindings);
                                }
                            });
                            unifiedBindings = [...(new Set(unifiedBindings))];
                            return unifiedBindings.map(binding =>
                                binding.count.value
                            );
                        })
                        .catch(error => {
                            console.error(error);
                        })
                }
            })
        ]
    }
];