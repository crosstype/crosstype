
/* ****************************************************************************************************************** */
// region: Basic JSON Types
/* ****************************************************************************************************************** */

export type JsonPrimitive = string | number | boolean | null

export interface JsonObject { [p: string]: JsonValue }
export type JsonValue = JsonPrimitive | JsonObject | Array<JsonValue>;
export type NonArrayJsonValue = JsonPrimitive | JsonObject

export type NullableJsonObject = { [p: string]: undefined | NullableJsonValue }
export type NullableJsonValue = JsonPrimitive | NullableJsonObject | Array<NullableJsonValue>
export type NullableNonArrayJsonValue = JsonPrimitive | NullableJsonObject

// endregion


/* ****************************************************************************************************************** */
// region: Utilities
/* ****************************************************************************************************************** */

export const isValidJSON = (v: any): v is JsonValue => { try { return !!JSON.stringify(v) } catch { return false } };

// endregion
