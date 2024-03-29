import * as $rdf from 'rdflib';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import utc from 'dayjs/plugin/utc.js';
dayjs.extend(duration);
dayjs.extend(relativeTime)
dayjs.extend(customParseFormat)
dayjs.extend(utc)

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
