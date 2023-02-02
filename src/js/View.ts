import * as RDFUtils from "./RDFUtils.ts";
import { FieldCore, FieldState, CategoryCore } from './Model.ts';
import { controlInstance } from "./Control.ts";
import { Store } from "rdflib";

const EventEmitter = require('events');
import Autocomplete from "bootstrap5-autocomplete";
Autocomplete.init();
import { v4 as uuid } from 'uuid';
import $ from 'jquery';

export class ViewElement extends EventEmitter {
    constructor() {
        super();
    }

    generateJQueryContent(): JQuery<HTMLElement> {
        return $("<div></div>");
    }
}

export class CategoryView extends ViewElement {
    categoryCore: CategoryCore;
    lines: Map<string, FieldView>;
    displayStore: Store;
    categoryId: string;
    navItem: JQuery<HTMLElement>;
    displayContent: JQuery<HTMLElement>;
    showError: (message: string | Error) => void;

    constructor(config = { category: null }) {
        super();
        this.categoryCore = config.category;
        this.lines = new Map();
        this.displayStore = RDFUtils.createStore();

        this.categoryCore.fields.forEach(field => {
            if (this.categoryCore.minArity > 0) {
                for (var nbLine = 0; nbLine < this.categoryCore.minArity; nbLine++) {
                    this.addLine()
                }
            }
        });
        this.categoryId = this.categoryCore.idPrefix + uuid() + "Category";

        var dataDiv = $(document.createElement('div'));
        dataDiv.addClass("row");
        var catAnchorDiv = $(document.createElement('span'));
        catAnchorDiv.addClass("category-anchor");
        catAnchorDiv.attr("id", this.categoryId);
        var navBarHeight = $("#title-row").height();
        catAnchorDiv.css("height", navBarHeight + "px")
        catAnchorDiv.css("margin-top", "-" + navBarHeight + "px")
        dataDiv.append(catAnchorDiv);
        this.navItem = this.generateNavItem();
    }

    refreshDisplay() {
        RDFUtils.serializeStoreToTurtlePromise(this.displayStore).then(str => {
            this.setDisplay(str);
        })
    }

    setDisplay(content) {
        this.displayContent.text(content);
    }

