import * as RDFUtils from "./RDFUtils.ts";
import { FieldCore, FieldState, CategoryCore, CoreElement } from './Model.ts';
import { controlInstance } from "./Control.ts";
import { Store } from "rdflib";

const EventEmitter = require('events');
import Autocomplete from "bootstrap5-autocomplete";
Autocomplete.init();
import { v4 as uuid } from 'uuid';
import $ from 'jquery';

export class ViewElement extends EventEmitter {
    JQueryContentContainer: JQuery<HTMLElement>;
    coreElement: CoreElement;

    constructor() {
        super();
        this.JQueryContentContainer = $(`<div class="row"></div>`)
    }

    render(): JQuery<HTMLElement> {
        this.JQueryContentContainer.empty();
        var content = this.generateJQueryContent();
        content.forEach(element => {
            this.JQueryContentContainer.append(element);
        });
        return this.JQueryContentContainer;
    }

    refresh(): void {
        this.JQueryContentContainer.empty();
        this.JQueryContentContainer.append(this.generateJQueryContent());
    }

    generateJQueryContent(): JQuery<HTMLElement>[] {
        return [$("<div></div>")];
    }
}

export class CategoryView extends ViewElement {
    lines: Map<string, FieldView>;
    displayStore: Store;
    categoryId: string;
    navItem: JQuery<HTMLElement>;
    catDisplayContent: JQuery<HTMLElement>;
    showError: (message: string | Error) => void;

    constructor(config = { category: null }) {
        super();
        this.coreElement = config.category;
        this.lines = new Map();
        this.displayStore = RDFUtils.createStore();

        this.coreElement.fields.forEach(field => {
            if (this.coreElement.minArity > 0) {
                for (var nbLine = 0; nbLine < this.coreElement.minArity; nbLine++) {
                    this.addLine()
                }
            }
        });
        this.categoryId = this.coreElement.idPrefix + uuid() + "Category";
        this.JQueryContentContainer = $(`<div class="card mb-4 border-secondary col-12"></div>`);
    }

    refreshDisplay() {
        RDFUtils.serializeStoreToTurtlePromise(this.displayStore).then(str => {
            this.setDisplay(str);
        })
    }

    setDisplay(content: string) {
        this.catDisplayContent.text(content);
    }

    addLine(value?: string): void {
        if (this.underMaximumNumberOfLine()) {
            this.coreElement.fields.forEach(field => {
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
            })
        }
    }

    removeLine(lineId) {
        if (this.aboveMinimumNumberOfLines()) {
            if (this.lines.get(lineId) != undefined && this.lines.get(lineId).getRDFData() != undefined) {
                this.emit("remove", this.lines.get(lineId).getRDFData(), this.lines.get(lineId));
            }
            this.lines.delete(lineId);
        }
    }

    aboveMinimumNumberOfLines() {
        return this.coreElement.minArity < this.lines.size
    }

    underMaximumNumberOfLine() {
        return this.lines.size < this.coreElement.maxArity;
    }

    generateNavItem() {
        var navItem = $(`<div class="navbar-item"><a class="navbar-link btn" href="${"#" + this.categoryId}">${this.coreElement.categoryTitle}</a></div>`);
        return navItem;
    }

    render(): JQuery<HTMLElement> {
        var result = $(`<div class="row" id="${this.categoryContentId}"></div>`);

        // Anchor for the navigation bar
        var catAnchorDiv = $(`<span class="category-anchor" id="${this.categoryId}"></span>`);
        var navBarHeight = $("#title-row").height();
        catAnchorDiv.css("height", navBarHeight + "px")
        catAnchorDiv.css("margin-top", "-" + navBarHeight + "px")
        this.navItem = this.generateNavItem();

        result.append(catAnchorDiv);

        // Removing and re-rendering the category content
        const content = this.generateJQueryContent();
        this.JQueryContentContainer.empty();
        content.forEach(element => {
            this.JQueryContentContainer.append(element);
        });
        result.append(this.JQueryContentContainer);

        return result;
    }

