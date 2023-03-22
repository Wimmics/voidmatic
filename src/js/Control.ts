import * as RDFUtils from "./RDFUtils.ts";
import * as Query from "./QueryUtils.ts";
import { inputMetadata } from './Categories.ts';
import { CategoryCore, FieldState } from './Model.ts';
import { CategoryView, generateNavItem } from "./View.ts";

import $ from 'jquery';
import * as $rdf from 'rdflib';
import { saveAs } from 'file-saver';
import { v4 as uuid } from 'uuid';
import * as bootstrap from 'bootstrap'
import { zipurl, unzipurl } from 'zipurl'


export let controlInstance;

export class Control {

    store: $rdf.Store;
    contentDisplay: JQuery<HTMLElement>;
    categoryViews: CategoryView[];
    metadataCategoryViewMap: Map<CategoryCore, CategoryView>;
    forceHTTPSFlag: boolean;
    sessionId: string;

    constructor() {
        if (controlInstance) {
            throw new Error("Control already instanced")
        }
        controlInstance = this;

        var navCol = $('#navCol');

        this.store = RDFUtils.createStore();
        this.contentDisplay = $("#displayTextArea");
        this.categoryViews = [];
        this.metadataCategoryViewMap = new Map();
        this.forceHTTPSFlag = true;
        this.sessionId = uuid();

        this.initCategoryViews();

        $("#downloadButton").on("click", () => {
            RDFUtils.serializeStoreToTurtlePromise(this.store).then(fileContent => {
                saveAs(new Blob([fileContent], { "type": "text/turtle" }), "description.ttl")
            })
        });

        // Import a turtle description present in the URL as value of the "description" parameter
        let currentUrl = new URL(window.location.href);
        let zippedDescription = currentUrl.searchParams.get("description");
        let description = unzipurl(zippedDescription);
        if (description != null) {
            let decodedDescription = decodeURIComponent(description);
            let parsedStore = RDFUtils.createStore();
            RDFUtils.parseTurtleToStore(decodedDescription, parsedStore).then(store => {
                if (parsedStore.length > 0) {
                    return this.importData(decodedDescription)
                }
            }).catch(error => {
                console.log(error);
            })
        }
        $("#fairButton").on("click", () => {
            RDFUtils.serializeStoreToTurtlePromise(this.store).then(fileContent => {
                let description = encodeURIComponent(fileContent);
                let currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set("description", description);
                Query.fetchPromise("https://foops.linkeddata.es/assessOntology", new Map([["Content-Type", "application/json; charset=utf-8"]]), "POST", '{ "ontologyURI":' + currentUrl.href + '}').then(response => {
                    console.log(response);
                })
            })
        })

        $("#saturationButton").on("click", () => {
            const equivalences = this.generateEquivalenceTriples();
            this.store.addAll(equivalences);
            this.refreshStore()
        });

        $('#forceHTTPScheckbox').on("change", () => {
            var checkboxValue = $('#forceHTTPScheckbox').prop("checked");
            this.forceHTTPSFlag = checkboxValue;
        })

        let loadModelInput = $('#loadTextarea');
        const loadModal = new bootstrap.Modal('#loadModalDiv', {})
        $("#loadButton").on("click", () => {
            loadModal.show();
        })

        $('#clearLoadButton').on("click", () => {
            loadModelInput.val("");
        });

        $('#closeLoadButton').on("click", () => {
            loadModal.hide();
        });

        $('#saveLoadButton').on("click", () => {
            try {
                this.importData(loadModelInput.val().toLocaleString(), $('#loadFileFormatSelect').val().toLocaleString()).then(() => {
                    loadModal.hide();
                });
            } catch (e) {
                console.error(e);
                $("#loadErrorDiv").text(e.message);
            }
        });

        this.addStatement(new $rdf.Statement(RDFUtils.exampleDataset, RDFUtils.RDF("type"), RDFUtils.DCAT("Dataset")));
    }

    changeUrlDescriptionParameter() {
        let currentUrl = new URL(window.location.href);
        RDFUtils.serializeStoreToTurtlePromise(this.store).then(fileContent => {
            let description = zipurl(encodeURIComponent(fileContent));
            currentUrl.searchParams.set("description", description);
            window.history.pushState({}, "", currentUrl.href);
        })
    }

    changeProgressBar() {
        let emptyRecommendedCategoryNames = [];
        let totalLines = 0;
        let totalValidLines = 0;
        this.categoryViews.forEach(catView => {
            if(catView.coreElement.recommended) {
                totalLines++;
                if (catView.hasValidLines()) {
                    totalValidLines++;
                } else {
                    emptyRecommendedCategoryNames.push(catView.coreElement.categoryTitle);
                }
            }
        })
        let progressBar = $("#recommendedProgressBar");
        let progress = (totalValidLines / totalLines) * 100;
        progressBar.css("width", progress + "%");
        progressBar.attr("aria-valuenow", progress);
        progressBar.text(Math.round(progress) + "%");
        let remark = "";
        if (emptyRecommendedCategoryNames.length > 0) {
            remark = "It is recommended to fill at least the following features: " + emptyRecommendedCategoryNames.join(", ");
        } else if(progress == 100) {
            remark = `The recommended features are all filled.<br/> Do not hesitate to evaluate the FAIRness of your dataset using one of the tools listed at <a target="_blank" rel="noopener noreferrer" href='https://fairassist.org/#!/'>FAIRassist</a>.`;
        }

        $("#recommendedRemark").html(remark);
    }

