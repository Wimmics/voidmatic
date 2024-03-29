import * as $rdf from 'rdflib';

import * as suggestions from "./suggestions.json";
import * as Validation from "./Validation";
import * as RDFUtils from "./RDFUtils";
import * as Query from "./QueryUtils";
import { FieldCore, CategoryCore, FieldState, SPARQLJSONResult, JSONValue } from './Model';
import { exampleDataset, exampleDatasetService } from './RDFUtils';
import { controlInstance } from "./Control";
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(duration);
dayjs.extend(relativeTime)
dayjs.extend(customParseFormat)
dayjs.extend(utc)
dayjs.extend(timezone)

const vocabularySuggestions = suggestions.vocabulary.map(vocabularyObject => {
    let result = {
        value: vocabularyObject.nsp,
        label: ""
    }
    if (vocabularyObject.titles.length > 0) {
        let foundVocabularyTitle = vocabularyObject.titles.find(titleObject => titleObject.lang == "en");
        if (foundVocabularyTitle !== undefined) {
            result.label = foundVocabularyTitle.value;
        } else {
            result.label = vocabularyObject.titles[0].value;
        }
    }
    result.label += " [" + vocabularyObject.prefix + "]";
    return result;
});

const datePatterns = [
    'YYYY-MM-DD',
    "DD-MM-YYYY",
    'YYYY MM DD',
    "DD MM YYYY",
    'YYYY/MM/DD',
    "DD/MM/YYYY"];
const dateTimePatterns = [
    "YYYY-MM-DD'T'HH:mm:ss",
    "DD-MM-YYYY'T'HH:mm:ss",
    "YYYY-MM-DD HH:mm:ss",
    "DD-MM-YYYY HH:mm:ss",
    "YYYY-MM-DD'T'HH:mm:ssXXX",
    "DD-MM-YYYY'T'HH:mm:ssXXX",
    "YYYY-MM-DD HH:mm:ssXXX",
    "DD-MM-YYYY HH:mm:ssXXX",
    "YYYY-MM-DD'T'HH:mm:ss.SSS'Z'",
    "DD-MM-YYYY'T'HH:mm:ss.SSS'Z'",
    "YYYY-MM-DD HH:mm:ss.SSS'Z'",
    "DD-MM-YYYY HH:mm:ss.SSS'Z'",
    "YYYY-MM-DD'T'HH:mm:ss.SSSXXX",
    "DD-MM-YYYY'T'HH:mm:ss.SSSXXX",
    "YYYY-MM-DD HH:mm:ss.SSSXXX",
    "DD-MM-YYYY HH:mm:ss.SSSXXX"
];
const gYearMonthPatterns = [
    'YYYY-MM',
    "MM-YYYY",
    'YYYY MM',
    "MM YYYY",
    'YYYY/MM',
    "MM/YYYY"];

