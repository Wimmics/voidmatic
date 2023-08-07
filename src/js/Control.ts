import * as RDFUtils from "./RDFUtils";
import * as Query from "./QueryUtils";
import { inputMetadata } from './Categories';
import { CategoryCore, FieldCore, FieldState } from './Model';
import { CategoryView } from "./View";
import * as equiv from "./Equivalences";

import $ from 'jquery';
import * as $rdf from 'rdflib';
import { saveAs } from 'file-saver';
import { v4 as uuid } from 'uuid';
import * as bootstrap from 'bootstrap'
import { zipurl, unzipurl } from 'zipurl'
import * as echarts from 'echarts';


export let controlInstance: Control;

export class Control {

    store: $rdf.Store;
    contentDisplay: JQuery<HTMLElement>;
    categoryViews: CategoryView[];
    metadataCategoryViewMap: Map<string, CategoryView>;
    forceHTTPSFlag: boolean;
    sessionId: string;
    radarChart: echarts.ECharts;

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

        // window.onload = (event) => {

        this.initCategoryViews();

        $("#downloadButton").on("click", () => {
            RDFUtils.serializeStoreToTurtlePromise(this.store).then(fileContent => {
                saveAs(new Blob([fileContent], { "type": "text/turtle" }), "description.ttl")
            })
        });