    generateJQueryContent(): JQuery<HTMLElement>[] {
        var addButtonId = "add" + this.coreElement.idPrefix + "Button";

        var result = [];

        const catCardHeader = $(`<h3 class="card-title text-center gx-0 display-6">${this.coreElement.categoryTitle}</h3>`)

        // Legend and extract button
        var catCardControlRow = $(`<div class="row"></div>`);
        var catCardLegendCol = $(`<div><p>${this.coreElement.legend}</p></div>`);
        var catExtractLineCol = $(`<div></div>`);
        var catExtractButton = $(`<a type="button" class="btn btn-light" id="${this.inputIdButton}" title="Metadatamatic will try to extract the information from the SPARQL endpoint.">Extract</a> `)
        catExtractLineCol.append(catExtractButton);
        catCardControlRow.append(catCardLegendCol);
        if (this.coreElement.computable) {
            catCardLegendCol.addClass("col-11");
            catExtractLineCol.addClass("col-1");
            catCardControlRow.append(catExtractLineCol);
        } else {
            catCardLegendCol.addClass("col-12");
        }

        catExtractButton.on("click", () => {
            this.coreElement.fields.forEach(field => {
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


        // Add button
        var catCardBody = $(`<div class="card-body col-12"></div>`);

        var catLineControlRow = $(`<div class="row"><div class="col-11"></div></div>`);
        var catAddLineButton = $(`<a type="button" class="btn btn-light" id="${addButtonId}" title="Add a new line"><i class="bi bi-file-plus fs-4"></i></a> `)
        var catAddLineButtonCol = $(`<div class="col-1"></div>`);
        catAddLineButtonCol.append(catAddLineButton);
        catLineControlRow.append(catAddLineButtonCol);

        catAddLineButton.on("click", () => {
            this.addLine();
            this.refresh();
        });

        // Error display
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

        // Fields
        var catFieldCol = $(`<div class="row"></div>`);
        this.lines.forEach((field, id) => {
            const fieldJqueryContent = field.render();
            catFieldCol.append(fieldJqueryContent);
        });
        if (this.lines.size == this.coreElement.maxArity) {
            catAddLineButton.addClass("d-none");
        } else {
            catAddLineButton.removeClass("d-none");
        }


        // Display the RDF content of the category
        var catDisplay = $(`<pre class="language-turtle"></pre>`);
        this.catDisplayContent = $(`<code class="language-turtle" title="RDF content generated for this category."></code>`);
        RDFUtils.serializeStoreToTurtlePromise(this.displayStore).then(str => {
            this.catDisplayContent.text(str);
        })
        catDisplay.append(this.catDisplayContent);
        this.on("add", statements => {
            this.displayStore.addAll(statements);
            this.refreshDisplay();
        });
        this.on("remove", statements => {
            statements.forEach(statement => {
                if (this.displayStore.holdsStatement(statement)) {
                    this.displayStore.removeStatement(statement);
                }
            })
            this.refreshDisplay();
        });

        catCardBody.append(catLineControlRow)
        catCardBody.append(catErrorDisplayRow)
        catCardBody.append(catFieldCol);

        result.push(catCardHeader);
        result.push(catCardControlRow);
        result.push(catCardBody);
        result.push(catDisplay);

        return result;
    }
}

export class FieldView extends ViewElement {
    parentCategoryView: CategoryView;
    index: string;
    metadataFieldIdPrefix: string;
    inputId: string;
    inputIdFields: string[];
    numberOfFields: number;
    bootstrapFieldColWidth: number[];
    fieldValue: string[];
    tooltip: string;
    validationState: FieldState;
    inputIdButton: string;

    constructor(config = { core: null, parentCategoryView: null }) {
        super();
        this.coreElement = config.core;
        this.parentCategoryView = config.parentCategoryView;
        this.index = uuid();
        this.metadataFieldIdPrefix = this.coreElement.parentCategory.idPrefix + "Field";
        this.fieldValue = this.coreElement.defaultValue;
        this.inputId = this.metadataFieldIdPrefix + this.index;
        this.tooltip = null;
        this.validationState = FieldState.none();

        if (config.core.bootstrapFieldColWidth != undefined) {
            this.bootstrapFieldColWidth = config.core.bootstrapFieldColWidth;
        } else {
            this.bootstrapFieldColWidth = [10];
        }
        this.numberOfFields = this.bootstrapFieldColWidth.length;
        this.fieldValue = this.coreElement.defaultValue;

        this.inputIdFields = [];
        for (var i = 0; i < this.numberOfFields; i++) {
            this.inputIdFields.push(this.inputId + "Field" + i);
        }
        this.inputIdButton = this.inputId + "Button";

        this.JQueryContentContainer = $(`<div class="row"></div>`)
    }

    getValue() {
        return this.fieldValue;
    }

    hasValidValue() {
        try {
            return FieldState.isValid(this.coreElement.dataValidationFunction(this.getValue()));
        } catch (e) {
            this.emit("error", e, this);
            return false;
        }
    }

    getRDFData() {
        var validated = this.hasValidValue();
        if (validated) {
            var statements = this.coreElement.dataCreationFunction(this.fieldValue);
            return statements;
        } else {
            return [];
        }
    }

    setValidationState(validationState: FieldState) {
        console.log("setValidationState", this.inputId)
        if (validationState != undefined && validationState.state != undefined && validationState.message != undefined) {
            this.validationState = validationState;
        } else {
            this.validationState = FieldState.none();
        }
    }

    setViewValidationState(validationState?: FieldState) {
        console.log("setViewValidationState", this.inputId)
        if (validationState == undefined) {
            validationState = this.validationState;
        }

        var validationButton = $('#' + this.inputIdButton);
        validationButton.attr("title", validationState.message);
        if (FieldState.isValid(validationState)) {
            validationButton.removeClass("btn-light")
            validationButton.removeClass("btn-warning")
            validationButton.removeClass("btn-danger")
            validationButton.addClass("btn-success")
            this.inputIdFields.forEach(id => {
                var field = $('#' + id);
                field.removeClass("border-light");
                field.removeClass("border-danger");
                field.addClass("border-success");
            })
        }
        else if (FieldState.isInvalid(validationState)) {
            validationButton.removeClass("btn-light")
            validationButton.removeClass("btn-warning")
            validationButton.removeClass("btn-success")
            validationButton.addClass("btn-danger")
            this.inputIdFields.forEach(id => {
                var field = $('#' + id);
                field.addClass("border-danger");
                field.removeClass("border-success");
                field.removeClass("border-light");
            })
        } else if (FieldState.isNone(validationState)) {
            validationButton.removeClass("btn-success")
            validationButton.removeClass("btn-warning")
            validationButton.removeClass("btn-danger")
            validationButton.addClass("btn-light")
            this.inputIdFields.forEach(id => {
                var field = $('#' + id);
                field.addClass("border-light");
                field.removeClass("border-success");
                field.removeClass("border-danger");
            })
        } else {
            throw new Error("Unknown validation state: " + validationState);
        }
    }

    validateContent() {
        console.log("validateContent", this.inputId)
        const validationState = this.coreElement.dataValidationFunction(this.fieldValue);
        var validated = FieldState.isValid(validationState);
        this.setValidationState(validationState);
        if (validated) {
            var statements = this.coreElement.dataCreationFunction(this.fieldValue);
            this.emit("add", statements, this);
            return statements;
        } else {
            if (this.coreElement.advice != undefined) {
                this.emit("error", this.coreElement.advice, this);
            } else {
                this.emit("error", validationState.message, this);
            }
        }
    }

    updateContent(newValue) {
        console.log("updateContent", this.inputId)
        var oldValueValidated = false;
        try {
            oldValueValidated = FieldState.isValid(this.coreElement.dataValidationFunction(this.fieldValue));
        } catch (e) {
            this.emit("error", e, this);
        }
        if (oldValueValidated) {
            var statement = this.coreElement.dataCreationFunction(this.fieldValue);
            this.emit("remove", statement, this);
        }
        this.fieldValue = newValue;
        this.validateContent();
        this.setViewValidationState()
    }

    render(): JQuery<HTMLElement> {
        console.log("render", this.inputId)
        console.log("state: ", this.validationState.state, this.inputId);
        this.setViewValidationState();
        return super.render();
    }

    refresh(): void {
        console.log("refresh", this.inputId)
        this.setValidationState(this.validationState);
        this.setViewValidationState();
        super.refresh();
    }

    generateJQueryContent(): JQuery<HTMLElement>[] {
        console.log("generateJQueryContent", this.inputId)
        var result = []
        var lineRemoveButtonCol = $(`<div class="col-1">
            </div>`);
        var lineRemoveButton = $(`<a id="${this.inputIdRemoveButton}" type="button text-truncate" class="btn btn-light" title="Remove this line" tabindex="0">
                <i class="bi bi-file-minus fs-4"></i>
            </a>`)
        lineRemoveButtonCol.append(lineRemoveButton);
        if (this.parentCategoryView.lines.size == this.parentCategoryView.coreElement.minArity) {
            lineRemoveButton.addClass("d-none");
        } else {
            lineRemoveButton.removeClass("d-none");
        }

        // Validation button
        var lineValidButton = $(`<a id="${this.inputIdButton}" type="button" class="btn btn-light text-truncate" title="Validate this line" tabindex="0">
                Validate
            </a>`)
        lineValidButton.attr("title", this.validationState.message);
        if (FieldState.isValid(this.validationState)) {
            lineValidButton.removeClass("btn-light")
            lineValidButton.removeClass("btn-warning")
            lineValidButton.removeClass("btn-danger")
            lineValidButton.addClass("btn-success")
        } else if (FieldState.isInvalid(this.validationState)) {
            lineValidButton.removeClass("btn-light")
            lineValidButton.removeClass("btn-warning")
            lineValidButton.removeClass("btn-success")
            lineValidButton.addClass("btn-danger")
        } else if (FieldState.isNone(this.validationState)) {
            lineValidButton.removeClass("btn-success")
            lineValidButton.removeClass("btn-warning")
            lineValidButton.removeClass("btn-danger")
            lineValidButton.addClass("btn-light")
        } else {
            throw new Error("Unknown validation state: " + this.validationState);
        }
        var lineValidButtonCol = $(`<div class="col-1">
            </div>`);
        lineValidButtonCol.append(lineValidButton);


        var fields = [];

        for (var i = 0; i < this.numberOfFields; i++) {
            var lineFieldCol = $(`<div class="col-${this.bootstrapFieldColWidth[i]} form-floating"></div>`);

            var lineLabel = $(`<label for="${this.inputIdFields[i]}" class="form-label">${this.coreElement.placeholder[i]}</label>`)
            var textInput = $(`<input type="text" class="form-control" autocomplete="off" id="${this.inputIdFields[i]}" value="${this.fieldValue[i]}"></input>`);

            if (FieldState.isValid(this.validationState)) {
                textInput.removeClass("border-light");
                textInput.removeClass("border-danger");
                textInput.addClass("border-success");
            } else if (FieldState.isInvalid(this.validationState)) {
                textInput.addClass("border-danger");
                textInput.removeClass("border-success");
                textInput.removeClass("border-light");
            } else if (FieldState.isNone(this.validationState)) {
                textInput.addClass("border-light");
                textInput.removeClass("border-success");
                textInput.removeClass("border-danger");
            }

            fields.push(textInput);

            lineFieldCol.append(textInput);
            lineFieldCol.append(lineLabel);

            result.push(lineFieldCol);

            if (this.coreElement.dataSuggestionFunction != undefined) {
                var items = this.coreElement.dataSuggestionFunction()[i];
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

        result.push(lineValidButtonCol);
        result.push(lineRemoveButtonCol);

        lineValidButton.on("click", () => {
            this.updateContent(fields.map(field => field.val()));
            this.setViewValidationState();
        });

        lineRemoveButton.on("click", () => {
            this.parentCategoryView.removeLine(this.inputId);
            this.parentCategoryView.refresh();
        });

        return result;
    }

}