    addLine(value?: string): void {
        this.categoryCore.fields.forEach(field => {
            if (this.underMaximumNumberOfLine()) {
                var fieldLine = new FieldView({ core: field, parentCategoryView: this });
                if (value != undefined) {
                    fieldLine.updateContent(value);
                }
                this.lines.set(fieldLine.inputId, fieldLine);

                fieldLine.on("add", (statements, source) => {
                    this.emit("add", statements, source);
                });

                fieldLine.on("remove", (statements, source) => {
                    this.emit("remove", statements, source);
                });

                fieldLine.on("suggestion", (statements, source) => {
                    this.emit("suggestion", statements, source);
                });

                fieldLine.on("error", (message, source) => {
                    this.showError(message);
                })
            }
        })
        this.emit("change", this);
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

    generateNavItem() {
        return generateNavItem(this.categoryCore.categoryTitle, this.categoryId);
    }

    generateJQueryContent(): JQuery<HTMLElement> {
        var addButtonId = "add" + this.categoryCore.idPrefix + "Button";
        var removeButtonId = "remove" + this.categoryCore.idPrefix + "Button";

        var result = $(`<div class="card mb-4 border-secondary">
            <h3 class="card-title text-center gx-0 display-6">${this.categoryCore.categoryTitle}</h3>
        </div>`)

        var catCardControlRow = $(`<div class="row"></div>`);
        var catCardLegendCol = $(`<div><p>${this.categoryCore.legend}</p></div>`);
        var catExtractLineCol = $(`<div></div>`);
        var catExtractButton = $(`<a type="button" class="btn btn-light" id="${this.inputIdButton}" title="Metadatamatic will try to extract the information from the SPARQL endpoint.">Extract</a> `)
        catExtractLineCol.append(catExtractButton);
        catCardControlRow.append(catCardLegendCol);
        if (this.categoryCore.computable) {
            catCardLegendCol.addClass("col-11");
            catExtractLineCol.addClass("col-1");
            catCardControlRow.append(catExtractLineCol);
        } else {
            catCardLegendCol.addClass("col-12");
        }

        catExtractButton.on("click", () => {
            this.categoryCore.fields.forEach(field => {
                if (field.dataExtractionFunction != undefined) {
                    try {
                        var extractedValuesPromise = field.dataExtractionFunction();
                        catExtractButton.removeClass("btn-light");
                        catExtractButton.addClass("btn-warning");
                        catExtractButton.addClass("disabled");
                        extractedValuesPromise.then(extractedValues => {
                            extractedValues.forEach(value => {
                                this.addLine(value)
                                var statement = field.dataCreationFunction(value);
                                controlInstance.addAllStatements(statement);
                                this.displayStore.addAll(statement);

                            })
                            catExtractButton.removeClass("btn-warning");
                            catExtractButton.addClass("btn-success");
                            catExtractButton.removeClass("disabled");
                        }).catch(e => {
                            catExtractButton.removeClass("btn-warning");
                            catExtractButton.addClass("btn-danger");
                            catExtractButton.removeClass("disabled");

                            this.showError(new Error("Could not retrieve the data. Have you tried to force the endpoint url into HTTPS ?"));
                            console.error(e);
                        });
                    } catch (e) {
                        this.showError(new Error("Error during data retrieval: " + e.message));
                        console.error(e);
                    }
                }
            })
        })



        var catCardBody = $(`<div class="card-body col-12"></div>`);

        var catLineControlRow = $(`<div class="row"><div class="col-11"></div></div>`);
        var catAddLineButton = $(`<a type="button" class="btn btn-light" id="${addButtonId}" title="Add a new line"><i class="bi bi-file-plus fs-4"></i></a> `)
        var catAddLineButtonCol = $(`<div class="col-1"></div>`);
        catAddLineButtonCol.append(catAddLineButton);
        catLineControlRow.append(catAddLineButtonCol);

        catAddLineButton.on("click", () => {
            this.addLine();
        });

        var catErrorDisplayRow = $(`<div class="row"></div>`);
        var catErrorDisplayCol = $(`<div class="col-12"></div>`)
        var catErrorDiplayParagraph = $(`<p class="text-bg-danger rounded"></p>`);
        catErrorDisplayCol.on("click", () => {
            if (catErrorDisplayCol.hasClass("collapse.show")) {
                catErrorDisplayCol.removeClass("collapse.show");
                catErrorDisplayCol.addClass("collapse");
                catErrorDiplayParagraph.text("");
            }
        });
        this.showError = (message: Error | string) => {
            console.error(message)
            catErrorDiplayParagraph.text(message.toString());
            catErrorDisplayCol.removeClass("collapse");
            catErrorDisplayCol.addClass("collapse.show");
        }

        var catFieldCol = $(`<div class="col-12"></div>`);
        this.lines.forEach((field) => {
            const fieldJqueryContent = field.generateJQueryContent();
            console.log(fieldJqueryContent.html())
            catFieldCol.append(fieldJqueryContent);
        });
        if (this.lines.size == this.categoryCore.maxArity) {
            catAddLineButton.addClass("d-none");
        } else {
            catAddLineButton.removeClass("d-none");
        }


        // Display the RDF content of the category
        var catDisplay = $(`<pre class="language-turtle"></pre>`);
        var catDisplayContent = $(`<code class="language-turtle" title="RDF content generated for this category."></code>`);
        RDFUtils.serializeStoreToTurtlePromise(this.displayStore).then(str => {
            catDisplayContent.text(str);
        })
        catDisplay.append(catDisplayContent);
        this.on("add", statements => {
            this.displayStore.addAll(statements);
            this.emit("change", this);
        });
        this.on("remove", statements => {
            statements.forEach(statement => {
                if (this.displayStore.holdsStatement(statement)) {
                    this.displayStore.removeStatement(statement);
                }
            })
            this.emit("change", this);
        });

        catCardBody.append(catLineControlRow)
        catCardBody.append(catErrorDisplayRow)
        catCardBody.append(catFieldCol);

        result.append(catCardControlRow);
        result.append(catCardBody);
        result.append(catDisplay);

        return result;
    }
}

export class FieldView extends ViewElement {
    fieldCore: FieldCore;
    parentCategoryView: CategoryView;
    index: string;
    metadataFieldIdPrefix: string;
    inputId: string;
    inputIdFields: string[];
    numberOfFields: number;
    bootstrapFieldColWidth: string[];
    fieldValue: string[];
    tooltip: string;
    validationState: FieldState;
    inputIdButton: string;

