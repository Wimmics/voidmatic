import $ from 'jquery';
import { Statement } from 'rdflib';
import dayjs from 'dayjs';
import { saveAs } from 'file-saver';
import { v4 as uuidv4 } from 'uuid';

// const $rdf = require('rdflib');
import * as $rdf from 'rdflib';
const EventEmitter = require('events');

var RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
var RDFS = $rdf.Namespace("http://www.w3.org/2000/01/rdf-schema#");
var OWL = $rdf.Namespace("http://www.w3.org/2002/07/owl#");
var XSD = $rdf.Namespace("http://www.w3.org/2001/XMLSchema#");
var DCAT = $rdf.Namespace("http://www.w3.org/ns/dcat#");
var FOAF = $rdf.Namespace("http://xmlns.com/foaf/0.1/");
var PROV = $rdf.Namespace("http://www.w3.org/ns/prov#");
var SCHEMA = $rdf.Namespace("http://schema.org/");
var VOID = $rdf.Namespace("http://rdfs.org/ns/void#");
var SD = $rdf.Namespace("http://www.w3.org/ns/sparql-service-description#");
var DCE = $rdf.Namespace("http://purl.org/dc/elements/1.1/");
var DCT = $rdf.Namespace("http://purl.org/dc/terms/");
var SKOS = $rdf.Namespace("http://www.w3.org/2004/02/skos/core#");
var PAV = $rdf.Namespace("http://purl.org/pav/");
var MOD = $rdf.Namespace("https://w3id.org/mod#");

var EX = $rdf.Namespace("https://e.g/#");
const exampleDataset = EX('dataset');

const queryPaginationSize = 500;

