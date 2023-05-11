import { Statement } from "rdflib";
import * as $rdf from 'rdflib';

export type JSONValue =
    | string
    | number
    | boolean
    | JSONObject
    | JSONArray;

interface JSONObject {
    [x: string]: JSONValue;
}

interface JSONArray extends Array<JSONValue> { }

export type SPARQLJSONResult = {
    head: {
        vars: string[]
    },
    results: {
        bindings: {
            [x: string]: {
                type: string,
                value: string
            }
        }[]
    }
}

export interface SuggestionItem {
    value: string;
    label: string;
}

export class FieldState {
    state: "Valid" | "Invalid" | "None";
    message: string;

    constructor(state: "Valid" | "Invalid" | "None", message: string) {
        this.state = state;
        this.message = message;
    }

    static valid() {
        return new FieldState("Valid", "");
    }

    static invalid(message: string) {
        return new FieldState("Invalid", message);
    }

    static none() {
        return new FieldState("None", "");
    }

    static isValid(fieldState: FieldState) {
        return fieldState.state.localeCompare("Valid") == 0;
    }

    static isInvalid(fieldState: FieldState) {
        return fieldState.state.localeCompare("Invalid") == 0;
    }

    static isNone(fieldState: FieldState) {
        return fieldState.state.localeCompare("None") == 0;
    }
}

export interface CoreElement {

}

export interface CategoryConfig {
    recommended: boolean;
    categoryTitle: string;
    legend: string | string[];
    idPrefix: string;
    minArity: number;
    maxArity: number;
    computable: boolean;
    fields: FieldConfig[];
    subCategories?: CategoryCore[];
}

export class CategoryCore implements CoreElement {

    recommended: boolean;
    categoryTitle: string;
    legend: string | string[];
    idPrefix: string;
    minArity: number;
    maxArity: number;
    computable: boolean;
    fields: FieldCore[];
    subCategories?: CategoryCore[];

    constructor(config: CategoryConfig = { recommended: false, categoryTitle: "", legend: "", idPrefix: "id", minArity: 0, maxArity: Infinity, computable: false, fields: [], subCategories: [] }) {
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
        });
        this.subCategories = [];
        if(config.subCategories != undefined) {
            this.subCategories = config.subCategories;
        }
    }

    addNewField(fieldConfig) {
        fieldConfig.parentCategory = this;
        this.fields.push(fieldConfig);
    }
}

export interface FieldConfig {
    placeholder: string[];
    dataValidationFunction: (inputVal: string[]) => FieldState;
    dataCreationFunction: (inputVal: string[]) => Statement[];
    /**
     * This function extract the field value from the endpoint if it is not explicitly given in the dataset.
     */
    dataExtractionFunction?: () => Promise<string[]>;
    dataSuggestionFunction?: (string) => SuggestionItem[][];
    /**
     * This function load the values of the field that are explicitly given in the store.
     */
    dataLoadFunction: (store: $rdf.Store) => string[][];
    parentCategory?: CategoryCore | null;
    defaultValue: any;
    advice?: string;
    bootstrapFieldColWidth?: number[];
    /**
     * This property is used to check if the field is already in the store.
     * It contains the pattern that is used to check if the field is already in the store.
     * If several patterns are possible, they are stored in different arrays.
     */
    fieldPattern: Statement[][];
}

export class FieldCore implements CoreElement {

    placeholder: string[];
    dataValidationFunction: (inputVal: string[]) => FieldState;
    dataCreationFunction: (inputVal: string[]) => Statement[];
    dataExtractionFunction?: () => Promise<string[]>;
    dataSuggestionFunction?: (string) =>  SuggestionItem[][];
    dataLoadFunction: (store: $rdf.Store) => string[][];
    parentCategory?: CategoryCore | null;
    defaultValue: string[];
    advice?: string;
    bootstrapFieldColWidth: number[] | undefined;
    fieldPattern: Statement[][];

    constructor(config: FieldConfig) {
        this.placeholder = config.placeholder;
        this.dataValidationFunction = (inputVal: string[]) : FieldState => {
            var result = FieldState.none() ;
            try {
                result = config.dataValidationFunction(inputVal);
            } catch (e) {
                throw e;
            }
            return result;
        };
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
        if (config.dataSuggestionFunction != undefined) {
            this.dataSuggestionFunction = (inputVal) => {
                try {
                    return config.dataSuggestionFunction(inputVal);
                } catch (e) {
                    throw e;
                }
            }
        }
        if (config.dataLoadFunction != undefined) {
            this.dataLoadFunction = (store) => {
                try {
                    return  [ ...new Set( config.dataLoadFunction(store))];
                } catch (e) {
                    throw e;
                }
            }
        }
        this.parentCategory = config.parentCategory;
        this.defaultValue = config.defaultValue;
        this.advice = config.advice;
        if(config.bootstrapFieldColWidth != undefined) {
            this.bootstrapFieldColWidth = config.bootstrapFieldColWidth;
        } else {
            config.bootstrapFieldColWidth = [12];
        }
        this.fieldPattern = config.fieldPattern;
    }
}