    importData(data: string, dataFormat?: string) {
        let parsingfunction = undefined;
        switch (dataFormat) {
            case "jsonld":
                parsingfunction = RDFUtils.parseJSONLDToStore;
                break;
            case "nquads":
                parsingfunction = RDFUtils.parseNQuadsToStore;
                break;
            case "rdf":
                parsingfunction = RDFUtils.parseRDFXMLToStore;
                break;
            case "ntriples":
                parsingfunction = RDFUtils.parseNTriplesToStore;
                break;
            case "n3":
                parsingfunction = RDFUtils.parseN3ToStore;
                break;
            case "turtle":
            default:
                parsingfunction = RDFUtils.parseTurtleToStore;
                break;
        };
        let parsedStore = RDFUtils.createStore();
        return parsingfunction(data, parsedStore).then(store => {
            function loadCategroyViewValues(catView, store) {
                let newLinesValues = [];
                catView.coreElement.fields.forEach(line => {
                    newLinesValues = newLinesValues.concat(line.dataLoadFunction(store));
                })
                newLinesValues.forEach(newValue => {
                    catView.addLine(newValue);
                })
                catView.subCategoryViews.forEach(subCatView => {
                    loadCategroyViewValues(subCatView, store);
                })
            }
            function cleanCategory(catView) {
                let lineToBeRemoved = [];
                catView.lines.forEach((line, lineId) => {
                    if (!FieldState.isValid(line.validationState)) {
                        lineToBeRemoved.push(lineId);
                    }
                })
                lineToBeRemoved.forEach(lineId => {
                    catView.removeLine(lineId);
                })
                catView.subCategoryViews.forEach(subCatView => {
                    cleanCategory(subCatView);
                })
            }
            this.categoryViews.forEach(catView => {
                cleanCategory(catView);
                loadCategroyViewValues(catView, store);
            })
        });
    }

    standardizeEndpointURL(endpointURL) {
        if (this.forceHTTPSFlag) {
            return endpointURL.replace("http://", "https://");
        } else {
            return endpointURL;
        }
    }

    /**
     * Generates triples in known vocabularies according to IndeGx equivalences.
     * TODO: Make it using SPARQL or defined in each field.
     */
    generateEquivalenceTriples() {
        var result: $rdf.Statement[] = [];

        const dcatDatasetInstanceStatement = this.store.anyStatementMatching(null, RDFUtils.RDF("type"), RDFUtils.DCAT("Dataset"));
        if (dcatDatasetInstanceStatement != undefined) {
            const subject = dcatDatasetInstanceStatement.subject;
            result.push(new $rdf.Statement(subject, RDFUtils.RDF("type"), RDFUtils.SCHEMA("Dataset")))
            result.push(new $rdf.Statement(subject, RDFUtils.RDF("type"), RDFUtils.DCMITYPE("Dataset")))
            result.push(new $rdf.Statement(subject, RDFUtils.RDF("type"), RDFUtils.VOID("Dataset")))
            result.push(new $rdf.Statement(subject, RDFUtils.RDF("type"), RDFUtils.SD("Dataset")))
            result.push(new $rdf.Statement(subject, RDFUtils.RDF("type"), RDFUtils.PROV("Entity")))
            result.push(new $rdf.Statement(subject, RDFUtils.RDF("type"), RDFUtils.SKOS("Concept")))
        }

        const dctTitleStatement = this.store.anyStatementMatching(null, RDFUtils.DCT("title"), null);
        if (dctTitleStatement != undefined) {
            const subject = dctTitleStatement.subject;
            const object = dctTitleStatement.object;
            result.push(new $rdf.Statement(subject, RDFUtils.SCHEMA("name"), object))
            result.push(new $rdf.Statement(subject, RDFUtils.RDFS("label"), object))
        }

        const dctDescriptionStatement = this.store.anyStatementMatching(null, RDFUtils.DCT("description"), null);
        if (dctDescriptionStatement != undefined) {
            const subject = dctDescriptionStatement.subject;
            const object = dctDescriptionStatement.object;
            result.push(new $rdf.Statement(subject, RDFUtils.SCHEMA("description"), object))
            result.push(new $rdf.Statement(subject, RDFUtils.OWL("comment"), object))
            result.push(new $rdf.Statement(subject, RDFUtils.SKOS("note"), object))
        }

        const dctCreatorStatement = this.store.anyStatementMatching(null, RDFUtils.DCT("creator"), null);
        if (dctCreatorStatement != undefined) {
            const subject = dctCreatorStatement.subject;
            const object = dctCreatorStatement.object;
            result.push(new $rdf.Statement(subject, RDFUtils.SCHEMA("creator"), object))
            result.push(new $rdf.Statement(subject, RDFUtils.PROV("wasAttributedTo"), object))
            result.push(new $rdf.Statement(subject, RDFUtils.PAV("authoredBy"), object))
            result.push(new $rdf.Statement(subject, RDFUtils.PAV("createdBy"), object))
        }

        const dctPublicationStatement = this.store.anyStatementMatching(null, RDFUtils.DCT("issued"), null);
        if (dctPublicationStatement != undefined) {
            const subject = dctPublicationStatement.subject;
            const object = dctPublicationStatement.object;
            result.push(new $rdf.Statement(subject, RDFUtils.SCHEMA("datePublished"), object))
        }

        const voidVocabularyStatement = this.store.anyStatementMatching(null, RDFUtils.VOID("vocabulary"), null);
        if (voidVocabularyStatement != undefined) {
            const subject = voidVocabularyStatement.subject;
            const object = voidVocabularyStatement.object;
            result.push(new $rdf.Statement(subject, RDFUtils.DCT("conformsTo"), object))
        }

        const voidSparqlEndpointStatement = this.store.anyStatementMatching(null, RDFUtils.VOID("sparqlEndpoint"), null);
        if (voidSparqlEndpointStatement != undefined) {
            const subject = voidSparqlEndpointStatement.subject;
            const object = voidSparqlEndpointStatement.object;
            result.push(new $rdf.Statement(subject, RDFUtils.SCHEMA("contentURL"), object))
            result.push(new $rdf.Statement(subject, RDFUtils.DCAT("endpointURL"), object))
        }

        const dcatVersionStatement = this.store.anyStatementMatching(null, RDFUtils.DCAT("version"), null);
        if (dcatVersionStatement != undefined) {
            const subject = dcatVersionStatement.subject;
            const object = dcatVersionStatement.object;
            result.push(new $rdf.Statement(subject, RDFUtils.SCHEMA("version"), object))
            result.push(new $rdf.Statement(subject, RDFUtils.DCT("hasVersion"), object))
            result.push(new $rdf.Statement(subject, RDFUtils.PAV("version"), object))
        }

        const dctLanguageStatement = this.store.anyStatementMatching(null, RDFUtils.DCT("language"), null);
        if (dctLanguageStatement != undefined) {
            const subject = dctLanguageStatement.subject;
            const object = dctLanguageStatement.object;
            result.push(new $rdf.Statement(subject, RDFUtils.SCHEMA("inLanguage"), object))
        }

        return result;
    }