$(() => {
    var dataCol = $('#dataCol');
    var navCol = $('#navCol');
    var uniqueIdCounter = 0;

    function fetchPromise(url, header = new Map()) {
        var myHeaders = new Headers();
        header.forEach((value, key) => {
            myHeaders.set(key, value);
        });
        var myInit = {
            method: 'GET',
            headers: myHeaders,
            mode: 'cors',
            cache: 'no-cache',
            redirect: 'follow'
        };
        return fetch(url, myInit)
            .then(response => {
                if (response.ok) {
                    return response.blob().then(blob => blob.text())
                } else {
                    throw response;
                }
            });
    }

    function fetchJSONPromise(url) {
        var header = new Map();
        header.set('Content-Type', 'application/json');
        header.set("Accept", "application/sparql-results+json")
        return fetchPromise(url, header).then(response => {
            return JSON.parse(response);
        });
    }

    function sparqlQueryPromise(endpoint, query) {
        if (query.includes("SELECT") || query.includes("ASK")) {
            return fetchJSONPromise(endpoint + '?query=' + encodeURIComponent(query) + '&format=json&timeout=60000')
        }
        else {
            console.error(error)
        }
    }

    function paginatedSparqlQueryPromise(endpoint, query, limit = queryPaginationSize, offset = 0, finalResult = []) {
        var paginatedQuery = query + " LIMIT " + limit + " OFFSET " + offset;
        return sparqlQueryPromise(paginatedQuery)
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

    class CategoryCore {
        constructor(config = { recommended: false, categoryTitle: "", legend: "", idPrefix: "id", minArity: 0, maxArity: Infinity, fields: [] }) {
            this.recommended = config.recommended;
            this.categoryTitle = config.categoryTitle;
            this.legend = config.legend;
            this.idPrefix = config.idPrefix;
            this.minArity = config.minArity;
            this.maxArity = config.maxArity;
            this.computable = config.computable;
            this.fields = [];
            config.fields.forEach(fieldConfig => {
                this.addNewField(fieldConfig);
            })
        }

        addNewField(fieldConfig) {
            fieldConfig.parentCategory = this;
            this.fields.push(fieldConfig);
        }
    }

    class CategoryView extends EventEmitter {

        constructor(config = { category: null }) {
            super();
            this.categoryCore = config.category;
            this.lines = new Map();

            this.categoryCore.fields.forEach(field => {
                if (this.categoryCore.minArity > 0) {
                    this.addLine()
                }
            });
            this.categoryId = this.categoryCore.idPrefix + "Category";

            var dataDiv = $(document.createElement('div'));
            dataDiv.addClass("row");
            var catAnchorDiv = $(document.createElement('span'));
            catAnchorDiv.addClass("category-anchor");
            catAnchorDiv.attr("id", this.categoryId);
            var navBarHeight = $("#title-row").height();
            catAnchorDiv.css("height", navBarHeight + "px")
            catAnchorDiv.css("margin-top", "-" + navBarHeight + "px")
            dataDiv.append(catAnchorDiv)
            this.jQueryContent = dataDiv;
            this.generateCategoryFields();
            this.navItem = this.generateNavItem();
        }



        addLine() {
            this.categoryCore.fields.forEach(field => {
                if (this.underMaximumNumberOfLine()) {
                    var fieldLine = null;
                    if (field instanceof SingleFieldCore) {
                        fieldLine = new SingleFieldView({ core: field, parentCategoryView: this });
                    } else if (field instanceof MultipleFieldCore) {
                        fieldLine = new MultipleFieldView({ core: field, parentCategoryView: this });
                    } else {
                        console.error(field)
                        throw new Error("Unknown line type ")
                    }
                    this.lines.set(fieldLine.inputId, fieldLine);

                    fieldLine.on("add", (statement, source) => {
                        this.emit("add", statement, source);
                    });

                    fieldLine.on("remove", (statement, source) => {
                        this.emit("remove", statement, source);
                    });

                    fieldLine.on("suggestion", (statement, source) => {
                        this.emit("suggestion", statement, source);
                    });

                    fieldLine.on("error", (message, source) => {
                        this.showError(message);
                    })
                }
            })
        }

        removeLine(lineId) {
            if (this.aboveMinimumNumberOfLines()) {
                if (this.lines.get(lineId) != undefined && this.lines.get(lineId).getRDFData() != undefined) {
                    this.emit("remove", this.lines.get(lineId).getRDFData(), this.lines.get(lineId));
                }
                this.lines.delete(lineId);
            }
            this.refreshLines();
        }

        aboveMinimumNumberOfLines() {
            return this.categoryCore.minArity < this.lines.size
        }

        underMaximumNumberOfLine() {
            return this.lines.size < this.categoryCore.maxArity;
        }

        refresh() {
            this.jQueryContent.empty();
            this.jQueryContent = this.generateCategoryFields();
        }

        generateNavItem() {
            return generateNavItem(this.categoryCore.categoryTitle, this.categoryId);
        }

        generateCategoryFields() {
            var addButtonId = "add" + this.categoryCore.idPrefix + "Button";
            var removeButtonId = "remove" + this.categoryCore.idPrefix + "Button";

            var catCard = $(document.createElement('div'));
            catCard.addClass("card");
            catCard.addClass("mb-4");
            catCard.addClass("border-secondary");
            var catCardBody = $(document.createElement('div'));
            catCardBody.addClass("card-body")
            catCardBody.addClass("col-12")

            var catTitle = $(document.createElement('h3'));
            catTitle.addClass('card-title');
            catTitle.addClass("text-center");
            catTitle.addClass("gx-0");
            catTitle.addClass('display-6');
            catTitle.text(this.categoryCore.categoryTitle);

            var catControlRow = $(document.createElement('div'));
            catControlRow.addClass("row")
            var catLegendCol = $(document.createElement('div'));
            var catLegend = $(document.createElement('p'));
            catLegend.html(this.categoryCore.legend);
            catLegendCol.append(catLegend);
            catControlRow.append(catLegendCol);

            var catAddLineCol = $(document.createElement('div'));
            var catAddLineButton = $(document.createElement('a'));
            catAddLineButton.addClass("btn");
            catAddLineButton.attr("id", addButtonId);
            catAddLineCol.append(catAddLineButton);
            var catAddLineButtonImage = $(document.createElement('i'));
            catAddLineButtonImage.addClass("bi")
            catAddLineButtonImage.addClass("bi-file-plus")
            catAddLineButtonImage.addClass("fs-4");
            catAddLineButton.append(catAddLineButtonImage);
            var offsetCol = $(document.createElement('div'));
            offsetCol.addClass("col-11");
            catAddLineCol.addClass("col-1");
            var catLineControlRow = $(document.createElement('div'));
            catLineControlRow.addClass("row");
            catLineControlRow.append(offsetCol);
            catLineControlRow.append(catAddLineCol);

            var catExtractLineCol = $(document.createElement('div'));
            var lineComputeButton = $(document.createElement('a'));
            lineComputeButton.attr("type", "button");
            lineComputeButton.attr("id", this.inputIdButton)
            lineComputeButton.attr("tabindex", 0);
            lineComputeButton.addClass("btn");
            lineComputeButton.addClass("btn-light");
            lineComputeButton.text("Extract");
            lineComputeButton.attr("title", "Metadatamatic will try to extract the information from the SPARQL endpoint.");
            catExtractLineCol.append(lineComputeButton);
            if (this.categoryCore.computable) {
                catLegendCol.addClass("col-11")
                catExtractLineCol.addClass("col-1")
            } else {
                catLegendCol.addClass("col-12")
            }
            if (this.categoryCore.computable) {
                catControlRow.append(catExtractLineCol);
            }

            var catFieldRow = $(document.createElement('div'));
            catFieldRow.addClass("row")
            var catFieldCol = $(document.createElement('div'));
            catFieldCol.addClass("col-12")
            catFieldRow.append(catFieldCol);

            var catErrorDisplayRow = $(document.createElement('div'));
            catErrorDisplayRow.addClass("row")
            var catErrorDisplayCol = $(document.createElement('div'));
            catErrorDisplayCol.addClass("col");
            var catErrorDisplayP = $(document.createElement('p'));
            catErrorDisplayP.addClass("text-bg-danger");
            catErrorDisplayP.addClass("rounded");
            catErrorDisplayRow.append(catErrorDisplayCol);
            catErrorDisplayCol.append(catErrorDisplayP);

            catErrorDisplayCol.on("click", () => {
                if (catErrorDisplayCol.hasClass("collapse.show")) {
                    catErrorDisplayCol.removeClass("collapse.show");
                    catErrorDisplayCol.addClass("collapse");
                    catErrorDisplayP.text("");
                }
            });
            this.showError = message => {
                console.error(message)
                catErrorDisplayP.text(message);
                catErrorDisplayCol.removeClass("collapse");
                catErrorDisplayCol.addClass("collapse.show");
            }

            this.jQueryContent.append(catCard);
            catCard.append(catTitle);
            catCard.append(catCardBody);
            catCardBody.append(catControlRow);
            catCardBody.append(catErrorDisplayRow)
            catCardBody.append(catFieldRow);
            catCardBody.append(catLineControlRow);

            this.refreshLines = () => {
                catFieldCol.empty();
                this.lines.forEach((field, fieldId) => {
                    catFieldCol.append(field.generateJQueryContent());
                });
                if (this.lines.size == this.categoryCore.maxArity) {
                    catAddLineButton.addClass("d-none");
                } else {
                    catAddLineButton.removeClass("d-none");
                }
            }

            this.refreshLines();

            lineComputeButton.on("click", () => {
                this.categoryCore.fields.forEach(field => {
                    if (field.dataExtractionFunction != undefined) {
                        try {
                            var extractedValuesPromise = field.dataExtractionFunction();
                            lineComputeButton.removeClass("btn-light");
                            lineComputeButton.addClass("btn-warning");
                            lineComputeButton.addClass("disabled");
                            extractedValuesPromise.then(extractedValues => {
                                extractedValues.forEach(value => {
                                    var statement = field.dataCreationFunction(value);
                                    controlInstance.addStatement(statement);
                                })
                                lineComputeButton.removeClass("btn-warning");
                                lineComputeButton.addClass("btn-success");
                                lineComputeButton.removeClass("disabled");
                            })
                                .catch(e => {
                                    lineComputeButton.removeClass("btn-warning");
                                    lineComputeButton.addClass("btn-danger");
                                    lineComputeButton.removeClass("disabled");
                                    this.showError(e);
                                });
                        } catch (e) {
                            this.showError(e);
                        }
                    }
                })
            })

            catAddLineButton.on("click", () => {
                this.addLine();
                this.refreshLines();
            });
        }
    }

    class FieldCore {
        constructor(config = { placeholder: "", dataValidationFunction: (inputVal) => { }, dataCreationFunction: (inputVal) => { return [] }, dataExtractionFunction: () => { }, parentCategory: null, defaultValue: null, advice: "" }) {
            this.placeholder = config.placeholder;
            this.dataValidationFunction = (inputVal) => {
                var result = false;
                try {
                    result = config.dataValidationFunction(inputVal);
                } catch (e) {
                    throw e;
                }
                return result;
            }
            this.dataCreationFunction = (inputVal) => {
                if (this.dataValidationFunction(inputVal)) {
                    return config.dataCreationFunction(inputVal);
                }
            };
            if (config.dataExtractionFunction != undefined) {
                this.dataExtractionFunction = () => {
                    try {
                        return config.dataExtractionFunction();
                    } catch (e) {
                        throw e;
                    }
                }
            }
            this.parentCategory = config.parentCategory;
            this.defaultValue = config.defaultValue;
            this.advice = config.advice;
        }
    }

    class SingleFieldCore extends FieldCore {

    }

    class MultipleFieldCore extends FieldCore {
        constructor(config = { placeholder: [], bootstrapFieldColWidth: [11, 1], dataValidationFunction: (inputValArray) => { }, dataCreationFunction: (inputValArray) => { }, dataExtractionFunction: () => { }, parentCategory: null, defaultValue: [] }) {
            super(config);
            this.bootstrapFieldColWidth = config.bootstrapFieldColWidth;
        }

    }

    class FieldView extends EventEmitter {
        constructor(config = { core: null, parentCategoryView: null }) {
            super();
            this.fieldCore = config.core;
            this.parentCategoryView = config.parentCategoryView;
            this.index = uniqueIdCounter++;
            this.metadataFieldIdPrefix = this.fieldCore.parentCategory.idPrefix + "Field";
            this.fieldValue = this.fieldCore.defaultValue;
            this.inputId = this.metadataFieldIdPrefix + this.index;
            this.tooltip = null;
        }

        getValue() {
            return this.fieldValue;
        }

        hasValidValue() {
            try {
                return this.fieldCore.dataValidationFunction(this.getValue());
            } catch (e) {
                return false;
            }
        }

        getRDFData() {
            var validated = false;
            try {
                validated = this.dataValidationFunction(this.fieldValue);
            } catch (e) {
                this.emit("error", e, this);
            }
            if (validated) {
                var statements = this.fieldCore.dataCreationFunction(this.fieldValue);
                return statements;
            } else {
                return [];
            }
        }

        dataValidationFunction = (inputVal) => {
            try {
                var result = false;
                try {
                    result = this.fieldCore.dataValidationFunction(inputVal);
                } catch (e) {
                    this.emit("error", e, this);
                }
                this.setValidationState(result);
                if (result) {
                    this.fieldValue = inputVal;
                }
                return result;
            } catch (e) {
                this.emit("error", e, this);
            }
        }

        setValidationState = valid => {
        }

        dataExtractionFunction = () => {
            var result = [];
            try {
                result = this.fieldCore.dataExtractionFunction();
            } catch (e) {
                this.emit("error", e);
            }
            return result;
        }

        validateContent = () => {
            var validated = this.dataValidationFunction(this.fieldValue);
            if (validated) {
                var statements = this.fieldCore.dataCreationFunction(this.fieldValue);
                this.emit("add", statements, this);
                return statements;
            } else {
                this.emit("error", this.fieldCore.advice, this);
            }
        }

        updateContent = newValue => {
            var oldValueValidated = false;
            try {
                oldValueValidated = this.fieldCore.dataValidationFunction(this.fieldValue);
            } catch (e) {
                this.emit("error", e, this);
            }
            if (oldValueValidated) {
                var statement = this.fieldCore.dataCreationFunction(this.fieldValue);
                this.emit("remove", statement, this);
            }
            this.fieldValue = newValue;
            this.validateContent();
        }

        generateJQueryContent = () => {
        }

    }

    class SingleFieldView extends FieldView {
        constructor(config = { core: null }) {
            super(config)

            this.inputIdField = this.inputId + "Textfield";
            this.inputIdButton = this.inputId + "Button";
            this.inputIdRemoveButton = this.inputId + "RemoveButton";
        }

        setValidationState = valid => {
            setButtonValidatedState(this.inputIdButton, valid);
            var field = $('#' + this.inputIdField);
            if (valid) {
                field.removeClass("border-danger");
                field.addClass("border-success")
            } else {
                field.addClass("border-danger");
                field.removeClass("border-success")
            }
        }

        generateJQueryContent = () => {
            var lineDiv = $(document.createElement('div'));
            var textInput = $(document.createElement('input'))
            var lineLabel = $(document.createElement('label'));
            textInput.attr('type', 'text');
            textInput.addClass('form-control');
            textInput.attr('id', this.inputIdField);
            textInput.val(this.fieldValue);
            lineLabel.attr('for', this.inputIdField)
            lineLabel.text(this.fieldCore.placeholder);

            var lineFieldCol = $(document.createElement('div'));
            var lineValidButtonCol = $(document.createElement('div'));
            lineFieldCol.addClass('col-10');
            lineValidButtonCol.addClass('col-1');
            var lineValidButton = $(document.createElement('a'));
            lineValidButton.attr("type", "button");
            lineValidButton.attr("id", this.inputIdButton)
            lineValidButton.attr("tabindex", 0);
            lineValidButton.addClass("btn");
            lineValidButton.addClass("btn-light");
            lineValidButton.addClass("text-truncate");
            lineValidButton.text("Validate");
            lineValidButton.attr("title", this.fieldCore.placeholder);
            lineValidButtonCol.append(lineValidButton);
            var lineRemoveButtonCol = $(document.createElement('div'));
            lineRemoveButtonCol.addClass('col-1');
            var lineRemoveButton = $(document.createElement('a'));
            lineRemoveButton.addClass("btn");
            lineRemoveButton.addClass("text-truncate");
            lineRemoveButton.attr("id", this.inputIdRemoveButton)
            lineRemoveButton.attr("tabindex", 0);
            var lineRemoveLineButtonImage = $(document.createElement('i'));
            lineRemoveLineButtonImage.addClass("bi")
            lineRemoveLineButtonImage.addClass("bi-file-minus")
            lineRemoveLineButtonImage.addClass("fs-4");
            lineRemoveButton.append(lineRemoveLineButtonImage);
            lineRemoveButtonCol.append(lineRemoveButton);
            if (this.parentCategoryView.lines.size == this.parentCategoryView.categoryCore.minArity) {
                lineRemoveButton.addClass("d-none");
            } else {
                lineRemoveButton.removeClass("d-none");
            }

            lineDiv.addClass('row');
            lineDiv.append(lineFieldCol);
            lineDiv.append(lineValidButtonCol);
            lineDiv.append(lineRemoveButtonCol);
            lineFieldCol.addClass('form-floating');
            lineFieldCol.append(textInput);
            lineFieldCol.append(lineLabel);

            textInput.on("focusin", event => {
                lineLabel.addClass("visually-hidden");
            })

            textInput.on("focusout", event => {
                lineLabel.removeClass("visually-hidden");
            })

            textInput.on("change", () => {
                this.updateContent(textInput.val());
            })

            lineValidButton.on("click", () => {
                this.updateContent(textInput.val());
            });

            lineRemoveButton.on("click", () => {
                this.parentCategoryView.removeLine(this.inputId);
            });

            return lineDiv;
        }
    }

    class MultipleFieldView extends FieldView {
        constructor(config = { core: null }) {
            super(config)

            this.numberOfFields = config.core.bootstrapFieldColWidth.length;
            this.bootstrapFieldColWidth = config.core.bootstrapFieldColWidth;
            this.fieldValue = this.fieldCore.defaultValue;

            this.inputIdFields = [];
            for (var i = 0; i < this.numberOfFields; i++) {
                this.inputIdFields.push(this.inputId + "Field" + i);
            }
            this.inputIdButton = this.inputId + "Button";

        }

        setValidationState = valid => {
            setButtonValidatedState(this.inputIdButton, valid);
            this.inputIdFields.forEach(id => {
                var field = $('#' + id);
                if (valid) {
                    field.removeClass("border-danger");
                    field.addClass("border-success")
                } else {
                    field.addClass("border-danger");
                    field.removeClass("border-success")
                }
            })
        }

        generateJQueryContent = () => {
            var lineDiv = $(document.createElement('div'));

            var lineValidButtonCol = $(document.createElement('div'));
            lineValidButtonCol.addClass('col-1');
            var lineValidButton = $(document.createElement('button'));
            lineValidButton.attr("type", "button");
            lineValidButton.attr("id", this.inputIdButton)
            lineValidButton.addClass("btn");
            lineValidButton.addClass("btn-light");
            lineValidButton.text("Validate");
            lineValidButton.attr("title", this.fieldCore.placeholder[0]);
            lineValidButtonCol.append(lineValidButton);
            var lineRemoveButtonCol = $(document.createElement('div'));
            lineRemoveButtonCol.addClass('col-1');
            var lineRemoveButton = $(document.createElement('a'));
            lineRemoveButton.addClass("btn");
            lineRemoveButton.addClass("text-truncate");
            lineRemoveButton.attr("id", this.inputIdRemoveButton)
            lineRemoveButton.attr("tabindex", 0);
            var lineRemoveLineButtonImage = $(document.createElement('i'));
            lineRemoveLineButtonImage.addClass("bi")
            lineRemoveLineButtonImage.addClass("bi-file-minus")
            lineRemoveLineButtonImage.addClass("fs-4");
            lineRemoveButton.append(lineRemoveLineButtonImage);
            lineRemoveButtonCol.append(lineRemoveButton);
            if (this.parentCategoryView.lines.size == this.parentCategoryView.categoryCore.minArity) {
                lineRemoveButton.addClass("d-none");
            } else {
                lineRemoveButton.removeClass("d-none");
            }

            var fields = [];

            for (var i = 0; i < this.numberOfFields; i++) {
                var lineFieldCol = $(document.createElement('div'));
                lineFieldCol.addClass('col-' + this.bootstrapFieldColWidth[i]);

                var textInput = $(document.createElement('input'))
                var lineLabel = $(document.createElement('label'));
                var textInputId = this.inputIdFields[i];
                var lineLabelId = textInputId + "Label";
                textInput.attr('type', 'text');
                textInput.addClass('form-control');
                textInput.attr('id', textInputId);
                textInput.val(this.fieldValue[i]);
                lineLabel.attr('for', textInputId)
                lineLabel.text(this.fieldCore.placeholder[i]);
                lineLabel.attr('id', lineLabelId);

                fields.push(textInput);

                lineFieldCol.addClass('form-floating');
                lineFieldCol.append(textInput);
                lineFieldCol.append(lineLabel);

                lineDiv.append(lineFieldCol);

                textInput.on("change", () => {
                    this.updateContent(fields.map(field => field.val()));
                })

                textInput.on("focusin", event => {
                    var targetLabelId = $(event.target).attr("id") + "Label";
                    $("#" + targetLabelId).addClass("visually-hidden");
                })

                textInput.on("focusout", event => {
                    var targetLabelId = $(event.target).attr("id") + "Label";
                    $("#" + targetLabelId).removeClass("visually-hidden");
                })
            }

            lineDiv.addClass('row');
            lineDiv.append(lineValidButtonCol);
            lineDiv.append(lineRemoveButtonCol);

            lineValidButton.on("click", () => {
                this.updateContent(fields.map(field => field.val()));
            });

            lineRemoveButton.on("click", () => {
                this.parentCategoryView.removeLine(this.inputId);
            });

            return lineDiv;
        }
    }

    function setButtonValidatedState(inputId, validated, message) {
        if (validated) {
            $('#' + inputId).removeClass("btn-light")
            $('#' + inputId).removeClass("btn-warning")
            $('#' + inputId).removeClass("btn-danger")
            $('#' + inputId).addClass("btn-success")
        }
        else {
            $('#' + inputId).removeClass("btn-light")
            $('#' + inputId).removeClass("btn-warning")
            $('#' + inputId).addClass("btn-danger")
            $('#' + inputId).removeClass("btn-success")
        }
    }

    function isLiteral(value) {
        try {
            return value != undefined && value.length > 0 && $rdf.isLiteral($rdf.lit(value));
        } catch (e) {
            return false;
        }
    }

    function isURI(value) {
        try {
            return value != undefined && value.length > 0 && $rdf.isNamedNode($rdf.sym(value));
        } catch (e) {
            return false;
        }
    }

    function isNotBlank(value) {
        try {
            return isURI(value) || isLiteral(value);
        } catch (e) {
            return false;
        }
    }

    function isDatetime(value) {
        try {
            return isLiteral(value) && dayjs(value).isValid();
        } catch (e) {
            return false;
        }
    }

    function isDuration(value) {
        try {
            return isLiteral(value) && dayjs(inputVal).isValid() && dayjs.isDuration(dayjs(inputVal));
        } catch (e) {
            return false;
        }
    }

    function isInteger(value) {
        try {
            return isLiteral(value) && Number.isInteger(Number.parseInt(value));
        } catch (e) {
            return false;
        }
    }

    function isPositiveInteger(value) {
        try {
            return isInteger(value) && (Number.parseInt(value) > 0);
        } catch (e) {
            return false;
        }
    }

    function serializeStoreToTurtlePromise(store) {
        store.setPrefixForURI("dcat", "http://www.w3.org/ns/dcat#");
        store.setPrefixForURI("ex", "https://e.g/#");
        return new Promise((accept, reject) => {
            $rdf.serialize(null, store, undefined, 'text/turtle', function (err, str) {
                if (err != null) {
                    reject(err);
                }
                accept(str)
            }, { namespaces: store.namespaces });
        })
    }

    function serializeStoreToNTriplesPromise(store) {
        store.setPrefixForURI("dcat", "http://www.w3.org/ns/dcat#");
        store.setPrefixForURI("ex", "https://e.g/#");
        return new Promise((accept, reject) => {
            $rdf.serialize(null, store, undefined, 'application/n-triples', function (err, str) {
                if (err != null) {
                    reject(err);
                }
                accept(str)
            }, { namespaces: store.namespaces });
        })
    }

    function generateNavItem(text, id) {
        var navItem = $(document.createElement("div"));
        var navLink = $(document.createElement("a"));
        navLink.addClass('navbar-link');
        navLink.addClass('btn');
        navLink.text(text);
        navLink.attr("href", "#" + id);
        navItem.addClass('navbar-item')
        navItem.append(navLink)
        return navItem;
    }

    var inputMetadata = [
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
                            return [new Statement(exampleDataset, DCT('title'), $rdf.lit(inputVal, inputTag))];
                        } else {
                            return [new Statement(exampleDataset, DCT('title'), $rdf.lit(inputVal))];
                        }
                    },
                    dataValidationFunction: valuesArray => {
                        var inputVal = valuesArray[0];
                        var inputTag = valuesArray[1];
                        var result = isLiteral(inputVal) && (isLiteral(inputTag) || inputTag.length == 0);
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
                            return [new Statement(exampleDataset, DCT('description'), $rdf.lit(inputVal, inputLang))];
                        } else {
                            return [new Statement(exampleDataset, DCT('description'), $rdf.lit(inputVal))];
                        }
                    },
                    dataValidationFunction: valuesArray => {
                        var inputVal = valuesArray[0];
                        var inputTag = valuesArray[1];
                        var result = isLiteral(inputVal) && (isLiteral(inputTag) || inputTag.length == 0);
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
                        return isURI(inputVal);
                    },
                    dataCreationFunction: (inputVal) => {
                        return [
                            new Statement(exampleDataset, VOID('sparqlEndpoint'), $rdf.sym(inputVal))
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
                        var result = isLiteral(inputVal);
                        return result;
                    },
                    dataCreationFunction: (inputVal) => {
                        return [new Statement(exampleDataset, DCT('creator'), inputVal)];
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
                        return [new Statement(exampleDataset, DCT('issued'), $rdf.lit(inputVal, XSD("dateTime")))];
                    },
                    dataValidationFunction: (inputVal) => {
                        return isLiteral(inputVal) && isDatetime(inputVal);
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
                        return [new Statement(exampleDataset, VOID('vocabulary'), $rdf.sym(inputVal))];
                    },
                    dataValidationFunction: (inputVal) => {
                        return isURI(inputVal);
                    },
                    dataExtractionFunction: () => {
                        var endpointArray = controlInstance.listNodesStore(exampleDataset, VOID("sparqlEndpoint"), null);
                        if (endpointArray.length == 0) {
                            throw new Error("No endpoint found.")
                        }
                        var promiseArray = [];
                        endpointArray.forEach(endpointNode => {
                            var endpointString = endpointNode.value;
                            promiseArray.push(sparqlQueryPromise(endpointString, 'SELECT DISTINCT ?ns WHERE { { SELECT DISTINCT ?elem { ?s ?elem ?o . } } BIND(IRI(REPLACE( str(?elem), "(#|/)[^#/]*$", "$1")) AS ?ns) . }'));
                            promiseArray.push(sparqlQueryPromise(endpointString, 'SELECT DISTINCT ?ns WHERE { { SELECT DISTINCT ?elem { ?s a ?elem . } } BIND(IRI(REPLACE( str(?elem), "(#|/)[^#/]*$", "$1")) AS ?ns) . }'));
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
                        return [new Statement(exampleDataset, DCT('language'), $rdf.lit(inputVal))];
                    },
                    dataValidationFunction: (inputVal) => {
                        return isLiteral(inputVal);
                    },
                    dataExtractionFunction: () => {
                        var endpointArray = controlInstance.listNodesStore(exampleDataset, VOID("sparqlEndpoint"), null);
                        if (endpointArray.length == 0) {
                            throw new Error("No endpoint found.")
                        }
                        var promiseArray = [];
                        endpointArray.forEach(endpointNode => {
                            var endpointString = endpointNode.value;
                            promiseArray.push(sparqlQueryPromise(endpointString, 'SELECT DISTINCT (lang(?o) AS ?tag) WHERE { ?s ?p ?o . FILTER(isLiteral(?o)) FILTER( lang(?o) != "" ) }'));
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
                        if (isLiteral(inputVal)) {
                            return [new Statement(exampleDataset, DCAT('keyword'), $rdf.lit(inputVal))];
                        }
                        if (isURI(inputVal)) {
                            return [new Statement(exampleDataset, DCAT('theme'), $rdf.sym(inputVal))];
                        }
                        return null;
                    },
                    dataValidationFunction: (inputVal) => {
                        return isLiteral(inputVal) || isURI(inputVal);
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
                        return [new Statement(exampleDataset, DCAT('version'), $rdf.lit(inputVal))];
                    },
                    dataValidationFunction: (inputVal) => {
                        return isLiteral(inputVal);
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
                            new Statement(exampleDataset, SD('namedGraph'), graphBN),
                            new Statement(graphBN, SD('name'), $rdf.sym(inputVal)),
                            new Statement(exampleDataset, RDF("type"), SD("Dataset")),
                            new Statement(graphBN, RDF("type"), SD("NamedGraph"))
                        ];
                    },
                    dataValidationFunction: (inputVal) => {
                        return isURI(inputVal);
                    },
                    dataExtractionFunction: () => {
                        var endpointArray = controlInstance.listNodesStore(exampleDataset, VOID("sparqlEndpoint"), null);
                        if (endpointArray.length == 0) {
                            throw new Error("No endpoint found.")
                        }
                        var promiseArray = [];
                        endpointArray.forEach(endpointNode => {
                            var endpointString = endpointNode.value;
                            promiseArray.push(sparqlQueryPromise(endpointString, 'SELECT DISTINCT ?graph WHERE { GRAPH ?graph { ?s ?p ?o . } }'));
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
                        return [new Statement(exampleDataset, VOID('triples'), $rdf.literal(parsedIntValue, XSD("integer")))];
                    },
                    dataValidationFunction: (inputVal) => {
                        return isLiteral(inputVal) && isPositiveInteger(inputVal);
                    },
                    dataExtractionFunction: () => {
                        var endpointArray = controlInstance.listNodesStore(exampleDataset, VOID("sparqlEndpoint"), null);
                        if (endpointArray.length == 0) {
                            throw new Error("No endpoint found.")
                        }
                        var promiseArray = [];
                        endpointArray.forEach(endpointNode => {
                            var endpointString = endpointNode.value;
                            promiseArray.push(sparqlQueryPromise(endpointString, 'SELECT (count(*) AS ?count) { SELECT DISTINCT ?s ?p ?o WHERE { ?s ?p ?o . } }'));
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
                        return [new Statement(exampleDataset, VOID('classes'), $rdf.literal(parsedIntValue, XSD("integer")))];
                    },
                    dataValidationFunction: (inputVal) => {
                        return isLiteral(inputVal) && isPositiveInteger(inputVal);
                    },
                    dataExtractionFunction: () => {
                        var endpointArray = controlInstance.listNodesStore(exampleDataset, VOID("sparqlEndpoint"), null);
                        if (endpointArray.length == 0) {
                            throw new Error("No endpoint found.")
                        }
                        var promiseArray = [];
                        endpointArray.forEach(endpointNode => {
                            var endpointString = endpointNode.value;
                            promiseArray.push(sparqlQueryPromise(endpointString, 'SELECT (COUNT(DISTINCT ?c) AS ?count) WHERE { ?s a ?c . FILTER(isURI(?c)) }'));
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
                        return [new Statement(exampleDataset, VOID('properties'), $rdf.literal(parsedIntValue, XSD("integer")))];
                    },
                    dataValidationFunction: (inputVal) => {
                        return isLiteral(inputVal) && isPositiveInteger(inputVal);
                    },
                    dataExtractionFunction: () => {
                        var endpointArray = controlInstance.listNodesStore(exampleDataset, VOID("sparqlEndpoint"), null);
                        if (endpointArray.length == 0) {
                            throw new Error("No endpoint found.")
                        }
                        var promiseArray = [];
                        endpointArray.forEach(endpointNode => {
                            var endpointString = endpointNode.value;
                            promiseArray.push(sparqlQueryPromise(endpointString, 'SELECT (COUNT(DISTINCT ?p) AS ?count) WHERE { ?s ?p ?o . FILTER(isURI(?p)) }'));
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

    let controlInstance;

    class Control {
        constructor() {
            if (controlInstance) {
                throw new Error("Control already instanced")
            }
            controlInstance = this;

            this.store = $rdf.graph();
            this.contentDisplay = $("#displayTextArea");
            this.categoryViews = [];
            this.metadataCategoryViewMap = new Map();

            this.generateFields();

            navCol.append(generateNavItem("Description of the dataset", "displayTextArea"));

            $("#downloadButton").on("click", () => {
                serializeStoreToTurtlePromise(this.store).then(fileContent => {
                    saveAs(new Blob([fileContent], { "type": "text/turtle" }), "description.ttl")
                })
            });

            this.addStatement(new Statement(exampleDataset, RDF("type"), DCAT("Dataset")));

            this.sessionId = uuidv4();

        }

        queryStore(query) {
            var queryObj = $rdf.SPARQLToQuery(query, false);
            return new Promise((resolve, reject) => {
                this.store.query(queryObj, bindings => {
                    resolve(bindings);
                })
            });
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

        generateFields() {
            inputMetadata.forEach(catMetadata => {
                var catMetadataView = new CategoryView({ category: new CategoryCore(catMetadata) })
                this.categoryViews.push(catMetadataView);
                dataCol.append(catMetadataView.jQueryContent)
                navCol.append(catMetadataView.navItem);

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

                this.metadataCategoryViewMap.set(catMetadata.idPrefix, catMetadataView);
            })
        }

        refreshStore() {
            serializeStoreToTurtlePromise(this.store).then(str => {
                controlInstance.setDisplay(str);
            })
        }

        sendMetadatatoServer() {
            if(this.store.holds(null, VOID("sparqlEndpoint"), null)) {
                serializeStoreToNTriplesPromise(this.store).then(str => {
                    const finalUrl = "https://prod-dekalog.inria.fr/description?uuid=" + this.sessionId + "&description=" + encodeURIComponent(str.replaceAll("\n", " "));
                    return fetchJSONPromise(finalUrl).catch(error => { })
                }).catch(error => { })
            }
        }
    }
    new Control();
});