export const inputMetadata = [
    new CategoryCore({
        recommended: true,
        categoryTitle: "Title",
        legend: "Short title for the knowledge base and its content.",
        idPrefix: "title",
        minArity: 1,
        maxArity: Infinity,
        computable: false,
        fields: [
            new FieldCore({
                placeholder: ["Short title for the knowledge base", "Language tag (optional)"],
                defaultValue: ["", "en"],
                bootstrapFieldColWidth: [8, 2],
                dataCreationFunction: valuesArray => {
                    let inputVal = valuesArray[0];
                    let inputTag = valuesArray[1];
                    if (inputTag.length > 0) {
                        return [$rdf.st(exampleDataset, RDFUtils.DCT('title'), $rdf.lit(inputVal, inputTag))];
                    } else {
                        return [$rdf.st(exampleDataset, RDFUtils.DCT('title'), $rdf.lit(inputVal))];
                    }
                },
                dataValidationFunction: valuesArray => {
                    let inputVal = valuesArray[0];
                    let inputTag = valuesArray[1];
                    let testResult = Validation.isLiteral(inputVal) && (Validation.isLiteral(inputTag) || inputTag.length == 0);
                    if (testResult) {
                        return FieldState.valid();
                    } else {
                        return FieldState.invalid("The short title must be non-empty");
                    }
                },
                dataLoadFunction(store: $rdf.Store): string[][] {
                    let datasets = store.statementsMatching(null, RDFUtils.RDF('type'), RDFUtils.DCAT('Dataset')).map(statement => statement.subject);
                    let inputVals = [];
                    datasets.forEach(dataset => {
                        let datasetInputVals = store.statementsMatching(dataset, RDFUtils.DCT('title'), null).map(statement => statement.object).map(object => {
                            if ($rdf.isLiteral(object)) {
                                if (object.language !== undefined) {
                                    return [object.value, object.language];
                                } else {
                                    return [object.value, ""];
                                }
                            }
                            else {
                                return [object.value, ""]; // Should never happen
                            }
                        });
                        inputVals = inputVals.concat(datasetInputVals);
                    });
                    return inputVals;
                },
                fieldPattern: [[$rdf.st(null, RDFUtils.DCT('title'), null)]]
            })
        ]
    }),
    new CategoryCore({
        recommended: true,
        categoryTitle: "Description",
        legend: "Long description of the knowledge base and its content.",
        idPrefix: "description",
        minArity: 1,
        maxArity: Infinity,
        computable: false,
        fields: [
            new FieldCore({
                placeholder: ["Long description of the knowledge base", "Language tag (optional)"],
                defaultValue: ["", "en"],
                bootstrapFieldColWidth: [8, 2],
                dataCreationFunction(valuesArray: string[]): $rdf.Statement[] {
                    let inputVal = valuesArray[0];
                    let inputLang = valuesArray[1];
                    if (inputLang.length > 0) {
                        return [$rdf.st(exampleDataset, RDFUtils.DCT('description'), $rdf.lit(inputVal, inputLang))];
                    } else {
                        return [$rdf.st(exampleDataset, RDFUtils.DCT('description'), $rdf.lit(inputVal))];
                    }
                },
                dataValidationFunction(valuesArray: string[]): FieldState {
                    let inputVal = valuesArray[0];
                    let inputTag = valuesArray[1];
                    let result = Validation.isLiteral(inputVal) && (Validation.isLiteral(inputTag) || inputTag.length == 0);
                    if (result) {
                        return FieldState.valid();
                    } else {
                        return FieldState.invalid("The description must be non-empty");
                    }
                },
                dataLoadFunction(store: $rdf.Store): string[][] {
                    let datasets = store.statementsMatching(null, RDFUtils.RDF('type'), RDFUtils.DCAT('Dataset')).map(statement => statement.subject);
                    let inputVals = [];
                    datasets.forEach(dataset => {
                        let datasetInputVals = store.statementsMatching(dataset, RDFUtils.DCT('description'), null).map(statement => statement.object).map(object => {
                            if ($rdf.isLiteral(object)) {
                                if (object.language !== undefined) {
                                    return [object.value, object.language];
                                } else {
                                    return [object.value, ""];
                                }
                            }
                            else {
                                return [object.value, ""]; // Should never happen
                            }
                        });
                        inputVals = inputVals.concat(datasetInputVals);
                    });
                    return inputVals;
                },
                fieldPattern: [[$rdf.st(null, RDFUtils.DCT('description'), null)]]
            })
        ]
    }),
    new CategoryCore({
        recommended: false,
        categoryTitle: "Endpoint URL",
        legend: "URL of the SPARQL endpoint.",
        idPrefix: "endpoint",
        minArity: 1,
        maxArity: Infinity,
        computable: false,
        fields: [
            new FieldCore({
                placeholder: ["Endpoint's URL"],
                defaultValue: [""],
                dataValidationFunction(valuesArray: string[]): FieldState {
                    let inputVal = valuesArray[0];
                    let result = Validation.isURI(inputVal);
                    if (result) {
                        return FieldState.valid();
                    } else {
                        return FieldState.invalid("The URL must direct to a working SPARQL endpoint for the extraction functions to work.");
                    }
                },
                dataCreationFunction(valuesArray: string[]): $rdf.Statement[] {
                    let inputVal = valuesArray[0];
                    return [
                        $rdf.st(exampleDataset, RDFUtils.VOID('sparqlEndpoint'), $rdf.sym(inputVal)),
                        $rdf.st(exampleDatasetService, RDFUtils.RDF('type'), RDFUtils.DCAT("DataService")),
                        $rdf.st(exampleDatasetService, RDFUtils.DCAT('endpointURL'), $rdf.sym(inputVal)),
                        $rdf.st(exampleDatasetService, RDFUtils.DCAT('servesDataset'), exampleDataset),
                    ];
                },
                dataLoadFunction(store: $rdf.Store): string[][] {
                    let inputVals = store.statementsMatching(null, RDFUtils.VOID('sparqlEndpoint'), null).map(statement => [statement.object.value]);
                    inputVals = inputVals.concat(store.statementsMatching(null, RDFUtils.DCAT('endpointURL'), null).map(statement => [statement.object.value]));
                    return inputVals;
                },
                fieldPattern: [[$rdf.st(null, RDFUtils.DCAT('endpointURL'), null)]]
            })
        ]
    }),
    new CategoryCore({
        recommended: true,
        categoryTitle: "Actors",
        legend: "Represents the different actors involved in the life cycle of the dataset.",
        idPrefix: "actor",
        minArity: 0,
        maxArity: 0,
        computable: false,
        fields: [],
        subCategories: [
            new CategoryCore({
                recommended: true,
                categoryTitle: "Creator",
                legend: "Represents the different actors involved in the creation of the dataset.",
                idPrefix: "creator",
                minArity: 1,
                maxArity: Infinity,
                computable: false,
                fields: [
                    new FieldCore({
                        placeholder: ["Creator's name or URI"],
                        defaultValue: [""],
                        dataValidationFunction(valuesArray: string[]): FieldState {
                            let inputVal = valuesArray[0];
                            let result = Validation.isLiteral(inputVal) || Validation.isURI(inputVal);
                            if (result) {
                                return FieldState.valid();
                            } else {
                                return FieldState.invalid("The creator must be non-empty");
                            }
                        },
                        dataCreationFunction(valuesArray: string[]): $rdf.Statement[] {
                            let inputVal = valuesArray[0];
                            if (Validation.isURI(inputVal)) {
                                return [$rdf.st(exampleDataset, RDFUtils.DCT('creator'), $rdf.sym(inputVal))];
                            }
                            if (Validation.isLiteral(inputVal)) {
                                return [$rdf.st(exampleDataset, RDFUtils.DCT('creator'), $rdf.lit(inputVal))];
                            }
                            return null;
                        },
                        dataLoadFunction(store: $rdf.Store): string[][] {
                            let datasets = store.statementsMatching(null, RDFUtils.RDF('type'), RDFUtils.DCAT('Dataset')).map(statement => statement.subject);
                            let inputVals = [];
                            datasets.forEach(dataset => {
                                let datasetInputVals = store.statementsMatching(dataset, RDFUtils.DCT('creator'), null).map(statement => [statement.object.value]);
                                inputVals = inputVals.concat(datasetInputVals);
                            });
                            return inputVals;
                        },
                        fieldPattern: [[$rdf.st(null, RDFUtils.DCT('creator'), null)]]
                    })
                ],
            }),
            new CategoryCore({
                recommended: true,
                categoryTitle: "Contributor",
                legend: "Represents the different actors involved in the modification of the dataset.",
                idPrefix: "contributor",
                minArity: 1,
                maxArity: Infinity,
                computable: false,
                fields: [
                    new FieldCore({
                        placeholder: ["Contributor's name or URI"],
                        defaultValue: [""],
                        dataValidationFunction(valuesArray: string[]): FieldState {
                            let inputVal = valuesArray[0];
                            let result = Validation.isLiteral(inputVal) || Validation.isURI(inputVal);
                            if (result) {
                                return FieldState.valid();
                            } else {
                                return FieldState.invalid("The contributor must be non-empty");
                            }
                        },
                        dataCreationFunction(valuesArray: string[]): $rdf.Statement[] {
                            let inputVal = valuesArray[0];
                            if (Validation.isURI(inputVal)) {
                                return [$rdf.st(exampleDataset, RDFUtils.DCT('contributor'), $rdf.sym(inputVal))];
                            }
                            if (Validation.isLiteral(inputVal)) {
                                return [$rdf.st(exampleDataset, RDFUtils.DCT('contributor'), $rdf.lit(inputVal))];
                            }
                            return null;
                        },
                        dataLoadFunction(store: $rdf.Store): string[][] {
                            let datasets = store.statementsMatching(null, RDFUtils.RDF('type'), RDFUtils.DCAT('Dataset')).map(statement => statement.subject);
                            let inputVals = [];
                            datasets.forEach(dataset => {
                                let datasetInputVals = store.statementsMatching(dataset, RDFUtils.DCT('contributor'), null).map(statement => [statement.object.value]);
                                inputVals = inputVals.concat(datasetInputVals);
                            });
                            return inputVals;
                        },
                        fieldPattern: [[$rdf.st(null, RDFUtils.DCT('contributor'), null)]]
                    })
                ]
            })
        ]
    }),
    new CategoryCore({
        recommended: true,
        categoryTitle: "Dates",
        legend: "Dates relative to the life cycle of the knowledge base. ",
        idPrefix: "date",
        minArity: 0,
        maxArity: 0,
        computable: false,
        fields: [],
        subCategories: [
            new CategoryCore({
                recommended: true,
                categoryTitle: "Publication date",
                legend: "Publication date of the knowledge base. A standard <a href='https://en.wikipedia.org/wiki/ISO_8601'>ISO 8601</a> date is expected, e.g YYYY-MM, YYYY-MM-DD, YYYY-MM-DDThh:mm:ss, etc. ",
                idPrefix: "publication",
                minArity: 1,
                maxArity: 1,
                computable: false,
                fields: [
                    new FieldCore({
                        placeholder: ["Publication date of the knowledge base."],
                        defaultValue: [dayjs().format("YYYY-MM-DD")],
                        dataCreationFunction(valuesArray: string[]): $rdf.Statement[] {
                            let inputVal = valuesArray[0];
                            if (dayjs(inputVal, datePatterns, true).isValid()) { // This is a date
                                return [$rdf.st(exampleDataset, RDFUtils.DCT('issued'), $rdf.lit(inputVal, undefined, RDFUtils.XSD("date")))];
                            } else if (dayjs(inputVal, dateTimePatterns).isValid()) { // This is a date and time
                                return [$rdf.st(exampleDataset, RDFUtils.DCT('issued'), $rdf.lit(inputVal, undefined, RDFUtils.XSD("dateTime")))];
                            } else if (dayjs(inputVal, gYearMonthPatterns, true).isValid()) {
                                return [$rdf.st(exampleDataset, RDFUtils.DCT('issued'), $rdf.lit(inputVal, undefined, RDFUtils.XSD("gYearMonth")))];
                            } else if (dayjs(inputVal, 'YYYY', true).isValid()) {
                                return [$rdf.st(exampleDataset, RDFUtils.DCT('issued'), $rdf.lit(inputVal, undefined, RDFUtils.XSD("gYear")))];
                            } else {
                                return [$rdf.st(exampleDataset, RDFUtils.DCT('issued'), $rdf.lit(inputVal))];
                            }
                        },
                        dataValidationFunction(valuesArray: string[]): FieldState {
                            let inputVal = valuesArray[0];
                            const result = Validation.isLiteral(inputVal) && Validation.isDatetime(inputVal);
                            if (result) {
                                return FieldState.valid();
                            } else {
                                return FieldState.invalid("The date must be non-empty and in the correct format");
                            }
                        },
                        dataLoadFunction(store: $rdf.Store): string[][] {
                            let datasets = store.statementsMatching(null, RDFUtils.RDF('type'), RDFUtils.DCAT('Dataset')).map(statement => statement.subject);
                            let inputVals = [];
                            datasets.forEach(dataset => {
                                let datasetInputVals = store.statementsMatching(dataset, RDFUtils.DCT('issued'), null).map(statement => [statement.object.value]);
                                inputVals = inputVals.concat(datasetInputVals);
                            });
                            return inputVals;
                        },
                        fieldPattern: [[$rdf.st(null, RDFUtils.DCT('issued'), null)]]
                    })
                ]
            }),
            new CategoryCore({
                recommended: false,
                categoryTitle: "Modification date",
                legend: "Date of the last modification of the knowledge base. A standard <a href='https://en.wikipedia.org/wiki/ISO_8601'>ISO 8601</a> date is expected, e.g YYYY-MM, YYYY-MM-DD, YYYY-MM-DDThh:mm:ss, etc. ",
                idPrefix: "modification",
                minArity: 1,
                maxArity: 1,
                computable: false,
                fields: [
                    new FieldCore({
                        placeholder: ["Last modification date of the knowledge base."],
                        defaultValue: [dayjs().format("YYYY-MM-DD")],
                        dataCreationFunction(valuesArray: string[]): $rdf.Statement[] {
                            let inputVal = valuesArray[0];
                            if (dayjs(inputVal, datePatterns, true).isValid()) { // This is a date
                                return [$rdf.st(exampleDataset, RDFUtils.DCT('modified'), $rdf.lit(inputVal, undefined, RDFUtils.XSD("date")))];
                            } else if (dayjs(inputVal, dateTimePatterns).isValid()) {  // This is a date and time
                                return [$rdf.st(exampleDataset, RDFUtils.DCT('modified'), $rdf.lit(inputVal, undefined, RDFUtils.XSD("dateTime")))];
                            } else if (dayjs(inputVal, gYearMonthPatterns, true).isValid()) {
                                return [$rdf.st(exampleDataset, RDFUtils.DCT('modified'), $rdf.lit(inputVal, undefined, RDFUtils.XSD("gYearMonth")))];
                            } else if (dayjs(inputVal, 'YYYY', true).isValid()) {
                                return [$rdf.st(exampleDataset, RDFUtils.DCT('modified'), $rdf.lit(inputVal, undefined, RDFUtils.XSD("gYear")))];
                            } else {
                                return [$rdf.st(exampleDataset, RDFUtils.DCT('modified'), $rdf.lit(inputVal))];
                            }
                        },
                        dataValidationFunction(valuesArray: string[]): FieldState {
                            let inputVal = valuesArray[0];
                            const result = Validation.isLiteral(inputVal) && Validation.isDatetime(inputVal);
                            if (result) {
                                return FieldState.valid();
                            } else {
                                return FieldState.invalid("The date must be non-empty and in the correct format");
                            }
                        },
                        dataLoadFunction(store: $rdf.Store): string[][] {
                            let datasets = store.statementsMatching(null, RDFUtils.RDF('type'), RDFUtils.DCAT('Dataset')).map(statement => statement.subject);
                            let inputVals = [];
                            datasets.forEach(dataset => {
                                let datasetInputVals = store.statementsMatching(dataset, RDFUtils.DCT('modified'), null).map(statement => [statement.object.value]);
                                inputVals = inputVals.concat(datasetInputVals);
                            });
                            return inputVals;
                        },
                        fieldPattern: [[$rdf.st(null, RDFUtils.DCT('modified'), null)]]
                    })
                ]
            }),
            new CategoryCore({
                recommended: false,
                categoryTitle: "Creation date",
                legend: "Date of the creation knowledge base. A standard <a href='https://en.wikipedia.org/wiki/ISO_8601'>ISO 8601</a> date is expected, e.g YYYY-MM, YYYY-MM-DD, YYYY-MM-DDThh:mm:ss, etc. ",
                idPrefix: "creation",
                minArity: 1,
                maxArity: 1,
                computable: false,
                fields: [
                    new FieldCore({
                        placeholder: ["creation date of the knowledge base."],
                        defaultValue: [dayjs().format("YYYY-MM-DD")],
                        dataCreationFunction(valuesArray: string[]): $rdf.Statement[] {
                            let inputVal = valuesArray[0];
                            if (dayjs(inputVal, datePatterns, true).isValid()) { // This is a date
                                return [$rdf.st(exampleDataset, RDFUtils.DCT('created'), $rdf.lit(inputVal, undefined, RDFUtils.XSD("date")))];
                            } else if (dayjs(inputVal, dateTimePatterns).isValid()) { // This is a date and time
                                return [$rdf.st(exampleDataset, RDFUtils.DCT('created'), $rdf.lit(inputVal, undefined, RDFUtils.XSD("dateTime")))];
                            } else if (dayjs(inputVal, gYearMonthPatterns, true).isValid()) {
                                return [$rdf.st(exampleDataset, RDFUtils.DCT('created'), $rdf.lit(inputVal, undefined, RDFUtils.XSD("gYearMonth")))];
                            } else if (dayjs(inputVal, 'YYYY', true).isValid()) {
                                return [$rdf.st(exampleDataset, RDFUtils.DCT('created'), $rdf.lit(inputVal, undefined, RDFUtils.XSD("gYear")))];
                            } else {
                                return [$rdf.st(exampleDataset, RDFUtils.DCT('created'), $rdf.lit(inputVal))];
                            }
                        },
                        dataValidationFunction(valuesArray: string[]): FieldState {
                            let inputVal = valuesArray[0];
                            const result = Validation.isLiteral(inputVal) && Validation.isDatetime(inputVal);
                            if (result) {
                                return FieldState.valid();
                            } else {
                                return FieldState.invalid("The date must be non-empty and in the correct format");
                            }
                        },
                        dataLoadFunction(store: $rdf.Store): string[][] {
                            let datasets = store.statementsMatching(null, RDFUtils.RDF('type'), RDFUtils.DCAT('Dataset')).map(statement => statement.subject);
                            let inputVals = [];
                            datasets.forEach(dataset => {
                                let datasetInputVals = store.statementsMatching(dataset, RDFUtils.DCT('created'), null).map(statement => [statement.object.value]);
                                inputVals = inputVals.concat(datasetInputVals);
                            });
                            return inputVals;
                        },
                        fieldPattern: [[$rdf.st(null, RDFUtils.DCT('created'), null)]]
                    })
                ]
            })
        ]
    }),
    new CategoryCore({
        recommended: false,
        categoryTitle: "Keywords",
        legend: "Keywords describing the content of the knowledge base.",
        idPrefix: "keyword",
        minArity: 0,
        maxArity: Infinity,
        computable: false,
        fields: [
            new FieldCore({
                placeholder: ["Keywords used to describe the knowledge base"],
                defaultValue: ["keyword"],
                dataCreationFunction(valuesArray: string[]): $rdf.Statement[] {
                    let inputVal = valuesArray[0];
                    if (Validation.isURI(inputVal)) {
                        return [$rdf.st(exampleDataset, RDFUtils.DCAT('theme'), $rdf.sym(inputVal))];
                    }
                    if (Validation.isLiteral(inputVal)) {
                        return [$rdf.st(exampleDataset, RDFUtils.DCAT('keyword'), $rdf.lit(inputVal))];
                    }
                    return null;
                },
                dataValidationFunction(valuesArray: string[]): FieldState {
                    let inputVal = valuesArray[0];
                    const result = Validation.isLiteral(inputVal) || Validation.isURI(inputVal);
                    if (result) {
                        return FieldState.valid();
                    } else {
                        return FieldState.invalid("The keyword must be non empty");
                    }
                },
                dataLoadFunction(store: $rdf.Store): string[][] {
                    let datasets = store.statementsMatching(null, RDFUtils.RDF('type'), RDFUtils.DCAT('Dataset')).map(statement => statement.subject);
                    let inputVals = [];
                    datasets.forEach(dataset => {
                        let datasetInputVals = store.statementsMatching(dataset, RDFUtils.DCAT('keyword'), null).concat(store.statementsMatching(dataset, RDFUtils.DCAT('theme'), null)).map(statement => [statement.object.value]);
                        inputVals = inputVals.concat(datasetInputVals);
                    });
                    return inputVals;
                },
                fieldPattern: [[$rdf.st(null, RDFUtils.DCAT('theme'), null)], [$rdf.st(null, RDFUtils.DCAT('keyword'), null)]]
            })
        ]
    }),
    new CategoryCore({
        recommended: true,
        categoryTitle: "Version",
        legend: "Current version number of the knowledge base.",
        idPrefix: "version",
        minArity: 1,
        maxArity: 1,
        computable: false,
        fields: [
            new FieldCore({
                placeholder: ["Current version of the knowledge base"],
                defaultValue: ["1.0"],
                dataCreationFunction(valuesArray: string[]): $rdf.Statement[] {
                    let inputVal = valuesArray[0];
                    return [$rdf.st(exampleDataset, RDFUtils.DCAT('version'), $rdf.lit(inputVal))];
                },
                dataValidationFunction(valuesArray: string[]): FieldState {
                    let inputVal = valuesArray[0];
                    const result = Validation.isLiteral(inputVal);
                    if (result) {
                        return FieldState.valid();
                    } else {
                        return FieldState.invalid("The version must be non empty");
                    }
                },
                dataLoadFunction(store: $rdf.Store): string[][] {
                    let datasets = store.statementsMatching(null, RDFUtils.RDF('type'), RDFUtils.DCAT('Dataset')).map(statement => statement.subject);
                    let inputVals = [];
                    datasets.forEach(dataset => {
                        let datasetInputVals = store.statementsMatching(dataset, RDFUtils.DCAT('version'), null).map(statement => [statement.object.value]);
                        inputVals = inputVals.concat(datasetInputVals);
                    });
                    return inputVals;
                },
                fieldPattern: [[$rdf.st(null, RDFUtils.DCAT('version'), null)]]
            })
        ]
    }),
    new CategoryCore({
        recommended: true,
        categoryTitle: "License",
        legend: "License of the knowledge base. Use an URI to refer to a license, or a literal to describe the license.",
        idPrefix: "license",
        minArity: 1,
        maxArity: Infinity,
        computable: false,
        fields: [
            new FieldCore({
                placeholder: ["Reference to the license of the knowledge base"],
                defaultValue: [""],
                dataCreationFunction(valuesArray: string[]): $rdf.Statement[] {
                    let inputVal = valuesArray[0];
                    if (Validation.isURI(inputVal)) {
                        return [
                            $rdf.st(exampleDataset, RDFUtils.DCT('license'), $rdf.sym(inputVal)),
                            $rdf.st($rdf.sym(inputVal), RDFUtils.RDF('type'), RDFUtils.DCT('LicenseDocument')),
                        ];
                    }
                    if (Validation.isLiteral(inputVal)) {
                        return [$rdf.st(exampleDataset, RDFUtils.DCT('license'), $rdf.lit(inputVal))];
                    }
                    return null;
                },
                dataValidationFunction(valuesArray: string[]): FieldState {
                    let inputVal = valuesArray[0];
                    const result = Validation.isLiteral(inputVal) || Validation.isURI(inputVal);
                    if (result) {
                        return FieldState.valid();
                    } else {
                        return FieldState.invalid("The license must be non empty");
                    }
                },
                dataSuggestionFunction: (inputVal) => {
                    return [suggestions.license];
                },
                dataLoadFunction(store: $rdf.Store): string[][] {
                    let datasets = store.statementsMatching(null, RDFUtils.RDF('type'), RDFUtils.DCAT('Dataset')).map(statement => statement.subject);
                    let inputVals = [];
                    datasets.forEach(dataset => {
                        let datasetInputVals = store.statementsMatching(dataset, RDFUtils.DCT('license'), null).map(statement => [statement.object.value]);
                        inputVals = inputVals.concat(datasetInputVals);
                    });
                    return inputVals;
                },
                fieldPattern: [[$rdf.st(null, RDFUtils.DCAT('license'), $rdf.variable("license")), $rdf.st($rdf.variable("license"), RDFUtils.RDF('type'), RDFUtils.DCT('LicenseDocument'))]]
            })
        ]
    }),
    new CategoryCore({
        recommended: false,
        categoryTitle: "Rights",
        legend: "Metadata related to the rights of the dataset",
        idPrefix: "rights",
        minArity: 0,
        maxArity: 0,
        computable: false,
        fields: [],
        subCategories: [
            new CategoryCore({
                recommended: false,
                categoryTitle: "Rights holder",
                legend: "A person or organization owning or managing rights over the dataset",
                idPrefix: "properties",
                minArity: 1,
                maxArity: Infinity,
                computable: true,
                fields: [
                    new FieldCore({
                        placeholder: ["Person or organization"],
                        defaultValue: [""],
                        dataCreationFunction(valuesArray: string[]): $rdf.Statement[] {
                            let inputVal = valuesArray[0];
                            if (Validation.isURI(inputVal)) {
                                return [$rdf.st(exampleDataset, RDFUtils.DCT('rightsHolder'), $rdf.sym(inputVal))];
                            } else {
                                return [$rdf.st(exampleDataset, RDFUtils.DCT('rightsHolder'), $rdf.literal(inputVal))];
                            }
                        },
                        dataValidationFunction(valuesArray: string[]): FieldState {
                            let inputVal = valuesArray[0];
                            const result = Validation.isURI(inputVal) || Validation.isLiteral(inputVal);
                            if (result) {
                                return FieldState.valid();
                            } else {
                                return FieldState.invalid("The rights holder must be represented as an URI or a literal.");
                            }
                        },
                        dataSuggestionFunction: () => {
                            let creatorArray = controlInstance.listNodesStore(exampleDataset, RDFUtils.DCT("creator"), null);
                            let contributorArray = controlInstance.listNodesStore(exampleDataset, RDFUtils.DCT("contributor"), null);
                            let result = [
                                creatorArray.map(rightsHolderNode => {
                                    return {
                                        value: rightsHolderNode.value,
                                        label: ""
                                    }
                                }).concat(contributorArray.map(rightsHolderNode => {
                                    return {
                                        value: rightsHolderNode.value,
                                        label: ""
                                    }
                                }))
                            ];
                            return result;
                        },
                        dataLoadFunction(store: $rdf.Store): string[][] {
                            let datasets = store.statementsMatching(null, RDFUtils.RDF('type'), RDFUtils.DCAT('Dataset')).map(statement => statement.subject);
                            let inputVals = [];
                            datasets.forEach(dataset => {
                                let datasetInputVals = store.statementsMatching(dataset, RDFUtils.DCT('rightsHolder'), null).map(statement => [statement.object.value]);
                                inputVals = inputVals.concat(datasetInputVals);
                            });
                            return inputVals;
                        },
                        fieldPattern: [[$rdf.st(null, RDFUtils.DCT('rightsHolder'), null)]]
                    })
                ]
            }),
            new CategoryCore({
                recommended: false,
                categoryTitle: "Access rights",
                legend: "Access rights of the dataset",
                idPrefix: "access_rights",
                minArity: 1,
                maxArity: 1,
                computable: false,
                fields: [
                    new FieldCore({
                        placeholder: ["Access rights"],
                        defaultValue: [""],
                        dataCreationFunction(valuesArray: string[]): $rdf.Statement[] {
                            let inputVal = valuesArray[0];
                            if (Validation.isURI(inputVal)) {
                                return [$rdf.st(exampleDataset, RDFUtils.DCT('accessRights'), $rdf.sym(inputVal))];
                            } else {
                                return [$rdf.st(exampleDataset, RDFUtils.DCT('accessRights'), $rdf.literal(inputVal))];
                            }
                        },
                        dataValidationFunction(valuesArray: string[]): FieldState {
                            let inputVal = valuesArray[0];
                            const result = Validation.isURI(inputVal) || Validation.isLiteral(inputVal);
                            if (result) {
                                return FieldState.valid();
                            } else {
                                return FieldState.invalid("The access rights must be represented as an URI or a literal.");
                            }
                        },
                        dataSuggestionFunction: (inputVal) => {
                            return [
                                [
                                    {
                                        value: "http://publications.europa.eu/resource/authority/access-right/PUBLIC",
                                        label: "Public"
                                    },
                                    {
                                        value: "http://publications.europa.eu/resource/authority/access-right/RESTRICTED",
                                        label: "Restricted"
                                    },
                                    {
                                        value: "http://publications.europa.eu/resource/authority/access-right/NON_PUBLIC",
                                        label: "Non-public"
                                    }
                                ]
                            ]
                        },
                        dataLoadFunction(store: $rdf.Store): string[][] {
                            let datasets = store.statementsMatching(null, RDFUtils.RDF('type'), RDFUtils.DCAT('Dataset')).map(statement => statement.subject);
                            let inputVals = [];
                            datasets.forEach(dataset => {
                                let datasetInputVals = store.statementsMatching(dataset, RDFUtils.DCT('accessRights'), null).map(statement => [statement.object.value]);
                                inputVals = inputVals.concat(datasetInputVals);
                            });
                            return inputVals;
                        },
                        fieldPattern: [[$rdf.st(null, RDFUtils.DCT('accessRights'), null)]]
                    })
                ]
            }),
        ]
    }),
    new CategoryCore({
        recommended: false,
        categoryTitle: "URIs",
        legend: "Charateristics of the URIs from the dataset",
        idPrefix: "uris",
        minArity: 0,
        maxArity: 0,
        computable: false,
        fields: [
        ],
        subCategories: [
            new CategoryCore({
                recommended: true,
                categoryTitle: "Namespace",
                legend: "Namespace of the URIs created for this dataset.",
                idPrefix: "title",
                minArity: 1,
                maxArity: 1,
                computable: false,
                fields: [
                    new FieldCore({
                        placeholder: ["Namespace of the URIS", "Preferred prefix for this namespace (optional)"],
                        defaultValue: ["", ""],
                        bootstrapFieldColWidth: [7, 3],
                        dataCreationFunction: valuesArray => {
                            let inputNs = valuesArray[0];
                            let inputPrefix = valuesArray[1];
                            if (inputPrefix !== undefined && inputPrefix.length > 0) {
                                return [
                                    $rdf.st(exampleDataset, RDFUtils.VOID('uriSpace'), $rdf.sym(inputNs)),
                                    $rdf.st($rdf.sym(inputNs), RDFUtils.VANN('preferredNamespaceUri'), $rdf.sym(inputNs)),
                                    $rdf.st($rdf.sym(inputNs), RDFUtils.VANN('preferredNamespacePrefix'), $rdf.sym(inputNs))
                                ];
                            } else {
                                return [
                                    $rdf.st(exampleDataset, RDFUtils.VOID('uriSpace'), $rdf.sym(inputNs)),
                                    $rdf.st($rdf.sym(inputNs), RDFUtils.VANN('preferredNamespaceUri'), $rdf.sym(inputNs))
                                ];
                            }
                        },
                        dataValidationFunction: valuesArray => {
                            let inputNs = valuesArray[0];
                            let inputPrefix = valuesArray[1];
                            let testResult = Validation.isURI(inputNs) && (inputPrefix === undefined || (inputPrefix !== undefined && (Validation.isLiteral(inputPrefix) || inputPrefix.length == 0)));
                            if (testResult) {
                                return FieldState.valid();
                            } else {
                                return FieldState.invalid("The namespace must be a valid URI and the prefix must be a literal. Given: " + inputNs + " and " + inputPrefix);
                            }
                        },
                        dataLoadFunction(store: $rdf.Store): string[][] {
                            let datasets = store.statementsMatching(null, RDFUtils.RDF('type'), RDFUtils.DCAT('Dataset')).map(statement => statement.subject);
                            let inputVals = [];
                            datasets.forEach(dataset => {
                                let inputNs = store.statementsMatching(dataset, RDFUtils.VOID('uriSpace'), null).map(statement => statement.object.value);
                                inputVals = inputVals.concat(inputNs.map(ns => {
                                    let prefixes = store.statementsMatching($rdf.sym(ns), RDFUtils.VANN('preferredNamespacePrefix'), null).map(statement => statement.object.value);
                                    if (prefixes.length == 0) {
                                        return [ns, ""];
                                    } else {
                                        return [ns, prefixes[0]];
                                    }
                                }))
                            })
                            return inputVals;
                        },
                        fieldPattern: [
                            [
                                $rdf.st(null, RDFUtils.VOID('uriSpace'), $rdf.variable("ns")),
                                $rdf.st($rdf.variable("ns"), RDFUtils.VANN('preferredNamespaceUri'), null),
                                $rdf.st($rdf.variable("ns"), RDFUtils.VANN('preferredNamespacePrefix'), null)
                            ], [
                                $rdf.st(exampleDataset, RDFUtils.VOID('uriSpace'), $rdf.variable("ns")),
                                $rdf.st($rdf.variable("ns"), RDFUtils.VANN('preferredNamespaceUri'), null)
                            ]
                        ]
                    })
                ]
            }),
        ]
    }),
    new CategoryCore({
        recommended: true,
        categoryTitle: "Vocabularies",
        legend: "URIs of the vocabularies used in the knowledge base.",
        idPrefix: "vocabulary",
        minArity: 0,
        maxArity: Infinity,
        computable: true,
        fields: [
            new FieldCore({
                placeholder: ["Vocabularies used in the knowledge base"],
                defaultValue: [""],
                dataCreationFunction(valuesArray: string[]): $rdf.Statement[] {
                    let inputVal = valuesArray[0];
                    return [$rdf.st(exampleDataset, RDFUtils.VOID('vocabulary'), $rdf.sym(inputVal))];
                },
                dataValidationFunction(valuesArray: string[]): FieldState {
                    let inputVal = valuesArray[0];
                    const result = Validation.isURI(inputVal);
                    if (result) {
                        return FieldState.valid();
                    } else {
                        return FieldState.invalid("The vocabulary must be an URI");
                    }
                },
                dataExtractionFunction: () => {
                    let endpointArray = controlInstance.listNodesStore(exampleDataset, RDFUtils.VOID("sparqlEndpoint"), null);
                    if (endpointArray.length == 0) {
                        throw new Error("No endpoint found.")
                    }
                    let promiseArray = [];
                    endpointArray.forEach(endpointNode => {
                        let endpointString = endpointNode.value;
                        endpointString = controlInstance.standardizeEndpointURL(endpointString);
                        promiseArray.push(Query.paginatedSparqlQueryPromise(endpointString, 'SELECT DISTINCT ?ns WHERE { { SELECT DISTINCT ?elem { ?s ?elem ?o . } } BIND(IRI(REPLACE( str(?elem), "(#|/)[^#/]*$", "$1")) AS ?ns) . }'));
                        promiseArray.push(Query.paginatedSparqlQueryPromise(endpointString, 'SELECT DISTINCT ?ns WHERE { { SELECT DISTINCT ?elem { ?s a ?elem . } } BIND(IRI(REPLACE( str(?elem), "(#|/)[^#/]*$", "$1")) AS ?ns) . }'));
                    });
                    return Promise.allSettled(promiseArray)
                        .then(rawBindingsArray => {
                            let bindingsArray: JSONValue[][] = Query.extractSettledPromiseValues(rawBindingsArray);
                            let unifiedBindings = [];
                            bindingsArray.forEach(bindings => {
                                if (bindings != undefined) {
                                    unifiedBindings = unifiedBindings.concat(bindings);
                                }
                            });
                            unifiedBindings = [...(new Set(unifiedBindings))];
                            return unifiedBindings.map(binding =>
                                binding.ns.value
                            );
                        })
                },
                dataSuggestionFunction: () => {
                    return [vocabularySuggestions];
                },
                dataLoadFunction(store: $rdf.Store): string[][] {
                    let datasets = store.statementsMatching(null, RDFUtils.RDF('type'), RDFUtils.DCAT('Dataset')).map(statement => statement.subject);
                    let inputVals = [];
                    datasets.forEach(dataset => {
                        let datasetInputVals = store.statementsMatching(dataset, RDFUtils.VOID('vocabulary'), null).map(statement => [statement.object.value]);
                        inputVals = inputVals.concat(datasetInputVals);
                    });
                    return inputVals;
                },
                fieldPattern: [[$rdf.st(null, RDFUtils.VOID('vocabulary'), null)]]
            })
        ]
    }),
    new CategoryCore({
        recommended: true,
        categoryTitle: "Languages",
        legend: "Language tags used in the literals of the knowledge base. It is recommended to use the tags used in the language tagged literal, or to follow the <a href='https://www.rfc-editor.org/info/bcp47#section-2.2.9'>RDF1.1 standard</a>.",
        idPrefix: "language",
        minArity: 0,
        maxArity: Infinity,
        computable: true,
        fields: [
            new FieldCore({
                placeholder: ["Language tags used in the literals of the knowledge base."],
                defaultValue: [""],
                dataCreationFunction(valuesArray: string[]): $rdf.Statement[] {
                    let inputVal = valuesArray[0];
                    return [$rdf.st(exampleDataset, RDFUtils.DCT('language'), $rdf.lit(inputVal))];
                },
                dataValidationFunction(valuesArray: string[]): FieldState {
                    let inputVal = valuesArray[0];
                    const result = Validation.isLiteral(inputVal);
                    if (result) {
                        return FieldState.valid();
                    } else {
                        return FieldState.invalid("The language must be non empty");
                    }
                },
                dataExtractionFunction: () => {
                    let endpointArray = controlInstance.listNodesStore(exampleDataset, RDFUtils.VOID("sparqlEndpoint"), null);
                    if (endpointArray.length == 0) {
                        throw new Error("No endpoint found.")
                    }
                    let promiseArray = [];
                    endpointArray.forEach(endpointNode => {
                        let endpointString = endpointNode.value;
                        endpointString = controlInstance.standardizeEndpointURL(endpointString);
                        promiseArray.push(Query.paginatedSparqlQueryPromise(endpointString, 'SELECT DISTINCT (LANG(?o) AS ?tag) WHERE { { SELECT DISTINCT ?o { ?s ?p ?o. FILTER(ISLITERAL(?o)) FILTER((LANG(?o)) != "") } } } LIMIT 50'));
                    });
                    return Promise.allSettled(promiseArray)
                        .then(rawBindingsArray => {
                            let bindingsArray: JSONValue[][] = Query.extractSettledPromiseValues(rawBindingsArray);
                            let unifiedBindings = [];
                            bindingsArray.forEach(bindings => {
                                if (bindings != undefined) {
                                    unifiedBindings = unifiedBindings.concat(bindings);
                                }
                            });
                            unifiedBindings = [...(new Set(unifiedBindings))];
                            return unifiedBindings.map(binding =>
                                binding.tag.value
                            );
                        })
                        .catch(error => {
                            console.error(error);
                            return [];
                        })
                },
                dataSuggestionFunction: (inputVal) => {
                    return [suggestions.lang];
                },
                dataLoadFunction(store: $rdf.Store): string[][] {
                    let datasets = store.statementsMatching(null, RDFUtils.RDF('type'), RDFUtils.DCAT('Dataset')).map(statement => statement.subject);
                    let inputVals = [];
                    datasets.forEach(dataset => {
                        let datasetInputVals = store.statementsMatching(dataset, RDFUtils.DCT('language'), null).map(statement => [statement.object.value]);
                        inputVals = inputVals.concat(datasetInputVals);
                    });
                    return inputVals;
                },
                fieldPattern: [[$rdf.st(null, RDFUtils.DCT('language'), null)]]
            })
        ]
    }),
    new CategoryCore({
        recommended: false,
        categoryTitle: "Graph",
        legend: "Graphs present in the dataset",
        idPrefix: "graph",
        minArity: 0,
        maxArity: Infinity,
        computable: true,
        fields: [
            new FieldCore({
                placeholder: ["Uri of the graph"],
                defaultValue: [""],
                dataCreationFunction(valuesArray: string[]): $rdf.Statement[] {
                    let inputVal = valuesArray[0];
                    let graphNode = $rdf.sym(inputVal);
                    return [
                        $rdf.st(exampleDataset, RDFUtils.SD('namedGraph'), graphNode),
                        $rdf.st(graphNode, RDFUtils.SD('name'), graphNode),
                        $rdf.st(exampleDataset, RDFUtils.RDF("type"), RDFUtils.SD("Dataset")),
                        $rdf.st(graphNode, RDFUtils.RDF("type"), RDFUtils.SD("NamedGraph")),
                        $rdf.st(exampleDatasetService, RDFUtils.RDF('type'), RDFUtils.DCAT("DataService")),
                        $rdf.st(exampleDatasetService, RDFUtils.RDF("type"), RDFUtils.SD("Service")),
                        $rdf.st(exampleDatasetService, RDFUtils.DCAT('servesDataset'), exampleDataset),
                        $rdf.st(exampleDatasetService, RDFUtils.SD("availableGraphs"), exampleDataset),
                    ];
                },
                dataValidationFunction(valuesArray: string[]): FieldState {
                    let inputVal = valuesArray[0];
                    const result = Validation.isURI(inputVal);
                    if (result) {
                        return FieldState.valid();
                    } else {
                        return FieldState.invalid("The name of the graph must be an URI");
                    }
                },
                dataExtractionFunction: () => {
                    let endpointArray = controlInstance.listNodesStore(exampleDataset, RDFUtils.VOID("sparqlEndpoint"), null);
                    if (endpointArray.length == 0) {
                        throw new Error("No endpoint found.")
                    }
                    let promiseArray = [];
                    endpointArray.forEach(endpointNode => {
                        let endpointString = endpointNode.value;
                        endpointString = controlInstance.standardizeEndpointURL(endpointString);
                        promiseArray.push(Query.paginatedSparqlQueryPromise(endpointString, 'SELECT DISTINCT ?graph WHERE { GRAPH ?graph { ?s ?p ?o . } }'));
                    });
                    return Promise.allSettled(promiseArray)
                        .then(rawBindingsArray => {
                            let bindingsArray: JSONValue[][] = Query.extractSettledPromiseValues(rawBindingsArray);
                            let unifiedBindings = [];
                            bindingsArray.forEach(bindings => {
                                if (bindings != undefined) {
                                    unifiedBindings = unifiedBindings.concat(bindings);
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
                },
                dataLoadFunction(store: $rdf.Store): string[][] {
                    let datasets = store.statementsMatching(null, RDFUtils.RDF('type'), RDFUtils.DCAT('Dataset')).map(statement => statement.subject);
                    let inputVals = [];
                    datasets.forEach(dataset => {
                        let graphNodes = store.statementsMatching(dataset, RDFUtils.SD('namedGraph'), null).map(statement => statement.object)
                        let graphBlankNodes = [];
                        graphNodes.forEach(graphNode => {
                            if ($rdf.isBlankNode(graphNode)) {
                                graphBlankNodes.push(graphNode)
                            } else if ($rdf.isNamedNode(graphNode)) {
                                inputVals.push([graphNode.value])
                            }
                        });
                        graphBlankNodes.forEach(graphBlankNode => {
                            let graphName = store.any(graphBlankNode, RDFUtils.SD('name'), null);
                            if (graphName != undefined) {
                                inputVals.push([graphName.value])
                            }
                        });
                    })
                    return inputVals;
                },
                fieldPattern: [[
                    $rdf.st($rdf.variable('dataset'), RDFUtils.SD('namedGraph'), $rdf.variable('graphNode')),
                    $rdf.st($rdf.variable('graphNode'), RDFUtils.SD('name'), $rdf.variable('graphNode')),
                    $rdf.st($rdf.variable('dataset'), RDFUtils.RDF("type"), RDFUtils.SD("Dataset")),
                    $rdf.st($rdf.variable('graphNode'), RDFUtils.RDF("type"), RDFUtils.SD("NamedGraph")),
                    $rdf.st($rdf.variable('service'), RDFUtils.RDF('type'), RDFUtils.DCAT("DataService")),
                    $rdf.st($rdf.variable('service'), RDFUtils.RDF("type"), RDFUtils.SD("Service")),
                    $rdf.st($rdf.variable('service'), RDFUtils.DCAT('servesDataset'), $rdf.variable('dataset')),
                    $rdf.st($rdf.variable('service'), RDFUtils.SD("availableGraphs"), $rdf.variable('dataset')),
                ]]
            })
        ]
    }),
    new CategoryCore({
        recommended: false,
        categoryTitle: "Triples",
        legend: "Number of triples present in the dataset",
        idPrefix: "triples",
        minArity: 0,
        maxArity: 1,
        computable: true,
        fields: [
            new FieldCore({
                placeholder: ["Number of triples"],
                defaultValue: [""],
                dataCreationFunction(valuesArray: string[]): $rdf.Statement[] {
                    let inputVal = valuesArray[0];
                    return [$rdf.st(exampleDataset, RDFUtils.VOID('triples'), $rdf.literal(inputVal, RDFUtils.XSD("integer")))];
                },
                dataValidationFunction(valuesArray: string[]): FieldState {
                    let inputVal = valuesArray[0];
                    const result = Validation.isLiteral(inputVal) && Validation.isPositiveInteger(inputVal);
                    if (result) {
                        return FieldState.valid();
                    } else {
                        return FieldState.invalid("The number of triples must be a positive integer number.");
                    }
                },
                dataExtractionFunction: () => {
                    let endpointArray = controlInstance.listNodesStore(exampleDataset, RDFUtils.VOID("sparqlEndpoint"), null);
                    if (endpointArray.length == 0) {
                        throw new Error("No endpoint found.")
                    }
                    let promiseArray = [];
                    endpointArray.forEach(endpointNode => {
                        let endpointString = endpointNode.value;
                        endpointString = controlInstance.standardizeEndpointURL(endpointString);
                        promiseArray.push(Query.sparqlQueryPromise(endpointString, 'SELECT (count(*) AS ?count) { ?s ?p ?o }'));
                    });
                    return Promise.allSettled(promiseArray)
                        .then(rawBindingsArray => {
                            let bindingsArray: SPARQLJSONResult[] = Query.extractSettledPromiseValues(rawBindingsArray);
                            let unifiedBindings = [];
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
                            return [];
                        })
                },
                dataLoadFunction(store: $rdf.Store): string[][] {
                    let datasets = store.statementsMatching(null, RDFUtils.RDF('type'), RDFUtils.DCAT('Dataset')).map(statement => statement.subject);
                    let inputVals = [];
                    datasets.forEach(dataset => {
                        let datasetInputVals = store.statementsMatching(dataset, RDFUtils.VOID('triples'), null).map(statement => [statement.object.value]);
                        inputVals = inputVals.concat(datasetInputVals);
                    });
                    return inputVals;
                },
                fieldPattern: [[
                    $rdf.st(null, RDFUtils.VOID('triples'), null)
                ]]
            })
        ]
    }),
    new CategoryCore({
        recommended: false,
        categoryTitle: "Classes",
        legend: "Number of classes present in the dataset",
        idPrefix: "classes",
        minArity: 0,
        maxArity: 1,
        computable: true,
        fields: [
            new FieldCore({
                placeholder: ["Number of classes"],
                defaultValue: [""],
                dataCreationFunction(valuesArray: string[]): $rdf.Statement[] {
                    let inputVal = valuesArray[0];
                    return [$rdf.st(exampleDataset, RDFUtils.VOID('classes'), $rdf.literal(inputVal, RDFUtils.XSD("integer")))];
                },
                dataValidationFunction(valuesArray: string[]): FieldState {
                    let inputVal = valuesArray[0];
                    const result = Validation.isLiteral(inputVal) && Validation.isPositiveInteger(inputVal);
                    if (result) {
                        return FieldState.valid();
                    } else {
                        return FieldState.invalid("The number of classes must be a positive integer number.");
                    }
                },
                dataExtractionFunction: () => {
                    let endpointArray = controlInstance.listNodesStore(exampleDataset, RDFUtils.VOID("sparqlEndpoint"), null);
                    if (endpointArray.length == 0) {
                        throw new Error("No endpoint found.")
                    }
                    let promiseArray = [];
                    endpointArray.forEach(endpointNode => {
                        let endpointString = endpointNode.value;
                        endpointString = controlInstance.standardizeEndpointURL(endpointString);
                        promiseArray.push(Query.sparqlQueryPromise(endpointString, 'SELECT (COUNT(DISTINCT ?c) AS ?count) WHERE { { SELECT DISTINCT ?c { ?s a ?c . FILTER(isURI(?c)) } } }'));
                    });
                    return Promise.allSettled(promiseArray)
                        .then(rawBindingsArray => {
                            let bindingsArray: SPARQLJSONResult[] = Query.extractSettledPromiseValues(rawBindingsArray);
                            let unifiedBindings = [];
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
                            return [];
                        })
                },
                dataLoadFunction(store: $rdf.Store): string[][] {
                    let datasets = store.statementsMatching(null, RDFUtils.RDF('type'), RDFUtils.DCAT('Dataset')).map(statement => statement.subject);
                    let inputVals = [];
                    datasets.forEach(dataset => {
                        let datasetInputVals = store.statementsMatching(dataset, RDFUtils.VOID('classes'), null).map(statement => [statement.object.value]);
                        inputVals = inputVals.concat(datasetInputVals);
                    });
                    return inputVals;
                },
                fieldPattern: [[
                    $rdf.st(null, RDFUtils.VOID('classes'), null)
                ]]
            })
        ]
    }),
    new CategoryCore({
        recommended: false,
        categoryTitle: "Properties",
        legend: "Number of properties present in the dataset",
        idPrefix: "properties",
        minArity: 0,
        maxArity: 1,
        computable: true,
        fields: [
            new FieldCore({
                placeholder: ["Number of properties"],
                defaultValue: [""],
                dataCreationFunction(valuesArray: string[]): $rdf.Statement[] {
                    let inputVal = valuesArray[0];
                    return [$rdf.st(exampleDataset, RDFUtils.VOID('properties'), $rdf.literal(inputVal, RDFUtils.XSD("integer")))];
                },
                dataValidationFunction(valuesArray: string[]): FieldState {
                    let inputVal = valuesArray[0];
                    const result = Validation.isLiteral(inputVal) && Validation.isPositiveInteger(inputVal);
                    if (result) {
                        return FieldState.valid();
                    } else {
                        return FieldState.invalid("The number of properties must be a positive integer number.");
                    }
                },
                dataExtractionFunction: () => {
                    let endpointArray = controlInstance.listNodesStore(exampleDataset, RDFUtils.VOID("sparqlEndpoint"), null);
                    if (endpointArray.length == 0) {
                        throw new Error("No endpoint found.")
                    }
                    let promiseArray = [];
                    endpointArray.forEach(endpointNode => {
                        let endpointString = endpointNode.value;
                        endpointString = controlInstance.standardizeEndpointURL(endpointString);
                        promiseArray.push(Query.sparqlQueryPromise(endpointString, 'SELECT (COUNT(DISTINCT ?p) AS ?count) WHERE { { SELECT DISTINCT ?p { ?s ?p ?o . FILTER(isURI(?p)) } } }'));
                    });
                    return Promise.allSettled(promiseArray)
                        .then(rawBindingsArray => {
                            let bindingsArray: SPARQLJSONResult[] = Query.extractSettledPromiseValues(rawBindingsArray);
                            let unifiedBindings = [];
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
                            return [];
                        })
                },
                dataLoadFunction(store: $rdf.Store): string[][] {
                    let datasets = store.statementsMatching(null, RDFUtils.RDF('type'), RDFUtils.DCAT('Dataset')).map(statement => statement.subject);
                    let inputVals = [];
                    datasets.forEach(dataset => {
                        let datasetInputVals = store.statementsMatching(dataset, RDFUtils.VOID('properties'), null).map(statement => [statement.object.value]);
                        inputVals = inputVals.concat(datasetInputVals);
                    });
                    return inputVals;
                },
                fieldPattern: [[
                    $rdf.st(null, RDFUtils.VOID('properties'), null)
                ]]
            })
        ]
    }),
];