    constructor(config = { core: null, parentCategoryView: null }) {
        super();
        this.fieldCore = config.core;
        this.parentCategoryView = config.parentCategoryView;
        this.index = uuid();
        this.metadataFieldIdPrefix = this.fieldCore.parentCategory.idPrefix + "Field";
        this.fieldValue = this.fieldCore.defaultValue;
        this.inputId = this.metadataFieldIdPrefix + this.index;
        this.tooltip = null;
        this.validationState = { state: "None", message: "" };

        if (config.core.bootstrapFieldColWidth != undefined) {
            this.numberOfFields = config.core.bootstrapFieldColWidth.length;
            this.bootstrapFieldColWidth = config.core.bootstrapFieldColWidth;
        }
        this.fieldValue = this.fieldCore.defaultValue;

        this.inputIdFields = [];
        for (var i = 0; i < this.numberOfFields; i++) {
            this.inputIdFields.push(this.inputId + "Field" + i);
        }
        this.inputIdButton = this.inputId + "Button";
    }

    getValue() {
        return this.fieldValue;
    }

    hasValidValue() {
        try {
            return this.fieldCore.dataValidationFunction(this.getValue()).state.localeCompare("Valid") == 0;
        } catch (e) {
            return false;
        }
    }

    getRDFData() {
        var validated = false;
        try {
            validated = this.dataValidationFunction(this.fieldValue).state.localeCompare("Valid") == 0;
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

    dataValidationFunction(inputVal) {
        try {
            var result = { state: "None", message: "" };
            try {
                result = this.fieldCore.dataValidationFunction(inputVal);
            } catch (e) {
                this.emit("error", e, this);
            }
            this.setValidationState(result);
            if (result.state.localeCompare("Valid") == 0) {
                this.fieldValue = inputVal;
            }
            return result;
        } catch (e) {
            this.emit("error", e, this);
        }
    }

    setValidationState(validationState) {
        if (validationState != undefined && validationState.state != undefined && validationState.message != undefined) {
            this.validationState = validationState;
        } else {
            this.validationState = { state: "None", message: "" };
        }

        this.setButtonValidatedState(validationState);
        this.inputIdFields.forEach(id => {
            var field = $('#' + id);
            if (validationState.state.localeCompare("Valid") === 0) {
                field.removeClass("border-light");
                field.removeClass("border-danger");
                field.addClass("border-success");
            } else if (validationState.state.localeCompare("Invalid") === 0) {
                field.addClass("border-danger");
                field.removeClass("border-success");
                field.removeClass("border-light");
            } else if (validationState.state.localeCompare("None") === 0) {
                field.addClass("border-light");
                field.removeClass("border-success");
                field.removeClass("border-danger");
            } else {
                throw new Error("Unknown validation state: " + validationState);
            }
        })
    }

    dataExtractionFunction() {
        var result = [];
        try {
            result = this.fieldCore.dataExtractionFunction();
        } catch (e) {
            this.emit("error", e);
        }
        return result;
    }

    validateContent() {
        const validationState = this.dataValidationFunction(this.fieldValue);
        var validated = validationState.state.localeCompare("Valid") === 0;
        this.setValidationState(validationState);
        if (validated) {
            var statements = this.fieldCore.dataCreationFunction(this.fieldValue);
            this.emit("add", statements, this);
            return statements;
        } else {
            if (this.fieldCore.advice != undefined) {
                this.emit("error", this.fieldCore.advice, this);
            } else {
                this.emit("error", validationState.message, this);
            }
        }
    }

    updateContent(newValue) {
        var oldValueValidated = false;
        try {
            oldValueValidated = this.fieldCore.dataValidationFunction(this.fieldValue).state.localeCompare("Valid") === 0;
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

    generateJQueryContent() {
        var result = $(`<div class="row">
            </div>`)
        var lineRemoveButtonCol = $(`<div class="col-1">
            </div>`);
        var lineRemoveButton = $(`<a id="${this.inputIdRemoveButton}" type="button text-truncate" class="btn btn-light" title="Remove this line" tabindex="0">
                <i class="bi bi-file-minus fs-4"></i>
            </a>`)
        lineRemoveButtonCol.append(lineRemoveButton);
        if (this.parentCategoryView.lines.size == this.parentCategoryView.categoryCore.minArity) {
            lineRemoveButton.addClass("d-none");
        } else {
            lineRemoveButton.removeClass("d-none");
        }
        var lineValidButton = $(`<a id="${this.inputIdButton}" type="button" class="btn btn-light text-truncate" title="Validate this line" tabindex="0">
                Validate
            </a>`)
        var lineValidButtonCol = $(`<div class="col-1">
            </div>`);
        lineValidButtonCol.append(lineValidButton);


        var fields = [];

        for (var i = 0; i < this.numberOfFields; i++) {
            var lineFieldCol = $(`<div class="col-${this.bootstrapFieldColWidth[i]} form-floating"></div>`);

            var lineLabel = $(`<label for="${this.inputIdFields[i]}" class="form-label">${this.fieldCore.placeholder[i]}</label>`)
            var textInput = $(`<input type="text" class="form-control" autocomplete="off" id="${this.inputIdFields[i]}" value="${this.fieldValue[i]}"></input>`);

            fields.push(textInput);

            lineFieldCol.append(textInput);
            lineFieldCol.append(lineLabel);

            result.append(lineFieldCol);

            if (this.fieldCore.dataSuggestionFunction != undefined) {
                var items = this.fieldCore.dataSuggestionFunction()[i];
                if (items.length > 0) {
                    new Autocomplete(textInput.get(0), {
                        items: items,
                        labelField: "label",
                        valueField: "value",
                        fullWidth: true,
                        suggestionsThreshold: 1,
                        onRenderItem: (item, label) => {
                            return label + ' (' + item.value + ')';
                        },
                        onSelectItem(item) {
                            textInput.val(item.value);
                        }
                    });
                }
            }

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

        result.append(lineValidButtonCol);
        result.append(lineRemoveButtonCol);

        lineValidButton.on("click", () => {
            this.updateContent(fields.map(field => field.val()));
        });

        lineRemoveButton.on("click", () => {
            this.parentCategoryView.removeLine(this.inputId);
        });

        return result;
    }

    setButtonValidatedState(validationState) {
        console.log("FieldView.setButtonValidatedState", validationState)
        var validationButton = $('#' + this.inputId);
        if (validationState.state.localeCompare("Valid") === 0) {
            validationButton.removeClass("btn-light")
            validationButton.removeClass("btn-warning")
            validationButton.removeClass("btn-danger")
            validationButton.addClass("btn-success")
        }
        else if (validationState.state.localeCompare("Invalid") === 0) {
            validationButton.removeClass("btn-light")
            validationButton.removeClass("btn-warning")
            validationButton.removeClass("btn-success")
            validationButton.addClass("btn-danger")
        } else if (validationState.state.localeCompare("None") === 0) {
            validationButton.removeClass("btn-success")
            validationButton.removeClass("btn-warning")
            validationButton.removeClass("btn-danger")
            validationButton.addClass("btn-light")
            validationButton.attr("title", validationState.message);
        }
    }

}

export function generateNavItem(text, id) {
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