        $("#saturationButton").on("click", () => {
            this.generateEquivalenceTriples().then(equivalences => {
                this.store.addAll(equivalences);
                this.refreshStore();
                return;
            });
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

        $("#clearButton").on("click", () => {
            this.clearAll();
        });

        $("#exampleDBpediaButton").attr("title", "DESCRIBE <http://dbpedia.org/void/Dataset>")
        $("#exampleDBpediaButton").on("click", () => {
            this.clearAll();
            $("#exampleDBpediaButton").removeClass("btn-dark");
            $("#exampleDBpediaButton").removeClass("btn-success");
            $("#exampleDBpediaButton").removeClass("btn-danger");
            $("#exampleDBpediaButton").addClass("btn-warning");
            this.fetchExample("https://dbpedia.org/sparql", "http://dbpedia.org/void/Dataset").then(exampleDescription => {
                return this.importData(exampleDescription).then(() => {
                    $("#exampleDBpediaButton").removeClass("btn-dark");
                    $("#exampleDBpediaButton").removeClass("btn-warning");
                    $("#exampleDBpediaButton").removeClass("btn-danger");
                    $("#exampleDBpediaButton").addClass("btn-success");
                });
            }).catch(error => {
                console.error(error);
                $("#exampleDBpediaButton").removeClass("btn-dark");
                $("#exampleDBpediaButton").removeClass("btn-warning");
                $("#exampleDBpediaButton").removeClass("btn-success");
                $("#exampleDBpediaButton").addClass("btn-danger");
            })
        });

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

        $("#fairButton").on("click", () => {
            $("#fairButton").removeClass("btn-dark");
            $("#fairButton").removeClass("btn-success");
            $("#fairButton").addClass("btn-warning");
            this.setFAIRRadar().then(() => {
                $("#fairButton").removeClass("btn-dark");
                $("#fairButton").removeClass("btn-warning");
                $("#fairButton").addClass("btn-success");
                return;
            })
        })
        // Dirty hack to fix echarts width and height bug
        const baseWidth = window.innerWidth - 270;
        const baseHeight = window.innerHeight * 0.45;

        let radarDOM = document.getElementById('fairRadar');
        this.radarChart = echarts.init(radarDOM);

        // };

        // Import a turtle description present in the URL as value of the "description" parameter
        let currentUrl = new URL(window.location.href);
        let zippedDescription = currentUrl.searchParams.get("description");
        if (zippedDescription != null) {
            let description = unzipurl(zippedDescription);
            if (description != null) {
                let decodedDescription = decodeURIComponent(description);
                let parsedStore = RDFUtils.createStore();
                RDFUtils.parseTurtleToStore(decodedDescription, parsedStore).then(store => {
                    if (parsedStore.length > 0) {
                        return this.importData(decodedDescription)
                    }
                }).catch(error => {
                    console.error(error);
                })
            }
        }

        this.addStatement($rdf.st(RDFUtils.exampleDataset, RDFUtils.RDF("type"), RDFUtils.DCAT("Dataset")));
    }

    fetchExample(endpointUrl: string, resourceURL: string): Promise<string> {
        let query = `DESCRIBE <${resourceURL}>`;
        return Query.sparqlQueryPromise(endpointUrl, query).then(storeResult => {
            return RDFUtils.serializeStoreToTurtlePromise(storeResult);
        }).catch(error => { console.error(endpointUrl, query, error); throw error })
    }

    setFAIRRadar(): Promise<void> {

        const mainContentColWidth = $("#mainContentCol").width();
        controlInstance.radarChart.resize({
            width: mainContentColWidth,
            height: 500,
        });

        function setFAIRError(message) {
            $("#fairError").text(message);
            $("#fairError").addClass("alert-danger");
        }

        function resetFAIRError() {
            $("#fairError").text("");
            $("#fairError").removeClass("alert-danger");
        }

        return Query.fetchJSONPromise("https://fair-checker.france-bioinformatique.fr/api/check/metrics_all?url=" + encodeURIComponent(document.location.href)).then(result => {

            resetFAIRError();
            $("#fairchecker").removeClass("collapse");
            if (Array.isArray(result) && result.length > 0) {
                let F1AScore = result.find(metric => metric.metric === "F1A")?.score;
                let F1BScore = result.find(metric => metric.metric === "F1B")?.score;
                let F2AScore = result.find(metric => metric.metric === "F2A")?.score;
                let F2BScore = result.find(metric => metric.metric === "F2B")?.score;
                let A11Score = result.find(metric => metric.metric === "A1.1")?.score;
                let A12Score = result.find(metric => metric.metric === "A1.2")?.score;
                let I1Score = result.find(metric => metric.metric === "I1")?.score;
                let I2Score = result.find(metric => metric.metric === "I2")?.score;
                let I3Score = result.find(metric => metric.metric === "I3")?.score;
                let R11Score = result.find(metric => metric.metric === "R1.1")?.score;
                let R12Score = result.find(metric => metric.metric === "R1.2")?.score;
                let R13Score = result.find(metric => metric.metric === "R1.3")?.score;

                if ([F1AScore, F1BScore, F2AScore, F2BScore, A11Score, A12Score, I1Score, I2Score, I3Score, R11Score, R12Score, R13Score].some(score => score == undefined)) {
                    setFAIRError("One of the metrics could not be retrieved from FAIR-checker " + JSON.stringify(result, null, 2));
                } else {

                    F1AScore = Number.parseInt(F1AScore);
                    F1BScore = 0;// Number.parseInt(F1BScore); // Stuck at 0 because we are generating URIs for the dataset and identifiers are a bioinformatics oriented metric
                    F2AScore = Number.parseInt(F2AScore);
                    F2BScore = Number.parseInt(F2BScore);
                    A11Score = Number.parseInt(A11Score);
                    A12Score = Number.parseInt(A12Score);
                    I1Score = Number.parseInt(I1Score);
                    I2Score = Number.parseInt(I2Score);
                    I3Score = Number.parseInt(I3Score);
                    R11Score = Number.parseInt(R11Score);
                    R12Score = Number.parseInt(R12Score);
                    R13Score = Number.parseInt(R13Score);

                    let option = {
                        title: {
                            text: 'FAIR-Checker evaluation',
                            left: 'center'
                        },
                        legend: {
                            show: false
                        },
                        radar: [
                            {
                                axisName: {
                                    show: true,
                                },
                                indicator: [
                                    { name: 'Findable', max: 8 },
                                    { name: 'Accessible', max: 4 },
                                    { name: 'Interoperable', max: 6 },
                                    { name: 'Reusable', max: 6 }
                                ],
                                center: ['25%', '50%'],
                                radius: "50%"
                            },
                            {
                                axisName: {
                                    show: true,
                                },
                                indicator: [
                                    { name: 'F1A', max: 2 },
                                    { name: 'F1B', max: 2 },
                                    { name: 'F2A', max: 2 },
                                    { name: 'F2B', max: 2 }
                                ],
                                center: ['62%', '25%'],
                                radius: "20%"
                            },
                            {
                                axisName: {
                                    show: true,
                                },
                                indicator: [
                                    { name: 'A1.1', max: 2 },
                                    { name: '', max: 2 },
                                    { name: 'A1.2', max: 2 },
                                    { name: '', max: 2 }
                                ],
                                center: ['87%', '25%'],
                                radius: "20%"
                            },
                            {
                                axisName: {
                                    show: true,
                                },
                                indicator: [
                                    { name: 'I1', max: 2 },
                                    { name: 'I2', max: 2 },
                                    { name: 'I3', max: 2 }
                                ],
                                center: ['62%', '75%'],
                                radius: "20%"
                            },
                            {
                                axisName: {
                                    show: true,
                                },
                                indicator: [
                                    { name: 'R1.1', max: 2 },
                                    { name: 'R1.2', max: 2 },
                                    { name: 'R1.3', max: 2 }
                                ],
                                center: ['87%', '75%'],
                                radius: "20%"
                            },
                        ],
                        series: [
                            {
                                name: 'FAIRness evaluation',
                                radarIndex: 0,
                                type: 'radar',
                                data: [
                                    {
                                        value: [F1AScore + F1BScore + F2AScore + F2BScore, A11Score + A12Score, I1Score + I2Score + I3Score, R11Score + R12Score + R13Score],
                                        name: 'Dataset'
                                    }
                                ]
                            },
                            {
                                name: 'Findability',
                                radarIndex: 1,
                                type: 'radar',
                                data: [
                                    {
                                        value: [F1AScore, F1BScore, F2AScore, F2BScore],
                                        name: 'Dataset'
                                    }
                                ]
                            },
                            {
                                name: 'Accessibility',
                                radarIndex: 2,
                                type: 'radar',
                                data: [
                                    {
                                        value: [A11Score, 0, A12Score, 0],
                                        name: 'Dataset'
                                    }
                                ]
                            },
                            {
                                name: 'Interoperability',
                                radarIndex: 3,
                                type: 'radar',
                                data: [
                                    {
                                        value: [I1Score, I2Score, I3Score],
                                        name: 'Dataset'
                                    }
                                ]
                            },
                            {
                                name: 'Reusability',
                                radarIndex: 4,
                                type: 'radar',
                                data: [
                                    {
                                        value: [R11Score, R12Score, R13Score],
                                        name: 'Dataset'
                                    }
                                ]
                            }
                        ]
                    };

                    option && controlInstance.radarChart.setOption(option);
                }
            } else {
                setFAIRError("No result returned by FAIR-checker");
            }
            $("#fairresult").text(JSON.stringify(result, null, 2));
        }).catch(error => {
            setFAIRError("Error while checking the FAIRness of the dataset: " + error);
        })
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
            if (catView.coreElement.recommended) {
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
        } else if (progress == 100) {
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
        if (data !== undefined && data !== null && data !== "") {
            let parsedStore = RDFUtils.createStore();
            return parsingfunction(data, parsedStore).then(store => {
                return equiv.readEquivalenceFile("https://raw.githubusercontent.com/Wimmics/voidmatic/master/data/equivalences.ttl")
                    .then(equivalences => {
                        return equiv.applyEquivalences(equivalences, store);
                    }).then(equivalences => {
                        store.addAll(equivalences);
                        return store;
                    })
            }).then(store => {
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
        } else {
            return Promise.resolve();
        }
    }

    standardizeEndpointURL(endpointURL) {
        if (this.forceHTTPSFlag) {
            return endpointURL.replace("http://", "https://");
        } else {
            return endpointURL;
        }
    }
    generateEquivalenceTriples(): Promise<$rdf.Statement[]> {
        return this.generateEquivalenceTriplesFromStore(this.store);
    }

    /**
     * Generates triples in known vocabularies according to IndeGx equivalences.
     * TODO: Make it using SPARQL or defined in each field.
     */
    generateEquivalenceTriplesFromStore(store: $rdf.Store): Promise<$rdf.Statement[]> {
        return equiv.readEquivalenceFile("https://raw.githubusercontent.com/Wimmics/voidmatic/master/data/equivalences.ttl").then(equivalences => {
            return equiv.applyEquivalences(equivalences, store);
        })
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

    removeStatement(statement: $rdf.Statement) {
        if (this.store.holdsStatement(statement)) {
            this.store.remove(statement);
            this.refreshStore();
        }
    }

    removeAllStatements(statements: $rdf.Statement[]) {
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

    containsStatement(statement) {
        return this.store.holdsStatement(statement);
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
                if (catMetadataView.coreElement.idPrefix === "endpoint") {
                    this.sendMetadatatoServer();
                }
            });

            catMetadataView.on("remove", (statements, source) => {
                this.removeAllStatements(statements);
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
        RDFUtils.serializeStoreToJSONLDPromise(this.store).then(str => {
            $("#fairJson").html(str);
        })
    }

    clearAll() {
        console.log("Clearing all");
        this.removeAllStatements(this.store.statementsMatching(null, null, null));
        this.categoryViews.forEach(categoryView => {
            categoryView.clear();
        })
        this.refreshStore();
    }

    sendMetadatatoServer() {
        if (this.store.holds(null, RDFUtils.VOID("sparqlEndpoint"), null)) {
            let str = "";
            this.store.statementsMatching(null, RDFUtils.VOID("sparqlEndpoint"), null).forEach(statement => {
                str += statement.toNT() + " ";
            })
            const finalUrl = "https://prod-dekalog.inria.fr/description?uuid=" + this.sessionId + "&description=" + encodeURIComponent(str.replaceAll("\n", " "));
            return Query.fetchJSONPromise(finalUrl).catch(error => { })
        }
    }
}