import * as $rdf from 'rdflib';
import dayjs from 'dayjs';

export function isLiteral(value: string): boolean {
    try {
        return value != undefined && value.length > 0 && $rdf.isLiteral($rdf.lit(value));
    } catch (e) {
        return false;
    }
}

export function isURI(value: string): boolean {
    try {
        return value != undefined && value.length > 0 && $rdf.isNamedNode($rdf.sym(value));
    } catch (e) {
        return false;
    }
}

export function isNotBlank(value: string): boolean {
    try {
        return isURI(value) || isLiteral(value);
    } catch (e) {
        return false;
    }
}

export function isDatetime(value: string): boolean {
    try {
        return isLiteral(value) && dayjs(value).isValid();
    } catch (e) {
        return false;
    }
}

export function isDuration(value: string): boolean {
    try {
        return isLiteral(value) && dayjs(value).isValid() && dayjs.isDuration(dayjs(value));
    } catch (e) {
        return false;
    }
}

export function isInteger(value: string): boolean {
    try {
        return isLiteral(value) && Number.isInteger(Number.parseInt(value));
    } catch (e) {
        return false;
    }
}

export function isPositiveInteger(value: string): boolean {
    try {
        return isInteger(value) && (Number.parseInt(value) > 0);
    } catch (e) {
        return false;
    }
}