    listNodesStore(s, p, o) {
        return this.store.each(s, p, o);
    }

    addStatement(statement) {
        this.addAllStatements([statement])
    }

    addAllStatements(statements) {
        this.store.add(statements);
        this.refreshStore();
    }

    removeStatement(statement) {
        if (this.store.holdsStatement(statement)) {
            this.store.remove(statement);
            this.refreshStore();
        }
    }

    removeAllStatements(statements) {
        statements.forEach(statement => {
            if (this.store.holdsStatement(statement)) {
                this.store.remove(statement);
            }
            this.refreshStore();
        })
    }

    setDisplay(str) {
        this.contentDisplay.text(str);
    }

    /**
     * Add the category views to the page and add the listeners
     */
    initCategoryViews() {
        var dataCol = $('#dataCol');
        var navCol = $('#navCol');

        inputMetadata.forEach(catMetadata => {
            var catMetadataView = new CategoryView({ category: catMetadata });
            this.categoryViews.push(catMetadataView);
            const categoryJquery = catMetadataView.render();
            dataCol.append(categoryJquery)
            navCol.append(catMetadataView.navItem);
            this.metadataCategoryViewMap.set(catMetadata.idPrefix, catMetadataView);

            catMetadataView.on("add", (statements, source) => {
                this.addAllStatements(statements);
                this.sendMetadatatoServer();
            });

            catMetadataView.on("remove", (statements, source) => {
                this.removeAllStatements(statements);
                this.sendMetadatatoServer();
            });

            catMetadataView.on("error", (message, source) => {
                console.error(message);
            })

            catMetadataView.on("change", source => {
                dataCol.empty();
                navCol.empty();
                catMetadataView.refresh();
            })

        })

        navCol.append($(`<div class="navbar-item"><a class="navbar-link btn" href="#displayTextArea">Description of the dataset</a></div>`));
    }

    refreshCategories() {
        this.categoryViews.forEach(categoryView => {
            categoryView.refresh();
        })
    }

    refreshStore() {
        this.changeProgressBar()
        RDFUtils.serializeStoreToTurtlePromise(this.store).then(str => {
            controlInstance.setDisplay(str);
            this.changeUrlDescriptionParameter();
        })
    }

    sendMetadatatoServer() {
        if (this.store.holds(null, RDFUtils.VOID("sparqlEndpoint"), null)) {
            RDFUtils.serializeStoreToNTriplesPromise(this.store).then(str => {
                const finalUrl = "https://prod-dekalog.inria.fr/description?uuid=" + this.sessionId + "&description=" + encodeURIComponent(str.replaceAll("\n", " "));
                return Query.fetchJSONPromise(finalUrl).catch(error => { })
            }).catch(error => { })
        }
    }
}