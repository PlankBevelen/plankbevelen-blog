import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import { LRUCache } from 'lru-cache';
import { createGenerator } from '@unocss/core';
import presetWind from '@unocss/preset-wind3';
import { parse as parse$3 } from 'devalue';
import { createConsola } from 'consola';
import { createUnhead } from 'unhead';
import http from 'node:http';
import https from 'node:https';
import { EventEmitter } from 'node:events';
import { Buffer as Buffer$1 } from 'node:buffer';
import { toValue, isRef, hasInjectionContext, inject, ref, watchEffect, getCurrentInstance, onBeforeUnmount, onDeactivated, onActivated } from 'vue';
import { createRouterMatcher } from 'vue-router';
import { promises, existsSync } from 'node:fs';
import path, { resolve as resolve$2, dirname as dirname$1, join } from 'node:path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import jwt from 'jsonwebtoken';
import { createHead as createHead$1, propsToString } from 'unhead/server';
import { FlatMetaPlugin } from 'unhead/plugins';
import { walkResolver } from 'unhead/utils';
import { createRenderer } from 'vue-bundle-renderer/runtime';
import { renderToString } from 'vue/server-renderer';
import { ipxFSStorage, ipxHttpStorage, createIPX, createIPXH3Handler } from 'ipx';
import { createHash } from 'node:crypto';

const suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(key, value) {
  if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
    warnKeyDropped(key);
    return;
  }
  return value;
}
function warnKeyDropped(key) {
  console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
}
function destr(value, options = {}) {
  if (typeof value !== "string") {
    return value;
  }
  if (value[0] === '"' && value[value.length - 1] === '"' && value.indexOf("\\") === -1) {
    return value.slice(1, -1);
  }
  const _value = value.trim();
  if (_value.length <= 9) {
    switch (_value.toLowerCase()) {
      case "true": {
        return true;
      }
      case "false": {
        return false;
      }
      case "undefined": {
        return void 0;
      }
      case "null": {
        return null;
      }
      case "nan": {
        return Number.NaN;
      }
      case "infinity": {
        return Number.POSITIVE_INFINITY;
      }
      case "-infinity": {
        return Number.NEGATIVE_INFINITY;
      }
    }
  }
  if (!JsonSigRx.test(value)) {
    if (options.strict) {
      throw new SyntaxError("[destr] Invalid JSON");
    }
    return value;
  }
  try {
    if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
      if (options.strict) {
        throw new Error("[destr] Possible prototype pollution");
      }
      return JSON.parse(value, jsonParseTransform);
    }
    return JSON.parse(value);
  } catch (error) {
    if (options.strict) {
      throw error;
    }
    return value;
  }
}

const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const IM_RE = /\?/g;
const PLUS_RE = /\+/g;
const ENC_CARET_RE = /%5e/gi;
const ENC_BACKTICK_RE = /%60/gi;
const ENC_PIPE_RE = /%7c/gi;
const ENC_SPACE_RE = /%20/gi;
const ENC_SLASH_RE = /%2f/gi;
const ENC_ENC_SLASH_RE = /%252f/gi;
function encode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|");
}
function encodeQueryValue(input) {
  return encode(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CARET_RE, "^").replace(SLASH_RE, "%2F");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function encodePath(text) {
  return encode(text).replace(HASH_RE, "%23").replace(IM_RE, "%3F").replace(ENC_ENC_SLASH_RE, "%2F").replace(AMPERSAND_RE, "%26").replace(PLUS_RE, "%2B");
}
function encodeParam(text) {
  return encodePath(text).replace(SLASH_RE, "%2F");
}
function decode$2(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodePath(text) {
  return decode$2(text.replace(ENC_SLASH_RE, "%252F"));
}
function decodeQueryKey(text) {
  return decode$2(text.replace(PLUS_RE, " "));
}
function decodeQueryValue(text) {
  return decode$2(text.replace(PLUS_RE, " "));
}

function parseQuery(parametersString = "") {
  const object = /* @__PURE__ */ Object.create(null);
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey(key);
  }
  if (Array.isArray(value)) {
    return value.map(
      (_value) => `${encodeQueryKey(key)}=${encodeQueryValue(_value)}`
    ).join("&");
  }
  return `${encodeQueryKey(key)}=${encodeQueryValue(value)}`;
}
function stringifyQuery(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem(k, query[k])).filter(Boolean).join("&");
}

const PROTOCOL_STRICT_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX = /^([/\\]\s*){2,}[^/\\]/;
const PROTOCOL_SCRIPT_RE = /^[\s\0]*(blob|data|javascript|vbscript):$/i;
const TRAILING_SLASH_RE = /\/$|\/\?|\/#/;
const JOIN_LEADING_SLASH_RE = /^\.?\//;
function hasProtocol(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX.test(inputString);
  }
  return PROTOCOL_REGEX.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX.test(inputString) : false);
}
function isScriptProtocol(protocol) {
  return !!protocol && PROTOCOL_SCRIPT_RE.test(protocol);
}
function hasTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return input.endsWith("/");
  }
  return TRAILING_SLASH_RE.test(input);
}
function withoutTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || "/";
  }
  if (!hasTrailingSlash(input, true)) {
    return input || "/";
  }
  let path = input;
  let fragment = "";
  const fragmentIndex = input.indexOf("#");
  if (fragmentIndex !== -1) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
  }
  const [s0, ...s] = path.split("?");
  const cleanPath = s0.endsWith("/") ? s0.slice(0, -1) : s0;
  return (cleanPath || "/") + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function withTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return input.endsWith("/") ? input : input + "/";
  }
  if (hasTrailingSlash(input, true)) {
    return input || "/";
  }
  let path = input;
  let fragment = "";
  const fragmentIndex = input.indexOf("#");
  if (fragmentIndex !== -1) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
    if (!path) {
      return fragment;
    }
  }
  const [s0, ...s] = path.split("?");
  return s0 + "/" + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function hasLeadingSlash(input = "") {
  return input.startsWith("/");
}
function withoutLeadingSlash(input = "") {
  return (hasLeadingSlash(input) ? input.slice(1) : input) || "/";
}
function withLeadingSlash(input = "") {
  return hasLeadingSlash(input) ? input : "/" + input;
}
function withBase(input, base) {
  if (isEmptyURL(base) || hasProtocol(input)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (input.startsWith(_base)) {
    return input;
  }
  return joinURL(_base, input);
}
function withoutBase(input, base) {
  if (isEmptyURL(base)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (!input.startsWith(_base)) {
    return input;
  }
  const trimmed = input.slice(_base.length);
  return trimmed[0] === "/" ? trimmed : "/" + trimmed;
}
function withQuery(input, query) {
  const parsed = parseURL(input);
  const mergedQuery = { ...parseQuery(parsed.search), ...query };
  parsed.search = stringifyQuery(mergedQuery);
  return stringifyParsedURL(parsed);
}
function getQuery$1(input) {
  return parseQuery(parseURL(input).search);
}
function isEmptyURL(url) {
  return !url || url === "/";
}
function isNonEmptyURL(url) {
  return url && url !== "/";
}
function joinURL(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE, "");
      url = withTrailingSlash(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}
function joinRelativeURL(..._input) {
  const JOIN_SEGMENT_SPLIT_RE = /\/(?!\/)/;
  const input = _input.filter(Boolean);
  const segments = [];
  let segmentsDepth = 0;
  for (const i of input) {
    if (!i || i === "/") {
      continue;
    }
    for (const [sindex, s] of i.split(JOIN_SEGMENT_SPLIT_RE).entries()) {
      if (!s || s === ".") {
        continue;
      }
      if (s === "..") {
        if (segments.length === 1 && hasProtocol(segments[0])) {
          continue;
        }
        segments.pop();
        segmentsDepth--;
        continue;
      }
      if (sindex === 1 && segments[segments.length - 1]?.endsWith(":/")) {
        segments[segments.length - 1] += "/" + s;
        continue;
      }
      segments.push(s);
      segmentsDepth++;
    }
  }
  let url = segments.join("/");
  if (segmentsDepth >= 0) {
    if (input[0]?.startsWith("/") && !url.startsWith("/")) {
      url = "/" + url;
    } else if (input[0]?.startsWith("./") && !url.startsWith("./")) {
      url = "./" + url;
    }
  } else {
    url = "../".repeat(-1 * segmentsDepth) + url;
  }
  if (input[input.length - 1]?.endsWith("/") && !url.endsWith("/")) {
    url += "/";
  }
  return url;
}
function withHttps(input) {
  return withProtocol(input, "https://");
}
function withProtocol(input, protocol) {
  let match = input.match(PROTOCOL_REGEX);
  if (!match) {
    match = input.match(/^\/{2,}/);
  }
  if (!match) {
    return protocol + input;
  }
  return protocol + input.slice(match[0].length);
}
function isEqual$1(a, b, options = {}) {
  if (!options.trailingSlash) {
    a = withTrailingSlash(a);
    b = withTrailingSlash(b);
  }
  if (!options.leadingSlash) {
    a = withLeadingSlash(a);
    b = withLeadingSlash(b);
  }
  if (!options.encoding) {
    a = decode$2(a);
    b = decode$2(b);
  }
  return a === b;
}

const protocolRelative = Symbol.for("ufo:protocolRelative");
function parseURL(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol(input, { acceptRelative: true })) {
    return defaultProto ? parseURL(defaultProto + input) : parsePath(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  let [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  if (protocol === "file:") {
    path = path.replace(/\/(?=[A-Za-z]:)/, "");
  }
  const { pathname, search, hash } = parsePath(path);
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative]: !protocol
  };
}
function parsePath(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}

function parse$2(str, options) {
  if (typeof str !== "string") {
    throw new TypeError("argument str must be a string");
  }
  const obj = {};
  const opt = {};
  const dec = opt.decode || decode$1;
  let index = 0;
  while (index < str.length) {
    const eqIdx = str.indexOf("=", index);
    if (eqIdx === -1) {
      break;
    }
    let endIdx = str.indexOf(";", index);
    if (endIdx === -1) {
      endIdx = str.length;
    } else if (endIdx < eqIdx) {
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }
    const key = str.slice(index, eqIdx).trim();
    if (opt?.filter && !opt?.filter(key)) {
      index = endIdx + 1;
      continue;
    }
    if (void 0 === obj[key]) {
      let val = str.slice(eqIdx + 1, endIdx).trim();
      if (val.codePointAt(0) === 34) {
        val = val.slice(1, -1);
      }
      obj[key] = tryDecode$1(val, dec);
    }
    index = endIdx + 1;
  }
  return obj;
}
function decode$1(str) {
  return str.includes("%") ? decodeURIComponent(str) : str;
}
function tryDecode$1(str, decode2) {
  try {
    return decode2(str);
  } catch {
    return str;
  }
}

const fieldContentRegExp = /^[\u0009\u0020-\u007E\u0080-\u00FF]+$/;
function serialize$2(name, value, options) {
  const opt = options || {};
  const enc = opt.encode || encodeURIComponent;
  if (typeof enc !== "function") {
    throw new TypeError("option encode is invalid");
  }
  if (!fieldContentRegExp.test(name)) {
    throw new TypeError("argument name is invalid");
  }
  const encodedValue = enc(value);
  if (encodedValue && !fieldContentRegExp.test(encodedValue)) {
    throw new TypeError("argument val is invalid");
  }
  let str = name + "=" + encodedValue;
  if (void 0 !== opt.maxAge && opt.maxAge !== null) {
    const maxAge = opt.maxAge - 0;
    if (Number.isNaN(maxAge) || !Number.isFinite(maxAge)) {
      throw new TypeError("option maxAge is invalid");
    }
    str += "; Max-Age=" + Math.floor(maxAge);
  }
  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError("option domain is invalid");
    }
    str += "; Domain=" + opt.domain;
  }
  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError("option path is invalid");
    }
    str += "; Path=" + opt.path;
  }
  if (opt.expires) {
    if (!isDate(opt.expires) || Number.isNaN(opt.expires.valueOf())) {
      throw new TypeError("option expires is invalid");
    }
    str += "; Expires=" + opt.expires.toUTCString();
  }
  if (opt.httpOnly) {
    str += "; HttpOnly";
  }
  if (opt.secure) {
    str += "; Secure";
  }
  if (opt.priority) {
    const priority = typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority;
    switch (priority) {
      case "low": {
        str += "; Priority=Low";
        break;
      }
      case "medium": {
        str += "; Priority=Medium";
        break;
      }
      case "high": {
        str += "; Priority=High";
        break;
      }
      default: {
        throw new TypeError("option priority is invalid");
      }
    }
  }
  if (opt.sameSite) {
    const sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
    switch (sameSite) {
      case true: {
        str += "; SameSite=Strict";
        break;
      }
      case "lax": {
        str += "; SameSite=Lax";
        break;
      }
      case "strict": {
        str += "; SameSite=Strict";
        break;
      }
      case "none": {
        str += "; SameSite=None";
        break;
      }
      default: {
        throw new TypeError("option sameSite is invalid");
      }
    }
  }
  if (opt.partitioned) {
    str += "; Partitioned";
  }
  return str;
}
function isDate(val) {
  return Object.prototype.toString.call(val) === "[object Date]" || val instanceof Date;
}

function parseSetCookie(setCookieValue, options) {
  const parts = (setCookieValue || "").split(";").filter((str) => typeof str === "string" && !!str.trim());
  const nameValuePairStr = parts.shift() || "";
  const parsed = _parseNameValuePair(nameValuePairStr);
  const name = parsed.name;
  let value = parsed.value;
  try {
    value = options?.decode === false ? value : (options?.decode || decodeURIComponent)(value);
  } catch {
  }
  const cookie = {
    name,
    value
  };
  for (const part of parts) {
    const sides = part.split("=");
    const partKey = (sides.shift() || "").trimStart().toLowerCase();
    const partValue = sides.join("=");
    switch (partKey) {
      case "expires": {
        cookie.expires = new Date(partValue);
        break;
      }
      case "max-age": {
        cookie.maxAge = Number.parseInt(partValue, 10);
        break;
      }
      case "secure": {
        cookie.secure = true;
        break;
      }
      case "httponly": {
        cookie.httpOnly = true;
        break;
      }
      case "samesite": {
        cookie.sameSite = partValue;
        break;
      }
      default: {
        cookie[partKey] = partValue;
      }
    }
  }
  return cookie;
}
function _parseNameValuePair(nameValuePairStr) {
  let name = "";
  let value = "";
  const nameValueArr = nameValuePairStr.split("=");
  if (nameValueArr.length > 1) {
    name = nameValueArr.shift();
    value = nameValueArr.join("=");
  } else {
    value = nameValuePairStr;
  }
  return { name, value };
}

const NODE_TYPES = {
  NORMAL: 0,
  WILDCARD: 1,
  PLACEHOLDER: 2
};

function createRouter$1(options = {}) {
  const ctx = {
    options,
    rootNode: createRadixNode(),
    staticRoutesMap: {}
  };
  const normalizeTrailingSlash = (p) => options.strictTrailingSlash ? p : p.replace(/\/$/, "") || "/";
  if (options.routes) {
    for (const path in options.routes) {
      insert(ctx, normalizeTrailingSlash(path), options.routes[path]);
    }
  }
  return {
    ctx,
    lookup: (path) => lookup(ctx, normalizeTrailingSlash(path)),
    insert: (path, data) => insert(ctx, normalizeTrailingSlash(path), data),
    remove: (path) => remove(ctx, normalizeTrailingSlash(path))
  };
}
function lookup(ctx, path) {
  const staticPathNode = ctx.staticRoutesMap[path];
  if (staticPathNode) {
    return staticPathNode.data;
  }
  const sections = path.split("/");
  const params = {};
  let paramsFound = false;
  let wildcardNode = null;
  let node = ctx.rootNode;
  let wildCardParam = null;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (node.wildcardChildNode !== null) {
      wildcardNode = node.wildcardChildNode;
      wildCardParam = sections.slice(i).join("/");
    }
    const nextNode = node.children.get(section);
    if (nextNode === void 0) {
      if (node && node.placeholderChildren.length > 1) {
        const remaining = sections.length - i;
        node = node.placeholderChildren.find((c) => c.maxDepth === remaining) || null;
      } else {
        node = node.placeholderChildren[0] || null;
      }
      if (!node) {
        break;
      }
      if (node.paramName) {
        params[node.paramName] = section;
      }
      paramsFound = true;
    } else {
      node = nextNode;
    }
  }
  if ((node === null || node.data === null) && wildcardNode !== null) {
    node = wildcardNode;
    params[node.paramName || "_"] = wildCardParam;
    paramsFound = true;
  }
  if (!node) {
    return null;
  }
  if (paramsFound) {
    return {
      ...node.data,
      params: paramsFound ? params : void 0
    };
  }
  return node.data;
}
function insert(ctx, path, data) {
  let isStaticRoute = true;
  const sections = path.split("/");
  let node = ctx.rootNode;
  let _unnamedPlaceholderCtr = 0;
  const matchedNodes = [node];
  for (const section of sections) {
    let childNode;
    if (childNode = node.children.get(section)) {
      node = childNode;
    } else {
      const type = getNodeType(section);
      childNode = createRadixNode({ type, parent: node });
      node.children.set(section, childNode);
      if (type === NODE_TYPES.PLACEHOLDER) {
        childNode.paramName = section === "*" ? `_${_unnamedPlaceholderCtr++}` : section.slice(1);
        node.placeholderChildren.push(childNode);
        isStaticRoute = false;
      } else if (type === NODE_TYPES.WILDCARD) {
        node.wildcardChildNode = childNode;
        childNode.paramName = section.slice(
          3
          /* "**:" */
        ) || "_";
        isStaticRoute = false;
      }
      matchedNodes.push(childNode);
      node = childNode;
    }
  }
  for (const [depth, node2] of matchedNodes.entries()) {
    node2.maxDepth = Math.max(matchedNodes.length - depth, node2.maxDepth || 0);
  }
  node.data = data;
  if (isStaticRoute === true) {
    ctx.staticRoutesMap[path] = node;
  }
  return node;
}
function remove(ctx, path) {
  let success = false;
  const sections = path.split("/");
  let node = ctx.rootNode;
  for (const section of sections) {
    node = node.children.get(section);
    if (!node) {
      return success;
    }
  }
  if (node.data) {
    const lastSection = sections.at(-1) || "";
    node.data = null;
    if (Object.keys(node.children).length === 0 && node.parent) {
      node.parent.children.delete(lastSection);
      node.parent.wildcardChildNode = null;
      node.parent.placeholderChildren = [];
    }
    success = true;
  }
  return success;
}
function createRadixNode(options = {}) {
  return {
    type: options.type || NODE_TYPES.NORMAL,
    maxDepth: 0,
    parent: options.parent || null,
    children: /* @__PURE__ */ new Map(),
    data: options.data || null,
    paramName: options.paramName || null,
    wildcardChildNode: null,
    placeholderChildren: []
  };
}
function getNodeType(str) {
  if (str.startsWith("**")) {
    return NODE_TYPES.WILDCARD;
  }
  if (str[0] === ":" || str === "*") {
    return NODE_TYPES.PLACEHOLDER;
  }
  return NODE_TYPES.NORMAL;
}

function toRouteMatcher(router) {
  const table = _routerNodeToTable("", router.ctx.rootNode);
  return _createMatcher(table, router.ctx.options.strictTrailingSlash);
}
function _createMatcher(table, strictTrailingSlash) {
  return {
    ctx: { table },
    matchAll: (path) => _matchRoutes(path, table, strictTrailingSlash)
  };
}
function _createRouteTable() {
  return {
    static: /* @__PURE__ */ new Map(),
    wildcard: /* @__PURE__ */ new Map(),
    dynamic: /* @__PURE__ */ new Map()
  };
}
function _matchRoutes(path, table, strictTrailingSlash) {
  if (strictTrailingSlash !== true && path.endsWith("/")) {
    path = path.slice(0, -1) || "/";
  }
  const matches = [];
  for (const [key, value] of _sortRoutesMap(table.wildcard)) {
    if (path === key || path.startsWith(key + "/")) {
      matches.push(value);
    }
  }
  for (const [key, value] of _sortRoutesMap(table.dynamic)) {
    if (path.startsWith(key + "/")) {
      const subPath = "/" + path.slice(key.length).split("/").splice(2).join("/");
      matches.push(..._matchRoutes(subPath, value));
    }
  }
  const staticMatch = table.static.get(path);
  if (staticMatch) {
    matches.push(staticMatch);
  }
  return matches.filter(Boolean);
}
function _sortRoutesMap(m) {
  return [...m.entries()].sort((a, b) => a[0].length - b[0].length);
}
function _routerNodeToTable(initialPath, initialNode) {
  const table = _createRouteTable();
  function _addNode(path, node) {
    if (path) {
      if (node.type === NODE_TYPES.NORMAL && !(path.includes("*") || path.includes(":"))) {
        if (node.data) {
          table.static.set(path, node.data);
        }
      } else if (node.type === NODE_TYPES.WILDCARD) {
        table.wildcard.set(path.replace("/**", ""), node.data);
      } else if (node.type === NODE_TYPES.PLACEHOLDER) {
        const subTable = _routerNodeToTable("", node);
        if (node.data) {
          subTable.static.set("/", node.data);
        }
        table.dynamic.set(path.replace(/\/\*|\/:\w+/, ""), subTable);
        return;
      }
    }
    for (const [childPath, child] of node.children.entries()) {
      _addNode(`${path}/${childPath}`.replace("//", "/"), child);
    }
  }
  _addNode(initialPath, initialNode);
  return table;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject(defaults)) {
    return _defu(baseObject, {}, namespace, merger);
  }
  const object = Object.assign({}, defaults);
  for (const key in baseObject) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject(value) && isPlainObject(object[key])) {
      object[key] = _defu(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
  );
}
const defu = createDefu();
const defuFn = createDefu((object, key, currentValue) => {
  if (object[key] !== void 0 && typeof currentValue === "function") {
    object[key] = currentValue(object[key]);
    return true;
  }
});

function o$1(n){throw new Error(`${n} is not implemented yet!`)}let i$2 = class i extends EventEmitter{__unenv__={};readableEncoding=null;readableEnded=true;readableFlowing=false;readableHighWaterMark=0;readableLength=0;readableObjectMode=false;readableAborted=false;readableDidRead=false;closed=false;errored=null;readable=false;destroyed=false;static from(e,t){return new i(t)}constructor(e){super();}_read(e){}read(e){}setEncoding(e){return this}pause(){return this}resume(){return this}isPaused(){return  true}unpipe(e){return this}unshift(e,t){}wrap(e){return this}push(e,t){return  false}_destroy(e,t){this.removeAllListeners();}destroy(e){return this.destroyed=true,this._destroy(e),this}pipe(e,t){return {}}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return this.destroy(),Promise.resolve()}async*[Symbol.asyncIterator](){throw o$1("Readable.asyncIterator")}iterator(e){throw o$1("Readable.iterator")}map(e,t){throw o$1("Readable.map")}filter(e,t){throw o$1("Readable.filter")}forEach(e,t){throw o$1("Readable.forEach")}reduce(e,t,r){throw o$1("Readable.reduce")}find(e,t){throw o$1("Readable.find")}findIndex(e,t){throw o$1("Readable.findIndex")}some(e,t){throw o$1("Readable.some")}toArray(e){throw o$1("Readable.toArray")}every(e,t){throw o$1("Readable.every")}flatMap(e,t){throw o$1("Readable.flatMap")}drop(e,t){throw o$1("Readable.drop")}take(e,t){throw o$1("Readable.take")}asIndexedPairs(e){throw o$1("Readable.asIndexedPairs")}};let l$2 = class l extends EventEmitter{__unenv__={};writable=true;writableEnded=false;writableFinished=false;writableHighWaterMark=0;writableLength=0;writableObjectMode=false;writableCorked=0;closed=false;errored=null;writableNeedDrain=false;writableAborted=false;destroyed=false;_data;_encoding="utf8";constructor(e){super();}pipe(e,t){return {}}_write(e,t,r){if(this.writableEnded){r&&r();return}if(this._data===void 0)this._data=e;else {const s=typeof this._data=="string"?Buffer$1.from(this._data,this._encoding||t||"utf8"):this._data,a=typeof e=="string"?Buffer$1.from(e,t||this._encoding||"utf8"):e;this._data=Buffer$1.concat([s,a]);}this._encoding=t,r&&r();}_writev(e,t){}_destroy(e,t){}_final(e){}write(e,t,r){const s=typeof t=="string"?this._encoding:"utf8",a=typeof t=="function"?t:typeof r=="function"?r:void 0;return this._write(e,s,a),true}setDefaultEncoding(e){return this}end(e,t,r){const s=typeof e=="function"?e:typeof t=="function"?t:typeof r=="function"?r:void 0;if(this.writableEnded)return s&&s(),this;const a=e===s?void 0:e;if(a){const u=t===s?void 0:t;this.write(a,u,s);}return this.writableEnded=true,this.writableFinished=true,this.emit("close"),this.emit("finish"),this}cork(){}uncork(){}destroy(e){return this.destroyed=true,delete this._data,this.removeAllListeners(),this}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return Promise.resolve()}};const c$2=class c{allowHalfOpen=true;_destroy;constructor(e=new i$2,t=new l$2){Object.assign(this,e),Object.assign(this,t),this._destroy=m(e._destroy,t._destroy);}};function _$1(){return Object.assign(c$2.prototype,i$2.prototype),Object.assign(c$2.prototype,l$2.prototype),c$2}function m(...n){return function(...e){for(const t of n)t(...e);}}const g=_$1();let A$1 = class A extends g{__unenv__={};bufferSize=0;bytesRead=0;bytesWritten=0;connecting=false;destroyed=false;pending=false;localAddress="";localPort=0;remoteAddress="";remoteFamily="";remotePort=0;autoSelectFamilyAttemptedAddresses=[];readyState="readOnly";constructor(e){super();}write(e,t,r){return  false}connect(e,t,r){return this}end(e,t,r){return this}setEncoding(e){return this}pause(){return this}resume(){return this}setTimeout(e,t){return this}setNoDelay(e){return this}setKeepAlive(e,t){return this}address(){return {}}unref(){return this}ref(){return this}destroySoon(){this.destroy();}resetAndDestroy(){const e=new Error("ERR_SOCKET_CLOSED");return e.code="ERR_SOCKET_CLOSED",this.destroy(e),this}};class y extends i$2{aborted=false;httpVersion="1.1";httpVersionMajor=1;httpVersionMinor=1;complete=true;connection;socket;headers={};trailers={};method="GET";url="/";statusCode=200;statusMessage="";closed=false;errored=null;readable=false;constructor(e){super(),this.socket=this.connection=e||new A$1;}get rawHeaders(){const e=this.headers,t=[];for(const r in e)if(Array.isArray(e[r]))for(const s of e[r])t.push(r,s);else t.push(r,e[r]);return t}get rawTrailers(){return []}setTimeout(e,t){return this}get headersDistinct(){return p(this.headers)}get trailersDistinct(){return p(this.trailers)}}function p(n){const e={};for(const[t,r]of Object.entries(n))t&&(e[t]=(Array.isArray(r)?r:[r]).filter(Boolean));return e}class w extends l$2{statusCode=200;statusMessage="";upgrading=false;chunkedEncoding=false;shouldKeepAlive=false;useChunkedEncodingByDefault=false;sendDate=false;finished=false;headersSent=false;strictContentLength=false;connection=null;socket=null;req;_headers={};constructor(e){super(),this.req=e;}assignSocket(e){e._httpMessage=this,this.socket=e,this.connection=e,this.emit("socket",e),this._flush();}_flush(){this.flushHeaders();}detachSocket(e){}writeContinue(e){}writeHead(e,t,r){e&&(this.statusCode=e),typeof t=="string"&&(this.statusMessage=t,t=void 0);const s=r||t;if(s&&!Array.isArray(s))for(const a in s)this.setHeader(a,s[a]);return this.headersSent=true,this}writeProcessing(){}setTimeout(e,t){return this}appendHeader(e,t){e=e.toLowerCase();const r=this._headers[e],s=[...Array.isArray(r)?r:[r],...Array.isArray(t)?t:[t]].filter(Boolean);return this._headers[e]=s.length>1?s:s[0],this}setHeader(e,t){return this._headers[e.toLowerCase()]=t,this}setHeaders(e){for(const[t,r]of Object.entries(e))this.setHeader(t,r);return this}getHeader(e){return this._headers[e.toLowerCase()]}getHeaders(){return this._headers}getHeaderNames(){return Object.keys(this._headers)}hasHeader(e){return e.toLowerCase()in this._headers}removeHeader(e){delete this._headers[e.toLowerCase()];}addTrailers(e){}flushHeaders(){}writeEarlyHints(e,t){typeof t=="function"&&t();}}const E=(()=>{const n=function(){};return n.prototype=Object.create(null),n})();function R$1(n={}){const e=new E,t=Array.isArray(n)||H(n)?n:Object.entries(n);for(const[r,s]of t)if(s){if(e[r]===void 0){e[r]=s;continue}e[r]=[...Array.isArray(e[r])?e[r]:[e[r]],...Array.isArray(s)?s:[s]];}return e}function H(n){return typeof n?.entries=="function"}function v(n={}){if(n instanceof Headers)return n;const e=new Headers;for(const[t,r]of Object.entries(n))if(r!==void 0){if(Array.isArray(r)){for(const s of r)e.append(t,String(s));continue}e.set(t,String(r));}return e}const S$1=new Set([101,204,205,304]);async function b$1(n,e){const t=new y,r=new w(t);t.url=e.url?.toString()||"/";let s;if(!t.url.startsWith("/")){const d=new URL(t.url);s=d.host,t.url=d.pathname+d.search+d.hash;}t.method=e.method||"GET",t.headers=R$1(e.headers||{}),t.headers.host||(t.headers.host=e.host||s||"localhost"),t.connection.encrypted=t.connection.encrypted||e.protocol==="https",t.body=e.body||null,t.__unenv__=e.context,await n(t,r);let a=r._data;(S$1.has(r.statusCode)||t.method.toUpperCase()==="HEAD")&&(a=null,delete r._headers["content-length"]);const u={status:r.statusCode,statusText:r.statusMessage,headers:r._headers,body:a};return t.destroy(),r.destroy(),u}async function C$1(n,e,t={}){try{const r=await b$1(n,{url:e,...t});return new Response(r.body,{status:r.status,statusText:r.statusText,headers:v(r.headers)})}catch(r){return new Response(r.toString(),{status:Number.parseInt(r.statusCode||r.code)||500,statusText:r.statusText})}}

function useBase(base, handler) {
  base = withoutTrailingSlash(base);
  if (!base || base === "/") {
    return handler;
  }
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _path = event._path || event.node.req.url || "/";
    event._path = withoutBase(event.path || "/", base);
    event.node.req.url = event._path;
    try {
      return await handler(event);
    } finally {
      event._path = event.node.req.url = _path;
    }
  });
}

function hasProp(obj, prop) {
  try {
    return prop in obj;
  } catch {
    return false;
  }
}

class H3Error extends Error {
  static __h3_error__ = true;
  statusCode = 500;
  fatal = false;
  unhandled = false;
  statusMessage;
  data;
  cause;
  constructor(message, opts = {}) {
    super(message, opts);
    if (opts.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
  toJSON() {
    const obj = {
      message: this.message,
      statusCode: sanitizeStatusCode(this.statusCode, 500)
    };
    if (this.statusMessage) {
      obj.statusMessage = sanitizeStatusMessage(this.statusMessage);
    }
    if (this.data !== void 0) {
      obj.data = this.data;
    }
    return obj;
  }
}
function createError$1(input) {
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (isError(input)) {
    return input;
  }
  const err = new H3Error(input.message ?? input.statusMessage ?? "", {
    cause: input.cause || input
  });
  if (hasProp(input, "stack")) {
    try {
      Object.defineProperty(err, "stack", {
        get() {
          return input.stack;
        }
      });
    } catch {
      try {
        err.stack = input.stack;
      } catch {
      }
    }
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.statusCode) {
    err.statusCode = sanitizeStatusCode(input.statusCode, err.statusCode);
  } else if (input.status) {
    err.statusCode = sanitizeStatusCode(input.status, err.statusCode);
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  } else if (input.statusText) {
    err.statusMessage = input.statusText;
  }
  if (err.statusMessage) {
    const originalMessage = err.statusMessage;
    const sanitizedMessage = sanitizeStatusMessage(err.statusMessage);
    if (sanitizedMessage !== originalMessage) {
      console.warn(
        "[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future, `statusMessage` will be sanitized by default."
      );
    }
  }
  if (input.fatal !== void 0) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== void 0) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function sendError(event, error, debug) {
  if (event.handled) {
    return;
  }
  const h3Error = isError(error) ? error : createError$1(error);
  const responseBody = {
    statusCode: h3Error.statusCode,
    statusMessage: h3Error.statusMessage,
    stack: [],
    data: h3Error.data
  };
  if (debug) {
    responseBody.stack = (h3Error.stack || "").split("\n").map((l) => l.trim());
  }
  if (event.handled) {
    return;
  }
  const _code = Number.parseInt(h3Error.statusCode);
  setResponseStatus(event, _code, h3Error.statusMessage);
  event.node.res.setHeader("content-type", MIMES.json);
  event.node.res.end(JSON.stringify(responseBody, void 0, 2));
}
function isError(input) {
  return input?.constructor?.__h3_error__ === true;
}

function parse$1(multipartBodyBuffer, boundary) {
  let lastline = "";
  let state = 0 /* INIT */;
  let buffer = [];
  const allParts = [];
  let currentPartHeaders = [];
  for (let i = 0; i < multipartBodyBuffer.length; i++) {
    const prevByte = i > 0 ? multipartBodyBuffer[i - 1] : null;
    const currByte = multipartBodyBuffer[i];
    const newLineChar = currByte === 10 || currByte === 13;
    if (!newLineChar) {
      lastline += String.fromCodePoint(currByte);
    }
    const newLineDetected = currByte === 10 && prevByte === 13;
    if (0 /* INIT */ === state && newLineDetected) {
      if ("--" + boundary === lastline) {
        state = 1 /* READING_HEADERS */;
      }
      lastline = "";
    } else if (1 /* READING_HEADERS */ === state && newLineDetected) {
      if (lastline.length > 0) {
        const i2 = lastline.indexOf(":");
        if (i2 > 0) {
          const name = lastline.slice(0, i2).toLowerCase();
          const value = lastline.slice(i2 + 1).trim();
          currentPartHeaders.push([name, value]);
        }
      } else {
        state = 2 /* READING_DATA */;
        buffer = [];
      }
      lastline = "";
    } else if (2 /* READING_DATA */ === state) {
      if (lastline.length > boundary.length + 4) {
        lastline = "";
      }
      if ("--" + boundary === lastline) {
        const j = buffer.length - lastline.length;
        const part = buffer.slice(0, j - 1);
        allParts.push(process$1(part, currentPartHeaders));
        buffer = [];
        currentPartHeaders = [];
        lastline = "";
        state = 3 /* READING_PART_SEPARATOR */;
      } else {
        buffer.push(currByte);
      }
      if (newLineDetected) {
        lastline = "";
      }
    } else if (3 /* READING_PART_SEPARATOR */ === state && newLineDetected) {
      state = 1 /* READING_HEADERS */;
    }
  }
  return allParts;
}
function process$1(data, headers) {
  const dataObj = {};
  const contentDispositionHeader = headers.find((h) => h[0] === "content-disposition")?.[1] || "";
  for (const i of contentDispositionHeader.split(";")) {
    const s = i.split("=");
    if (s.length !== 2) {
      continue;
    }
    const key = (s[0] || "").trim();
    if (key === "name" || key === "filename") {
      const _value = (s[1] || "").trim().replace(/"/g, "");
      dataObj[key] = Buffer.from(_value, "latin1").toString("utf8");
    }
  }
  const contentType = headers.find((h) => h[0] === "content-type")?.[1] || "";
  if (contentType) {
    dataObj.type = contentType;
  }
  dataObj.data = Buffer.from(data);
  return dataObj;
}

function getQuery(event) {
  return getQuery$1(event.path || "");
}
function getRouterParams(event, opts = {}) {
  let params = event.context.params || {};
  if (opts.decode) {
    params = { ...params };
    for (const key in params) {
      params[key] = decode$2(params[key]);
    }
  }
  return params;
}
function getRouterParam(event, name, opts = {}) {
  const params = getRouterParams(event, opts);
  return params[name];
}
function isMethod(event, expected, allowHead) {
  if (typeof expected === "string") {
    if (event.method === expected) {
      return true;
    }
  } else if (expected.includes(event.method)) {
    return true;
  }
  return false;
}
function assertMethod(event, expected, allowHead) {
  if (!isMethod(event, expected)) {
    throw createError$1({
      statusCode: 405,
      statusMessage: "HTTP method is not allowed."
    });
  }
}
function getRequestHeaders(event) {
  const _headers = {};
  for (const key in event.node.req.headers) {
    const val = event.node.req.headers[key];
    _headers[key] = Array.isArray(val) ? val.filter(Boolean).join(", ") : val;
  }
  return _headers;
}
function getRequestHeader(event, name) {
  const headers = getRequestHeaders(event);
  const value = headers[name.toLowerCase()];
  return value;
}
const getHeader = getRequestHeader;
function getRequestHost(event, opts = {}) {
  if (opts.xForwardedHost) {
    const _header = event.node.req.headers["x-forwarded-host"];
    const xForwardedHost = (_header || "").split(",").shift()?.trim();
    if (xForwardedHost) {
      return xForwardedHost;
    }
  }
  return event.node.req.headers.host || "localhost";
}
function getRequestProtocol(event, opts = {}) {
  if (opts.xForwardedProto !== false && event.node.req.headers["x-forwarded-proto"] === "https") {
    return "https";
  }
  return event.node.req.connection?.encrypted ? "https" : "http";
}
function getRequestURL(event, opts = {}) {
  const host = getRequestHost(event, opts);
  const protocol = getRequestProtocol(event, opts);
  const path = (event.node.req.originalUrl || event.path).replace(
    /^[/\\]+/g,
    "/"
  );
  return new URL(path, `${protocol}://${host}`);
}

const RawBodySymbol = Symbol.for("h3RawBody");
const ParsedBodySymbol = Symbol.for("h3ParsedBody");
const PayloadMethods$1 = ["PATCH", "POST", "PUT", "DELETE"];
function readRawBody(event, encoding = "utf8") {
  assertMethod(event, PayloadMethods$1);
  const _rawBody = event._requestBody || event.web?.request?.body || event.node.req[RawBodySymbol] || event.node.req.rawBody || event.node.req.body;
  if (_rawBody) {
    const promise2 = Promise.resolve(_rawBody).then((_resolved) => {
      if (Buffer.isBuffer(_resolved)) {
        return _resolved;
      }
      if (typeof _resolved.pipeTo === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.pipeTo(
            new WritableStream({
              write(chunk) {
                chunks.push(chunk);
              },
              close() {
                resolve(Buffer.concat(chunks));
              },
              abort(reason) {
                reject(reason);
              }
            })
          ).catch(reject);
        });
      } else if (typeof _resolved.pipe === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.on("data", (chunk) => {
            chunks.push(chunk);
          }).on("end", () => {
            resolve(Buffer.concat(chunks));
          }).on("error", reject);
        });
      }
      if (_resolved.constructor === Object) {
        return Buffer.from(JSON.stringify(_resolved));
      }
      if (_resolved instanceof URLSearchParams) {
        return Buffer.from(_resolved.toString());
      }
      if (_resolved instanceof FormData) {
        return new Response(_resolved).bytes().then((uint8arr) => Buffer.from(uint8arr));
      }
      return Buffer.from(_resolved);
    });
    return encoding ? promise2.then((buff) => buff.toString(encoding)) : promise2;
  }
  if (!Number.parseInt(event.node.req.headers["content-length"] || "") && !String(event.node.req.headers["transfer-encoding"] ?? "").split(",").map((e) => e.trim()).filter(Boolean).includes("chunked")) {
    return Promise.resolve(void 0);
  }
  const promise = event.node.req[RawBodySymbol] = new Promise(
    (resolve, reject) => {
      const bodyData = [];
      event.node.req.on("error", (err) => {
        reject(err);
      }).on("data", (chunk) => {
        bodyData.push(chunk);
      }).on("end", () => {
        resolve(Buffer.concat(bodyData));
      });
    }
  );
  const result = encoding ? promise.then((buff) => buff.toString(encoding)) : promise;
  return result;
}
async function readBody(event, options = {}) {
  const request = event.node.req;
  if (hasProp(request, ParsedBodySymbol)) {
    return request[ParsedBodySymbol];
  }
  const contentType = request.headers["content-type"] || "";
  const body = await readRawBody(event);
  let parsed;
  if (contentType === "application/json") {
    parsed = _parseJSON(body, options.strict ?? true);
  } else if (contentType.startsWith("application/x-www-form-urlencoded")) {
    parsed = _parseURLEncodedBody(body);
  } else if (contentType.startsWith("text/")) {
    parsed = body;
  } else {
    parsed = _parseJSON(body, options.strict ?? false);
  }
  request[ParsedBodySymbol] = parsed;
  return parsed;
}
async function readMultipartFormData(event) {
  const contentType = getRequestHeader(event, "content-type");
  if (!contentType || !contentType.startsWith("multipart/form-data")) {
    return;
  }
  const boundary = contentType.match(/boundary=([^;]*)(;|$)/i)?.[1];
  if (!boundary) {
    return;
  }
  const body = await readRawBody(event, false);
  if (!body) {
    return;
  }
  return parse$1(body, boundary);
}
function getRequestWebStream(event) {
  if (!PayloadMethods$1.includes(event.method)) {
    return;
  }
  const bodyStream = event.web?.request?.body || event._requestBody;
  if (bodyStream) {
    return bodyStream;
  }
  const _hasRawBody = RawBodySymbol in event.node.req || "rawBody" in event.node.req || "body" in event.node.req || "__unenv__" in event.node.req;
  if (_hasRawBody) {
    return new ReadableStream({
      async start(controller) {
        const _rawBody = await readRawBody(event, false);
        if (_rawBody) {
          controller.enqueue(_rawBody);
        }
        controller.close();
      }
    });
  }
  return new ReadableStream({
    start: (controller) => {
      event.node.req.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      event.node.req.on("end", () => {
        controller.close();
      });
      event.node.req.on("error", (err) => {
        controller.error(err);
      });
    }
  });
}
function _parseJSON(body = "", strict) {
  if (!body) {
    return void 0;
  }
  try {
    return destr(body, { strict });
  } catch {
    throw createError$1({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Invalid JSON body"
    });
  }
}
function _parseURLEncodedBody(body) {
  const form = new URLSearchParams(body);
  const parsedForm = /* @__PURE__ */ Object.create(null);
  for (const [key, value] of form.entries()) {
    if (hasProp(parsedForm, key)) {
      if (!Array.isArray(parsedForm[key])) {
        parsedForm[key] = [parsedForm[key]];
      }
      parsedForm[key].push(value);
    } else {
      parsedForm[key] = value;
    }
  }
  return parsedForm;
}

function handleCacheHeaders(event, opts) {
  const cacheControls = ["public", ...opts.cacheControls || []];
  let cacheMatched = false;
  if (opts.maxAge !== void 0) {
    cacheControls.push(`max-age=${+opts.maxAge}`, `s-maxage=${+opts.maxAge}`);
  }
  if (opts.modifiedTime) {
    const modifiedTime = new Date(opts.modifiedTime);
    const ifModifiedSince = event.node.req.headers["if-modified-since"];
    event.node.res.setHeader("last-modified", modifiedTime.toUTCString());
    if (ifModifiedSince && new Date(ifModifiedSince) >= modifiedTime) {
      cacheMatched = true;
    }
  }
  if (opts.etag) {
    event.node.res.setHeader("etag", opts.etag);
    const ifNonMatch = event.node.req.headers["if-none-match"];
    if (ifNonMatch === opts.etag) {
      cacheMatched = true;
    }
  }
  event.node.res.setHeader("cache-control", cacheControls.join(", "));
  if (cacheMatched) {
    event.node.res.statusCode = 304;
    if (!event.handled) {
      event.node.res.end();
    }
    return true;
  }
  return false;
}

const MIMES = {
  html: "text/html",
  json: "application/json"
};

const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
  if (!statusCode) {
    return defaultStatusCode;
  }
  if (typeof statusCode === "string") {
    statusCode = Number.parseInt(statusCode, 10);
  }
  if (statusCode < 100 || statusCode > 999) {
    return defaultStatusCode;
  }
  return statusCode;
}

function getDistinctCookieKey(name, opts) {
  return [name, opts.domain || "", opts.path || "/"].join(";");
}

function parseCookies(event) {
  return parse$2(event.node.req.headers.cookie || "");
}
function getCookie(event, name) {
  return parseCookies(event)[name];
}
function setCookie(event, name, value, serializeOptions = {}) {
  if (!serializeOptions.path) {
    serializeOptions = { path: "/", ...serializeOptions };
  }
  const newCookie = serialize$2(name, value, serializeOptions);
  const currentCookies = splitCookiesString(
    event.node.res.getHeader("set-cookie")
  );
  if (currentCookies.length === 0) {
    event.node.res.setHeader("set-cookie", newCookie);
    return;
  }
  const newCookieKey = getDistinctCookieKey(name, serializeOptions);
  event.node.res.removeHeader("set-cookie");
  for (const cookie of currentCookies) {
    const parsed = parseSetCookie(cookie);
    const key = getDistinctCookieKey(parsed.name, parsed);
    if (key === newCookieKey) {
      continue;
    }
    event.node.res.appendHeader("set-cookie", cookie);
  }
  event.node.res.appendHeader("set-cookie", newCookie);
}
function deleteCookie(event, name, serializeOptions) {
  setCookie(event, name, "", {
    ...serializeOptions,
    maxAge: 0
  });
}
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString.flatMap((c) => splitCookiesString(c));
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start));
    }
  }
  return cookiesStrings;
}

const defer = typeof setImmediate === "undefined" ? (fn) => fn() : setImmediate;
function send(event, data, type) {
  if (type) {
    defaultContentType(event, type);
  }
  return new Promise((resolve) => {
    defer(() => {
      if (!event.handled) {
        event.node.res.end(data);
      }
      resolve();
    });
  });
}
function sendNoContent(event, code) {
  if (event.handled) {
    return;
  }
  if (!code && event.node.res.statusCode !== 200) {
    code = event.node.res.statusCode;
  }
  const _code = sanitizeStatusCode(code, 204);
  if (_code === 204) {
    event.node.res.removeHeader("content-length");
  }
  event.node.res.writeHead(_code);
  event.node.res.end();
}
function setResponseStatus(event, code, text) {
  if (code) {
    event.node.res.statusCode = sanitizeStatusCode(
      code,
      event.node.res.statusCode
    );
  }
  if (text) {
    event.node.res.statusMessage = sanitizeStatusMessage(text);
  }
}
function getResponseStatus(event) {
  return event.node.res.statusCode;
}
function getResponseStatusText(event) {
  return event.node.res.statusMessage;
}
function defaultContentType(event, type) {
  if (type && event.node.res.statusCode !== 304 && !event.node.res.getHeader("content-type")) {
    event.node.res.setHeader("content-type", type);
  }
}
function sendRedirect(event, location, code = 302) {
  event.node.res.statusCode = sanitizeStatusCode(
    code,
    event.node.res.statusCode
  );
  event.node.res.setHeader("location", location);
  const encodedLoc = location.replace(/"/g, "%22");
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`;
  return send(event, html, MIMES.html);
}
function getResponseHeader(event, name) {
  return event.node.res.getHeader(name);
}
function setResponseHeaders(event, headers) {
  for (const [name, value] of Object.entries(headers)) {
    event.node.res.setHeader(
      name,
      value
    );
  }
}
const setHeaders = setResponseHeaders;
function setResponseHeader(event, name, value) {
  event.node.res.setHeader(name, value);
}
const setHeader = setResponseHeader;
function appendResponseHeader(event, name, value) {
  let current = event.node.res.getHeader(name);
  if (!current) {
    event.node.res.setHeader(name, value);
    return;
  }
  if (!Array.isArray(current)) {
    current = [current.toString()];
  }
  event.node.res.setHeader(name, [...current, value]);
}
function removeResponseHeader(event, name) {
  return event.node.res.removeHeader(name);
}
function isStream(data) {
  if (!data || typeof data !== "object") {
    return false;
  }
  if (typeof data.pipe === "function") {
    if (typeof data._read === "function") {
      return true;
    }
    if (typeof data.abort === "function") {
      return true;
    }
  }
  if (typeof data.pipeTo === "function") {
    return true;
  }
  return false;
}
function isWebResponse(data) {
  return typeof Response !== "undefined" && data instanceof Response;
}
function sendStream(event, stream) {
  if (!stream || typeof stream !== "object") {
    throw new Error("[h3] Invalid stream provided.");
  }
  event.node.res._data = stream;
  if (!event.node.res.socket) {
    event._handled = true;
    return Promise.resolve();
  }
  if (hasProp(stream, "pipeTo") && typeof stream.pipeTo === "function") {
    return stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk);
        }
      })
    ).then(() => {
      event.node.res.end();
    });
  }
  if (hasProp(stream, "pipe") && typeof stream.pipe === "function") {
    return new Promise((resolve, reject) => {
      stream.pipe(event.node.res);
      if (stream.on) {
        stream.on("end", () => {
          event.node.res.end();
          resolve();
        });
        stream.on("error", (error) => {
          reject(error);
        });
      }
      event.node.res.on("close", () => {
        if (stream.abort) {
          stream.abort();
        }
      });
    });
  }
  throw new Error("[h3] Invalid or incompatible stream provided.");
}
function sendWebResponse(event, response) {
  for (const [key, value] of response.headers) {
    if (key === "set-cookie") {
      event.node.res.appendHeader(key, splitCookiesString(value));
    } else {
      event.node.res.setHeader(key, value);
    }
  }
  if (response.status) {
    event.node.res.statusCode = sanitizeStatusCode(
      response.status,
      event.node.res.statusCode
    );
  }
  if (response.statusText) {
    event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  }
  if (response.redirected) {
    event.node.res.setHeader("location", response.url);
  }
  if (!response.body) {
    event.node.res.end();
    return;
  }
  return sendStream(event, response.body);
}

const PayloadMethods = /* @__PURE__ */ new Set(["PATCH", "POST", "PUT", "DELETE"]);
const ignoredHeaders = /* @__PURE__ */ new Set([
  "transfer-encoding",
  "accept-encoding",
  "connection",
  "keep-alive",
  "upgrade",
  "expect",
  "host",
  "accept"
]);
async function proxyRequest(event, target, opts = {}) {
  let body;
  let duplex;
  if (PayloadMethods.has(event.method)) {
    if (opts.streamRequest) {
      body = getRequestWebStream(event);
      duplex = "half";
    } else {
      body = await readRawBody(event, false).catch(() => void 0);
    }
  }
  const method = opts.fetchOptions?.method || event.method;
  const fetchHeaders = mergeHeaders$1(
    getProxyRequestHeaders(event, { host: target.startsWith("/") }),
    opts.fetchOptions?.headers,
    opts.headers
  );
  return sendProxy(event, target, {
    ...opts,
    fetchOptions: {
      method,
      body,
      duplex,
      ...opts.fetchOptions,
      headers: fetchHeaders
    }
  });
}
async function sendProxy(event, target, opts = {}) {
  let response;
  try {
    response = await _getFetch(opts.fetch)(target, {
      headers: opts.headers,
      ignoreResponseError: true,
      // make $ofetch.raw transparent
      ...opts.fetchOptions
    });
  } catch (error) {
    throw createError$1({
      status: 502,
      statusMessage: "Bad Gateway",
      cause: error
    });
  }
  event.node.res.statusCode = sanitizeStatusCode(
    response.status,
    event.node.res.statusCode
  );
  event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  const cookies = [];
  for (const [key, value] of response.headers.entries()) {
    if (key === "content-encoding") {
      continue;
    }
    if (key === "content-length") {
      continue;
    }
    if (key === "set-cookie") {
      cookies.push(...splitCookiesString(value));
      continue;
    }
    event.node.res.setHeader(key, value);
  }
  if (cookies.length > 0) {
    event.node.res.setHeader(
      "set-cookie",
      cookies.map((cookie) => {
        if (opts.cookieDomainRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookieDomainRewrite,
            "domain"
          );
        }
        if (opts.cookiePathRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookiePathRewrite,
            "path"
          );
        }
        return cookie;
      })
    );
  }
  if (opts.onResponse) {
    await opts.onResponse(event, response);
  }
  if (response._data !== void 0) {
    return response._data;
  }
  if (event.handled) {
    return;
  }
  if (opts.sendStream === false) {
    const data = new Uint8Array(await response.arrayBuffer());
    return event.node.res.end(data);
  }
  if (response.body) {
    for await (const chunk of response.body) {
      event.node.res.write(chunk);
    }
  }
  return event.node.res.end();
}
function getProxyRequestHeaders(event, opts) {
  const headers = /* @__PURE__ */ Object.create(null);
  const reqHeaders = getRequestHeaders(event);
  for (const name in reqHeaders) {
    if (!ignoredHeaders.has(name) || name === "host" && opts?.host) {
      headers[name] = reqHeaders[name];
    }
  }
  return headers;
}
function fetchWithEvent(event, req, init, options) {
  return _getFetch(options?.fetch)(req, {
    ...init,
    context: init?.context || event.context,
    headers: {
      ...getProxyRequestHeaders(event, {
        host: typeof req === "string" && req.startsWith("/")
      }),
      ...init?.headers
    }
  });
}
function _getFetch(_fetch) {
  if (_fetch) {
    return _fetch;
  }
  if (globalThis.fetch) {
    return globalThis.fetch;
  }
  throw new Error(
    "fetch is not available. Try importing `node-fetch-native/polyfill` for Node.js."
  );
}
function rewriteCookieProperty(header, map, property) {
  const _map = typeof map === "string" ? { "*": map } : map;
  return header.replace(
    new RegExp(`(;\\s*${property}=)([^;]+)`, "gi"),
    (match, prefix, previousValue) => {
      let newValue;
      if (previousValue in _map) {
        newValue = _map[previousValue];
      } else if ("*" in _map) {
        newValue = _map["*"];
      } else {
        return match;
      }
      return newValue ? prefix + newValue : "";
    }
  );
}
function mergeHeaders$1(defaults, ...inputs) {
  const _inputs = inputs.filter(Boolean);
  if (_inputs.length === 0) {
    return defaults;
  }
  const merged = new Headers(defaults);
  for (const input of _inputs) {
    const entries = Array.isArray(input) ? input : typeof input.entries === "function" ? input.entries() : Object.entries(input);
    for (const [key, value] of entries) {
      if (value !== void 0) {
        merged.set(key, value);
      }
    }
  }
  return merged;
}

class H3Event {
  "__is_event__" = true;
  // Context
  node;
  // Node
  web;
  // Web
  context = {};
  // Shared
  // Request
  _method;
  _path;
  _headers;
  _requestBody;
  // Response
  _handled = false;
  // Hooks
  _onBeforeResponseCalled;
  _onAfterResponseCalled;
  constructor(req, res) {
    this.node = { req, res };
  }
  // --- Request ---
  get method() {
    if (!this._method) {
      this._method = (this.node.req.method || "GET").toUpperCase();
    }
    return this._method;
  }
  get path() {
    return this._path || this.node.req.url || "/";
  }
  get headers() {
    if (!this._headers) {
      this._headers = _normalizeNodeHeaders(this.node.req.headers);
    }
    return this._headers;
  }
  // --- Respoonse ---
  get handled() {
    return this._handled || this.node.res.writableEnded || this.node.res.headersSent;
  }
  respondWith(response) {
    return Promise.resolve(response).then(
      (_response) => sendWebResponse(this, _response)
    );
  }
  // --- Utils ---
  toString() {
    return `[${this.method}] ${this.path}`;
  }
  toJSON() {
    return this.toString();
  }
  // --- Deprecated ---
  /** @deprecated Please use `event.node.req` instead. */
  get req() {
    return this.node.req;
  }
  /** @deprecated Please use `event.node.res` instead. */
  get res() {
    return this.node.res;
  }
}
function isEvent(input) {
  return hasProp(input, "__is_event__");
}
function createEvent(req, res) {
  return new H3Event(req, res);
}
function _normalizeNodeHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}

function defineEventHandler(handler) {
  if (typeof handler === "function") {
    handler.__is_handler__ = true;
    return handler;
  }
  const _hooks = {
    onRequest: _normalizeArray(handler.onRequest),
    onBeforeResponse: _normalizeArray(handler.onBeforeResponse)
  };
  const _handler = (event) => {
    return _callHandler(event, handler.handler, _hooks);
  };
  _handler.__is_handler__ = true;
  _handler.__resolve__ = handler.handler.__resolve__;
  _handler.__websocket__ = handler.websocket;
  return _handler;
}
function _normalizeArray(input) {
  return input ? Array.isArray(input) ? input : [input] : void 0;
}
async function _callHandler(event, handler, hooks) {
  if (hooks.onRequest) {
    for (const hook of hooks.onRequest) {
      await hook(event);
      if (event.handled) {
        return;
      }
    }
  }
  const body = await handler(event);
  const response = { body };
  if (hooks.onBeforeResponse) {
    for (const hook of hooks.onBeforeResponse) {
      await hook(event, response);
    }
  }
  return response.body;
}
const eventHandler = defineEventHandler;
function isEventHandler(input) {
  return hasProp(input, "__is_handler__");
}
function toEventHandler(input, _, _route) {
  if (!isEventHandler(input)) {
    console.warn(
      "[h3] Implicit event handler conversion is deprecated. Use `eventHandler()` or `fromNodeMiddleware()` to define event handlers.",
      _route && _route !== "/" ? `
     Route: ${_route}` : "",
      `
     Handler: ${input}`
    );
  }
  return input;
}
function defineLazyEventHandler(factory) {
  let _promise;
  let _resolved;
  const resolveHandler = () => {
    if (_resolved) {
      return Promise.resolve(_resolved);
    }
    if (!_promise) {
      _promise = Promise.resolve(factory()).then((r) => {
        const handler2 = r.default || r;
        if (typeof handler2 !== "function") {
          throw new TypeError(
            "Invalid lazy handler result. It should be a function:",
            handler2
          );
        }
        _resolved = { handler: toEventHandler(r.default || r) };
        return _resolved;
      });
    }
    return _promise;
  };
  const handler = eventHandler((event) => {
    if (_resolved) {
      return _resolved.handler(event);
    }
    return resolveHandler().then((r) => r.handler(event));
  });
  handler.__resolve__ = resolveHandler;
  return handler;
}
const lazyEventHandler = defineLazyEventHandler;

function createApp(options = {}) {
  const stack = [];
  const handler = createAppEventHandler(stack, options);
  const resolve = createResolver(stack);
  handler.__resolve__ = resolve;
  const getWebsocket = cachedFn(() => websocketOptions(resolve, options));
  const app = {
    // @ts-expect-error
    use: (arg1, arg2, arg3) => use(app, arg1, arg2, arg3),
    resolve,
    handler,
    stack,
    options,
    get websocket() {
      return getWebsocket();
    }
  };
  return app;
}
function use(app, arg1, arg2, arg3) {
  if (Array.isArray(arg1)) {
    for (const i of arg1) {
      use(app, i, arg2, arg3);
    }
  } else if (Array.isArray(arg2)) {
    for (const i of arg2) {
      use(app, arg1, i, arg3);
    }
  } else if (typeof arg1 === "string") {
    app.stack.push(
      normalizeLayer({ ...arg3, route: arg1, handler: arg2 })
    );
  } else if (typeof arg1 === "function") {
    app.stack.push(normalizeLayer({ ...arg2, handler: arg1 }));
  } else {
    app.stack.push(normalizeLayer({ ...arg1 }));
  }
  return app;
}
function createAppEventHandler(stack, options) {
  const spacing = options.debug ? 2 : void 0;
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _reqPath = event._path || event.node.req.url || "/";
    let _layerPath;
    if (options.onRequest) {
      await options.onRequest(event);
    }
    for (const layer of stack) {
      if (layer.route.length > 1) {
        if (!_reqPath.startsWith(layer.route)) {
          continue;
        }
        _layerPath = _reqPath.slice(layer.route.length) || "/";
      } else {
        _layerPath = _reqPath;
      }
      if (layer.match && !layer.match(_layerPath, event)) {
        continue;
      }
      event._path = _layerPath;
      event.node.req.url = _layerPath;
      const val = await layer.handler(event);
      const _body = val === void 0 ? void 0 : await val;
      if (_body !== void 0) {
        const _response = { body: _body };
        if (options.onBeforeResponse) {
          event._onBeforeResponseCalled = true;
          await options.onBeforeResponse(event, _response);
        }
        await handleHandlerResponse(event, _response.body, spacing);
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, _response);
        }
        return;
      }
      if (event.handled) {
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, void 0);
        }
        return;
      }
    }
    if (!event.handled) {
      throw createError$1({
        statusCode: 404,
        statusMessage: `Cannot find any path matching ${event.path || "/"}.`
      });
    }
    if (options.onAfterResponse) {
      event._onAfterResponseCalled = true;
      await options.onAfterResponse(event, void 0);
    }
  });
}
function createResolver(stack) {
  return async (path) => {
    let _layerPath;
    for (const layer of stack) {
      if (layer.route === "/" && !layer.handler.__resolve__) {
        continue;
      }
      if (!path.startsWith(layer.route)) {
        continue;
      }
      _layerPath = path.slice(layer.route.length) || "/";
      if (layer.match && !layer.match(_layerPath, void 0)) {
        continue;
      }
      let res = { route: layer.route, handler: layer.handler };
      if (res.handler.__resolve__) {
        const _res = await res.handler.__resolve__(_layerPath);
        if (!_res) {
          continue;
        }
        res = {
          ...res,
          ..._res,
          route: joinURL(res.route || "/", _res.route || "/")
        };
      }
      return res;
    }
  };
}
function normalizeLayer(input) {
  let handler = input.handler;
  if (handler.handler) {
    handler = handler.handler;
  }
  if (input.lazy) {
    handler = lazyEventHandler(handler);
  } else if (!isEventHandler(handler)) {
    handler = toEventHandler(handler, void 0, input.route);
  }
  return {
    route: withoutTrailingSlash(input.route),
    match: input.match,
    handler
  };
}
function handleHandlerResponse(event, val, jsonSpace) {
  if (val === null) {
    return sendNoContent(event);
  }
  if (val) {
    if (isWebResponse(val)) {
      return sendWebResponse(event, val);
    }
    if (isStream(val)) {
      return sendStream(event, val);
    }
    if (val.buffer) {
      return send(event, val);
    }
    if (val.arrayBuffer && typeof val.arrayBuffer === "function") {
      return val.arrayBuffer().then((arrayBuffer) => {
        return send(event, Buffer.from(arrayBuffer), val.type);
      });
    }
    if (val instanceof Error) {
      throw createError$1(val);
    }
    if (typeof val.end === "function") {
      return true;
    }
  }
  const valType = typeof val;
  if (valType === "string") {
    return send(event, val, MIMES.html);
  }
  if (valType === "object" || valType === "boolean" || valType === "number") {
    return send(event, JSON.stringify(val, void 0, jsonSpace), MIMES.json);
  }
  if (valType === "bigint") {
    return send(event, val.toString(), MIMES.json);
  }
  throw createError$1({
    statusCode: 500,
    statusMessage: `[h3] Cannot send ${valType} as response.`
  });
}
function cachedFn(fn) {
  let cache;
  return () => {
    if (!cache) {
      cache = fn();
    }
    return cache;
  };
}
function websocketOptions(evResolver, appOptions) {
  return {
    ...appOptions.websocket,
    async resolve(info) {
      const url = info.request?.url || info.url || "/";
      const { pathname } = typeof url === "string" ? parseURL(url) : url;
      const resolved = await evResolver(pathname);
      return resolved?.handler?.__websocket__ || {};
    }
  };
}

const RouterMethods = [
  "connect",
  "delete",
  "get",
  "head",
  "options",
  "post",
  "put",
  "trace",
  "patch"
];
function createRouter(opts = {}) {
  const _router = createRouter$1({});
  const routes = {};
  let _matcher;
  const router = {};
  const addRoute = (path, handler, method) => {
    let route = routes[path];
    if (!route) {
      routes[path] = route = { path, handlers: {} };
      _router.insert(path, route);
    }
    if (Array.isArray(method)) {
      for (const m of method) {
        addRoute(path, handler, m);
      }
    } else {
      route.handlers[method] = toEventHandler(handler, void 0, path);
    }
    return router;
  };
  router.use = router.add = (path, handler, method) => addRoute(path, handler, method || "all");
  for (const method of RouterMethods) {
    router[method] = (path, handle) => router.add(path, handle, method);
  }
  const matchHandler = (path = "/", method = "get") => {
    const qIndex = path.indexOf("?");
    if (qIndex !== -1) {
      path = path.slice(0, Math.max(0, qIndex));
    }
    const matched = _router.lookup(path);
    if (!matched || !matched.handlers) {
      return {
        error: createError$1({
          statusCode: 404,
          name: "Not Found",
          statusMessage: `Cannot find any route matching ${path || "/"}.`
        })
      };
    }
    let handler = matched.handlers[method] || matched.handlers.all;
    if (!handler) {
      if (!_matcher) {
        _matcher = toRouteMatcher(_router);
      }
      const _matches = _matcher.matchAll(path).reverse();
      for (const _match of _matches) {
        if (_match.handlers[method]) {
          handler = _match.handlers[method];
          matched.handlers[method] = matched.handlers[method] || handler;
          break;
        }
        if (_match.handlers.all) {
          handler = _match.handlers.all;
          matched.handlers.all = matched.handlers.all || handler;
          break;
        }
      }
    }
    if (!handler) {
      return {
        error: createError$1({
          statusCode: 405,
          name: "Method Not Allowed",
          statusMessage: `Method ${method} is not allowed on this route.`
        })
      };
    }
    return { matched, handler };
  };
  const isPreemptive = opts.preemptive || opts.preemtive;
  router.handler = eventHandler((event) => {
    const match = matchHandler(
      event.path,
      event.method.toLowerCase()
    );
    if ("error" in match) {
      if (isPreemptive) {
        throw match.error;
      } else {
        return;
      }
    }
    event.context.matchedRoute = match.matched;
    const params = match.matched.params || {};
    event.context.params = params;
    return Promise.resolve(match.handler(event)).then((res) => {
      if (res === void 0 && isPreemptive) {
        return null;
      }
      return res;
    });
  });
  router.handler.__resolve__ = async (path) => {
    path = withLeadingSlash(path);
    const match = matchHandler(path);
    if ("error" in match) {
      return;
    }
    let res = {
      route: match.matched.path,
      handler: match.handler
    };
    if (match.handler.__resolve__) {
      const _res = await match.handler.__resolve__(path);
      if (!_res) {
        return;
      }
      res = { ...res, ..._res };
    }
    return res;
  };
  return router;
}
function toNodeListener(app) {
  const toNodeHandle = async function(req, res) {
    const event = createEvent(req, res);
    try {
      await app.handler(event);
    } catch (_error) {
      const error = createError$1(_error);
      if (!isError(_error)) {
        error.unhandled = true;
      }
      setResponseStatus(event, error.statusCode, error.statusMessage);
      if (app.options.onError) {
        await app.options.onError(error, event);
      }
      if (event.handled) {
        return;
      }
      if (error.unhandled || error.fatal) {
        console.error("[h3]", error.fatal ? "[fatal]" : "[unhandled]", error);
      }
      if (app.options.onBeforeResponse && !event._onBeforeResponseCalled) {
        await app.options.onBeforeResponse(event, { body: error });
      }
      await sendError(event, error, !!app.options.debug);
      if (app.options.onAfterResponse && !event._onAfterResponseCalled) {
        await app.options.onAfterResponse(event, { body: error });
      }
    }
  };
  return toNodeHandle;
}

function flatHooks(configHooks, hooks = {}, parentName) {
  for (const key in configHooks) {
    const subHook = configHooks[key];
    const name = parentName ? `${parentName}:${key}` : key;
    if (typeof subHook === "object" && subHook !== null) {
      flatHooks(subHook, hooks, name);
    } else if (typeof subHook === "function") {
      hooks[name] = subHook;
    }
  }
  return hooks;
}
const defaultTask = { run: (function_) => function_() };
const _createTask = () => defaultTask;
const createTask = typeof console.createTask !== "undefined" ? console.createTask : _createTask;
function serialTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return hooks.reduce(
    (promise, hookFunction) => promise.then(() => task.run(() => hookFunction(...args))),
    Promise.resolve()
  );
}
function parallelTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
}
function callEachWith(callbacks, arg0) {
  for (const callback of [...callbacks]) {
    callback(arg0);
  }
}

class Hookable {
  constructor() {
    this._hooks = {};
    this._before = void 0;
    this._after = void 0;
    this._deprecatedMessages = void 0;
    this._deprecatedHooks = {};
    this.hook = this.hook.bind(this);
    this.callHook = this.callHook.bind(this);
    this.callHookWith = this.callHookWith.bind(this);
  }
  hook(name, function_, options = {}) {
    if (!name || typeof function_ !== "function") {
      return () => {
      };
    }
    const originalName = name;
    let dep;
    while (this._deprecatedHooks[name]) {
      dep = this._deprecatedHooks[name];
      name = dep.to;
    }
    if (dep && !options.allowDeprecated) {
      let message = dep.message;
      if (!message) {
        message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
      }
      if (!this._deprecatedMessages) {
        this._deprecatedMessages = /* @__PURE__ */ new Set();
      }
      if (!this._deprecatedMessages.has(message)) {
        console.warn(message);
        this._deprecatedMessages.add(message);
      }
    }
    if (!function_.name) {
      try {
        Object.defineProperty(function_, "name", {
          get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
          configurable: true
        });
      } catch {
      }
    }
    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push(function_);
    return () => {
      if (function_) {
        this.removeHook(name, function_);
        function_ = void 0;
      }
    };
  }
  hookOnce(name, function_) {
    let _unreg;
    let _function = (...arguments_) => {
      if (typeof _unreg === "function") {
        _unreg();
      }
      _unreg = void 0;
      _function = void 0;
      return function_(...arguments_);
    };
    _unreg = this.hook(name, _function);
    return _unreg;
  }
  removeHook(name, function_) {
    if (this._hooks[name]) {
      const index = this._hooks[name].indexOf(function_);
      if (index !== -1) {
        this._hooks[name].splice(index, 1);
      }
      if (this._hooks[name].length === 0) {
        delete this._hooks[name];
      }
    }
  }
  deprecateHook(name, deprecated) {
    this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
    const _hooks = this._hooks[name] || [];
    delete this._hooks[name];
    for (const hook of _hooks) {
      this.hook(name, hook);
    }
  }
  deprecateHooks(deprecatedHooks) {
    Object.assign(this._deprecatedHooks, deprecatedHooks);
    for (const name in deprecatedHooks) {
      this.deprecateHook(name, deprecatedHooks[name]);
    }
  }
  addHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    const removeFns = Object.keys(hooks).map(
      (key) => this.hook(key, hooks[key])
    );
    return () => {
      for (const unreg of removeFns.splice(0, removeFns.length)) {
        unreg();
      }
    };
  }
  removeHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    for (const key in hooks) {
      this.removeHook(key, hooks[key]);
    }
  }
  removeAllHooks() {
    for (const key in this._hooks) {
      delete this._hooks[key];
    }
  }
  callHook(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(serialTaskCaller, name, ...arguments_);
  }
  callHookParallel(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(parallelTaskCaller, name, ...arguments_);
  }
  callHookWith(caller, name, ...arguments_) {
    const event = this._before || this._after ? { name, args: arguments_, context: {} } : void 0;
    if (this._before) {
      callEachWith(this._before, event);
    }
    const result = caller(
      name in this._hooks ? [...this._hooks[name]] : [],
      arguments_
    );
    if (result instanceof Promise) {
      return result.finally(() => {
        if (this._after && event) {
          callEachWith(this._after, event);
        }
      });
    }
    if (this._after && event) {
      callEachWith(this._after, event);
    }
    return result;
  }
  beforeEach(function_) {
    this._before = this._before || [];
    this._before.push(function_);
    return () => {
      if (this._before !== void 0) {
        const index = this._before.indexOf(function_);
        if (index !== -1) {
          this._before.splice(index, 1);
        }
      }
    };
  }
  afterEach(function_) {
    this._after = this._after || [];
    this._after.push(function_);
    return () => {
      if (this._after !== void 0) {
        const index = this._after.indexOf(function_);
        if (index !== -1) {
          this._after.splice(index, 1);
        }
      }
    };
  }
}
function createHooks() {
  return new Hookable();
}

const s$1=globalThis.Headers,i$1=globalThis.AbortController,l$1=globalThis.fetch||(()=>{throw new Error("[node-fetch-native] Failed to fetch: `globalThis.fetch` is not available!")});

class FetchError extends Error {
  constructor(message, opts) {
    super(message, opts);
    this.name = "FetchError";
    if (opts?.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
}
function createFetchError(ctx) {
  const errorMessage = ctx.error?.message || ctx.error?.toString() || "";
  const method = ctx.request?.method || ctx.options?.method || "GET";
  const url = ctx.request?.url || String(ctx.request) || "/";
  const requestStr = `[${method}] ${JSON.stringify(url)}`;
  const statusStr = ctx.response ? `${ctx.response.status} ${ctx.response.statusText}` : "<no response>";
  const message = `${requestStr}: ${statusStr}${errorMessage ? ` ${errorMessage}` : ""}`;
  const fetchError = new FetchError(
    message,
    ctx.error ? { cause: ctx.error } : void 0
  );
  for (const key of ["request", "options", "response"]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx[key];
      }
    });
  }
  for (const [key, refKey] of [
    ["data", "_data"],
    ["status", "status"],
    ["statusCode", "status"],
    ["statusText", "statusText"],
    ["statusMessage", "statusText"]
  ]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx.response && ctx.response[refKey];
      }
    });
  }
  return fetchError;
}

const payloadMethods = new Set(
  Object.freeze(["PATCH", "POST", "PUT", "DELETE"])
);
function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}
function isJSONSerializable(value) {
  if (value === void 0) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  if (value instanceof FormData || value instanceof URLSearchParams) {
    return false;
  }
  return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
const textTypes = /* @__PURE__ */ new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html"
]);
const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(_contentType = "") {
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift() || "";
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (contentType === "text/event-stream") {
    return "stream";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
function resolveFetchOptions(request, input, defaults, Headers) {
  const headers = mergeHeaders(
    input?.headers ?? request?.headers,
    defaults?.headers,
    Headers
  );
  let query;
  if (defaults?.query || defaults?.params || input?.params || input?.query) {
    query = {
      ...defaults?.params,
      ...defaults?.query,
      ...input?.params,
      ...input?.query
    };
  }
  return {
    ...defaults,
    ...input,
    query,
    params: query,
    headers
  };
}
function mergeHeaders(input, defaults, Headers) {
  if (!defaults) {
    return new Headers(input);
  }
  const headers = new Headers(defaults);
  if (input) {
    for (const [key, value] of Symbol.iterator in input || Array.isArray(input) ? input : new Headers(input)) {
      headers.set(key, value);
    }
  }
  return headers;
}
async function callHooks(context, hooks) {
  if (hooks) {
    if (Array.isArray(hooks)) {
      for (const hook of hooks) {
        await hook(context);
      }
    } else {
      await hooks(context);
    }
  }
}

const retryStatusCodes = /* @__PURE__ */ new Set([
  408,
  // Request Timeout
  409,
  // Conflict
  425,
  // Too Early (Experimental)
  429,
  // Too Many Requests
  500,
  // Internal Server Error
  502,
  // Bad Gateway
  503,
  // Service Unavailable
  504
  // Gateway Timeout
]);
const nullBodyResponses = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createFetch(globalOptions = {}) {
  const {
    fetch = globalThis.fetch,
    Headers = globalThis.Headers,
    AbortController = globalThis.AbortController
  } = globalOptions;
  async function onError(context) {
    const isAbort = context.error && context.error.name === "AbortError" && !context.options.timeout || false;
    if (context.options.retry !== false && !isAbort) {
      let retries;
      if (typeof context.options.retry === "number") {
        retries = context.options.retry;
      } else {
        retries = isPayloadMethod(context.options.method) ? 0 : 1;
      }
      const responseCode = context.response && context.response.status || 500;
      if (retries > 0 && (Array.isArray(context.options.retryStatusCodes) ? context.options.retryStatusCodes.includes(responseCode) : retryStatusCodes.has(responseCode))) {
        const retryDelay = typeof context.options.retryDelay === "function" ? context.options.retryDelay(context) : context.options.retryDelay || 0;
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        return $fetchRaw(context.request, {
          ...context.options,
          retry: retries - 1
        });
      }
    }
    const error = createFetchError(context);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, $fetchRaw);
    }
    throw error;
  }
  const $fetchRaw = async function $fetchRaw2(_request, _options = {}) {
    const context = {
      request: _request,
      options: resolveFetchOptions(
        _request,
        _options,
        globalOptions.defaults,
        Headers
      ),
      response: void 0,
      error: void 0
    };
    if (context.options.method) {
      context.options.method = context.options.method.toUpperCase();
    }
    if (context.options.onRequest) {
      await callHooks(context, context.options.onRequest);
      if (!(context.options.headers instanceof Headers)) {
        context.options.headers = new Headers(
          context.options.headers || {}
          /* compat */
        );
      }
    }
    if (typeof context.request === "string") {
      if (context.options.baseURL) {
        context.request = withBase(context.request, context.options.baseURL);
      }
      if (context.options.query) {
        context.request = withQuery(context.request, context.options.query);
        delete context.options.query;
      }
      if ("query" in context.options) {
        delete context.options.query;
      }
      if ("params" in context.options) {
        delete context.options.params;
      }
    }
    if (context.options.body && isPayloadMethod(context.options.method)) {
      if (isJSONSerializable(context.options.body)) {
        const contentType = context.options.headers.get("content-type");
        if (typeof context.options.body !== "string") {
          context.options.body = contentType === "application/x-www-form-urlencoded" ? new URLSearchParams(
            context.options.body
          ).toString() : JSON.stringify(context.options.body);
        }
        if (!contentType) {
          context.options.headers.set("content-type", "application/json");
        }
        if (!context.options.headers.has("accept")) {
          context.options.headers.set("accept", "application/json");
        }
      } else if (
        // ReadableStream Body
        "pipeTo" in context.options.body && typeof context.options.body.pipeTo === "function" || // Node.js Stream Body
        typeof context.options.body.pipe === "function"
      ) {
        if (!("duplex" in context.options)) {
          context.options.duplex = "half";
        }
      }
    }
    let abortTimeout;
    if (!context.options.signal && context.options.timeout) {
      const controller = new AbortController();
      abortTimeout = setTimeout(() => {
        const error = new Error(
          "[TimeoutError]: The operation was aborted due to timeout"
        );
        error.name = "TimeoutError";
        error.code = 23;
        controller.abort(error);
      }, context.options.timeout);
      context.options.signal = controller.signal;
    }
    try {
      context.response = await fetch(
        context.request,
        context.options
      );
    } catch (error) {
      context.error = error;
      if (context.options.onRequestError) {
        await callHooks(
          context,
          context.options.onRequestError
        );
      }
      return await onError(context);
    } finally {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }
    const hasBody = (context.response.body || // https://github.com/unjs/ofetch/issues/324
    // https://github.com/unjs/ofetch/issues/294
    // https://github.com/JakeChampion/fetch/issues/1454
    context.response._bodyInit) && !nullBodyResponses.has(context.response.status) && context.options.method !== "HEAD";
    if (hasBody) {
      const responseType = (context.options.parseResponse ? "json" : context.options.responseType) || detectResponseType(context.response.headers.get("content-type") || "");
      switch (responseType) {
        case "json": {
          const data = await context.response.text();
          const parseFunction = context.options.parseResponse || destr;
          context.response._data = parseFunction(data);
          break;
        }
        case "stream": {
          context.response._data = context.response.body || context.response._bodyInit;
          break;
        }
        default: {
          context.response._data = await context.response[responseType]();
        }
      }
    }
    if (context.options.onResponse) {
      await callHooks(
        context,
        context.options.onResponse
      );
    }
    if (!context.options.ignoreResponseError && context.response.status >= 400 && context.response.status < 600) {
      if (context.options.onResponseError) {
        await callHooks(
          context,
          context.options.onResponseError
        );
      }
      return await onError(context);
    }
    return context.response;
  };
  const $fetch = async function $fetch2(request, options) {
    const r = await $fetchRaw(request, options);
    return r._data;
  };
  $fetch.raw = $fetchRaw;
  $fetch.native = (...args) => fetch(...args);
  $fetch.create = (defaultOptions = {}, customGlobalOptions = {}) => createFetch({
    ...globalOptions,
    ...customGlobalOptions,
    defaults: {
      ...globalOptions.defaults,
      ...customGlobalOptions.defaults,
      ...defaultOptions
    }
  });
  return $fetch;
}

function createNodeFetch() {
  const useKeepAlive = JSON.parse(process.env.FETCH_KEEP_ALIVE || "false");
  if (!useKeepAlive) {
    return l$1;
  }
  const agentOptions = { keepAlive: true };
  const httpAgent = new http.Agent(agentOptions);
  const httpsAgent = new https.Agent(agentOptions);
  const nodeFetchOptions = {
    agent(parsedURL) {
      return parsedURL.protocol === "http:" ? httpAgent : httpsAgent;
    }
  };
  return function nodeFetchWithKeepAlive(input, init) {
    return l$1(input, { ...nodeFetchOptions, ...init });
  };
}
const fetch$1 = globalThis.fetch ? (...args) => globalThis.fetch(...args) : createNodeFetch();
const Headers$1 = globalThis.Headers || s$1;
const AbortController$1 = globalThis.AbortController || i$1;
const ofetch = createFetch({ fetch: fetch$1, Headers: Headers$1, AbortController: AbortController$1 });
const $fetch$1 = ofetch;

function wrapToPromise(value) {
  if (!value || typeof value.then !== "function") {
    return Promise.resolve(value);
  }
  return value;
}
function asyncCall(function_, ...arguments_) {
  try {
    return wrapToPromise(function_(...arguments_));
  } catch (error) {
    return Promise.reject(error);
  }
}
function isPrimitive$1(value) {
  const type = typeof value;
  return value === null || type !== "object" && type !== "function";
}
function isPureObject(value) {
  const proto = Object.getPrototypeOf(value);
  return !proto || proto.isPrototypeOf(Object);
}
function stringify(value) {
  if (isPrimitive$1(value)) {
    return String(value);
  }
  if (isPureObject(value) || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value.toJSON === "function") {
    return stringify(value.toJSON());
  }
  throw new Error("[unstorage] Cannot stringify value!");
}
const BASE64_PREFIX = "base64:";
function serializeRaw(value) {
  if (typeof value === "string") {
    return value;
  }
  return BASE64_PREFIX + base64Encode(value);
}
function deserializeRaw(value) {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.startsWith(BASE64_PREFIX)) {
    return value;
  }
  return base64Decode(value.slice(BASE64_PREFIX.length));
}
function base64Decode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input, "base64");
  }
  return Uint8Array.from(
    globalThis.atob(input),
    (c) => c.codePointAt(0)
  );
}
function base64Encode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input).toString("base64");
  }
  return globalThis.btoa(String.fromCodePoint(...input));
}

const storageKeyProperties = [
  "has",
  "hasItem",
  "get",
  "getItem",
  "getItemRaw",
  "set",
  "setItem",
  "setItemRaw",
  "del",
  "remove",
  "removeItem",
  "getMeta",
  "setMeta",
  "removeMeta",
  "getKeys",
  "clear",
  "mount",
  "unmount"
];
function prefixStorage(storage, base) {
  base = normalizeBaseKey(base);
  if (!base) {
    return storage;
  }
  const nsStorage = { ...storage };
  for (const property of storageKeyProperties) {
    nsStorage[property] = (key = "", ...args) => (
      // @ts-ignore
      storage[property](base + key, ...args)
    );
  }
  nsStorage.getKeys = (key = "", ...arguments_) => storage.getKeys(base + key, ...arguments_).then((keys) => keys.map((key2) => key2.slice(base.length)));
  nsStorage.keys = nsStorage.getKeys;
  nsStorage.getItems = async (items, commonOptions) => {
    const prefixedItems = items.map(
      (item) => typeof item === "string" ? base + item : { ...item, key: base + item.key }
    );
    const results = await storage.getItems(prefixedItems, commonOptions);
    return results.map((entry) => ({
      key: entry.key.slice(base.length),
      value: entry.value
    }));
  };
  nsStorage.setItems = async (items, commonOptions) => {
    const prefixedItems = items.map((item) => ({
      key: base + item.key,
      value: item.value,
      options: item.options
    }));
    return storage.setItems(prefixedItems, commonOptions);
  };
  return nsStorage;
}
function normalizeKey$1(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
}
function joinKeys(...keys) {
  return normalizeKey$1(keys.join(":"));
}
function normalizeBaseKey(base) {
  base = normalizeKey$1(base);
  return base ? base + ":" : "";
}
function filterKeyByDepth(key, depth) {
  if (depth === void 0) {
    return true;
  }
  let substrCount = 0;
  let index = key.indexOf(":");
  while (index > -1) {
    substrCount++;
    index = key.indexOf(":", index + 1);
  }
  return substrCount <= depth;
}
function filterKeyByBase(key, base) {
  if (base) {
    return key.startsWith(base) && key[key.length - 1] !== "$";
  }
  return key[key.length - 1] !== "$";
}

function defineDriver$1(factory) {
  return factory;
}

const DRIVER_NAME$2 = "memory";
const memory = defineDriver$1(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME$2,
    getInstance: () => data,
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return [...data.keys()];
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    }
  };
});

function createStorage(options = {}) {
  const context = {
    mounts: { "": options.driver || memory() },
    mountpoints: [""],
    watching: false,
    watchListeners: [],
    unwatch: {}
  };
  const getMount = (key) => {
    for (const base of context.mountpoints) {
      if (key.startsWith(base)) {
        return {
          base,
          relativeKey: key.slice(base.length),
          driver: context.mounts[base]
        };
      }
    }
    return {
      base: "",
      relativeKey: key,
      driver: context.mounts[""]
    };
  };
  const getMounts = (base, includeParent) => {
    return context.mountpoints.filter(
      (mountpoint) => mountpoint.startsWith(base) || includeParent && base.startsWith(mountpoint)
    ).map((mountpoint) => ({
      relativeBase: base.length > mountpoint.length ? base.slice(mountpoint.length) : void 0,
      mountpoint,
      driver: context.mounts[mountpoint]
    }));
  };
  const onChange = (event, key) => {
    if (!context.watching) {
      return;
    }
    key = normalizeKey$1(key);
    for (const listener of context.watchListeners) {
      listener(event, key);
    }
  };
  const startWatch = async () => {
    if (context.watching) {
      return;
    }
    context.watching = true;
    for (const mountpoint in context.mounts) {
      context.unwatch[mountpoint] = await watch(
        context.mounts[mountpoint],
        onChange,
        mountpoint
      );
    }
  };
  const stopWatch = async () => {
    if (!context.watching) {
      return;
    }
    for (const mountpoint in context.unwatch) {
      await context.unwatch[mountpoint]();
    }
    context.unwatch = {};
    context.watching = false;
  };
  const runBatch = (items, commonOptions, cb) => {
    const batches = /* @__PURE__ */ new Map();
    const getBatch = (mount) => {
      let batch = batches.get(mount.base);
      if (!batch) {
        batch = {
          driver: mount.driver,
          base: mount.base,
          items: []
        };
        batches.set(mount.base, batch);
      }
      return batch;
    };
    for (const item of items) {
      const isStringItem = typeof item === "string";
      const key = normalizeKey$1(isStringItem ? item : item.key);
      const value = isStringItem ? void 0 : item.value;
      const options2 = isStringItem || !item.options ? commonOptions : { ...commonOptions, ...item.options };
      const mount = getMount(key);
      getBatch(mount).items.push({
        key,
        value,
        relativeKey: mount.relativeKey,
        options: options2
      });
    }
    return Promise.all([...batches.values()].map((batch) => cb(batch))).then(
      (r) => r.flat()
    );
  };
  const storage = {
    // Item
    hasItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.hasItem, relativeKey, opts);
    },
    getItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => destr(value)
      );
    },
    getItems(items, commonOptions = {}) {
      return runBatch(items, commonOptions, (batch) => {
        if (batch.driver.getItems) {
          return asyncCall(
            batch.driver.getItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              options: item.options
            })),
            commonOptions
          ).then(
            (r) => r.map((item) => ({
              key: joinKeys(batch.base, item.key),
              value: destr(item.value)
            }))
          );
        }
        return Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.getItem,
              item.relativeKey,
              item.options
            ).then((value) => ({
              key: item.key,
              value: destr(value)
            }));
          })
        );
      });
    },
    getItemRaw(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.getItemRaw) {
        return asyncCall(driver.getItemRaw, relativeKey, opts);
      }
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => deserializeRaw(value)
      );
    },
    async setItem(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.setItem) {
        return;
      }
      await asyncCall(driver.setItem, relativeKey, stringify(value), opts);
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async setItems(items, commonOptions) {
      await runBatch(items, commonOptions, async (batch) => {
        if (batch.driver.setItems) {
          return asyncCall(
            batch.driver.setItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              value: stringify(item.value),
              options: item.options
            })),
            commonOptions
          );
        }
        if (!batch.driver.setItem) {
          return;
        }
        await Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.setItem,
              item.relativeKey,
              stringify(item.value),
              item.options
            );
          })
        );
      });
    },
    async setItemRaw(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key, opts);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.setItemRaw) {
        await asyncCall(driver.setItemRaw, relativeKey, value, opts);
      } else if (driver.setItem) {
        await asyncCall(driver.setItem, relativeKey, serializeRaw(value), opts);
      } else {
        return;
      }
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async removeItem(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { removeMeta: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.removeItem) {
        return;
      }
      await asyncCall(driver.removeItem, relativeKey, opts);
      if (opts.removeMeta || opts.removeMata) {
        await asyncCall(driver.removeItem, relativeKey + "$", opts);
      }
      if (!driver.watch) {
        onChange("remove", key);
      }
    },
    // Meta
    async getMeta(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { nativeOnly: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      const meta = /* @__PURE__ */ Object.create(null);
      if (driver.getMeta) {
        Object.assign(meta, await asyncCall(driver.getMeta, relativeKey, opts));
      }
      if (!opts.nativeOnly) {
        const value = await asyncCall(
          driver.getItem,
          relativeKey + "$",
          opts
        ).then((value_) => destr(value_));
        if (value && typeof value === "object") {
          if (typeof value.atime === "string") {
            value.atime = new Date(value.atime);
          }
          if (typeof value.mtime === "string") {
            value.mtime = new Date(value.mtime);
          }
          Object.assign(meta, value);
        }
      }
      return meta;
    },
    setMeta(key, value, opts = {}) {
      return this.setItem(key + "$", value, opts);
    },
    removeMeta(key, opts = {}) {
      return this.removeItem(key + "$", opts);
    },
    // Keys
    async getKeys(base, opts = {}) {
      base = normalizeBaseKey(base);
      const mounts = getMounts(base, true);
      let maskedMounts = [];
      const allKeys = [];
      let allMountsSupportMaxDepth = true;
      for (const mount of mounts) {
        if (!mount.driver.flags?.maxDepth) {
          allMountsSupportMaxDepth = false;
        }
        const rawKeys = await asyncCall(
          mount.driver.getKeys,
          mount.relativeBase,
          opts
        );
        for (const key of rawKeys) {
          const fullKey = mount.mountpoint + normalizeKey$1(key);
          if (!maskedMounts.some((p) => fullKey.startsWith(p))) {
            allKeys.push(fullKey);
          }
        }
        maskedMounts = [
          mount.mountpoint,
          ...maskedMounts.filter((p) => !p.startsWith(mount.mountpoint))
        ];
      }
      const shouldFilterByDepth = opts.maxDepth !== void 0 && !allMountsSupportMaxDepth;
      return allKeys.filter(
        (key) => (!shouldFilterByDepth || filterKeyByDepth(key, opts.maxDepth)) && filterKeyByBase(key, base)
      );
    },
    // Utils
    async clear(base, opts = {}) {
      base = normalizeBaseKey(base);
      await Promise.all(
        getMounts(base, false).map(async (m) => {
          if (m.driver.clear) {
            return asyncCall(m.driver.clear, m.relativeBase, opts);
          }
          if (m.driver.removeItem) {
            const keys = await m.driver.getKeys(m.relativeBase || "", opts);
            return Promise.all(
              keys.map((key) => m.driver.removeItem(key, opts))
            );
          }
        })
      );
    },
    async dispose() {
      await Promise.all(
        Object.values(context.mounts).map((driver) => dispose(driver))
      );
    },
    async watch(callback) {
      await startWatch();
      context.watchListeners.push(callback);
      return async () => {
        context.watchListeners = context.watchListeners.filter(
          (listener) => listener !== callback
        );
        if (context.watchListeners.length === 0) {
          await stopWatch();
        }
      };
    },
    async unwatch() {
      context.watchListeners = [];
      await stopWatch();
    },
    // Mount
    mount(base, driver) {
      base = normalizeBaseKey(base);
      if (base && context.mounts[base]) {
        throw new Error(`already mounted at ${base}`);
      }
      if (base) {
        context.mountpoints.push(base);
        context.mountpoints.sort((a, b) => b.length - a.length);
      }
      context.mounts[base] = driver;
      if (context.watching) {
        Promise.resolve(watch(driver, onChange, base)).then((unwatcher) => {
          context.unwatch[base] = unwatcher;
        }).catch(console.error);
      }
      return storage;
    },
    async unmount(base, _dispose = true) {
      base = normalizeBaseKey(base);
      if (!base || !context.mounts[base]) {
        return;
      }
      if (context.watching && base in context.unwatch) {
        context.unwatch[base]?.();
        delete context.unwatch[base];
      }
      if (_dispose) {
        await dispose(context.mounts[base]);
      }
      context.mountpoints = context.mountpoints.filter((key) => key !== base);
      delete context.mounts[base];
    },
    getMount(key = "") {
      key = normalizeKey$1(key) + ":";
      const m = getMount(key);
      return {
        driver: m.driver,
        base: m.base
      };
    },
    getMounts(base = "", opts = {}) {
      base = normalizeKey$1(base);
      const mounts = getMounts(base, opts.parents);
      return mounts.map((m) => ({
        driver: m.driver,
        base: m.mountpoint
      }));
    },
    // Aliases
    keys: (base, opts = {}) => storage.getKeys(base, opts),
    get: (key, opts = {}) => storage.getItem(key, opts),
    set: (key, value, opts = {}) => storage.setItem(key, value, opts),
    has: (key, opts = {}) => storage.hasItem(key, opts),
    del: (key, opts = {}) => storage.removeItem(key, opts),
    remove: (key, opts = {}) => storage.removeItem(key, opts)
  };
  return storage;
}
function watch(driver, onChange, base) {
  return driver.watch ? driver.watch((event, key) => onChange(event, base + key)) : () => {
  };
}
async function dispose(driver) {
  if (typeof driver.dispose === "function") {
    await asyncCall(driver.dispose);
  }
}

const _assets = {
  ["nuxt-og-image:fonts:Inter-normal-400.ttf.base64"]: {
    import: () => import('../raw/Inter-normal-400.ttf.mjs').then(r => r.default || r),
    meta: {"type":"text/plain; charset=utf-8","etag":"\"652cc-qEeSD1DXCSV8gPP2rnBA6ePGdZ4\"","mtime":"2026-03-17T17:10:12.355Z"}
  },
  ["nuxt-og-image:fonts:Inter-normal-700.ttf.base64"]: {
    import: () => import('../raw/Inter-normal-700.ttf.mjs').then(r => r.default || r),
    meta: {"type":"text/plain; charset=utf-8","etag":"\"674f0-FZReUXHhPTnY0HmYVn2iPpKm9ds\"","mtime":"2026-03-17T17:10:12.356Z"}
  }
};

const normalizeKey = function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
};

const assets$1 = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

function defineDriver(factory) {
  return factory;
}
function createError(driver, message, opts) {
  const err = new Error(`[unstorage] [${driver}] ${message}`, opts);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(err, createError);
  }
  return err;
}
function createRequiredError(driver, name) {
  if (Array.isArray(name)) {
    return createError(
      driver,
      `Missing some of the required options ${name.map((n) => "`" + n + "`").join(", ")}`
    );
  }
  return createError(driver, `Missing required option \`${name}\`.`);
}

function ignoreNotfound(err) {
  return err.code === "ENOENT" || err.code === "EISDIR" ? null : err;
}
function ignoreExists(err) {
  return err.code === "EEXIST" ? null : err;
}
async function writeFile(path, data, encoding) {
  await ensuredir(dirname$1(path));
  return promises.writeFile(path, data, encoding);
}
function readFile(path, encoding) {
  return promises.readFile(path, encoding).catch(ignoreNotfound);
}
function unlink(path) {
  return promises.unlink(path).catch(ignoreNotfound);
}
function readdir(dir) {
  return promises.readdir(dir, { withFileTypes: true }).catch(ignoreNotfound).then((r) => r || []);
}
async function ensuredir(dir) {
  if (existsSync(dir)) {
    return;
  }
  await ensuredir(dirname$1(dir)).catch(ignoreExists);
  await promises.mkdir(dir).catch(ignoreExists);
}
async function readdirRecursive(dir, ignore, maxDepth) {
  if (ignore && ignore(dir)) {
    return [];
  }
  const entries = await readdir(dir);
  const files = [];
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve$2(dir, entry.name);
      if (entry.isDirectory()) {
        if (maxDepth === void 0 || maxDepth > 0) {
          const dirFiles = await readdirRecursive(
            entryPath,
            ignore,
            maxDepth === void 0 ? void 0 : maxDepth - 1
          );
          files.push(...dirFiles.map((f) => entry.name + "/" + f));
        }
      } else {
        if (!(ignore && ignore(entry.name))) {
          files.push(entry.name);
        }
      }
    })
  );
  return files;
}
async function rmRecursive(dir) {
  const entries = await readdir(dir);
  await Promise.all(
    entries.map((entry) => {
      const entryPath = resolve$2(dir, entry.name);
      if (entry.isDirectory()) {
        return rmRecursive(entryPath).then(() => promises.rmdir(entryPath));
      } else {
        return promises.unlink(entryPath);
      }
    })
  );
}

const PATH_TRAVERSE_RE = /\.\.:|\.\.$/;
const DRIVER_NAME$1 = "fs-lite";
const unstorage_47drivers_47fs_45lite = defineDriver((opts = {}) => {
  if (!opts.base) {
    throw createRequiredError(DRIVER_NAME$1, "base");
  }
  opts.base = resolve$2(opts.base);
  const r = (key) => {
    if (PATH_TRAVERSE_RE.test(key)) {
      throw createError(
        DRIVER_NAME$1,
        `Invalid key: ${JSON.stringify(key)}. It should not contain .. segments`
      );
    }
    const resolved = join(opts.base, key.replace(/:/g, "/"));
    return resolved;
  };
  return {
    name: DRIVER_NAME$1,
    options: opts,
    flags: {
      maxDepth: true
    },
    hasItem(key) {
      return existsSync(r(key));
    },
    getItem(key) {
      return readFile(r(key), "utf8");
    },
    getItemRaw(key) {
      return readFile(r(key));
    },
    async getMeta(key) {
      const { atime, mtime, size, birthtime, ctime } = await promises.stat(r(key)).catch(() => ({}));
      return { atime, mtime, size, birthtime, ctime };
    },
    setItem(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value, "utf8");
    },
    setItemRaw(key, value) {
      if (opts.readOnly) {
        return;
      }
      return writeFile(r(key), value);
    },
    removeItem(key) {
      if (opts.readOnly) {
        return;
      }
      return unlink(r(key));
    },
    getKeys(_base, topts) {
      return readdirRecursive(r("."), opts.ignore, topts?.maxDepth);
    },
    async clear() {
      if (opts.readOnly || opts.noClear) {
        return;
      }
      await rmRecursive(r("."));
    }
  };
});

const storage$1 = createStorage({});

storage$1.mount('/assets', assets$1);

storage$1.mount('data', unstorage_47drivers_47fs_45lite({"driver":"fsLite","base":"./.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage$1, base) : storage$1;
}

function serialize$1(o){return typeof o=="string"?`'${o}'`:new c$1().serialize(o)}const c$1=/*@__PURE__*/function(){class o{#t=new Map;compare(t,r){const e=typeof t,n=typeof r;return e==="string"&&n==="string"?t.localeCompare(r):e==="number"&&n==="number"?t-r:String.prototype.localeCompare.call(this.serialize(t,true),this.serialize(r,true))}serialize(t,r){if(t===null)return "null";switch(typeof t){case "string":return r?t:`'${t}'`;case "bigint":return `${t}n`;case "object":return this.$object(t);case "function":return this.$function(t)}return String(t)}serializeObject(t){const r=Object.prototype.toString.call(t);if(r!=="[object Object]")return this.serializeBuiltInType(r.length<10?`unknown:${r}`:r.slice(8,-1),t);const e=t.constructor,n=e===Object||e===void 0?"":e.name;if(n!==""&&globalThis[n]===e)return this.serializeBuiltInType(n,t);if(typeof t.toJSON=="function"){const i=t.toJSON();return n+(i!==null&&typeof i=="object"?this.$object(i):`(${this.serialize(i)})`)}return this.serializeObjectEntries(n,Object.entries(t))}serializeBuiltInType(t,r){const e=this["$"+t];if(e)return e.call(this,r);if(typeof r?.entries=="function")return this.serializeObjectEntries(t,r.entries());throw new Error(`Cannot serialize ${t}`)}serializeObjectEntries(t,r){const e=Array.from(r).sort((i,a)=>this.compare(i[0],a[0]));let n=`${t}{`;for(let i=0;i<e.length;i++){const[a,l]=e[i];n+=`${this.serialize(a,true)}:${this.serialize(l)}`,i<e.length-1&&(n+=",");}return n+"}"}$object(t){let r=this.#t.get(t);return r===void 0&&(this.#t.set(t,`#${this.#t.size}`),r=this.serializeObject(t),this.#t.set(t,r)),r}$function(t){const r=Function.prototype.toString.call(t);return r.slice(-15)==="[native code] }"?`${t.name||""}()[native]`:`${t.name}(${t.length})${r.replace(/\s*\n\s*/g,"")}`}$Array(t){let r="[";for(let e=0;e<t.length;e++)r+=this.serialize(t[e]),e<t.length-1&&(r+=",");return r+"]"}$Date(t){try{return `Date(${t.toISOString()})`}catch{return "Date(null)"}}$ArrayBuffer(t){return `ArrayBuffer[${new Uint8Array(t).join(",")}]`}$Set(t){return `Set${this.$Array(Array.from(t).sort((r,e)=>this.compare(r,e)))}`}$Map(t){return this.serializeObjectEntries("Map",t.entries())}}for(const s of ["Error","RegExp","URL"])o.prototype["$"+s]=function(t){return `${s}(${t})`};for(const s of ["Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Uint16Array","Int32Array","Uint32Array","Float32Array","Float64Array"])o.prototype["$"+s]=function(t){return `${s}[${t.join(",")}]`};for(const s of ["BigInt64Array","BigUint64Array"])o.prototype["$"+s]=function(t){return `${s}[${t.join("n,")}${t.length>0?"n":""}]`};return o}();

function isEqual(object1, object2) {
  if (object1 === object2) {
    return true;
  }
  if (serialize$1(object1) === serialize$1(object2)) {
    return true;
  }
  return false;
}

const e=globalThis.process?.getBuiltinModule?.("crypto")?.hash,r$1="sha256",s="base64url";function digest(t){if(e)return e(r$1,t,s);const o=createHash(r$1).update(t);return globalThis.process?.versions?.webcontainer?o.digest().toString(s):o.digest(s)}

function hash$1(input) {
  return digest(serialize$1(input));
}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

function klona(x) {
	if (typeof x !== 'object') return x;

	var k, tmp, str=Object.prototype.toString.call(x);

	if (str === '[object Object]') {
		if (x.constructor !== Object && typeof x.constructor === 'function') {
			tmp = new x.constructor();
			for (k in x) {
				if (x.hasOwnProperty(k) && tmp[k] !== x[k]) {
					tmp[k] = klona(x[k]);
				}
			}
		} else {
			tmp = {}; // null
			for (k in x) {
				if (k === '__proto__') {
					Object.defineProperty(tmp, k, {
						value: klona(x[k]),
						configurable: true,
						enumerable: true,
						writable: true,
					});
				} else {
					tmp[k] = klona(x[k]);
				}
			}
		}
		return tmp;
	}

	if (str === '[object Array]') {
		k = x.length;
		for (tmp=Array(k); k--;) {
			tmp[k] = klona(x[k]);
		}
		return tmp;
	}

	if (str === '[object Set]') {
		tmp = new Set;
		x.forEach(function (val) {
			tmp.add(klona(val));
		});
		return tmp;
	}

	if (str === '[object Map]') {
		tmp = new Map;
		x.forEach(function (val, key) {
			tmp.set(klona(key), klona(val));
		});
		return tmp;
	}

	if (str === '[object Date]') {
		return new Date(+x);
	}

	if (str === '[object RegExp]') {
		tmp = new RegExp(x.source, x.flags);
		tmp.lastIndex = x.lastIndex;
		return tmp;
	}

	if (str === '[object DataView]') {
		return new x.constructor( klona(x.buffer) );
	}

	if (str === '[object ArrayBuffer]') {
		return x.slice(0);
	}

	// ArrayBuffer.isView(x)
	// ~> `new` bcuz `Buffer.slice` => ref
	if (str.slice(-6) === 'Array]') {
		return new x.constructor(x);
	}

	return x;
}

const inlineAppConfig = {
  "nuxt": {}
};



const appConfig = defuFn(inlineAppConfig);

const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char)) {
    return void 0;
  }
  return char !== char.toLowerCase();
}
function splitByCase(str, separators) {
  const splitters = STR_SPLITTERS;
  const parts = [];
  if (!str || typeof str !== "string") {
    return parts;
  }
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = splitters.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function upperFirst(str) {
  return str ? str[0].toUpperCase() + str.slice(1) : "";
}
function lowerFirst(str) {
  return str ? str[0].toLowerCase() + str.slice(1) : "";
}
function pascalCase(str, opts) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => upperFirst(p)).join("") : "";
}
function camelCase(str, opts) {
  return lowerFirst(pascalCase(str || ""));
}
function kebabCase(str, joiner) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => p.toLowerCase()).join(joiner) : "";
}
function snakeCase(str) {
  return kebabCase(str || "", "_");
}
const titleCaseExceptions = /^(a|an|and|as|at|but|by|for|if|in|is|nor|of|on|or|the|to|with)$/i;
function titleCase(str, opts) {
  return (Array.isArray(str) ? str : splitByCase(str)).filter(Boolean).map(
    (p) => titleCaseExceptions.test(p) ? p.toLowerCase() : upperFirst(p)
  ).join(" ");
}

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/",
    "buildId": "0391ee58-5e48-4a27-8bf7-e190eff263e9",
    "buildAssetsDir": "/_nuxt/",
    "cdnURL": ""
  },
  "nitro": {
    "envPrefix": "NUXT_",
    "routeRules": {
      "/__nuxt_error": {
        "cache": false
      },
      "/sitemap.xml": {
        "redirect": {
          "to": "/sitemap_index.xml",
          "statusCode": 307
        }
      },
      "/sitemap_index.xml": {
        "headers": {
          "Content-Type": "text/xml; charset=UTF-8",
          "Cache-Control": "public, max-age=600, must-revalidate",
          "X-Sitemap-Prerendered": "2026-03-17T17:10:11.998Z"
        }
      },
      "/__sitemap__/zh.xml": {
        "headers": {
          "Content-Type": "text/xml; charset=UTF-8",
          "Cache-Control": "public, max-age=600, must-revalidate",
          "X-Sitemap-Prerendered": "2026-03-17T17:10:11.998Z"
        }
      },
      "/__sitemap__/en.xml": {
        "headers": {
          "Content-Type": "text/xml; charset=UTF-8",
          "Cache-Control": "public, max-age=600, must-revalidate",
          "X-Sitemap-Prerendered": "2026-03-17T17:10:11.998Z"
        }
      },
      "/_nuxt": {
        "robots": "noindex",
        "headers": {
          "X-Robots-Tag": "noindex"
        }
      },
      "/_nuxt/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable",
          "X-Robots-Tag": "noindex"
        },
        "robots": "noindex"
      },
      "/_nuxt/builds/meta/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/_nuxt/builds/**": {
        "headers": {
          "cache-control": "public, max-age=1, immutable"
        }
      }
    }
  },
  "public": {
    "baseUrl": "http://localhost:3000",
    "cookiePrefix": "plankbevelen_blog_",
    "expirationTime": "43200",
    "keepAliveTime": "604800",
    "seo-utils": {
      "canonicalQueryWhitelist": [
        "page",
        "sort",
        "filter",
        "search",
        "q",
        "category",
        "tag"
      ],
      "canonicalLowercase": true
    },
    "i18n": {
      "baseUrl": "",
      "defaultLocale": "zh",
      "rootRedirect": "",
      "redirectStatusCode": 302,
      "skipSettingLocaleOnNavigate": false,
      "locales": [
        {
          "code": "zh",
          "name": "中文",
          "_hreflang": "zh",
          "_sitemap": "zh",
          "language": ""
        },
        {
          "code": "en",
          "name": "English",
          "_hreflang": "en",
          "_sitemap": "en",
          "language": ""
        }
      ],
      "detectBrowserLanguage": {
        "alwaysRedirect": false,
        "cookieCrossOrigin": false,
        "cookieDomain": "",
        "cookieKey": "i18n_redirected",
        "cookieSecure": false,
        "fallbackLocale": "",
        "redirectOn": "root",
        "useCookie": true
      },
      "experimental": {
        "localeDetector": "",
        "typedPages": true,
        "typedOptionsAndMessages": false,
        "alternateLinkCanonicalQueries": true,
        "devCache": false,
        "cacheLifetime": "",
        "stripMessagesPayload": false,
        "preload": false,
        "strictSeo": false,
        "nitroContextDetection": true,
        "httpCacheDuration": 10
      },
      "domainLocales": {
        "zh": {
          "domain": ""
        },
        "en": {
          "domain": ""
        }
      }
    }
  },
  "authSecret": "5&L6\\k£t$#264lY?+hzBcT8|98{{h5D\"",
  "sitemap": {
    "isI18nMapped": true,
    "sitemapName": "sitemap.xml",
    "isMultiSitemap": true,
    "excludeAppSources": [],
    "cacheMaxAgeSeconds": 600,
    "autoLastmod": false,
    "defaultSitemapsChunkSize": 1000,
    "minify": false,
    "sortEntries": true,
    "debug": false,
    "discoverImages": true,
    "discoverVideos": true,
    "sitemapsPathPrefix": "/__sitemap__/",
    "isNuxtContentDocumentDriven": false,
    "xsl": false,
    "xslTips": true,
    "xslColumns": [
      {
        "label": "URL",
        "width": "50%"
      },
      {
        "label": "Images",
        "width": "25%",
        "select": "count(image:image)"
      },
      {
        "label": "Last Updated",
        "width": "25%",
        "select": "concat(substring(sitemap:lastmod,0,11),concat(' ', substring(sitemap:lastmod,12,5)),concat(' ', substring(sitemap:lastmod,20,6)))"
      }
    ],
    "credits": false,
    "version": "7.4.9",
    "sitemaps": {
      "index": {
        "sitemapName": "index",
        "_route": "sitemap_index.xml",
        "sitemaps": [],
        "include": [],
        "exclude": []
      },
      "zh": {
        "include": [],
        "exclude": [
          "/admin/**",
          "/en/admin/**",
          "/_**",
          "/_nuxt/**"
        ],
        "includeAppSources": true,
        "sitemapName": "zh",
        "_route": "/__sitemap__/zh.xml"
      },
      "en": {
        "include": [],
        "exclude": [
          "/admin/**",
          "/en/admin/**",
          "/_**",
          "/_nuxt/**"
        ],
        "includeAppSources": true,
        "sitemapName": "en",
        "_route": "/__sitemap__/en.xml"
      }
    },
    "autoI18n": {
      "differentDomains": false,
      "defaultLocale": "zh",
      "locales": [
        {
          "code": "zh",
          "file": "zh.json",
          "name": "中文",
          "_hreflang": "zh",
          "_sitemap": "zh"
        },
        {
          "code": "en",
          "file": "en.json",
          "name": "English",
          "_hreflang": "en",
          "_sitemap": "en"
        }
      ],
      "strategy": "prefix_except_default",
      "pages": {}
    }
  },
  "nuxt-schema-org": {
    "reactive": false,
    "minify": true,
    "scriptAttributes": {
      "data-nuxt-schema-org": true
    },
    "identity": "",
    "version": "5.0.10"
  },
  "nuxt-site-config": {
    "stack": [
      {
        "_context": "system",
        "_priority": -15,
        "name": "plankbevelen-blog",
        "env": "production"
      },
      {
        "_context": "package.json",
        "_priority": -10,
        "name": "plankbevelen-blog"
      },
      {
        "_priority": -3,
        "_context": "nuxt-site-config:config",
        "url": "https://plankbevelen.cn",
        "name": "plankbevelen 的个人博客",
        "description": "plankbevelen的个人博客",
        "defaultLocale": "zh"
      },
      {
        "_context": "@nuxtjs/i18n",
        "defaultLocale": "zh"
      }
    ],
    "version": "3.2.14",
    "debug": false,
    "multiTenancy": []
  },
  "nuxt-robots": {
    "version": "5.6.7",
    "isNuxtContentV2": false,
    "debug": false,
    "credits": true,
    "groups": [
      {
        "comment": [],
        "disallow": [
          "/admin/",
          "/en/admin/",
          "/admin/**",
          "/en/admin/**"
        ],
        "allow": [
          "/",
          "/en/",
          "/favicon.ico"
        ],
        "userAgent": [
          "*"
        ],
        "contentUsage": [],
        "contentSignal": [],
        "_indexable": true,
        "_rules": [
          {
            "pattern": "/admin/",
            "allow": false
          },
          {
            "pattern": "/en/admin/",
            "allow": false
          },
          {
            "pattern": "/admin/**",
            "allow": false
          },
          {
            "pattern": "/en/admin/**",
            "allow": false
          },
          {
            "pattern": "/",
            "allow": true
          },
          {
            "pattern": "/en/",
            "allow": true
          },
          {
            "pattern": "/favicon.ico",
            "allow": true
          }
        ],
        "_normalized": true
      }
    ],
    "sitemap": [
      "https://plankbevelen.cn/sitemap.xml",
      "/sitemap_index.xml"
    ],
    "header": true,
    "robotsEnabledValue": "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    "robotsDisabledValue": "noindex, nofollow",
    "cacheControl": "max-age=14400, must-revalidate",
    "botDetection": true
  },
  "nuxt-og-image": {
    "version": "5.1.13",
    "satoriOptions": {},
    "resvgOptions": {},
    "sharpOptions": {},
    "publicStoragePath": "root:public",
    "defaults": {
      "emojis": "noto",
      "renderer": "satori",
      "component": "NuxtSeo",
      "extension": "png",
      "width": 1200,
      "height": 600,
      "cacheMaxAgeSeconds": 259200
    },
    "debug": false,
    "baseCacheKey": "/cache/nuxt-og-image/5.1.13",
    "fonts": [
      {
        "cacheKey": "Inter:undefined:400",
        "style": "normal",
        "weight": 400,
        "name": "Inter",
        "key": "nuxt-og-image:fonts:Inter-normal-400.ttf.base64"
      },
      {
        "cacheKey": "Inter:undefined:700",
        "style": "normal",
        "weight": 700,
        "name": "Inter",
        "key": "nuxt-og-image:fonts:Inter-normal-700.ttf.base64"
      }
    ],
    "hasNuxtIcon": false,
    "colorPreference": "light",
    "strictNuxtContentPaths": "",
    "isNuxtContentDocumentDriven": false
  },
  "ipx": {
    "baseURL": "/_ipx",
    "maxAge": 31536000,
    "modifiers": {
      "quality": 80
    },
    "alias": {},
    "fs": {
      "dir": "../public"
    },
    "http": {
      "domains": [
        "plankbevelen.cn",
        "localhost",
        "127.0.0.1"
      ]
    }
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  if (!event) {
    return _sharedRuntimeConfig;
  }
  if (event.context.nitro.runtimeConfig) {
    return event.context.nitro.runtimeConfig;
  }
  const runtimeConfig = klona(_inlineRuntimeConfig);
  applyEnv(runtimeConfig, envOptions);
  event.context.nitro.runtimeConfig = runtimeConfig;
  return runtimeConfig;
}
_deepFreeze(klona(appConfig));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

function createContext(opts = {}) {
  let currentInstance;
  let isSingleton = false;
  const checkConflict = (instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };
  let als;
  if (opts.asyncContext) {
    const _AsyncLocalStorage = opts.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    if (_AsyncLocalStorage) {
      als = new _AsyncLocalStorage();
    } else {
      console.warn("[unctx] `AsyncLocalStorage` is not provided.");
    }
  }
  const _getCurrentInstance = () => {
    if (als) {
      const instance = als.getStore();
      if (instance !== void 0) {
        return instance;
      }
    }
    return currentInstance;
  };
  return {
    use: () => {
      const _instance = _getCurrentInstance();
      if (_instance === void 0) {
        throw new Error("Context is not available");
      }
      return _instance;
    },
    tryUse: () => {
      return _getCurrentInstance();
    },
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = void 0;
      isSingleton = false;
    },
    call: (instance, callback) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return als ? als.run(instance, callback) : callback();
      } finally {
        if (!isSingleton) {
          currentInstance = void 0;
        }
      }
    },
    async callAsync(instance, callback) {
      currentInstance = instance;
      const onRestore = () => {
        currentInstance = instance;
      };
      const onLeave = () => currentInstance === instance ? onRestore : void 0;
      asyncHandlers.add(onLeave);
      try {
        const r = als ? als.run(instance, callback) : callback();
        if (!isSingleton) {
          currentInstance = void 0;
        }
        return await r;
      } finally {
        asyncHandlers.delete(onLeave);
      }
    }
  };
}
function createNamespace(defaultOpts = {}) {
  const contexts = {};
  return {
    get(key, opts = {}) {
      if (!contexts[key]) {
        contexts[key] = createContext({ ...defaultOpts, ...opts });
      }
      return contexts[key];
    }
  };
}
const _globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
const defaultNamespace = _globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
const getContext = (key, opts = {}) => defaultNamespace.get(key, opts);
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());
function executeAsync(function_) {
  const restores = [];
  for (const leaveHandler of asyncHandlers) {
    const restore2 = leaveHandler();
    if (restore2) {
      restores.push(restore2);
    }
  }
  const restore = () => {
    for (const restore2 of restores) {
      restore2();
    }
  };
  let awaitable = function_();
  if (awaitable && typeof awaitable === "object" && "catch" in awaitable) {
    awaitable = awaitable.catch((error) => {
      restore();
      throw error;
    });
  }
  return [awaitable, restore];
}

const config$1 = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter$1({ routes: config$1.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function isJsonRequest(event) {
  if (hasReqHeader(event, "accept", "text/html")) {
    return false;
  }
  return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || hasReqHeader(event, "sec-fetch-mode", "cors") || event.path.startsWith("/api/") || event.path.endsWith(".json");
}
function hasReqHeader(event, name, includes) {
  const value = getRequestHeader(event, name);
  return value && typeof value === "string" && value.toLowerCase().includes(includes);
}

const errorHandler$0 = (async function errorhandler(error, event, { defaultHandler }) {
  if (event.handled || isJsonRequest(event)) {
    return;
  }
  const defaultRes = await defaultHandler(error, event, { json: true });
  const statusCode = error.statusCode || 500;
  if (statusCode === 404 && defaultRes.status === 302) {
    setResponseHeaders(event, defaultRes.headers);
    setResponseStatus(event, defaultRes.status, defaultRes.statusText);
    return send(event, JSON.stringify(defaultRes.body, null, 2));
  }
  const errorObject = defaultRes.body;
  const url = new URL(errorObject.url);
  errorObject.url = withoutBase(url.pathname, useRuntimeConfig(event).app.baseURL) + url.search + url.hash;
  errorObject.message ||= "Server Error";
  errorObject.data ||= error.data;
  errorObject.statusMessage ||= error.statusMessage;
  delete defaultRes.headers["content-type"];
  delete defaultRes.headers["content-security-policy"];
  setResponseHeaders(event, defaultRes.headers);
  const reqHeaders = getRequestHeaders(event);
  const isRenderingError = event.path.startsWith("/__nuxt_error") || !!reqHeaders["x-nuxt-error"];
  const res = isRenderingError ? null : await useNitroApp().localFetch(
    withQuery(joinURL(useRuntimeConfig(event).app.baseURL, "/__nuxt_error"), errorObject),
    {
      headers: { ...reqHeaders, "x-nuxt-error": "true" },
      redirect: "manual"
    }
  ).catch(() => null);
  if (event.handled) {
    return;
  }
  if (!res) {
    const { template } = await import('./error-500.mjs');
    setResponseHeader(event, "Content-Type", "text/html;charset=UTF-8");
    return send(event, template(errorObject));
  }
  const html = await res.text();
  for (const [header, value] of res.headers.entries()) {
    if (header === "set-cookie") {
      appendResponseHeader(event, header, value);
      continue;
    }
    setResponseHeader(event, header, value);
  }
  setResponseStatus(event, res.status && res.status !== 200 ? res.status : defaultRes.status, res.statusText || defaultRes.statusText);
  return send(event, html);
});

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$1 = defineNitroErrorHandler(
  function defaultNitroErrorHandler(error, event) {
    const res = defaultHandler(error, event);
    setResponseHeaders(event, res.headers);
    setResponseStatus(event, res.status, res.statusText);
    return send(event, JSON.stringify(res.body, null, 2));
  }
);
function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    console.error(`[request error] ${tags} [${event.method}] ${url}
`, error);
  }
  const headers = {
    "content-type": "application/json",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'none'; frame-ancestors 'none';"
  };
  setResponseStatus(event, statusCode, statusMessage);
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = {
    error: true,
    url: url.href,
    statusCode,
    statusMessage,
    message: isSensitive ? "Server Error" : error.message,
    data: isSensitive ? void 0 : error.data
  };
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}

const errorHandlers = [errorHandler$0, errorHandler$1];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
const unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
const reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
const escaped = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
const objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  const counts = /* @__PURE__ */ new Map();
  let logNum = 0;
  function log(message) {
    if (logNum < 100) {
      console.warn(message);
      logNum += 1;
    }
  }
  function walk(thing) {
    if (typeof thing === "function") {
      log(`Cannot stringify a function ${thing.name}`);
      return;
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      const type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          const proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            if (typeof thing.toJSON !== "function") {
              log(`Cannot stringify arbitrary non-POJOs ${thing.constructor.name}`);
            }
          } else if (Object.getOwnPropertySymbols(thing).length > 0) {
            log(`Cannot stringify POJOs with symbolic keys ${Object.getOwnPropertySymbols(thing).map((symbol) => symbol.toString())}`);
          } else {
            Object.keys(thing).forEach((key) => walk(thing[key]));
          }
      }
    }
  }
  walk(value);
  const names = /* @__PURE__ */ new Map();
  Array.from(counts).filter((entry) => entry[1] > 1).sort((a, b) => b[1] - a[1]).forEach((entry, i) => {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    const type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return `Object(${stringify(thing.valueOf())})`;
      case "RegExp":
        return thing.toString();
      case "Date":
        return `new Date(${thing.getTime()})`;
      case "Array":
        const members = thing.map((v, i) => i in thing ? stringify(v) : "");
        const tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return `[${members.join(",")}${tail}]`;
      case "Set":
      case "Map":
        return `new ${type}([${Array.from(thing).map(stringify).join(",")}])`;
      default:
        if (thing.toJSON) {
          let json = thing.toJSON();
          if (getType(json) === "String") {
            try {
              json = JSON.parse(json);
            } catch (e) {
            }
          }
          return stringify(json);
        }
        if (Object.getPrototypeOf(thing) === null) {
          if (Object.keys(thing).length === 0) {
            return "Object.create(null)";
          }
          return `Object.create(null,{${Object.keys(thing).map((key) => `${safeKey(key)}:{writable:true,enumerable:true,value:${stringify(thing[key])}}`).join(",")}})`;
        }
        return `{${Object.keys(thing).map((key) => `${safeKey(key)}:${stringify(thing[key])}`).join(",")}}`;
    }
  }
  const str = stringify(value);
  if (names.size) {
    const params = [];
    const statements = [];
    const values = [];
    names.forEach((name, thing) => {
      params.push(name);
      if (isPrimitive(thing)) {
        values.push(stringifyPrimitive(thing));
        return;
      }
      const type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values.push(`Object(${stringify(thing.valueOf())})`);
          break;
        case "RegExp":
          values.push(thing.toString());
          break;
        case "Date":
          values.push(`new Date(${thing.getTime()})`);
          break;
        case "Array":
          values.push(`Array(${thing.length})`);
          thing.forEach((v, i) => {
            statements.push(`${name}[${i}]=${stringify(v)}`);
          });
          break;
        case "Set":
          values.push("new Set");
          statements.push(`${name}.${Array.from(thing).map((v) => `add(${stringify(v)})`).join(".")}`);
          break;
        case "Map":
          values.push("new Map");
          statements.push(`${name}.${Array.from(thing).map(([k, v]) => `set(${stringify(k)}, ${stringify(v)})`).join(".")}`);
          break;
        default:
          values.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach((key) => {
            statements.push(`${name}${safeProp(key)}=${stringify(thing[key])}`);
          });
      }
    });
    statements.push(`return ${str}`);
    return `(function(${params.join(",")}){${statements.join(";")}}(${values.join(",")}))`;
  } else {
    return str;
  }
}
function getName(num) {
  let name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? `${name}0` : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string") {
    return stringifyString(thing);
  }
  if (thing === void 0) {
    return "void 0";
  }
  if (thing === 0 && 1 / thing < 0) {
    return "-0";
  }
  const str = String(thing);
  if (typeof thing === "number") {
    return str.replace(/^(-)?0\./, "$1.");
  }
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? `.${key}` : `[${escapeUnsafeChars(JSON.stringify(key))}]`;
}
function stringifyString(str) {
  let result = '"';
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped) {
      result += escaped[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += `\\u${code.toString(16).toUpperCase()}`;
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}

function normalizeSiteConfig(config) {
  if (typeof config.indexable !== "undefined")
    config.indexable = String(config.indexable) !== "false";
  if (typeof config.trailingSlash !== "undefined" && !config.trailingSlash)
    config.trailingSlash = String(config.trailingSlash) !== "false";
  if (config.url && !hasProtocol(String(config.url), { acceptRelative: true, strict: false }))
    config.url = withHttps(String(config.url));
  const keys = Object.keys(config).sort((a, b) => a.localeCompare(b));
  const newConfig = {};
  for (const k of keys)
    newConfig[k] = config[k];
  return newConfig;
}
function createSiteConfigStack(options) {
  const debug = options?.debug || false;
  const stack = [];
  function push(input) {
    if (!input || typeof input !== "object" || Object.keys(input).length === 0) {
      return () => {
      };
    }
    if (!input._context && debug) {
      let lastFunctionName = new Error("tmp").stack?.split("\n")[2]?.split(" ")[5];
      if (lastFunctionName?.includes("/"))
        lastFunctionName = "anonymous";
      input._context = lastFunctionName;
    }
    const entry = {};
    for (const k in input) {
      const val = input[k];
      if (typeof val !== "undefined" && val !== "")
        entry[k] = val;
    }
    let idx;
    if (Object.keys(entry).filter((k) => !k.startsWith("_")).length > 0)
      idx = stack.push(entry);
    return () => {
      if (typeof idx !== "undefined") {
        stack.splice(idx - 1, 1);
      }
    };
  }
  function get(options2) {
    const siteConfig = {};
    if (options2?.debug)
      siteConfig._context = {};
    siteConfig._priority = {};
    for (const o in stack.sort((a, b) => (a._priority || 0) - (b._priority || 0))) {
      for (const k in stack[o]) {
        const key = k;
        const val = options2?.resolveRefs ? toValue(stack[o][k]) : stack[o][k];
        if (!k.startsWith("_") && typeof val !== "undefined" && val !== "") {
          siteConfig[k] = val;
          if (typeof stack[o]._priority !== "undefined" && stack[o]._priority !== -1) {
            siteConfig._priority[key] = stack[o]._priority;
          }
          if (options2?.debug)
            siteConfig._context[key] = stack[o]._context?.[key] || stack[o]._context || "anonymous";
        }
      }
    }
    return options2?.skipNormalize ? siteConfig : normalizeSiteConfig(siteConfig);
  }
  return {
    stack,
    push,
    get
  };
}

function envSiteConfig(env) {
  return Object.fromEntries(Object.entries(env).filter(([k]) => k.startsWith("NUXT_SITE_") || k.startsWith("NUXT_PUBLIC_SITE_")).map(([k, v]) => [
    k.replace(/^NUXT_(PUBLIC_)?SITE_/, "").split("_").map((s, i) => i === 0 ? s.toLowerCase() : s[0]?.toUpperCase() + s.slice(1).toLowerCase()).join(""),
    v
  ]));
}

function getSiteConfig(e, _options) {
  e.context.siteConfig = e.context.siteConfig || createSiteConfigStack();
  const options = defu(_options, useRuntimeConfig(e)["nuxt-site-config"], { debug: false });
  return e.context.siteConfig.get(options);
}

const _16f22ZRRmUUWTKi2_ra6x_KJI2cBfde_i5TrQjRXe4 = defineNitroPlugin(async (nitroApp) => {
  nitroApp.hooks.hook("render:html", async (ctx, { event }) => {
    const routeOptions = getRouteRules(event);
    const isIsland = process.env.NUXT_COMPONENT_ISLANDS && event.path.startsWith("/__nuxt_island");
    event.path;
    const noSSR = event.context.nuxt?.noSSR || routeOptions.ssr === false && !isIsland || (false);
    if (noSSR) {
      const siteConfig = Object.fromEntries(
        Object.entries(getSiteConfig(event)).map(([k, v]) => [k, toValue(v)])
      );
      ctx.body.push(`<script>window.__NUXT_SITE_CONFIG__=${devalue(siteConfig)}<\/script>`);
    }
  });
});

const KNOWN_SEARCH_BOTS = [
  {
    pattern: "googlebot",
    name: "googlebot",
    secondaryPatterns: ["google.com/bot.html"]
  },
  {
    pattern: "bingbot",
    name: "bingbot",
    secondaryPatterns: ["msnbot"]
  },
  {
    pattern: "yandexbot",
    name: "yandexbot"
  },
  {
    pattern: "baiduspider",
    name: "baiduspider",
    secondaryPatterns: ["baidu.com"]
  },
  {
    pattern: "duckduckbot",
    name: "duckduckbot",
    secondaryPatterns: ["duckduckgo.com"]
  },
  {
    pattern: "slurp",
    name: "yahoo"
  }
];
const SOCIAL_BOTS = [
  {
    pattern: "twitterbot",
    name: "twitter",
    secondaryPatterns: ["twitter"]
  },
  {
    pattern: "facebookexternalhit",
    name: "facebook",
    secondaryPatterns: ["facebook.com"]
  },
  {
    pattern: "linkedinbot",
    name: "linkedin",
    secondaryPatterns: ["linkedin"]
  },
  {
    pattern: "pinterestbot",
    name: "pinterest",
    secondaryPatterns: ["pinterest"]
  },
  {
    pattern: "discordbot",
    name: "discord",
    secondaryPatterns: ["discordapp"]
  }
];
const SEO_BOTS = [
  {
    pattern: "mj12bot",
    name: "majestic12",
    secondaryPatterns: ["majestic12.co.uk/bot"]
  },
  {
    pattern: "ahrefsbot",
    name: "ahrefs",
    secondaryPatterns: ["ahrefs.com"]
  },
  {
    pattern: "semrushbot",
    name: "semrush",
    secondaryPatterns: ["semrush.com/bot"]
  },
  {
    pattern: "screaming frog",
    name: "screaming-frog",
    secondaryPatterns: ["screamingfrog.co.uk"]
  },
  {
    pattern: "rogerbot",
    name: "moz"
  }
];
const AI_BOTS = [
  {
    pattern: "anthropic",
    name: "anthropic"
  },
  {
    pattern: "claude",
    name: "claude"
  },
  {
    pattern: "gptbot",
    name: "gpt",
    secondaryPatterns: ["openai.com"]
  },
  {
    pattern: "googlebot-news",
    name: "google-news"
  },
  {
    pattern: "cohere",
    name: "cohere",
    secondaryPatterns: ["cohere.com"]
  },
  {
    pattern: "ccbot",
    name: "commoncrawl",
    secondaryPatterns: ["commoncrawl.org"]
  },
  {
    pattern: "perplexitybot",
    name: "perplexity",
    secondaryPatterns: ["perplexity.ai"]
  }
];
const HTTP_TOOL_BOTS = [
  {
    pattern: "python-requests",
    name: "requests",
    secondaryPatterns: ["python"]
  },
  {
    pattern: "wget",
    name: "wget"
  },
  {
    pattern: "curl",
    name: "curl",
    secondaryPatterns: ["curl"]
  }
];
const SECURITY_SCANNING_BOTS = [
  {
    pattern: "zgrab",
    name: "zgrab"
  },
  {
    pattern: "masscan",
    name: "masscan"
  },
  {
    pattern: "nmap",
    name: "nmap",
    secondaryPatterns: ["insecure.org"]
  },
  {
    pattern: "nikto",
    name: "nikto"
  },
  {
    pattern: "wpscan",
    name: "wpscan"
  }
];
const SCRAPING_BOTS = [
  {
    pattern: "scrapy",
    name: "scrapy",
    secondaryPatterns: ["scrapy.org"]
  }
];
const AUTOMATION_BOTS = [
  {
    pattern: "phantomjs",
    name: "phantomjs"
  },
  {
    pattern: "headless",
    name: "headless-browser"
  },
  {
    pattern: "playwright",
    name: "playwright"
  },
  {
    pattern: "selenium",
    name: "selenium",
    secondaryPatterns: ["webdriver"]
  },
  {
    pattern: "puppeteer",
    name: "puppeteer",
    secondaryPatterns: ["headless"]
  }
];
const GENERIC_BOTS = [
  {
    pattern: "bot",
    name: "generic-bot"
  },
  {
    pattern: "spider",
    name: "generic-spider"
  },
  {
    pattern: "crawler",
    name: "generic-crawler"
  },
  {
    pattern: "scraper",
    name: "generic-scraper"
  }
];
const BOT_MAP = [
  {
    type: "search-engine",
    bots: KNOWN_SEARCH_BOTS,
    trusted: true
  },
  {
    type: "social",
    bots: SOCIAL_BOTS,
    trusted: true
  },
  {
    type: "seo",
    bots: SEO_BOTS,
    trusted: true
  },
  {
    type: "ai",
    bots: AI_BOTS,
    trusted: true
  },
  {
    type: "generic",
    bots: GENERIC_BOTS,
    trusted: false
  },
  {
    type: "automation",
    bots: AUTOMATION_BOTS,
    trusted: false
  },
  {
    type: "http-tool",
    bots: HTTP_TOOL_BOTS,
    trusted: false
  },
  {
    type: "security-scanner",
    bots: SECURITY_SCANNING_BOTS,
    trusted: false
  },
  {
    type: "scraping",
    bots: SCRAPING_BOTS,
    trusted: false
  }
];

const ROBOT_DIRECTIVE_VALUES = {
  // Standard directives
  enabled: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  disabled: "noindex, nofollow",
  index: "index",
  noindex: "noindex",
  follow: "follow",
  nofollow: "nofollow",
  none: "none",
  all: "all",
  // Non-standard directives (not part of official robots spec)
  noai: "noai",
  noimageai: "noimageai"
};
function formatMaxImagePreview(value) {
  return `max-image-preview:${value}`;
}
function formatMaxSnippet(value) {
  return `max-snippet:${value}`;
}
function formatMaxVideoPreview(value) {
  return `max-video-preview:${value}`;
}
function matches(pattern, path) {
  const pathLength = path.length;
  const patternLength = pattern.length;
  const matchingLengths = Array.from({ length: pathLength + 1 }).fill(0);
  let numMatchingLengths = 1;
  let p = 0;
  while (p < patternLength) {
    if (pattern[p] === "$" && p + 1 === patternLength) {
      return matchingLengths[numMatchingLengths - 1] === pathLength;
    }
    if (pattern[p] === "*") {
      numMatchingLengths = pathLength - matchingLengths[0] + 1;
      for (let i = 1; i < numMatchingLengths; i++) {
        matchingLengths[i] = matchingLengths[i - 1] + 1;
      }
    } else {
      let numMatches = 0;
      for (let i = 0; i < numMatchingLengths; i++) {
        const matchLength = matchingLengths[i];
        if (matchLength < pathLength && path[matchLength] === pattern[p]) {
          matchingLengths[numMatches++] = matchLength + 1;
        }
      }
      if (numMatches === 0) {
        return false;
      }
      numMatchingLengths = numMatches;
    }
    p++;
  }
  return true;
}
function matchPathToRule(path, _rules) {
  let matchedRule = null;
  const rules = _rules.filter(Boolean);
  const rulesLength = rules.length;
  let i = 0;
  while (i < rulesLength) {
    const rule = rules[i];
    if (!rule || !matches(rule.pattern, path)) {
      i++;
      continue;
    }
    if (!matchedRule || rule.pattern.length > matchedRule.pattern.length) {
      matchedRule = rule;
    } else if (rule.pattern.length === matchedRule.pattern.length && rule.allow && !matchedRule.allow) {
      matchedRule = rule;
    }
    i++;
  }
  return matchedRule;
}
function asArray(v) {
  return typeof v === "undefined" ? [] : Array.isArray(v) ? v : [v];
}
function contentUsageToString(prefs) {
  return Object.entries(prefs).filter(([_, value]) => value !== void 0).map(([key, value]) => `${key}=${value}`).join(", ");
}
function normalizeContentPreferences(value) {
  if (!value)
    return [];
  if (Array.isArray(value))
    return value.filter((rule) => Boolean(rule));
  if (typeof value === "object" && !Array.isArray(value)) {
    const str = contentUsageToString(value);
    return str ? [str] : [];
  }
  if (typeof value === "string")
    return value ? [value] : [];
  return [];
}
function normalizeGroup(group) {
  if (group._normalized) {
    const resolvedGroup = group;
    const disallow2 = asArray(resolvedGroup.disallow);
    resolvedGroup._indexable = !disallow2.includes("/");
    resolvedGroup._rules = [
      ...resolvedGroup.disallow.filter(Boolean).map((r) => ({ pattern: r, allow: false })),
      ...resolvedGroup.allow.map((r) => ({ pattern: r, allow: true }))
    ];
    return resolvedGroup;
  }
  const disallow = asArray(group.disallow);
  const allow = asArray(group.allow).filter((rule) => Boolean(rule));
  const contentUsage = normalizeContentPreferences(group.contentUsage);
  const contentSignal = normalizeContentPreferences(group.contentSignal);
  return {
    ...group,
    userAgent: group.userAgent ? asArray(group.userAgent) : ["*"],
    disallow,
    allow,
    contentUsage,
    contentSignal,
    _indexable: !disallow.includes("/"),
    _rules: [
      ...disallow.filter(Boolean).map((r) => ({ pattern: r, allow: false })),
      ...allow.map((r) => ({ pattern: r, allow: true }))
    ],
    _normalized: true
  };
}
function generateRobotsTxt({ groups, sitemaps }) {
  const lines = [];
  for (const group of groups) {
    for (const comment of group.comment || [])
      lines.push(`# ${comment}`);
    for (const userAgent of group.userAgent || ["*"])
      lines.push(`User-agent: ${userAgent}`);
    for (const allow of group.allow || [])
      lines.push(`Allow: ${allow}`);
    for (const disallow of group.disallow || [])
      lines.push(`Disallow: ${disallow}`);
    for (const cleanParam of group.cleanParam || [])
      lines.push(`Clean-param: ${cleanParam}`);
    for (const contentUsage of group.contentUsage || [])
      lines.push(`Content-Usage: ${contentUsage}`);
    for (const contentSignal of group.contentSignal || [])
      lines.push(`Content-Signal: ${contentSignal}`);
    lines.push("");
  }
  for (const sitemap of sitemaps)
    lines.push(`Sitemap: ${sitemap}`);
  return lines.join("\n");
}
function createPatternMap() {
  const patternMap = /* @__PURE__ */ new Map();
  for (const def of BOT_MAP) {
    for (const bot of def.bots) {
      const patterns = [bot.pattern, ...bot.secondaryPatterns || []];
      for (const pattern of patterns) {
        patternMap.set(pattern.toLowerCase(), {
          botName: bot.name,
          botCategory: def.type,
          trusted: def.trusted
        });
      }
    }
  }
  return patternMap;
}
function normaliseRobotsRouteRule(config) {
  let allow;
  if (typeof config.robots === "boolean")
    allow = config.robots;
  else if (typeof config.robots === "object" && "indexable" in config.robots && typeof config.robots.indexable !== "undefined")
    allow = config.robots.indexable;
  let rule;
  if (typeof config.robots === "object" && config.robots !== null) {
    if ("rule" in config.robots && typeof config.robots.rule !== "undefined") {
      rule = config.robots.rule;
    } else if (!("indexable" in config.robots)) {
      const directives = [];
      for (const [key, value] of Object.entries(config.robots)) {
        if (value === false || value === null || value === void 0)
          continue;
        if (key in ROBOT_DIRECTIVE_VALUES && typeof value === "boolean" && value) {
          directives.push(ROBOT_DIRECTIVE_VALUES[key]);
        } else if (key === "max-image-preview" && typeof value === "string") {
          directives.push(formatMaxImagePreview(value));
        } else if (key === "max-snippet" && typeof value === "number") {
          directives.push(formatMaxSnippet(value));
        } else if (key === "max-video-preview" && typeof value === "number") {
          directives.push(formatMaxVideoPreview(value));
        }
      }
      if (directives.length > 0) {
        rule = directives.join(", ");
      }
    }
  } else if (typeof config.robots === "string") {
    rule = config.robots;
  }
  if (rule && typeof allow === "undefined") {
    const disallowIndicators = ["none", "noindex", "noai", "noimageai"];
    allow = !disallowIndicators.some(
      (indicator) => rule === indicator || rule.split(",").some((part) => part.trim() === indicator)
    );
  }
  if (typeof allow === "undefined" && typeof rule === "undefined")
    return;
  return {
    allow,
    rule
  };
}

function useRuntimeConfigNuxtRobots(event) {
  return useRuntimeConfig(event)["nuxt-robots"];
}

const logger$2 = createConsola({
  defaults: { tag: "@nuxtjs/robots" }
});

async function resolveRobotsTxtContext(e, nitro = useNitroApp()) {
  const { groups, sitemap: sitemaps } = useRuntimeConfigNuxtRobots(e);
  const generateRobotsTxtCtx = {
    event: e,
    context: e ? "robots.txt" : "init",
    ...JSON.parse(JSON.stringify({ groups, sitemaps }))
  };
  await nitro.hooks.callHook("robots:config", generateRobotsTxtCtx);
  generateRobotsTxtCtx.groups = generateRobotsTxtCtx.groups.map(normalizeGroup);
  nitro._robots.ctx = generateRobotsTxtCtx;
  return generateRobotsTxtCtx;
}

const _7WMFSMiQxtWhriD01ta7ZJb413c8ENtsWc25LCtcE = defineNitroPlugin(async (nitroApp) => {
  const { isNuxtContentV2, robotsDisabledValue, botDetection } = useRuntimeConfigNuxtRobots();
  if (botDetection !== false) {
    nitroApp._robotsPatternMap = createPatternMap();
  }
  nitroApp._robots = {};
  await resolveRobotsTxtContext(void 0, nitroApp);
  const nuxtContentUrls = /* @__PURE__ */ new Set();
  if (isNuxtContentV2) {
    let urls;
    try {
      urls = await (await nitroApp.localFetch("/__robots__/nuxt-content.json", {})).json();
    } catch (e) {
      logger$2.error("Failed to read robot rules from content files.", e);
    }
    if (urls && Array.isArray(urls) && urls.length) {
      urls.forEach((url) => nuxtContentUrls.add(withoutTrailingSlash(url)));
    }
  }
  if (nuxtContentUrls.size) {
    nitroApp._robots.nuxtContentUrls = nuxtContentUrls;
  }
});

const DRIVER_NAME = "lru-cache";
const lruCacheDriver = defineDriver((opts = {}) => {
  const cache = new LRUCache({
    max: 1e3,
    sizeCalculation: opts.maxSize || opts.maxEntrySize ? (value, key) => {
      return key.length + byteLength(value);
    } : void 0,
    ...opts
  });
  return {
    name: DRIVER_NAME,
    options: opts,
    getInstance: () => cache,
    hasItem(key) {
      return cache.has(key);
    },
    getItem(key) {
      return cache.get(key) ?? null;
    },
    getItemRaw(key) {
      return cache.get(key) ?? null;
    },
    setItem(key, value) {
      cache.set(key, value);
    },
    setItemRaw(key, value) {
      cache.set(key, value);
    },
    removeItem(key) {
      cache.delete(key);
    },
    getKeys() {
      return [...cache.keys()];
    },
    clear() {
      cache.clear();
    },
    dispose() {
      cache.clear();
    }
  };
});
function byteLength(value) {
  if (typeof Buffer !== "undefined") {
    try {
      return Buffer.byteLength(value);
    } catch {
    }
  }
  try {
    return typeof value === "string" ? value.length : JSON.stringify(value).length;
  } catch {
  }
  return 0;
}

const htmlPayloadCache = createStorage({
  // short cache time so we don't need many entries at runtime
  driver: lruCacheDriver({ max: 50 })
});
const fontCache = createStorage({
  driver: lruCacheDriver({ max: 10 })
});
const emojiCache = createStorage({
  driver: lruCacheDriver({ max: 1e3 })
});

function resolveSitePath(pathOrUrl, options) {
  let path = pathOrUrl;
  if (hasProtocol(pathOrUrl, { strict: false, acceptRelative: true })) {
    const parsed = parseURL(pathOrUrl);
    path = parsed.pathname;
  }
  const base = withLeadingSlash(options.base || "/");
  if (base !== "/" && path.startsWith(base)) {
    path = path.slice(base.length);
  }
  let origin = withoutTrailingSlash(options.absolute ? options.siteUrl : "");
  if (base !== "/" && origin.endsWith(base)) {
    origin = origin.slice(0, origin.indexOf(base));
  }
  const baseWithOrigin = options.withBase ? withBase(base, origin || "/") : origin;
  const resolvedUrl = withBase(path, baseWithOrigin);
  return path === "/" && !options.withBase ? withTrailingSlash(resolvedUrl) : fixSlashes(options.trailingSlash, resolvedUrl);
}
const fileExtensions = [
  // Images
  "jpg",
  "jpeg",
  "png",
  "gif",
  "bmp",
  "webp",
  "svg",
  "ico",
  // Documents
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "md",
  "markdown",
  // Archives
  "zip",
  "rar",
  "7z",
  "tar",
  "gz",
  // Audio
  "mp3",
  "wav",
  "flac",
  "ogg",
  "opus",
  "m4a",
  "aac",
  "midi",
  "mid",
  // Video
  "mp4",
  "avi",
  "mkv",
  "mov",
  "wmv",
  "flv",
  "webm",
  // Web
  "html",
  "css",
  "js",
  "json",
  "xml",
  "tsx",
  "jsx",
  "ts",
  "vue",
  "svelte",
  "xsl",
  "rss",
  "atom",
  // Programming
  "php",
  "py",
  "rb",
  "java",
  "c",
  "cpp",
  "h",
  "go",
  // Data formats
  "csv",
  "tsv",
  "sql",
  "yaml",
  "yml",
  // Fonts
  "woff",
  "woff2",
  "ttf",
  "otf",
  "eot",
  // Executables/Binaries
  "exe",
  "msi",
  "apk",
  "ipa",
  "dmg",
  "iso",
  "bin",
  // Scripts/Config
  "bat",
  "cmd",
  "sh",
  "env",
  "htaccess",
  "conf",
  "toml",
  "ini",
  // Package formats
  "deb",
  "rpm",
  "jar",
  "war",
  // E-books
  "epub",
  "mobi",
  // Common temporary/backup files
  "log",
  "tmp",
  "bak",
  "old",
  "sav"
];
function isPathFile(path) {
  const lastSegment = path.split("/").pop();
  const ext = (lastSegment || path).match(/\.[0-9a-z]+$/i)?.[0];
  return ext && fileExtensions.includes(ext.replace(".", ""));
}
function fixSlashes(trailingSlash, pathOrUrl) {
  const $url = parseURL(pathOrUrl);
  if (isPathFile($url.pathname))
    return pathOrUrl;
  const fixedPath = trailingSlash ? withTrailingSlash($url.pathname) : withoutTrailingSlash($url.pathname);
  return `${$url.protocol ? `${$url.protocol}//` : ""}${$url.host || ""}${fixedPath}${$url.search || ""}${$url.hash || ""}`;
}

const r=Object.create(null),i=e=>globalThis.process?.env||globalThis._importMeta_.env||globalThis.Deno?.env.toObject()||globalThis.__env__||(e?r:globalThis),o=new Proxy(r,{get(e,s){return i()[s]??r[s]},has(e,s){const E=i();return s in E||s in r},set(e,s,E){const B=i(true);return B[s]=E,true},deleteProperty(e,s){if(!s)return  false;const E=i(true);return delete E[s],true},ownKeys(){const e=i(true);return Object.keys(e)}}),t=typeof process<"u"&&process.env&&"production"||"",f=[["APPVEYOR"],["AWS_AMPLIFY","AWS_APP_ID",{ci:true}],["AZURE_PIPELINES","SYSTEM_TEAMFOUNDATIONCOLLECTIONURI"],["AZURE_STATIC","INPUT_AZURE_STATIC_WEB_APPS_API_TOKEN"],["APPCIRCLE","AC_APPCIRCLE"],["BAMBOO","bamboo_planKey"],["BITBUCKET","BITBUCKET_COMMIT"],["BITRISE","BITRISE_IO"],["BUDDY","BUDDY_WORKSPACE_ID"],["BUILDKITE"],["CIRCLE","CIRCLECI"],["CIRRUS","CIRRUS_CI"],["CLOUDFLARE_PAGES","CF_PAGES",{ci:true}],["CLOUDFLARE_WORKERS","WORKERS_CI",{ci:true}],["CODEBUILD","CODEBUILD_BUILD_ARN"],["CODEFRESH","CF_BUILD_ID"],["DRONE"],["DRONE","DRONE_BUILD_EVENT"],["DSARI"],["GITHUB_ACTIONS"],["GITLAB","GITLAB_CI"],["GITLAB","CI_MERGE_REQUEST_ID"],["GOCD","GO_PIPELINE_LABEL"],["LAYERCI"],["HUDSON","HUDSON_URL"],["JENKINS","JENKINS_URL"],["MAGNUM"],["NETLIFY"],["NETLIFY","NETLIFY_LOCAL",{ci:false}],["NEVERCODE"],["RENDER"],["SAIL","SAILCI"],["SEMAPHORE"],["SCREWDRIVER"],["SHIPPABLE"],["SOLANO","TDDIUM"],["STRIDER"],["TEAMCITY","TEAMCITY_VERSION"],["TRAVIS"],["VERCEL","NOW_BUILDER"],["VERCEL","VERCEL",{ci:false}],["VERCEL","VERCEL_ENV",{ci:false}],["APPCENTER","APPCENTER_BUILD_ID"],["CODESANDBOX","CODESANDBOX_SSE",{ci:false}],["CODESANDBOX","CODESANDBOX_HOST",{ci:false}],["STACKBLITZ"],["STORMKIT"],["CLEAVR"],["ZEABUR"],["CODESPHERE","CODESPHERE_APP_ID",{ci:true}],["RAILWAY","RAILWAY_PROJECT_ID"],["RAILWAY","RAILWAY_SERVICE_ID"],["DENO-DEPLOY","DENO_DEPLOYMENT_ID"],["FIREBASE_APP_HOSTING","FIREBASE_APP_HOSTING",{ci:true}]];function b(){if(globalThis.process?.env)for(const e of f){const s=e[1]||e[0];if(globalThis.process?.env[s])return {name:e[0].toLowerCase(),...e[2]}}return globalThis.process?.env?.SHELL==="/bin/jsh"&&globalThis.process?.versions?.webcontainer?{name:"stackblitz",ci:false}:{name:"",ci:false}}const l=b();l.name;function n(e){return e?e!=="false":false}const I=globalThis.process?.platform||"",T=n(o.CI)||l.ci!==false,R=n(globalThis.process?.stdout&&globalThis.process?.stdout.isTTY);n(o.DEBUG);const a=t==="test"||n(o.TEST),h=t==="dev"||t==="development";n(o.MINIMAL)||T||a||!R;const A=/^win/i.test(I);!n(o.NO_COLOR)&&(n(o.FORCE_COLOR)||(R||A)&&o.TERM!=="dumb"||T);const C=(globalThis.process?.versions?.node||"").replace(/^v/,"")||null;Number(C?.split(".")[0])||null;const W=globalThis.process||Object.create(null),_={versions:{}};new Proxy(W,{get(e,s){if(s==="env")return o;if(s in e)return e[s];if(s in _)return _[s]}});const O=globalThis.process?.release?.name==="node",c=!!globalThis.Bun||!!globalThis.process?.versions?.bun,D=!!globalThis.Deno,L=!!globalThis.fastly,S=!!globalThis.Netlify,u=!!globalThis.EdgeRuntime,N=globalThis.navigator?.userAgent==="Cloudflare-Workers",F=[[S,"netlify"],[u,"edge-light"],[N,"workerd"],[L,"fastly"],[D,"deno"],[c,"bun"],[O,"node"]];function G(){const e=F.find(s=>s[0]);if(e)return {name:e[1]}}const P=G();P?.name||"";

function getNitroOrigin$1(ctx = {}) {
  const isDev = ctx.isDev ?? h;
  const isPrerender = ctx.isPrerender ?? !!o.prerender;
  let host = "";
  let port = "";
  let protocol = o.NITRO_SSL_CERT && o.NITRO_SSL_KEY ? "https" : "http";
  if (isDev || isPrerender) {
    const devEnv = o.__NUXT_DEV__ || o.NUXT_VITE_NODE_OPTIONS;
    if (devEnv) {
      const parsed = JSON.parse(devEnv);
      const origin = parsed.proxy?.url || parsed.baseURL?.replace("/__nuxt_vite_node__", "");
      host = origin.replace(/^https?:\/\//, "");
      protocol = origin.startsWith("https") ? "https" : "http";
    }
  }
  if (!host && ctx.requestHost) {
    host = ctx.requestHost;
    protocol = ctx.requestProtocol || protocol;
  }
  if (!host) {
    host = o.NITRO_HOST || o.HOST || "";
    if (isDev)
      port = o.NITRO_PORT || o.PORT || "3000";
  }
  if (host.includes(":")) {
    const i = host.lastIndexOf(":");
    port = host.slice(i + 1);
    host = host.slice(0, i);
  }
  host = o.NUXT_SITE_HOST_OVERRIDE || host;
  port = o.NUXT_SITE_PORT_OVERRIDE || port;
  if (host.startsWith("http://") || host.startsWith("https://")) {
    protocol = host.startsWith("https://") ? "https" : "http";
    host = host.replace(/^https?:\/\//, "");
  } else if (!host.includes("localhost") && !host.startsWith("127.")) {
    protocol = "https";
  }
  return `${protocol}://${host}${port ? `:${port}` : ""}/`;
}

function getNitroOrigin(e) {
  return getNitroOrigin$1({
    isDev: false,
    isPrerender: false,
    requestHost: e ? getRequestHost(e, { xForwardedHost: true }) : void 0,
    requestProtocol: e ? getRequestProtocol(e, { xForwardedProto: true }) : void 0
  });
}

function createSitePathResolver(e, options = {}) {
  const siteConfig = getSiteConfig(e);
  const nitroOrigin = getNitroOrigin(e);
  const nuxtBase = useRuntimeConfig(e).app.baseURL || "/";
  return (path) => {
    return resolveSitePath(path, {
      ...options,
      siteUrl: options.canonical !== false || false ? siteConfig.url : nitroOrigin,
      trailingSlash: siteConfig.trailingSlash,
      base: nuxtBase
    });
  };
}
function withSiteUrl(e, path, options = {}) {
  const siteConfig = e.context.siteConfig?.get();
  let siteUrl = e.context.siteConfigNitroOrigin;
  if ((options.canonical !== false || false) && siteConfig.url)
    siteUrl = siteConfig.url;
  return resolveSitePath(path, {
    absolute: true,
    siteUrl,
    trailingSlash: siteConfig.trailingSlash,
    base: e.context.nitro.baseURL,
    withBase: options.withBase
  });
}

function detectBase64MimeType(data) {
  const signatures = {
    "R0lGODdh": "image/gif",
    "R0lGODlh": "image/gif",
    "iVBORw0KGgo": "image/png",
    "/9j/": "image/jpeg",
    "UklGR": "image/webp",
    "AAABAA": "image/x-icon"
  };
  for (const s in signatures) {
    if (data.startsWith(s)) {
      return signatures[s];
    }
  }
  return "image/svg+xml";
}
function toBase64Image(data) {
  const base64 = typeof data === "string" ? data : Buffer.from(data).toString("base64");
  const type = detectBase64MimeType(base64);
  return `data:${type};base64,${base64}`;
}
function filterIsOgImageOption(key) {
  const keys = [
    "url",
    "extension",
    "width",
    "height",
    "fonts",
    "alt",
    "props",
    "renderer",
    "html",
    "component",
    "renderer",
    "emojis",
    "_query",
    "satori",
    "resvg",
    "sharp",
    "screenshot",
    "cacheMaxAgeSeconds"
  ];
  return keys.includes(key);
}
function separateProps(options, ignoreKeys = []) {
  options = options || {};
  const _props = defu(options.props, Object.fromEntries(
    Object.entries({ ...options }).filter(([k]) => !filterIsOgImageOption(k) && !ignoreKeys.includes(k))
  ));
  const props = {};
  Object.entries(_props).forEach(([key, val]) => {
    props[key.replace(/-([a-z])/g, (g) => String(g[1]).toUpperCase())] = val;
  });
  return {
    ...Object.fromEntries(
      Object.entries({ ...options }).filter(([k]) => filterIsOgImageOption(k) || ignoreKeys.includes(k))
    ),
    props
  };
}
function normaliseFontInput(fonts) {
  return fonts.map((f) => {
    if (typeof f === "string") {
      const vals = f.split(":");
      const includesStyle = vals.length === 3;
      let name, weight, style;
      if (includesStyle) {
        name = vals[0];
        style = vals[1];
        weight = vals[2];
      } else {
        name = vals[0];
        weight = vals[1];
      }
      return {
        cacheKey: f,
        name,
        weight: weight || 400,
        style: style || "normal",
        path: void 0
      };
    }
    return {
      cacheKey: f.key || `${f.name}:${f.style}:${f.weight}`,
      style: "normal",
      weight: 400,
      ...f
    };
  });
}

const theme$2 = {};

function useSiteConfig(e, _options) {
  return getSiteConfig(e, _options);
}

function htmlDecodeQuotes(html) {
  return html.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'");
}
function decodeHtml(html) {
  return html.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&cent;/g, "\xA2").replace(/&pound;/g, "\xA3").replace(/&yen;/g, "\xA5").replace(/&euro;/g, "\u20AC").replace(/&copy;/g, "\xA9").replace(/&reg;/g, "\xAE").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'").replace(/&#x2F;/g, "/").replace(/&#(\d+);/g, (full, int) => {
    return String.fromCharCode(Number.parseInt(int));
  }).replace(/&amp;/g, "&");
}
function decodeObjectHtmlEntities(obj) {
  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === "string")
      obj[key] = decodeHtml(value);
  });
  return obj;
}

function fetchIsland(e, component, props) {
  const hashId = hash$1([component, props]).replaceAll("_", "-");
  return e.$fetch(`/__nuxt_island/${component}_${hashId}.json`, {
    params: {
      props: JSON.stringify(props)
    }
  });
}
function withoutQuery$2(path) {
  return path.split("?")[0];
}
function createNitroRouteRuleMatcher$2() {
  const { nitro, app } = useRuntimeConfig();
  const _routeRulesMatcher = toRouteMatcher(
    createRouter$1({
      routes: Object.fromEntries(
        Object.entries(nitro?.routeRules || {}).map(([path, rules]) => [withoutTrailingSlash(path), rules])
      )
    })
  );
  return (path) => {
    return defu({}, ..._routeRulesMatcher.matchAll(
      // radix3 does not support trailing slashes
      withoutBase(withoutTrailingSlash(withoutQuery$2(path)), app.baseURL)
    ).reverse());
  };
}

const logger$1 = createConsola({
  defaults: {
    tag: "Nuxt OG Image"
  }
});

const componentNames = [{"hash":"lqi2TIJIQMafRl6atyAjEmgaOb13hjqfbfUGe7PXhOw","pascalName":"BrandedLogoDVue","kebabName":"branded-logo-d-vue","path":"C:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/node_modules/.pnpm/nuxt-og-image@5.1.13_@unhea_60d7827de2655ab6ea97f64694443129/node_modules/nuxt-og-image/dist/runtime/app/components/Templates/Community/BrandedLogo.d.vue.ts","category":"community","credits":"Full Stack Heroes <https://fullstackheroes.com/>"},{"hash":"SOHaoKfoo4fUkREsCFGw8ewxkl4-XkkHkug2VwYRtFM","pascalName":"BrandedLogo","kebabName":"branded-logo","path":"C:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/node_modules/.pnpm/nuxt-og-image@5.1.13_@unhea_60d7827de2655ab6ea97f64694443129/node_modules/nuxt-og-image/dist/runtime/app/components/Templates/Community/BrandedLogo.vue","category":"community"},{"hash":"BMTMwASJKH3AG9ey0Y845iqbPNO7HjNX5eW2U2psVTE","pascalName":"FrameDVue","kebabName":"frame-d-vue","path":"C:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/node_modules/.pnpm/nuxt-og-image@5.1.13_@unhea_60d7827de2655ab6ea97f64694443129/node_modules/nuxt-og-image/dist/runtime/app/components/Templates/Community/Frame.d.vue.ts","category":"community","credits":"@arashsheyda <https://github.com/arashsheyda>"},{"hash":"tFoYPh0fXaZR3uXybAqFEOGnQuQsvz-E-Yq-CtrFlIY","pascalName":"Frame","kebabName":"frame","path":"C:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/node_modules/.pnpm/nuxt-og-image@5.1.13_@unhea_60d7827de2655ab6ea97f64694443129/node_modules/nuxt-og-image/dist/runtime/app/components/Templates/Community/Frame.vue","category":"community"},{"hash":"XHXMYyA3oPy1eN81p4R-wv8k8tkHNooxhCRL8Zs1Pz0","pascalName":"NuxtDVue","kebabName":"nuxt-d-vue","path":"C:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/node_modules/.pnpm/nuxt-og-image@5.1.13_@unhea_60d7827de2655ab6ea97f64694443129/node_modules/nuxt-og-image/dist/runtime/app/components/Templates/Community/Nuxt.d.vue.ts","category":"community"},{"hash":"NPQTTXYQ8toXx5OaJ1VlRUUcxy1SNOxg-FoM7C08ZPM","pascalName":"Nuxt","kebabName":"nuxt","path":"C:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/node_modules/.pnpm/nuxt-og-image@5.1.13_@unhea_60d7827de2655ab6ea97f64694443129/node_modules/nuxt-og-image/dist/runtime/app/components/Templates/Community/Nuxt.vue","category":"community"},{"hash":"jGeID02J5-Tz9qaGIsRVZfJSXVQS9q-3V2Qnw65GQMg","pascalName":"NuxtSeoDVue","kebabName":"nuxt-seo-d-vue","path":"C:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/node_modules/.pnpm/nuxt-og-image@5.1.13_@unhea_60d7827de2655ab6ea97f64694443129/node_modules/nuxt-og-image/dist/runtime/app/components/Templates/Community/NuxtSeo.d.vue.ts","category":"community"},{"hash":"VAHSTZlVcPHzkozocV1iTnwc4-YttdoOkHsYfoSgDZ4","pascalName":"NuxtSeo","kebabName":"nuxt-seo","path":"C:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/node_modules/.pnpm/nuxt-og-image@5.1.13_@unhea_60d7827de2655ab6ea97f64694443129/node_modules/nuxt-og-image/dist/runtime/app/components/Templates/Community/NuxtSeo.vue","category":"community"},{"hash":"XHXMYyA3oPy1eN81p4R-wv8k8tkHNooxhCRL8Zs1Pz0","pascalName":"PergelDVue","kebabName":"pergel-d-vue","path":"C:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/node_modules/.pnpm/nuxt-og-image@5.1.13_@unhea_60d7827de2655ab6ea97f64694443129/node_modules/nuxt-og-image/dist/runtime/app/components/Templates/Community/Pergel.d.vue.ts","category":"community"},{"hash":"8CNn4yU043gQFqO-sZNDPz9GKED-h7ahXJ-61c9ThHM","pascalName":"Pergel","kebabName":"pergel","path":"C:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/node_modules/.pnpm/nuxt-og-image@5.1.13_@unhea_60d7827de2655ab6ea97f64694443129/node_modules/nuxt-og-image/dist/runtime/app/components/Templates/Community/Pergel.vue","category":"community"},{"hash":"7-N5uiZ77GftW16gAKUKdbC2kTqoiWjlYDsNWxCsCG4","pascalName":"SimpleBlogDVue","kebabName":"simple-blog-d-vue","path":"C:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/node_modules/.pnpm/nuxt-og-image@5.1.13_@unhea_60d7827de2655ab6ea97f64694443129/node_modules/nuxt-og-image/dist/runtime/app/components/Templates/Community/SimpleBlog.d.vue.ts","category":"community"},{"hash":"b-Juo-FXQepo6SOCnA478MTAqbXNZuve6-MzHgTKA7s","pascalName":"SimpleBlog","kebabName":"simple-blog","path":"C:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/node_modules/.pnpm/nuxt-og-image@5.1.13_@unhea_60d7827de2655ab6ea97f64694443129/node_modules/nuxt-og-image/dist/runtime/app/components/Templates/Community/SimpleBlog.vue","category":"community"},{"hash":"ahhiG3dVaeRX0C50qOnvcUsjBRro4ufe-6jzsUbVxBY","pascalName":"UnJsDVue","kebabName":"un-js-d-vue","path":"C:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/node_modules/.pnpm/nuxt-og-image@5.1.13_@unhea_60d7827de2655ab6ea97f64694443129/node_modules/nuxt-og-image/dist/runtime/app/components/Templates/Community/UnJs.d.vue.ts","category":"community","credits":"UnJS <https://unjs.io/>"},{"hash":"vRUm5ru-64PEHIGsBby6-vCgLBg7iUJfvFKL6VuCXtI","pascalName":"UnJs","kebabName":"un-js","path":"C:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/node_modules/.pnpm/nuxt-og-image@5.1.13_@unhea_60d7827de2655ab6ea97f64694443129/node_modules/nuxt-og-image/dist/runtime/app/components/Templates/Community/UnJs.vue","category":"community"},{"hash":"pzp5dWaNkZa2Gbj-RXhoDiBahvrINMjPJC9-Vs2OtxE","pascalName":"WaveDVue","kebabName":"wave-d-vue","path":"C:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/node_modules/.pnpm/nuxt-og-image@5.1.13_@unhea_60d7827de2655ab6ea97f64694443129/node_modules/nuxt-og-image/dist/runtime/app/components/Templates/Community/Wave.d.vue.ts","category":"community","credits":"Full Stack Heroes <https://fullstackheroes.com/>"},{"hash":"hq07GBU-Yd16ICfETt8SfSxfaYj3qBmDAiQkTcv89nw","pascalName":"Wave","kebabName":"wave","path":"C:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/node_modules/.pnpm/nuxt-og-image@5.1.13_@unhea_60d7827de2655ab6ea97f64694443129/node_modules/nuxt-og-image/dist/runtime/app/components/Templates/Community/Wave.vue","category":"community"},{"hash":"hsZbjduIx-cfHCcgbOY44VlwFWt5bfWv-VxiGiUifDs","pascalName":"WithEmojiDVue","kebabName":"with-emoji-d-vue","path":"C:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/node_modules/.pnpm/nuxt-og-image@5.1.13_@unhea_60d7827de2655ab6ea97f64694443129/node_modules/nuxt-og-image/dist/runtime/app/components/Templates/Community/WithEmoji.d.vue.ts","category":"community","credits":"Full Stack Heroes <https://fullstackheroes.com/>"},{"hash":"zSwOodBXcjwS1qvFqGBJqitTEEnrvVfwQYkTeIxNpws","pascalName":"WithEmoji","kebabName":"with-emoji","path":"C:/Users/PlankBevelen/Desktop/plankbevelen/plankbevelen-blog/node_modules/.pnpm/nuxt-og-image@5.1.13_@unhea_60d7827de2655ab6ea97f64694443129/node_modules/nuxt-og-image/dist/runtime/app/components/Templates/Community/WithEmoji.vue","category":"community"}];

function normaliseOptions(_options) {
  const options = { ..._options };
  if (!options)
    return options;
  if (options.component && componentNames) {
    const originalName = options.component;
    for (const component of componentNames) {
      if (component.pascalName.endsWith(originalName) || component.kebabName.endsWith(originalName)) {
        options.component = component.pascalName;
        break;
      }
    }
  } else if (!options.component) {
    options.component = componentNames[0]?.pascalName;
  }
  return options;
}

function useOgImageRuntimeConfig(e) {
  const c = useRuntimeConfig(e);
  return {
    ...c["nuxt-og-image"],
    app: {
      baseURL: c.app.baseURL
    }
  };
}

const satoriRendererInstance = { instance: void 0 };
const chromiumRendererInstance = { instance: void 0 };
async function useSatoriRenderer() {
  satoriRendererInstance.instance = satoriRendererInstance.instance || await import('./renderer.mjs').then((m) => m.default);
  return satoriRendererInstance.instance;
}
async function useChromiumRenderer() {
  chromiumRendererInstance.instance = chromiumRendererInstance.instance || await import('./empty.mjs').then((m) => m.default);
  return chromiumRendererInstance.instance;
}

function resolvePathCacheKey(e, path) {
  const siteConfig = useSiteConfig(e, {
    resolveRefs: true
  });
  const basePath = withoutTrailingSlash(withoutLeadingSlash(normalizeKey$1(path)));
  return [
    !basePath || basePath === "/" ? "index" : basePath,
    hash$1([
      basePath,
      siteConfig.url,
      hash$1(getQuery(e))
    ])
  ].join(":");
}
async function resolveContext(e) {
  const runtimeConfig = useOgImageRuntimeConfig();
  const resolvePathWithBase = createSitePathResolver(e, {
    absolute: false,
    withBase: true
  });
  const path = resolvePathWithBase(parseURL(e.path).pathname);
  const extension = path.split(".").pop();
  if (!extension) {
    return createError$1({
      statusCode: 400,
      statusMessage: `[Nuxt OG Image] Missing OG Image type.`
    });
  }
  if (!["png", "jpeg", "jpg", "svg", "html", "json"].includes(extension)) {
    return createError$1({
      statusCode: 400,
      statusMessage: `[Nuxt OG Image] Unknown OG Image type ${extension}.`
    });
  }
  const query = getQuery(e);
  let queryParams = {};
  for (const k in query) {
    const v = String(query[k]);
    if (!v)
      continue;
    if (v.startsWith("{")) {
      try {
        queryParams[k] = JSON.parse(v);
      } catch (error) {
      }
    } else {
      queryParams[k] = v;
    }
  }
  queryParams = separateProps(queryParams);
  const basePath = withoutTrailingSlash(
    path.replace(`/__og-image__/image`, "").replace(`/__og-image__/static`, "").replace(`/og.${extension}`, "")
  );
  const basePathWithQuery = queryParams._query && typeof queryParams._query === "object" ? withQuery(basePath, queryParams._query) : basePath;
  const isDebugJsonPayload = extension === "json" && runtimeConfig.debug;
  const key = resolvePathCacheKey(e, basePathWithQuery);
  let options = queryParams.options;
  if (!options) {
    if (!options) {
      const payload = await fetchPathHtmlAndExtractOptions(e, basePathWithQuery, key);
      if (payload instanceof Error)
        return payload;
      options = payload;
    }
  }
  delete queryParams.options;
  const routeRuleMatcher = createNitroRouteRuleMatcher$2();
  const routeRules = routeRuleMatcher(basePath);
  if (typeof routeRules.ogImage === "undefined" && !options) {
    return createError$1({
      statusCode: 400,
      statusMessage: "The route is missing the Nuxt OG Image payload or route rules."
    });
  }
  const ogImageRouteRules = separateProps(routeRules.ogImage);
  options = defu(queryParams, options, ogImageRouteRules, runtimeConfig.defaults);
  if (!options) {
    return createError$1({
      statusCode: 404,
      statusMessage: "[Nuxt OG Image] OG Image not found."
    });
  }
  let renderer;
  switch (options.renderer) {
    case "satori":
      renderer = await useSatoriRenderer();
      break;
    case "chromium":
      renderer = await useChromiumRenderer();
      break;
  }
  if (!renderer || renderer.__mock__) {
    throw createError$1({
      statusCode: 400,
      statusMessage: `[Nuxt OG Image] Renderer ${options.renderer} is not enabled.`
    });
  }
  const unocss = await createGenerator({ theme: theme$2 }, {
    presets: [
      presetWind()
    ]
  });
  const ctx = {
    unocss,
    e,
    key,
    renderer,
    isDebugJsonPayload,
    runtimeConfig,
    publicStoragePath: runtimeConfig.publicStoragePath,
    extension,
    basePath,
    options: normaliseOptions(options),
    _nitro: useNitroApp()
  };
  await ctx._nitro.hooks.callHook("nuxt-og-image:context", ctx);
  return ctx;
}
const PAYLOAD_REGEX = /<script.+id="nuxt-og-image-options"[^>]*>(.+?)<\/script>/;
function getPayloadFromHtml(html) {
  const match = String(html).match(PAYLOAD_REGEX);
  return match ? String(match[1]) : null;
}
function extractAndNormaliseOgImageOptions(html) {
  const _payload = getPayloadFromHtml(html);
  let options = false;
  try {
    const payload2 = parse$3(_payload || "{}");
    Object.entries(payload2).forEach(([key, value]) => {
      if (!value && value !== 0)
        delete payload2[key];
    });
    options = payload2;
  } catch (e) {
  }
  if (options && typeof options?.props?.description === "undefined") {
    const description = html.match(/<meta[^>]+name="description"[^>]*>/)?.[0];
    if (description) {
      const [, content] = description.match(/content="([^"]+)"/) || [];
      if (content && !options.props.description)
        options.props.description = content;
    }
  }
  const payload = decodeObjectHtmlEntities(options || {});
  return payload;
}
async function doFetchWithErrorHandling(fetch, path) {
  const res = await fetch(path, {
    redirect: "follow",
    headers: {
      accept: "text/html"
    }
  }).catch((err) => {
    return err;
  });
  let errorDescription;
  if (res.status >= 300 && res.status < 400) {
    if (res.headers.has("location")) {
      return await doFetchWithErrorHandling(fetch, res.headers.get("location") || "");
    }
    errorDescription = `${res.status} redirected to ${res.headers.get("location") || "unknown"}`;
  } else if (res.status >= 500) {
    errorDescription = `${res.status} error: ${res.statusText}`;
  }
  if (errorDescription) {
    return [null, createError$1({
      statusCode: 500,
      statusMessage: `[Nuxt OG Image] Failed to parse \`${path}\` for og-image extraction. ${errorDescription}`
    })];
  }
  if (res._data) {
    return [res._data, null];
  } else if (res.text) {
    return [await res.text(), null];
  }
  return ["", null];
}
async function fetchPathHtmlAndExtractOptions(e, path, key) {
  const cachedHtmlPayload = await htmlPayloadCache.getItem(key);
  if (cachedHtmlPayload && cachedHtmlPayload.expiresAt < Date.now())
    return cachedHtmlPayload.value;
  let _payload = null;
  let [html, err] = await doFetchWithErrorHandling(e.fetch, path);
  if (err) {
    logger$1.warn(err);
  } else {
    _payload = getPayloadFromHtml(html);
  }
  if (!_payload) {
    const [fallbackHtml, err2] = await doFetchWithErrorHandling(globalThis.$fetch.raw, path);
    if (err2) {
      return err2;
    }
    _payload = getPayloadFromHtml(fallbackHtml);
    if (_payload) {
      html = fallbackHtml;
    }
  }
  if (!html) {
    return createError$1({
      statusCode: 500,
      statusMessage: `[Nuxt OG Image] Failed to read the path ${path} for og-image extraction, returning no HTML.`
    });
  }
  if (!_payload) {
    const payload2 = extractAndNormaliseOgImageOptions(html);
    if (payload2 && typeof payload2 === "object" && payload2.socialPreview?.og?.image) {
      const image = payload2.socialPreview.og.image;
      const p = {
        custom: true,
        url: typeof image === "string" ? image : image
      };
      if (typeof image === "object" && image["image:width"]) {
        p.width = image["image:width"];
      }
      if (typeof image === "object" && image["image:height"]) {
        p.height = image["image:height"];
      }
      return p;
    }
    return createError$1({
      statusCode: 500,
      statusMessage: `[Nuxt OG Image] HTML response from ${path} is missing the #nuxt-og-image-options script tag. Make sure you have defined an og image for this page.`
    });
  }
  const payload = extractAndNormaliseOgImageOptions(html);
  if (payload) {
    await htmlPayloadCache.setItem(key, {
      // 60 minutes for prerender, 10 seconds for runtime
      expiresAt: Date.now() + 1e3 * (10),
      value: payload
    });
  }
  return typeof payload === "object" ? payload : createError$1({
    statusCode: 500,
    statusMessage: "[Nuxt OG Image] Invalid payload type."
  });
}

const __uvMmNC_ta0iNIMQ9keg6yyltUUA17iwOJJh1xbGNfE = defineNitroPlugin(async (nitro) => {
  return;
});

/*!
  * shared v11.2.2
  * (c) 2025 kazuya kawaguchi
  * Released under the MIT License.
  */
const _create = Object.create;
const create = (obj = null) => _create(obj);
/* eslint-enable */
/**
 * Useful Utilities By Evan you
 * Modified by kazuya kawaguchi
 * MIT License
 * https://github.com/vuejs/vue-next/blob/master/packages/shared/src/index.ts
 * https://github.com/vuejs/vue-next/blob/master/packages/shared/src/codeframe.ts
 */
const isArray = Array.isArray;
const isFunction = (val) => typeof val === 'function';
const isString = (val) => typeof val === 'string';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isObject = (val) => val !== null && typeof val === 'object';
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);

const isNotObjectOrIsArray = (val) => !isObject(val) || isArray(val);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepCopy(src, des) {
    // src and des should both be objects, and none of them can be a array
    if (isNotObjectOrIsArray(src) || isNotObjectOrIsArray(des)) {
        throw new Error('Invalid value');
    }
    const stack = [{ src, des }];
    while (stack.length) {
        const { src, des } = stack.pop();
        // using `Object.keys` which skips prototype properties
        Object.keys(src).forEach(key => {
            if (key === '__proto__') {
                return;
            }
            // if src[key] is an object/array, set des[key]
            // to empty object/array to prevent setting by reference
            if (isObject(src[key]) && !isObject(des[key])) {
                des[key] = Array.isArray(src[key]) ? [] : create();
            }
            if (isNotObjectOrIsArray(des[key]) || isNotObjectOrIsArray(src[key])) {
                // replace with src[key] when:
                // src[key] or des[key] is not an object, or
                // src[key] or des[key] is an array
                des[key] = src[key];
            }
            else {
                // src[key] and des[key] are both objects, merge them
                stack.push({ src: src[key], des: des[key] });
            }
        });
    }
}

const __nuxtMock = { runWithContext: async (fn) => await fn() };
const merger$1 = createDefu((obj, key, value) => {
  if (key === "messages" || key === "datetimeFormats" || key === "numberFormats") {
    obj[key] ??= create(null);
    deepCopy(value, obj[key]);
    return true;
  }
});
async function loadVueI18nOptions(vueI18nConfigs) {
  const nuxtApp = __nuxtMock;
  let vueI18nOptions = { messages: create(null) };
  for (const configFile of vueI18nConfigs) {
    const resolver = await configFile().then((x) => isModule(x) ? x.default : x);
    const resolved = isFunction(resolver) ? await nuxtApp.runWithContext(() => resolver()) : resolver;
    vueI18nOptions = merger$1(create(null), resolved, vueI18nOptions);
  }
  vueI18nOptions.fallbackLocale ??= false;
  return vueI18nOptions;
}
const isModule = (val) => toTypeString(val) === "[object Module]";
async function getLocaleMessages(locale, loader) {
  const nuxtApp = __nuxtMock;
  try {
    const getter = await nuxtApp.runWithContext(loader.load).then((x) => isModule(x) ? x.default : x);
    return isFunction(getter) ? await nuxtApp.runWithContext(() => getter(locale)) : getter;
  } catch (e) {
    throw new Error(`Failed loading locale (${locale}): ` + e.message);
  }
}
async function getLocaleMessagesMerged(locale, loaders = []) {
  const nuxtApp = __nuxtMock;
  const messages = await Promise.all(
    loaders.map((loader) => nuxtApp.runWithContext(() => getLocaleMessages(locale, loader)))
  );
  const merged = {};
  for (const message of messages) {
    deepCopy(message, merged);
  }
  return merged;
}

var site$1 = {
	name: "PlankBevelen的博客",
	description: "个人技术博客，分享前端开发、Web 技术、编程经验和技术文章",
	keywords: "plankbevelen, plank, bevelen, PlankBevelen, Plank, Bevelen, 个人博客, 前端开发, Web 技术, 编程经验, 技术文章"
};
var header$1 = {
	title: "PlankBevelen的博客",
	nav: {
		home: "首页",
		article: "文章",
		about: "关于",
		project: "项目介绍"
	}
};
var footer$1 = {
	title: "PlankBevelen的博客",
	description: "记录生活，分享技术，追求美好",
	copyright: "PlankBevelen. 保留所有权利",
	beian: "蜀ICP备2024114585号"
};
var theme$1 = {
	light: "浅色",
	dark: "深色"
};
var lang$1 = {
	zh: "中文",
	en: "English"
};
var blogger$1 = {
	profession: "前端开发工程师",
	location: "中国 - 成都",
	stats: {
		articles: "文章数",
		categories: "分类数",
		tags: "标签数"
	}
};
var category$1 = {
	title: "分类"
};
var latest$1 = {
	title: "最新文章"
};
var recordLink$1 = {
	title: "推荐网站链接"
};
var tag$1 = {
	title: "标签云"
};
var toc$1 = {
	title: "目录",
	toTop: "返回顶部"
};
var pages$1 = {
	home: {
		title: "PlankBevelen Blog",
		meta: {
			description: "PlankBevelen的个人技术博客 - 分享编程教程、开发经验和科技见解",
			keywords: "plankbevelen, plank, bevelen, PlankBevelen, Web开发教程, 编程博客, 编码经验, 前端开发, 后端开发, 软件工程, 技术博客, 个人博客"
		}
	},
	article: {
		title: "文章",
		meta: {
			description: "浏览PlankBevelen博客上的所有技术文章和编程教程",
			keywords: "plankbevelen, plank, bevelen, PlankBevelen, 编程文章, 编码教程, Web开发指南, 技术学习资源, PlankBevelen文章, 前端教程, 后端教程"
		},
		search: {
			placeholder: "搜索文章",
			btn: "搜索"
		},
		articleDetail: {
			fallback: "文章详情",
			meta: {
				description: "文章详情 - 技术文章和编程教程的详细内容",
				keywords: "plankbevelen, plank, bevelen, PlankBevelen"
			},
			prev: "上一篇",
			next: "下一篇"
		}
	},
	about: {
		title: "关于",
		meta: {
			description: "了解更多关于PlankBevelen - 一位热衷于分享知识和编码经验的开发者",
			keywords: "关于PlankBevelen, plankbevelen, plank, bevelen, PlankBevelen, 开发者介绍, 技术博主, 编程背景, 个人介绍, 技术分享者"
		}
	}
};
const locale_zh_46json_27688602 = {
	site: site$1,
	header: header$1,
	footer: footer$1,
	theme: theme$1,
	lang: lang$1,
	blogger: blogger$1,
	category: category$1,
	latest: latest$1,
	recordLink: recordLink$1,
	tag: tag$1,
	toc: toc$1,
	pages: pages$1
};

var site = {
	name: "PlankBevelen's Blog",
	description: "Personal tech blog sharing coding experience and articles",
	keywords: "plankbevelen, plank, bevelen, PlankBevelen, Web development tutorials, programming blog, coding experiences, frontend development, backend development, software engineering, tech blog, personal blog"
};
var header = {
	title: "PlankBevelen's Blog",
	nav: {
		home: "Home",
		article: "Articles",
		about: "About",
		project: "Projects"
	}
};
var footer = {
	title: "PlankBevelen's Blog",
	description: "Personal tech blog sharing coding experience and articles",
	copyright: "PlankBevelen. All Rights Reserved.",
	beian: "蜀ICP备2024114585号"
};
var theme = {
	light: "Light",
	dark: "Dark"
};
var lang = {
	zh: "中文",
	en: "English"
};
var blogger = {
	profession: "Front-end Developer",
	location: "China - Chengdu",
	stats: {
		articles: "Articles",
		categories: "Categories",
		tags: "Tags"
	}
};
var category = {
	title: "Categories"
};
var latest = {
	title: "Latest Articles"
};
var recordLink = {
	title: "Recommended Websites"
};
var tag = {
	title: "Tag Cloud"
};
var toc = {
	title: "Table of Contents",
	toTop: "Back to Top"
};
var pages = {
	home: {
		title: "PlankBevelen Blog",
		meta: {
			description: "Personal tech blog by PlankBevelen - Sharing coding tutorials, development experiences and tech insights",
			keywords: "plankbevelen, plank, bevelen, PlankBevelen, web development tutorials, programming blog, coding experiences, frontend development, backend development, software engineering"
		}
	},
	article: {
		title: "Articles",
		meta: {
			description: "Browse all tech articles and coding tutorials on PlankBevelen's blog",
			keywords: "plankbevelen, plank, bevelen, PlankBevelen, programming articles, coding tutorials, web development guides, tech learning resources, PlankBevelen articles"
		},
		search: {
			placeholder: "Search articles",
			btn: "Search"
		},
		articleDetail: {
			fallback: "Article Detail",
			meta: {
				description: "Article Detail",
				keywords: "plankbevelen, plank, bevelen, PlankBevelen"
			},
			prev: "Previous Article",
			next: "Next Article"
		}
	},
	about: {
		title: "About",
		meta: {
			description: "Learn more about PlankBevelen - A developer passionate about sharing knowledge and coding experiences",
			keywords: "about, plankbevelen, plank, bevelen, PlankBevelen, developer introduction, tech blogger, programming background"
		}
	}
};
const locale_en_46json_340f67db = {
	site: site,
	header: header,
	footer: footer,
	theme: theme,
	lang: lang,
	blogger: blogger,
	category: category,
	latest: latest,
	recordLink: recordLink,
	tag: tag,
	toc: toc,
	pages: pages
};

// @ts-nocheck
const localeCodes =  [
  "zh",
  "en"
];
const localeLoaders = {
  zh: [
    {
      key: "locale_zh_46json_27688602",
      load: () => Promise.resolve(locale_zh_46json_27688602),
      cache: true
    }
  ],
  en: [
    {
      key: "locale_en_46json_340f67db",
      load: () => Promise.resolve(locale_en_46json_340f67db),
      cache: true
    }
  ]
};
const vueI18nConfigs = [];
const normalizedLocales = [
  {
    code: "zh",
    name: "中文",
    _hreflang: "zh",
    _sitemap: "zh",
    language: undefined
  },
  {
    code: "en",
    name: "English",
    _hreflang: "en",
    _sitemap: "en",
    language: undefined
  }
];

const setupVueI18nOptions = async (defaultLocale) => {
  const options = await loadVueI18nOptions(vueI18nConfigs);
  options.locale = defaultLocale || options.locale || "en-US";
  options.defaultLocale = defaultLocale;
  options.fallbackLocale ??= false;
  options.messages ??= {};
  for (const locale of localeCodes) {
    options.messages[locale] ??= {};
  }
  return options;
};

function defineNitroPlugin(def) {
  return def;
}

function defineRenderHandler(render) {
  const runtimeConfig = useRuntimeConfig();
  return eventHandler(async (event) => {
    const nitroApp = useNitroApp();
    const ctx = { event, render, response: void 0 };
    await nitroApp.hooks.callHook("render:before", ctx);
    if (!ctx.response) {
      if (event.path === `${runtimeConfig.app.baseURL}favicon.ico`) {
        setResponseHeader(event, "Content-Type", "image/x-icon");
        return send(
          event,
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        );
      }
      ctx.response = await ctx.render(event);
      if (!ctx.response) {
        const _currentStatus = getResponseStatus(event);
        setResponseStatus(event, _currentStatus === 200 ? 500 : _currentStatus);
        return send(
          event,
          "No response returned from render handler: " + event.path
        );
      }
    }
    await nitroApp.hooks.callHook("render:response", ctx.response, ctx);
    if (ctx.response.headers) {
      setResponseHeaders(event, ctx.response.headers);
    }
    if (ctx.response.statusCode || ctx.response.statusMessage) {
      setResponseStatus(
        event,
        ctx.response.statusCode,
        ctx.response.statusMessage
      );
    }
    return ctx.response.body;
  });
}

function baseURL() {
  return useRuntimeConfig().app.baseURL;
}
function buildAssetsDir() {
  return useRuntimeConfig().app.buildAssetsDir;
}
function buildAssetsURL(...path) {
  return joinRelativeURL(publicAssetsURL(), buildAssetsDir(), ...path);
}
function publicAssetsURL(...path) {
  const app = useRuntimeConfig().app;
  const publicBase = app.cdnURL || app.baseURL;
  return path.length ? joinRelativeURL(publicBase, ...path) : publicBase;
}

function parseAcceptLanguage(value) {
  return value.split(",").map((tag) => tag.split(";")[0]).filter(
    (tag) => !(tag === "*" || tag === "")
  );
}
function createPathIndexLanguageParser(index = 0) {
  return (path) => {
    const rawPath = typeof path === "string" ? path : path.pathname;
    const normalizedPath = rawPath.split("?")[0];
    const parts = normalizedPath.split("/");
    if (parts[0] === "") {
      parts.shift();
    }
    return parts.length > index ? parts[index] || "" : "";
  };
}

function getSiteIndexable(e) {
  const { env, indexable } = getSiteConfig(e);
  if (typeof indexable !== "undefined")
    return String(indexable) === "true";
  return env === "production";
}

function useNitroOrigin(e) {
  return getNitroOrigin(e);
}

function withoutQuery$1(path) {
  return path.split("?")[0];
}
function createNitroRouteRuleMatcher$1(e) {
  const { nitro, app } = useRuntimeConfig(e);
  const _routeRulesMatcher = toRouteMatcher(
    createRouter$1({
      routes: Object.fromEntries(
        Object.entries(nitro?.routeRules || {}).map(([path, rules]) => [withoutTrailingSlash(path), rules])
      )
    })
  );
  return (path) => {
    return defu({}, ..._routeRulesMatcher.matchAll(
      // radix3 does not support trailing slashes
      withoutBase(withoutTrailingSlash(withoutQuery$1(path)), app.baseURL)
    ).reverse());
  };
}

function getSiteRobotConfig(e) {
  const query = getQuery(e);
  const hints = [];
  const { groups, debug } = useRuntimeConfigNuxtRobots(e);
  let indexable = getSiteIndexable(e);
  const queryIndexableEnabled = String(query.mockProductionEnv) === "true" || query.mockProductionEnv === "";
  if (debug || false) {
    const { _context } = getSiteConfig(e, { debug: debug || false });
    if (queryIndexableEnabled) {
      indexable = true;
      hints.push("You are mocking a production enviroment with ?mockProductionEnv query.");
    } else if (!indexable && _context.indexable === "nuxt-robots:config") {
      hints.push("You are blocking indexing with your Nuxt Robots config.");
    } else if (!queryIndexableEnabled && !_context.indexable) {
      hints.push(`Indexing is blocked in development. You can mock a production environment with ?mockProductionEnv query.`);
    } else if (!indexable && !queryIndexableEnabled) {
      hints.push(`Indexing is blocked by site config set by ${_context.indexable}.`);
    } else if (indexable && !queryIndexableEnabled) {
      hints.push(`Indexing is enabled from ${_context.indexable}.`);
    }
  }
  if (groups.some((g) => g.userAgent.includes("*") && g.disallow.includes("/"))) {
    indexable = false;
    hints.push("You are blocking all user agents with a wildcard `Disallow /`.");
  } else if (groups.some((g) => g.disallow.includes("/"))) {
    hints.push("You are blocking specific user agents with `Disallow /`.");
  }
  return { indexable, hints };
}

function getPathRobotConfig(e, options) {
  const runtimeConfig = useRuntimeConfig(e);
  const { robotsDisabledValue, robotsEnabledValue, isNuxtContentV2 } = useRuntimeConfigNuxtRobots(e);
  if (!options?.skipSiteIndexable) {
    if (!getSiteRobotConfig(e).indexable) {
      return {
        rule: robotsDisabledValue,
        indexable: false,
        debug: {
          source: "Site Config"
        }
      };
    }
  }
  const path = options?.path || e.path;
  let userAgent = options?.userAgent;
  if (!userAgent) {
    try {
      userAgent = getRequestHeader(e, "User-Agent");
    } catch {
    }
  }
  const nitroApp = useNitroApp();
  const groups = [
    // run explicit user agent matching first
    ...nitroApp._robots.ctx.groups.filter((g) => {
      if (userAgent) {
        return g.userAgent.some((ua) => ua.toLowerCase().includes(userAgent.toLowerCase()));
      }
      return false;
    }),
    // run wildcard matches second
    ...nitroApp._robots.ctx.groups.filter((g) => g.userAgent.includes("*"))
  ];
  for (const group of groups) {
    if (group._indexable === false) {
      return {
        indexable: false,
        rule: robotsDisabledValue,
        debug: {
          source: "/robots.txt",
          line: JSON.stringify(group)
        }
      };
    }
    const robotsTxtRule = matchPathToRule(path, group._rules || []);
    if (robotsTxtRule) {
      if (!robotsTxtRule.allow) {
        return {
          indexable: false,
          rule: robotsDisabledValue,
          debug: {
            source: "/robots.txt",
            line: `Disallow: ${robotsTxtRule.pattern}`
          }
        };
      }
      break;
    }
  }
  if (isNuxtContentV2 && nitroApp._robots?.nuxtContentUrls?.has(withoutTrailingSlash(path))) {
    return {
      indexable: false,
      rule: robotsDisabledValue,
      debug: {
        source: "Nuxt Content"
      }
    };
  }
  nitroApp._robotsRuleMatcher = nitroApp._robotsRuleMatcher || createNitroRouteRuleMatcher$1(e);
  let robotRouteRules = nitroApp._robotsRuleMatcher(path);
  let routeRulesPath = path;
  if (runtimeConfig.public?.i18n?.locales && typeof robotRouteRules.robots === "undefined") {
    const { locales } = runtimeConfig.public.i18n;
    const locale = locales.find((l) => routeRulesPath.startsWith(`/${l.code}`));
    if (locale) {
      routeRulesPath = routeRulesPath.replace(`/${locale.code}`, "");
      robotRouteRules = nitroApp._robotsRuleMatcher(routeRulesPath);
    }
  }
  const routeRules = normaliseRobotsRouteRule(robotRouteRules);
  if (routeRules && (typeof routeRules.allow !== "undefined" || typeof routeRules.rule !== "undefined")) {
    return {
      indexable: routeRules.allow ?? false,
      rule: routeRules.rule || (routeRules.allow ? robotsEnabledValue : robotsDisabledValue),
      debug: {
        source: "Route Rules"
      }
    };
  }
  return {
    indexable: true,
    rule: robotsEnabledValue
  };
}

dotenv.config();
const config = {
  host: process.env.NUXT_DB_HOST || "localhost",
  port: Number(process.env.NUXT_DB_PORT) || 3306,
  user: process.env.NUXT_DB_USER || "root",
  password: process.env.NUXT_DB_PASSWORD || "",
  database: process.env.NUXT_DB_NAME || "",
  connectionLimit: Number(process.env.NUXT_DB_CONNECTION_LIMIT) || 10,
  timezone: "+08:00",
  connectTimeout: 1e4,
  // 10秒
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  typeCast: function(field, next) {
    if (field.type === "JSON") {
      try {
        return JSON.parse(field.string());
      } catch {
        return field.string();
      }
    }
    return next();
  }
};
let pool = null;
let keepAliveTimer = null;
function getPool() {
  if (!pool) {
    pool = mysql.createPool(config);
  }
  return pool;
}
async function closeDB() {
  if (pool) {
    stopKeepAlive();
    await pool.end();
    pool = null;
  }
}
async function initDB() {
  try {
    const poolInstance = getPool();
    await poolInstance.query("SELECT 1");
    startKeepAlive();
    return true;
  } catch (error) {
    console.error("\u274C \u6570\u636E\u5E93\u8FDE\u63A5\u521D\u59CB\u5316\u5931\u8D25:", error.message);
    return false;
  }
}
function startKeepAlive() {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
  }
  keepAliveTimer = setInterval(async () => {
    try {
      await getPool().query("SELECT 1");
    } catch (error) {
      console.error(error.message);
    }
  }, 5 * 60 * 1e3);
}
function stopKeepAlive() {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}
async function query(sql, params, connection) {
  try {
    const executor = connection || getPool();
    const [rows] = await executor.query(sql, params);
    return rows;
  } catch (error) {
    console.error("sql error:", {
      sql,
      params,
      error: error.message
    });
    throw error;
  }
}
async function execute(sql, params, connection) {
  try {
    const executor = connection || getPool();
    const [result] = await executor.execute(sql, params);
    return result;
  } catch (error) {
    console.error("sql error:", {
      sql,
      params,
      error: error.message
    });
    throw error;
  }
}
async function withTransaction(callback) {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

function parseTags(tagsStr) {
  if (!tagsStr) return [];
  return tagsStr.replace(/，/g, ",").split(",").map((t) => t.trim()).filter((t) => t.length > 0);
}
async function updateTagsCount(oldTagsStr, newTagsStr, connection) {
  const oldTags = new Set(parseTags(oldTagsStr));
  const newTags = new Set(parseTags(newTagsStr));
  const tagsToAdd = [...newTags].filter((t) => !oldTags.has(t));
  const tagsToRemove = [...oldTags].filter((t) => !newTags.has(t));
  if (tagsToAdd.length > 0) {
    const values = tagsToAdd.map(() => "(?, 1)").join(", ");
    const params = tagsToAdd;
    await execute(
      `INSERT INTO tags (name, count) VALUES ${values} ON DUPLICATE KEY UPDATE count = count + 1`,
      params,
      connection
    );
  }
  if (tagsToRemove.length > 0) {
    const placeholders = tagsToRemove.map(() => "?").join(", ");
    await execute(
      `UPDATE tags SET count = CASE WHEN count > 0 THEN count - 1 ELSE 0 END WHERE name IN (${placeholders})`,
      tagsToRemove,
      connection
    );
  }
  if (tagsToRemove.length > 0) {
    await execute("DELETE FROM tags WHERE count <= 0", [], connection);
  }
}
async function updateCategoryCount(oldCategoryId, newCategoryId, connection) {
  const oldId = oldCategoryId ? Number(oldCategoryId) : null;
  const newId = newCategoryId ? Number(newCategoryId) : null;
  if (oldId === newId) return;
  if (oldId) {
    await execute(
      "UPDATE categories SET count = CASE WHEN count > 0 THEN count - 1 ELSE 0 END WHERE id = ?",
      [oldId],
      connection
    );
  }
  if (newId) {
    await execute(
      "UPDATE categories SET count = count + 1 WHERE id = ?",
      [newId],
      connection
    );
  }
}

function getUploadsBaseDir() {
  return process.env.UPLOAD_DIR || "/var/www/uploads";
}
function getTempUploadsDir() {
  return path.join(getUploadsBaseDir(), "temp");
}

function useRuntimeI18n(nuxtApp, event) {
  {
    return useRuntimeConfig(event).public.i18n;
  }
}
function useI18nDetection(nuxtApp) {
  const detectBrowserLanguage = useRuntimeI18n().detectBrowserLanguage;
  const detect = detectBrowserLanguage || {};
  return {
    ...detect,
    enabled: !!detectBrowserLanguage,
    cookieKey: detect.cookieKey || "i18n_redirected"
  };
}
function resolveRootRedirect(config) {
  if (!config) {
    return void 0;
  }
  return {
    path: "/" + (isString(config) ? config : config.path).replace(/^\//, ""),
    code: !isString(config) && config.statusCode || 302
  };
}
function toArray(value) {
  return Array.isArray(value) ? value : [value];
}

function createLocaleConfigs(fallbackLocale) {
  const localeConfigs = {};
  for (const locale of localeCodes) {
    const fallbacks = getFallbackLocaleCodes(fallbackLocale, [locale]);
    const cacheable = isLocaleWithFallbacksCacheable(locale, fallbacks);
    localeConfigs[locale] = { fallbacks, cacheable };
  }
  return localeConfigs;
}
function getFallbackLocaleCodes(fallback, locales) {
  if (fallback === false) {
    return [];
  }
  if (isArray(fallback)) {
    return fallback;
  }
  let fallbackLocales = [];
  if (isString(fallback)) {
    if (locales.every((locale) => locale !== fallback)) {
      fallbackLocales.push(fallback);
    }
    return fallbackLocales;
  }
  const targets = [...locales, "default"];
  for (const locale of targets) {
    if (locale in fallback == false) {
      continue;
    }
    fallbackLocales = [...fallbackLocales, ...fallback[locale].filter(Boolean)];
  }
  return fallbackLocales;
}
function isLocaleCacheable(locale) {
  return localeLoaders[locale] != null && localeLoaders[locale].every((loader) => loader.cache !== false);
}
function isLocaleWithFallbacksCacheable(locale, fallbackLocales) {
  return isLocaleCacheable(locale) && fallbackLocales.every((fallbackLocale) => isLocaleCacheable(fallbackLocale));
}
function getDefaultLocaleForDomain(host) {
  return normalizedLocales.find((l) => !!l.defaultForDomains?.includes(host))?.code;
}
const isSupportedLocale = (locale) => localeCodes.includes(locale || "");

function useI18nContext(event) {
  if (event.context.nuxtI18n == null) {
    throw new Error("Nuxt I18n server context has not been set up yet.");
  }
  return event.context.nuxtI18n;
}
function tryUseI18nContext(event) {
  return event.context.nuxtI18n;
}
const getHost = (event) => getRequestURL(event, { xForwardedHost: true }).host;
async function initializeI18nContext(event) {
  const runtimeI18n = useRuntimeI18n(void 0, event);
  const defaultLocale = runtimeI18n.defaultLocale || "";
  const options = await setupVueI18nOptions(getDefaultLocaleForDomain(getHost(event)) || defaultLocale);
  const localeConfigs = createLocaleConfigs(options.fallbackLocale);
  const ctx = createI18nContext();
  ctx.vueI18nOptions = options;
  ctx.localeConfigs = localeConfigs;
  event.context.nuxtI18n = ctx;
  return ctx;
}
function createI18nContext() {
  return {
    messages: {},
    slp: {},
    localeConfigs: {},
    trackMap: {},
    vueI18nOptions: void 0,
    trackKey(key, locale) {
      this.trackMap[locale] ??= /* @__PURE__ */ new Set();
      this.trackMap[locale].add(key);
    }
  };
}

function matchBrowserLocale(locales, browserLocales) {
  const matchedLocales = [];
  for (const [index, browserCode] of browserLocales.entries()) {
    const matchedLocale = locales.find((l) => l.language?.toLowerCase() === browserCode.toLowerCase());
    if (matchedLocale) {
      matchedLocales.push({ code: matchedLocale.code, score: 1 - index / browserLocales.length });
      break;
    }
  }
  for (const [index, browserCode] of browserLocales.entries()) {
    const languageCode = browserCode.split("-")[0].toLowerCase();
    const matchedLocale = locales.find((l) => l.language?.split("-")[0].toLowerCase() === languageCode);
    if (matchedLocale) {
      matchedLocales.push({ code: matchedLocale.code, score: 0.999 - index / browserLocales.length });
      break;
    }
  }
  return matchedLocales;
}
function compareBrowserLocale(a, b) {
  if (a.score === b.score) {
    return b.code.length - a.code.length;
  }
  return b.score - a.score;
}
function findBrowserLocale(locales, browserLocales) {
  const matchedLocales = matchBrowserLocale(
    locales.map((l) => ({ code: l.code, language: l.language || l.code })),
    browserLocales
  );
  return matchedLocales.sort(compareBrowserLocale).at(0)?.code ?? "";
}

const appHead = {"link":[{"rel":"icon","type":"image/x-icon","href":"/favicon.ico"},{"rel":"icon","type":"image/webp","href":"/img/logo.webp"},{"rel":"apple-touch-icon","href":"/img/logo.webp"}],"meta":[{"charset":"utf-8"},{"name":"viewport","content":"width=device-width, initial-scale=1"},{"name":"format-detection","content":"telephone=no"},{"name":"keywords","content":"plankbevelen, plank, bevelen, PlankBevelen, 个人博客, 前端开发, Web 技术, 编程经验, 技术文章"},{"name":"description","content":"个人技术博客，分享前端开发、Web 技术、编程经验和技术文章"},{"property":"og:type","content":"website"}],"style":[],"script":[],"noscript":[],"htmlAttrs":{"lang":"zh"}};

const appRootTag = "div";

const appRootAttrs = {"id":"__nuxt"};

const appTeleportTag = "div";

const appTeleportAttrs = {"id":"teleports"};

const appSpaLoaderTag = "div";

const appSpaLoaderAttrs = {"id":"__nuxt-loader"};

const appId = "nuxt-app";

const separator = "___";
const pathLanguageParser = createPathIndexLanguageParser(0);
const getLocaleFromRoutePath = (path) => pathLanguageParser(path);
const getLocaleFromRouteName = (name) => name.split(separator).at(1) ?? "";
function normalizeInput(input) {
  return typeof input !== "object" ? String(input) : String(input?.name || input?.path || "");
}
function getLocaleFromRoute(route) {
  const input = normalizeInput(route);
  return input[0] === "/" ? getLocaleFromRoutePath(input) : getLocaleFromRouteName(input);
}

function matchDomainLocale(locales, host, pathLocale) {
  const normalizeDomain = (domain = "") => domain.replace(/https?:\/\//, "");
  const matches = locales.filter(
    (locale) => normalizeDomain(locale.domain) === host || toArray(locale.domains).includes(host)
  );
  if (matches.length <= 1) {
    return matches[0]?.code;
  }
  return (
    // match by current path locale
    matches.find((l) => l.code === pathLocale)?.code || matches.find((l) => l.defaultForDomains?.includes(host) ?? l.domainDefault)?.code
  );
}

const getCookieLocale = (event, cookieName) => (getCookie(event, cookieName)) || void 0;
const getRouteLocale = (event, route) => getLocaleFromRoute(route);
const getHeaderLocale = (event) => findBrowserLocale(normalizedLocales, parseAcceptLanguage(getRequestHeader(event, "accept-language") || ""));
const getHostLocale = (event, path, domainLocales) => {
  const host = getRequestURL(event, { xForwardedHost: true }).host;
  const locales = normalizedLocales.map((l) => ({
    ...l,
    domain: domainLocales[l.code]?.domain ?? l.domain
  }));
  return matchDomainLocale(locales, host, getLocaleFromRoutePath(path));
};
const useDetectors = (event, config, nuxtApp) => {
  if (!event) {
    throw new Error("H3Event is required for server-side locale detection");
  }
  const runtimeI18n = useRuntimeI18n();
  return {
    cookie: () => getCookieLocale(event, config.cookieKey),
    header: () => getHeaderLocale(event) ,
    navigator: () => void 0,
    host: (path) => getHostLocale(event, path, runtimeI18n.domainLocales),
    route: (path) => getRouteLocale(event, path)
  };
};

// Generated by @nuxtjs/i18n
const pathToI18nConfig = {
  "/about": {
    "zh": "/about",
    "en": "/about"
  },
  "/": {
    "zh": "/",
    "en": "/"
  },
  "/project": {
    "zh": "/project",
    "en": "/project"
  },
  "/admin": {
    "zh": "/admin",
    "en": "/admin"
  },
  "/admin/login": {
    "zh": "/admin/login",
    "en": "/admin/login"
  },
  "/article/:id()": {
    "zh": "/article/:id()",
    "en": "/article/:id()"
  },
  "/article": {
    "zh": "/article",
    "en": "/article"
  },
  "/admin/content/article/edit": {
    "zh": "/admin/content/article/edit",
    "en": "/admin/content/article/edit"
  },
  "/admin/content/article": {
    "zh": "/admin/content/article",
    "en": "/admin/content/article"
  },
  "/admin/content/category": {
    "zh": "/admin/content/category",
    "en": "/admin/content/category"
  },
  "/admin/content/statistics": {
    "zh": "/admin/content/statistics",
    "en": "/admin/content/statistics"
  },
  "/ndefined": {
    "zh": "/ndefined",
    "en": "/ndefined"
  }
};
const i18nPathToPath = {
  "/about": "/about",
  "/": "/",
  "/project": "/project",
  "/admin": "/admin",
  "/admin/login": "/admin/login",
  "/article/:id()": "/article/:id()",
  "/article": "/article",
  "/admin/content/article/edit": "/admin/content/article/edit",
  "/admin/content/article": "/admin/content/article",
  "/admin/content/category": "/admin/content/category",
  "/admin/content/statistics": "/admin/content/statistics",
  "/ndefined": "/ndefined"
};

const matcher = createRouterMatcher([], {});
for (const path of Object.keys(i18nPathToPath)) {
  matcher.addRoute({ path, component: () => "", meta: {} });
}
const getI18nPathToI18nPath = (path, locale) => {
  if (!path || !locale) {
    return;
  }
  const plainPath = i18nPathToPath[path];
  const i18nConfig = pathToI18nConfig[plainPath];
  if (i18nConfig && i18nConfig[locale]) {
    return i18nConfig[locale] === true ? plainPath : i18nConfig[locale];
  }
};
function isExistingNuxtRoute(path) {
  if (path === "") {
    return;
  }
  if (path.endsWith("/__nuxt_error")) {
    return;
  }
  const resolvedMatch = matcher.resolve({ path }, { path: "/", name: "", matched: [], params: {}, meta: {} });
  return resolvedMatch.matched.length > 0 ? resolvedMatch : void 0;
}
function matchLocalized(path, locale, defaultLocale) {
  if (path === "") {
    return;
  }
  const parsed = parsePath(path);
  const resolvedMatch = matcher.resolve(
    { path: parsed.pathname || "/" },
    { path: "/", name: "", matched: [], params: {}, meta: {} }
  );
  if (resolvedMatch.matched.length > 0) {
    const alternate = getI18nPathToI18nPath(resolvedMatch.matched[0].path, locale);
    const match = matcher.resolve(
      { params: resolvedMatch.params },
      { path: alternate || "/", name: "", matched: [], params: {}, meta: {} }
    );
    const isPrefixable = prefixable(locale, defaultLocale);
    return withLeadingSlash(joinURL(isPrefixable ? locale : "", match.path));
  }
}
function prefixable(currentLocale, defaultLocale) {
  return (currentLocale !== defaultLocale || "prefix_except_default" === "prefix");
}

function* detect(detectors, detection, path) {
  if (detection.enabled) {
    yield { locale: detectors.cookie(), source: "cookie" };
    yield { locale: detectors.header(), source: "header" };
  }
  {
    yield { locale: detectors.route(path), source: "route" };
  }
  yield { locale: detection.fallbackLocale, source: "fallback" };
}
function createRedirectResponse(event, dest, code) {
  event.node.res.setHeader("location", dest);
  event.node.res.statusCode = sanitizeStatusCode(code, event.node.res.statusCode);
  return {
    headers: event.node.res.getHeaders(),
    statusCode: event.node.res.statusCode,
    body: `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${dest.replace(/"/g, "%22")}"></head></html>`
  };
}
const _jnI7GhoubDsZ4jI3a9T9OS72iOKdLVJQT1vTt7oFhM = defineNitroPlugin(async (nitro) => {
  const runtimeI18n = useRuntimeI18n();
  const rootRedirect = resolveRootRedirect(runtimeI18n.rootRedirect);
  runtimeI18n.defaultLocale || "";
  try {
    const cacheStorage = useStorage("cache");
    const cachedKeys = await cacheStorage.getKeys("nitro:handlers:i18n");
    await Promise.all(cachedKeys.map((key) => cacheStorage.removeItem(key)));
  } catch {
  }
  const detection = useI18nDetection();
  const cookieOptions = {
    path: "/",
    domain: detection.cookieDomain || void 0,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: detection.cookieSecure
  };
  const createBaseUrlGetter = () => {
    isFunction(runtimeI18n.baseUrl) ? "" : runtimeI18n.baseUrl || "";
    if (isFunction(runtimeI18n.baseUrl)) {
      return () => "";
    }
    return (event, defaultLocale) => {
      return "";
    };
  };
  function resolveRedirectPath(event, path, pathLocale, defaultLocale, detector) {
    let locale = "";
    for (const detected of detect(detector, detection, event.path)) {
      if (detected.locale && isSupportedLocale(detected.locale)) {
        locale = detected.locale;
        break;
      }
    }
    locale ||= defaultLocale;
    function getLocalizedMatch(locale2) {
      const res = matchLocalized(path || "/", locale2, defaultLocale);
      if (res && res !== event.path) {
        return res;
      }
    }
    let resolvedPath = void 0;
    let redirectCode = 302;
    const requestURL = getRequestURL(event);
    if (rootRedirect && requestURL.pathname === "/") {
      locale = detection.enabled && locale || defaultLocale;
      resolvedPath = isSupportedLocale(detector.route(rootRedirect.path)) && rootRedirect.path || matchLocalized(rootRedirect.path, locale, defaultLocale);
      redirectCode = rootRedirect.code;
    } else if (runtimeI18n.redirectStatusCode) {
      redirectCode = runtimeI18n.redirectStatusCode;
    }
    switch (detection.redirectOn) {
      case "root":
        if (requestURL.pathname !== "/") {
          break;
        }
      // fallthrough (root has no prefix)
      case "no prefix":
        if (pathLocale) {
          break;
        }
      // fallthrough to resolve
      case "all":
        resolvedPath ??= getLocalizedMatch(locale);
        break;
    }
    if (requestURL.pathname === "/" && "prefix_except_default" === "prefix") ;
    return { path: resolvedPath, code: redirectCode, locale };
  }
  const baseUrlGetter = createBaseUrlGetter();
  nitro.hooks.hook("request", async (event) => {
    await initializeI18nContext(event);
  });
  nitro.hooks.hook("render:before", async (context) => {
    const { event } = context;
    const ctx = useI18nContext(event);
    const url = getRequestURL(event);
    const detector = useDetectors(event, detection);
    const localeSegment = detector.route(event.path);
    const pathLocale = isSupportedLocale(localeSegment) && localeSegment || void 0;
    const path = (pathLocale && url.pathname.slice(pathLocale.length + 1)) ?? url.pathname;
    if (!url.pathname.includes("/_i18n/SI5ZM0BU") && !isExistingNuxtRoute(path)) {
      return;
    }
    const resolved = resolveRedirectPath(event, path, pathLocale, ctx.vueI18nOptions.defaultLocale, detector);
    if (resolved.path && resolved.path !== url.pathname) {
      ctx.detectLocale = resolved.locale;
      detection.useCookie && setCookie(event, detection.cookieKey, resolved.locale, cookieOptions);
      context.response = createRedirectResponse(
        event,
        joinURL(baseUrlGetter(event, ctx.vueI18nOptions.defaultLocale), resolved.path + url.search),
        resolved.code
      );
      return;
    }
  });
  nitro.hooks.hook("render:html", (htmlContext, { event }) => {
    tryUseI18nContext(event);
  });
});

function readEnvInt(name, fallback) {
  const raw = (process.env[name] || "").trim();
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
const _Li25LaFvpZLktOn2nH_SnEoZKcXHSWC1MfAddXX7pVI = defineNitroPlugin(async (nuxtApp) => {
  const ttlHours = readEnvInt("TEMP_UPLOAD_TTL_HOURS", 48);
  const intervalMinutes = readEnvInt("TEMP_CLEAN_INTERVAL_MINUTES", 60);
  const ttlMs = ttlHours * 60 * 60 * 1e3;
  let timer = null;
  let running = false;
  const cleanup = async () => {
    var _a;
    if (running) return;
    running = true;
    try {
      const base = getTempUploadsDir();
      const now = Date.now();
      let entries = [];
      try {
        entries = await promises.readdir(base, { withFileTypes: true });
      } catch (e) {
        if ((e == null ? void 0 : e.code) === "ENOENT") return;
        throw e;
      }
      for (const ent of entries) {
        if (!((_a = ent == null ? void 0 : ent.isDirectory) == null ? void 0 : _a.call(ent))) continue;
        const full = path.join(base, ent.name);
        try {
          const st = await promises.stat(full);
          const age = now - st.mtimeMs;
          if (age > ttlMs) {
            await promises.rm(full, { recursive: true, force: true });
          }
        } catch (e) {
          if ((e == null ? void 0 : e.code) === "ENOENT") continue;
          console.error("temp uploads cleanup error:", (e == null ? void 0 : e.message) || e);
        }
      }
    } catch (e) {
      console.error("temp uploads cleanup failure:", (e == null ? void 0 : e.message) || e);
    } finally {
      running = false;
    }
  };
  await cleanup();
  timer = setInterval(cleanup, intervalMinutes * 60 * 1e3);
  nuxtApp.hooks.hook("close", async () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  });
});

const _qGZQJZqagGrtkokECXtRTzIajwn0NVpmqMVChpHHYCI = defineNitroPlugin(async (nuxtApp) => {
  let retryTimer = null;
  const ok = await initDB();
  if (!ok) {
    retryTimer = setInterval(async () => {
      try {
        const success = await initDB();
        if (success) {
          if (retryTimer) {
            clearInterval(retryTimer);
            retryTimer = null;
          }
        }
      } catch (e) {
        console.error("db connect retry failure:", (e == null ? void 0 : e.message) || e);
      }
    }, 60 * 1e3);
  }
  nuxtApp.hooks.hook("close", async () => {
    if (retryTimer) {
      clearInterval(retryTimer);
      retryTimer = null;
    }
    await closeDB();
  });
});

const plugins = [
  _16f22ZRRmUUWTKi2_ra6x_KJI2cBfde_i5TrQjRXe4,
_7WMFSMiQxtWhriD01ta7ZJb413c8ENtsWc25LCtcE,
__uvMmNC_ta0iNIMQ9keg6yyltUUA17iwOJJh1xbGNfE,
_jnI7GhoubDsZ4jI3a9T9OS72iOKdLVJQT1vTt7oFhM,
_Li25LaFvpZLktOn2nH_SnEoZKcXHSWC1MfAddXX7pVI,
_qGZQJZqagGrtkokECXtRTzIajwn0NVpmqMVChpHHYCI
];

const assets = {
  "/favicon.ico": {
    "type": "image/vnd.microsoft.icon",
    "etag": "\"423e-QpCPCM9x9QdIS7ggWPMFVVnOPCs\"",
    "mtime": "2026-03-17T12:10:40.433Z",
    "size": 16958,
    "path": "../public/favicon.ico"
  },
  "/robots.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"11b-KPdh8XyC59sPUr8J/8WOGtk2MYs\"",
    "mtime": "2026-03-17T17:12:16.676Z",
    "size": 283,
    "path": "../public/robots.txt"
  },
  "/robots.txt.bak": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"74-rJwvtGpFzlLA3l1DlMFqbu1Gu9c\"",
    "mtime": "2026-03-17T12:10:40.989Z",
    "size": 116,
    "path": "../public/robots.txt.bak"
  },
  "/sitemap_index.xml": {
    "type": "application/xml",
    "etag": "\"12f-mNDeoJlX2y1r1JW7PjWh40Gt4dc\"",
    "mtime": "2026-03-17T17:12:16.719Z",
    "size": 303,
    "path": "../public/sitemap_index.xml"
  },
  "/_robots.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"74-rJwvtGpFzlLA3l1DlMFqbu1Gu9c\"",
    "mtime": "2026-03-17T12:10:41.475Z",
    "size": 116,
    "path": "../public/_robots.txt"
  },
  "/img/404.webp": {
    "type": "image/webp",
    "etag": "\"1d80-jiNLHLCN2NUszHoejqJZcXl8vIM\"",
    "mtime": "2026-03-17T12:10:29.369Z",
    "size": 7552,
    "path": "../public/img/404.webp"
  },
  "/img/avatar.webp": {
    "type": "image/webp",
    "etag": "\"b204-ie7J2zG7wGCvc4iByKJoYOJz0PY\"",
    "mtime": "2026-03-17T12:10:29.024Z",
    "size": 45572,
    "path": "../public/img/avatar.webp"
  },
  "/img/logo.webp": {
    "type": "image/webp",
    "etag": "\"41e8-DEifz5MiX34GdE2b0WPIVYa6K9Y\"",
    "mtime": "2026-03-17T12:10:29.175Z",
    "size": 16872,
    "path": "../public/img/logo.webp"
  },
  "/md/about-en.md": {
    "type": "text/markdown; charset=utf-8",
    "etag": "\"220-EPeY9irHpkzWcJJBWWK50fNQoAk\"",
    "mtime": "2026-03-17T12:10:31.004Z",
    "size": 544,
    "path": "../public/md/about-en.md"
  },
  "/md/about.md": {
    "type": "text/markdown; charset=utf-8",
    "etag": "\"1f0-9Y8AOHG9zMVjkUaAufXh1yezHS4\"",
    "mtime": "2026-03-17T12:10:30.082Z",
    "size": 496,
    "path": "../public/md/about.md"
  },
  "/md/article-1.md": {
    "type": "text/markdown; charset=utf-8",
    "etag": "\"b03-JkjdTiy6CyJe6PBk+3vLYaJVPY8\"",
    "mtime": "2026-03-17T12:10:29.947Z",
    "size": 2819,
    "path": "../public/md/article-1.md"
  },
  "/md/article-2.md": {
    "type": "text/markdown; charset=utf-8",
    "etag": "\"1c6b-fkeoFr7orCUD3/TuuinKOQlu8Qo\"",
    "mtime": "2026-03-17T12:10:30.876Z",
    "size": 7275,
    "path": "../public/md/article-2.md"
  },
  "/md/article-20.md": {
    "type": "text/markdown; charset=utf-8",
    "etag": "\"12a8-QS+O3GineiqVLdTcAVHUMxBbN94\"",
    "mtime": "2026-03-17T12:10:30.686Z",
    "size": 4776,
    "path": "../public/md/article-20.md"
  },
  "/md/article-21.md": {
    "type": "text/markdown; charset=utf-8",
    "etag": "\"3e-3wujZLg/oksFXvPRYcAK1bP0t5Y\"",
    "mtime": "2026-03-17T12:10:31.189Z",
    "size": 62,
    "path": "../public/md/article-21.md"
  },
  "/md/article-3.md": {
    "type": "text/markdown; charset=utf-8",
    "etag": "\"1205-5GrmkuuaKCvyjPr6qJOGcH92dB0\"",
    "mtime": "2026-03-17T12:10:30.420Z",
    "size": 4613,
    "path": "../public/md/article-3.md"
  },
  "/md/article-4.md": {
    "type": "text/markdown; charset=utf-8",
    "etag": "\"16a5-mZFGkFkU0SL/RljHsDoU9igZiOo\"",
    "mtime": "2026-03-17T12:10:30.556Z",
    "size": 5797,
    "path": "../public/md/article-4.md"
  },
  "/md/article-5.md": {
    "type": "text/markdown; charset=utf-8",
    "etag": "\"8e4-1GZ2j8tfXMxfWGg4Gi7iGBUtlQo\"",
    "mtime": "2026-03-17T12:10:30.213Z",
    "size": 2276,
    "path": "../public/md/article-5.md"
  },
  "/ico/empty.ico": {
    "type": "image/vnd.microsoft.icon",
    "etag": "\"423e-zoSL+U/s5FXHisxnvN11KMrDHeg\"",
    "mtime": "2026-03-17T12:10:28.807Z",
    "size": 16958,
    "path": "../public/ico/empty.ico"
  },
  "/__sitemap__/en.xml": {
    "type": "application/xml",
    "etag": "\"7ef-q9d35/0BGb0MSeCSw5LHSs6VReM\"",
    "mtime": "2026-03-17T17:12:16.803Z",
    "size": 2031,
    "path": "../public/__sitemap__/en.xml"
  },
  "/__sitemap__/en.xml.br": {
    "type": "application/xml",
    "encoding": "br",
    "etag": "\"146-kWKnp40lW0Jy8Ab/JoaUUq3lWoo\"",
    "mtime": "2026-03-17T17:12:16.848Z",
    "size": 326,
    "path": "../public/__sitemap__/en.xml.br"
  },
  "/__sitemap__/en.xml.gz": {
    "type": "application/xml",
    "encoding": "gzip",
    "etag": "\"187-3HHVEC3n9I6ZwcK0GqkDzlclCtQ\"",
    "mtime": "2026-03-17T17:12:16.842Z",
    "size": 391,
    "path": "../public/__sitemap__/en.xml.gz"
  },
  "/__sitemap__/zh.xml": {
    "type": "application/xml",
    "etag": "\"1105-CkuJ+/otU2ENiET/Rm70+ID3Hok\"",
    "mtime": "2026-03-17T17:12:16.779Z",
    "size": 4357,
    "path": "../public/__sitemap__/zh.xml"
  },
  "/__sitemap__/zh.xml.br": {
    "type": "application/xml",
    "encoding": "br",
    "etag": "\"1c6-HbNy9O3oWjC6ATY5i4+2JSYzhvg\"",
    "mtime": "2026-03-17T17:12:16.832Z",
    "size": 454,
    "path": "../public/__sitemap__/zh.xml.br"
  },
  "/__sitemap__/zh.xml.gz": {
    "type": "application/xml",
    "encoding": "gzip",
    "etag": "\"230-IRxgFypi2rogFZrJbY4nlneBEV0\"",
    "mtime": "2026-03-17T17:12:16.818Z",
    "size": 560,
    "path": "../public/__sitemap__/zh.xml.gz"
  },
  "/_nuxt/-L3eBynH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8fd-QbRC0hMNQXk16buduvPwWZMbo68\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 2301,
    "path": "../public/_nuxt/-L3eBynH.js"
  },
  "/_nuxt/-L3eBynH.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"3c9-TRbnJlW/YDR4RwvQKSVnzbMQ8ws\"",
    "mtime": "2026-03-17T17:12:18.977Z",
    "size": 969,
    "path": "../public/_nuxt/-L3eBynH.js.br"
  },
  "/_nuxt/-L3eBynH.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"4a9-oLwXB0aKE3FgVXOlxVX/go7tPeI\"",
    "mtime": "2026-03-17T17:12:18.977Z",
    "size": 1193,
    "path": "../public/_nuxt/-L3eBynH.js.gz"
  },
  "/_nuxt/4D5F-n5U.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"67c-ebZDY1u2yhiihGa9wbWHPSJRKV0\"",
    "mtime": "2026-03-17T17:11:35.676Z",
    "size": 1660,
    "path": "../public/_nuxt/4D5F-n5U.js"
  },
  "/_nuxt/4D5F-n5U.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"213-d1TNahM0++Tj0SLwAzGqC6mSZ4s\"",
    "mtime": "2026-03-17T17:12:18.976Z",
    "size": 531,
    "path": "../public/_nuxt/4D5F-n5U.js.br"
  },
  "/_nuxt/4D5F-n5U.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"25c-Lw0Udoxy7hU9WEOhFRlSAeHULs0\"",
    "mtime": "2026-03-17T17:12:18.976Z",
    "size": 604,
    "path": "../public/_nuxt/4D5F-n5U.js.gz"
  },
  "/_nuxt/5rdN8-tt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2ecb-FkWH7/wuMLRzu0Ek4DcszMwtMd8\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 11979,
    "path": "../public/_nuxt/5rdN8-tt.js"
  },
  "/_nuxt/5rdN8-tt.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"100a-rqsnuTwXtzvW1XU1WK16CpVSoB8\"",
    "mtime": "2026-03-17T17:11:38.346Z",
    "size": 4106,
    "path": "../public/_nuxt/5rdN8-tt.js.gz"
  },
  "/_nuxt/9x8dAVQw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"482-TAXomqw1SJSVW8ebrie6ivVAL7w\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 1154,
    "path": "../public/_nuxt/9x8dAVQw.js"
  },
  "/_nuxt/9x8dAVQw.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"210-4rcz0kNwVQ1I7jns4lt5ILSLaQA\"",
    "mtime": "2026-03-17T17:12:18.977Z",
    "size": 528,
    "path": "../public/_nuxt/9x8dAVQw.js.br"
  },
  "/_nuxt/9x8dAVQw.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"24c-GVhOCcLIt1/FcGbl8UWG4gSaRRo\"",
    "mtime": "2026-03-17T17:12:18.976Z",
    "size": 588,
    "path": "../public/_nuxt/9x8dAVQw.js.gz"
  },
  "/_nuxt/about.DL5ldDpV.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"158a-oAsBEN5DOovEBs6EJCJI53gz2JQ\"",
    "mtime": "2026-03-17T17:11:35.669Z",
    "size": 5514,
    "path": "../public/_nuxt/about.DL5ldDpV.css"
  },
  "/_nuxt/about.DL5ldDpV.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"4e0-1e/RvH7G3ROiz3aS5ZljOyx4Spw\"",
    "mtime": "2026-03-17T17:12:18.977Z",
    "size": 1248,
    "path": "../public/_nuxt/about.DL5ldDpV.css.br"
  },
  "/_nuxt/about.DL5ldDpV.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"5ba-tUCsWZEEl9S0BYveKPFfrgNUm3E\"",
    "mtime": "2026-03-17T17:12:18.977Z",
    "size": 1466,
    "path": "../public/_nuxt/about.DL5ldDpV.css.gz"
  },
  "/_nuxt/admin.oE7MjCFw.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"152d-FwkX3nAl0HtarKjeUxFIfvxz7JA\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 5421,
    "path": "../public/_nuxt/admin.oE7MjCFw.css"
  },
  "/_nuxt/admin.oE7MjCFw.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"4e4-dJQ6NGcv03dZr9GW580KcSw3wGw\"",
    "mtime": "2026-03-17T17:12:18.977Z",
    "size": 1252,
    "path": "../public/_nuxt/admin.oE7MjCFw.css.br"
  },
  "/_nuxt/admin.oE7MjCFw.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"5a9-h69dtNmSSho8SxoqzyZ2ZYhUSIY\"",
    "mtime": "2026-03-17T17:12:18.976Z",
    "size": 1449,
    "path": "../public/_nuxt/admin.oE7MjCFw.css.gz"
  },
  "/_nuxt/articleDesc.3usPhcTq.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"17fd-8UyZ9VYXyJX8qvhHf/cu26ACm6Q\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 6141,
    "path": "../public/_nuxt/articleDesc.3usPhcTq.css"
  },
  "/_nuxt/articleDesc.3usPhcTq.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"55b-VtucWLdaA/6kq2qUfmkdMKmISC0\"",
    "mtime": "2026-03-17T17:12:18.977Z",
    "size": 1371,
    "path": "../public/_nuxt/articleDesc.3usPhcTq.css.br"
  },
  "/_nuxt/articleDesc.3usPhcTq.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"64d-YCTjbK33luxMUyIrx/wRphTyTJY\"",
    "mtime": "2026-03-17T17:12:18.976Z",
    "size": 1613,
    "path": "../public/_nuxt/articleDesc.3usPhcTq.css.gz"
  },
  "/_nuxt/articleList.DNaELYTN.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"14e5-FHR7y9OPjVZVDZVHQ2ya+bAxoRA\"",
    "mtime": "2026-03-17T17:11:35.670Z",
    "size": 5349,
    "path": "../public/_nuxt/articleList.DNaELYTN.css"
  },
  "/_nuxt/articleList.DNaELYTN.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"4c9-AgQPJqgcVQ0oSTy7vpZoR+XxrE0\"",
    "mtime": "2026-03-17T17:12:18.976Z",
    "size": 1225,
    "path": "../public/_nuxt/articleList.DNaELYTN.css.br"
  },
  "/_nuxt/articleList.DNaELYTN.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"590-Z796VIEL7E01FWqobBoeqLRx9Qc\"",
    "mtime": "2026-03-17T17:12:18.977Z",
    "size": 1424,
    "path": "../public/_nuxt/articleList.DNaELYTN.css.gz"
  },
  "/_nuxt/B-8jnY81.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1180-ZWdY3NYmf0fn7LR50RAZ17iQD+8\"",
    "mtime": "2026-03-17T17:11:35.675Z",
    "size": 4480,
    "path": "../public/_nuxt/B-8jnY81.js"
  },
  "/_nuxt/B-8jnY81.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"612-dbtx9B/pbZq7H1OSivLgn3vcDio\"",
    "mtime": "2026-03-17T17:12:18.977Z",
    "size": 1554,
    "path": "../public/_nuxt/B-8jnY81.js.br"
  },
  "/_nuxt/B-8jnY81.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"6ef-TFYs0VigQqu5lmNl572MVJ3OISM\"",
    "mtime": "2026-03-17T17:12:18.977Z",
    "size": 1775,
    "path": "../public/_nuxt/B-8jnY81.js.gz"
  },
  "/_nuxt/B-bq8YJr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b355-QlnB6hPk7BQYM1hdRhNkXvmKxEI\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 45909,
    "path": "../public/_nuxt/B-bq8YJr.js"
  },
  "/_nuxt/B-bq8YJr.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"4094-ggd0zPGsJv/FpFooaMCMlBGCVqI\"",
    "mtime": "2026-03-17T17:11:38.355Z",
    "size": 16532,
    "path": "../public/_nuxt/B-bq8YJr.js.gz"
  },
  "/_nuxt/B-ioSKa-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"111617-G/aY5JW1pK9oYHNP5s3slUH/wjM\"",
    "mtime": "2026-03-17T17:11:35.699Z",
    "size": 1119767,
    "path": "../public/_nuxt/B-ioSKa-.js"
  },
  "/_nuxt/B-ioSKa-.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"5a7a7-3SkVfHSDP90CrPzJ6pMPaLCJ9Fg\"",
    "mtime": "2026-03-17T17:11:38.640Z",
    "size": 370599,
    "path": "../public/_nuxt/B-ioSKa-.js.gz"
  },
  "/_nuxt/B1tBg_DP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7b9-bVKRZU8i1+vUCQV8Xmq9X6xX1mM\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 1977,
    "path": "../public/_nuxt/B1tBg_DP.js"
  },
  "/_nuxt/B1tBg_DP.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"326-fPDFmGcM87HBJh6QOnsjTCcLr1M\"",
    "mtime": "2026-03-17T17:12:18.977Z",
    "size": 806,
    "path": "../public/_nuxt/B1tBg_DP.js.br"
  },
  "/_nuxt/B1tBg_DP.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"37f-u+TIGgSj/6vZyPFf+nJn2T97LnQ\"",
    "mtime": "2026-03-17T17:12:18.977Z",
    "size": 895,
    "path": "../public/_nuxt/B1tBg_DP.js.gz"
  },
  "/_nuxt/B2Rjki9n.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"142c-KKM0f4n7Mcqe/xX6b8q9sDTEBOQ\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 5164,
    "path": "../public/_nuxt/B2Rjki9n.js"
  },
  "/_nuxt/B2Rjki9n.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"7be-kGKbKSlDuWDKMAv58jttwJxDRSE\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 1982,
    "path": "../public/_nuxt/B2Rjki9n.js.br"
  },
  "/_nuxt/B2Rjki9n.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"866-igaHZgvVOs9E1JWZtm2Bxoxqeys\"",
    "mtime": "2026-03-17T17:12:18.977Z",
    "size": 2150,
    "path": "../public/_nuxt/B2Rjki9n.js.gz"
  },
  "/_nuxt/B4CMkyY2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8fd-lyp8u6QiNFJ0j90lWnKWv6VB3/8\"",
    "mtime": "2026-03-17T17:11:35.675Z",
    "size": 2301,
    "path": "../public/_nuxt/B4CMkyY2.js"
  },
  "/_nuxt/B4CMkyY2.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"41c-0K97srxMsaaZpRbsNqCMRF0X2/w\"",
    "mtime": "2026-03-17T17:12:18.977Z",
    "size": 1052,
    "path": "../public/_nuxt/B4CMkyY2.js.br"
  },
  "/_nuxt/B4CMkyY2.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"4cb-CKzlovJE1L1OlSniygOnwK4Xz0c\"",
    "mtime": "2026-03-17T17:12:18.977Z",
    "size": 1227,
    "path": "../public/_nuxt/B4CMkyY2.js.gz"
  },
  "/_nuxt/B4kiWyti.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2476-k1paXLnu9B+ZXhmVPUdwQ9pokgc\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 9334,
    "path": "../public/_nuxt/B4kiWyti.js"
  },
  "/_nuxt/B4kiWyti.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"e1a-9kGDaSZpoI3GIrkXe6J8/b1qCro\"",
    "mtime": "2026-03-17T17:12:18.977Z",
    "size": 3610,
    "path": "../public/_nuxt/B4kiWyti.js.br"
  },
  "/_nuxt/B4kiWyti.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"100c-BJnCHfprLlhdXa9oDcdSJp0YWQQ\"",
    "mtime": "2026-03-17T17:12:18.977Z",
    "size": 4108,
    "path": "../public/_nuxt/B4kiWyti.js.gz"
  },
  "/_nuxt/B533Al4x.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"64c6-DAzA/qcrSWkzE9YI/kCbfK0fo2g\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 25798,
    "path": "../public/_nuxt/B533Al4x.js"
  },
  "/_nuxt/B533Al4x.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"2194-Bdq1yMaMHKhIvE7Mmm6tjh0+Qwc\"",
    "mtime": "2026-03-17T17:11:38.346Z",
    "size": 8596,
    "path": "../public/_nuxt/B533Al4x.js.gz"
  },
  "/_nuxt/B6wPVr8A.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b7e-d8H6XZ5HocE+HQG3/TTWH1si9NU\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 2942,
    "path": "../public/_nuxt/B6wPVr8A.js"
  },
  "/_nuxt/B6wPVr8A.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"4e2-lqjyRAajVpskcw+bfUUC05LOatc\"",
    "mtime": "2026-03-17T17:12:18.977Z",
    "size": 1250,
    "path": "../public/_nuxt/B6wPVr8A.js.br"
  },
  "/_nuxt/B6wPVr8A.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"552-nxTjqop7PPYCe570PHHHqWNj2K4\"",
    "mtime": "2026-03-17T17:12:18.977Z",
    "size": 1362,
    "path": "../public/_nuxt/B6wPVr8A.js.gz"
  },
  "/_nuxt/B9uivgTg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"571e-r5KY2eSFi+PnaDNBzimkVGyGArk\"",
    "mtime": "2026-03-17T17:11:35.675Z",
    "size": 22302,
    "path": "../public/_nuxt/B9uivgTg.js"
  },
  "/_nuxt/B9uivgTg.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1eb6-WAxdzZiWXDZFMhhlrxNjTEb8UMc\"",
    "mtime": "2026-03-17T17:11:38.347Z",
    "size": 7862,
    "path": "../public/_nuxt/B9uivgTg.js.gz"
  },
  "/_nuxt/B9xdYoR4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"fd2-Y6HkWka/W26uoU65jVxVF5viSxI\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 4050,
    "path": "../public/_nuxt/B9xdYoR4.js"
  },
  "/_nuxt/B9xdYoR4.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"5cf-I4cx6KQAoxThTU3CBYy6fYEPQ20\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 1487,
    "path": "../public/_nuxt/B9xdYoR4.js.br"
  },
  "/_nuxt/B9xdYoR4.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"6a9-wPx95KuWY6hK3ADXelAJlNM1jd0\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 1705,
    "path": "../public/_nuxt/B9xdYoR4.js.gz"
  },
  "/_nuxt/BA5vi2Kp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"db6-vQ21m3ZQeSYxagOlf3kyZoDeoYk\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 3510,
    "path": "../public/_nuxt/BA5vi2Kp.js"
  },
  "/_nuxt/BA5vi2Kp.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"36f-k1FiPYpP+LQ08txX8yubGv6vGos\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 879,
    "path": "../public/_nuxt/BA5vi2Kp.js.br"
  },
  "/_nuxt/BA5vi2Kp.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"3d1-kJ3GIgoYcmntHIDr+Kh9U9jUQIY\"",
    "mtime": "2026-03-17T17:12:18.977Z",
    "size": 977,
    "path": "../public/_nuxt/BA5vi2Kp.js.gz"
  },
  "/_nuxt/BA8TQuH4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1c4-cP9P5JC43dLwtox95ondp/OH/mg\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 452,
    "path": "../public/_nuxt/BA8TQuH4.js"
  },
  "/_nuxt/BAlR-H5Z.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8bc-LpKCyr7f1nbYrSqfNanvsrXE4LI\"",
    "mtime": "2026-03-17T17:11:35.680Z",
    "size": 2236,
    "path": "../public/_nuxt/BAlR-H5Z.js"
  },
  "/_nuxt/BAlR-H5Z.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"41f-WA4HoGFEEuWlWxLWebkAJ0f7mBE\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 1055,
    "path": "../public/_nuxt/BAlR-H5Z.js.br"
  },
  "/_nuxt/BAlR-H5Z.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"496-FfenHAD9KW6IvoaJLGGSR4fV1Xg\"",
    "mtime": "2026-03-17T17:12:18.977Z",
    "size": 1174,
    "path": "../public/_nuxt/BAlR-H5Z.js.gz"
  },
  "/_nuxt/BCqr6yLg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"317f-ggNWjoUSB9QVbIw1sS3IZLkPrS4\"",
    "mtime": "2026-03-17T17:11:35.675Z",
    "size": 12671,
    "path": "../public/_nuxt/BCqr6yLg.js"
  },
  "/_nuxt/BCqr6yLg.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"15d1-UqUjQH3IKAcPQdL90vyLvrIjT6U\"",
    "mtime": "2026-03-17T17:11:38.347Z",
    "size": 5585,
    "path": "../public/_nuxt/BCqr6yLg.js.gz"
  },
  "/_nuxt/BCZA_wO0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"472-o3D2g5yx/Z1jkOrHJTKGNVnR1DI\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 1138,
    "path": "../public/_nuxt/BCZA_wO0.js"
  },
  "/_nuxt/BCZA_wO0.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"1c5-/onfG9DEMoR70FZ90+XAiJJCwXM\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 453,
    "path": "../public/_nuxt/BCZA_wO0.js.br"
  },
  "/_nuxt/BCZA_wO0.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"21a-AUUJGQc/hj58B89lQQYNuXxCras\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 538,
    "path": "../public/_nuxt/BCZA_wO0.js.gz"
  },
  "/_nuxt/BdPpgUhU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"11f-jy1vUl4BIIOEQaOMTdreJIuQLB4\"",
    "mtime": "2026-03-17T17:11:35.673Z",
    "size": 287,
    "path": "../public/_nuxt/BdPpgUhU.js"
  },
  "/_nuxt/BDto7vTd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"10fd-SJZRGOfwTRjQ7wKI6seqq/tv16k\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 4349,
    "path": "../public/_nuxt/BDto7vTd.js"
  },
  "/_nuxt/BDto7vTd.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"6a3-yOruhsb6GHFygb7y61XzpEHg3/I\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 1699,
    "path": "../public/_nuxt/BDto7vTd.js.br"
  },
  "/_nuxt/BDto7vTd.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"7f5-Yst2/Lr5gzxIw5TBDxcz2KFisk8\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 2037,
    "path": "../public/_nuxt/BDto7vTd.js.gz"
  },
  "/_nuxt/BEk9thJj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a8b-1+2rGYhpUUWMkcjHe1zTVwMpPMI\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 6795,
    "path": "../public/_nuxt/BEk9thJj.js"
  },
  "/_nuxt/BEk9thJj.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"a4c-wk4aRbsegcXZo2fBcP6YNwlxe/w\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 2636,
    "path": "../public/_nuxt/BEk9thJj.js.br"
  },
  "/_nuxt/BEk9thJj.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"ba6-HUfgpqbWay3Oc7Wvol1jLFk3lN8\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 2982,
    "path": "../public/_nuxt/BEk9thJj.js.gz"
  },
  "/_nuxt/BEugSyMb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2d72-DO+q/iY1PZ2wRMZOAoNt/YTzTdU\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 11634,
    "path": "../public/_nuxt/BEugSyMb.js"
  },
  "/_nuxt/BEugSyMb.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"11a5-7pwJA4F62ntKZbZHGfVym0WsxeQ\"",
    "mtime": "2026-03-17T17:11:38.347Z",
    "size": 4517,
    "path": "../public/_nuxt/BEugSyMb.js.gz"
  },
  "/_nuxt/BeYMoFt4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"145-Z7+J4EAQRRqBA7BBpkECpH3PjFo\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 325,
    "path": "../public/_nuxt/BeYMoFt4.js"
  },
  "/_nuxt/BfvgReVJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"836-vREa0gApDBp0ds0W1+DdpNuPlVk\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 2102,
    "path": "../public/_nuxt/BfvgReVJ.js"
  },
  "/_nuxt/BfvgReVJ.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"285-+qGTrTjTFjgW4aM8ufGpDJs2rzE\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 645,
    "path": "../public/_nuxt/BfvgReVJ.js.br"
  },
  "/_nuxt/BfvgReVJ.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"2ea-4VbHCumahlexXnSFf7NrZitGGqE\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 746,
    "path": "../public/_nuxt/BfvgReVJ.js.gz"
  },
  "/_nuxt/BFZDh1rQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d27-/iabxc34gsNDqOqmaIBvdCY2SfI\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 3367,
    "path": "../public/_nuxt/BFZDh1rQ.js"
  },
  "/_nuxt/BFZDh1rQ.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"58b-AE1ntTIpgZC87J/HZOlAS/k5/x0\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 1419,
    "path": "../public/_nuxt/BFZDh1rQ.js.br"
  },
  "/_nuxt/BFZDh1rQ.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"643-wrPh+o3ojV4FJEXD0wbeR+Y/Leo\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 1603,
    "path": "../public/_nuxt/BFZDh1rQ.js.gz"
  },
  "/_nuxt/BgMRiT3U.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d43-vwo73V2tQvOzIO0D8W8HdMKkjkM\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 3395,
    "path": "../public/_nuxt/BgMRiT3U.js"
  },
  "/_nuxt/BgMRiT3U.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"51b-nYVgcHt9uyza+pqo3nsKaVhz9Tk\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 1307,
    "path": "../public/_nuxt/BgMRiT3U.js.br"
  },
  "/_nuxt/BgMRiT3U.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"59c-Ckd4CqHUMFBr8QL6+gz6aljztnU\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 1436,
    "path": "../public/_nuxt/BgMRiT3U.js.gz"
  },
  "/_nuxt/BhIoCwQU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"44b-pFLz/LKLJ0JcVkE1yIirBAUWmUE\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 1099,
    "path": "../public/_nuxt/BhIoCwQU.js"
  },
  "/_nuxt/BhIoCwQU.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"237-4hpcshagp6pkTuT5kRvAmbKcbYU\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 567,
    "path": "../public/_nuxt/BhIoCwQU.js.br"
  },
  "/_nuxt/BhIoCwQU.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"27c-N1+JojHrGvNKQA73BL0O+i7FRTo\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 636,
    "path": "../public/_nuxt/BhIoCwQU.js.gz"
  },
  "/_nuxt/BiXATMrA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3f61-VyCEL/Z6oyyPxfIC/8mq8ABv31M\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 16225,
    "path": "../public/_nuxt/BiXATMrA.js"
  },
  "/_nuxt/BiXATMrA.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1cf5-gdzKoouk2YtJ1u/OMH1K//8VM24\"",
    "mtime": "2026-03-17T17:11:38.347Z",
    "size": 7413,
    "path": "../public/_nuxt/BiXATMrA.js.gz"
  },
  "/_nuxt/BJ4BC0dw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"86a-7M//hJi3CEH4PZPuB6kuqrzgodU\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 2154,
    "path": "../public/_nuxt/BJ4BC0dw.js"
  },
  "/_nuxt/BJ4BC0dw.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"3c7-Wm7Vq03ZrHALIZ25M92C58eYdNA\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 967,
    "path": "../public/_nuxt/BJ4BC0dw.js.br"
  },
  "/_nuxt/BJ4BC0dw.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"442-cW06HbVyWB4jO+WPHvKznxptGFw\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 1090,
    "path": "../public/_nuxt/BJ4BC0dw.js.gz"
  },
  "/_nuxt/BJE7k7XL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3934-EaLbO8VUQ9l4MLCKo1qqMPola0c\"",
    "mtime": "2026-03-17T17:11:35.675Z",
    "size": 14644,
    "path": "../public/_nuxt/BJE7k7XL.js"
  },
  "/_nuxt/BJE7k7XL.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"172f-u87H+JK+1jNZOgwp/M6/hN2yQ8Q\"",
    "mtime": "2026-03-17T17:11:38.348Z",
    "size": 5935,
    "path": "../public/_nuxt/BJE7k7XL.js.gz"
  },
  "/_nuxt/BKvsz2u1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a95-LOpk0mRNCo5trgYOzjEAJYXZc5k\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 2709,
    "path": "../public/_nuxt/BKvsz2u1.js"
  },
  "/_nuxt/BKvsz2u1.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2d0-SiGDjqnDasgB9zWeNDj7tNkp6l4\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 720,
    "path": "../public/_nuxt/BKvsz2u1.js.br"
  },
  "/_nuxt/BKvsz2u1.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"33a-oll5RG0sPA/dOPas4Rw4Rd1VTnY\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 826,
    "path": "../public/_nuxt/BKvsz2u1.js.gz"
  },
  "/_nuxt/blogger.Bu012-L3.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"baad-JAXgRLClvG4e529ITkBv0IfR1S0\"",
    "mtime": "2026-03-17T17:11:35.670Z",
    "size": 47789,
    "path": "../public/_nuxt/blogger.Bu012-L3.css"
  },
  "/_nuxt/blogger.Bu012-L3.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"180b-/yhe4kXLTY46Kn3VotCWuRS1Hkw\"",
    "mtime": "2026-03-17T17:11:38.347Z",
    "size": 6155,
    "path": "../public/_nuxt/blogger.Bu012-L3.css.gz"
  },
  "/_nuxt/Bm5Em-hy.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"472-CwqCb2/ZmwaIxhAvTX3tl5Rtx6g\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 1138,
    "path": "../public/_nuxt/Bm5Em-hy.js"
  },
  "/_nuxt/Bm5Em-hy.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"1dc-k7lboZgA4mHpMZCc2cvN8GBG054\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 476,
    "path": "../public/_nuxt/Bm5Em-hy.js.br"
  },
  "/_nuxt/Bm5Em-hy.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"21b-IFEUOS0e6sUTxZZrimYCC5bRYL4\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 539,
    "path": "../public/_nuxt/Bm5Em-hy.js.gz"
  },
  "/_nuxt/BMjYHr_A.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2a3f-bnwS3hB3zP5ygcKnYLknuasMz+Y\"",
    "mtime": "2026-03-17T17:11:35.675Z",
    "size": 10815,
    "path": "../public/_nuxt/BMjYHr_A.js"
  },
  "/_nuxt/BMjYHr_A.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"f9a-jtjY6Ck8I1Avfwco8HpkDDOMExI\"",
    "mtime": "2026-03-17T17:11:38.348Z",
    "size": 3994,
    "path": "../public/_nuxt/BMjYHr_A.js.gz"
  },
  "/_nuxt/BN6Pbh2c.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1748-SsMyxsDyrMcUVE1MIkniBvnr8qA\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 5960,
    "path": "../public/_nuxt/BN6Pbh2c.js"
  },
  "/_nuxt/BN6Pbh2c.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"8f4-cAXzyDbUHxxvr3mbCGCFvjaO7q4\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 2292,
    "path": "../public/_nuxt/BN6Pbh2c.js.br"
  },
  "/_nuxt/BN6Pbh2c.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"a4b-G4Ho5fjxKlKKcHR43/MBHjbS5Ik\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 2635,
    "path": "../public/_nuxt/BN6Pbh2c.js.gz"
  },
  "/_nuxt/BNC31MT9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"31d-Am9lJ2YaWEnQXtgzZl12Plb26A0\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 797,
    "path": "../public/_nuxt/BNC31MT9.js"
  },
  "/_nuxt/Bneqetm1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"11d7-36M+BuNh3yjzMK2Iy/LNx7j7QHU\"",
    "mtime": "2026-03-17T17:11:35.676Z",
    "size": 4567,
    "path": "../public/_nuxt/Bneqetm1.js"
  },
  "/_nuxt/Bneqetm1.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"478-eEnHQCMTefk6TawQofQemb/gfvQ\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 1144,
    "path": "../public/_nuxt/Bneqetm1.js.br"
  },
  "/_nuxt/Bneqetm1.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"4f8-8wCkuawz2FO+9zcf/9sF1H+2H2c\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 1272,
    "path": "../public/_nuxt/Bneqetm1.js.gz"
  },
  "/_nuxt/BnMrqG3P.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"69fc-BLIWxZcj0qygoKcXzUCl3cv2130\"",
    "mtime": "2026-03-17T17:11:35.675Z",
    "size": 27132,
    "path": "../public/_nuxt/BnMrqG3P.js"
  },
  "/_nuxt/BnMrqG3P.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"2115-dR8M5pqXmp5wBvdyt2fLlhHxxhU\"",
    "mtime": "2026-03-17T17:11:38.348Z",
    "size": 8469,
    "path": "../public/_nuxt/BnMrqG3P.js.gz"
  },
  "/_nuxt/BNw1qcRV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1f9f-RYiHlfi/FmpQgxiqXDvHs1RTfqw\"",
    "mtime": "2026-03-17T17:11:35.676Z",
    "size": 8095,
    "path": "../public/_nuxt/BNw1qcRV.js"
  },
  "/_nuxt/BNw1qcRV.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"a6e-r2+jL0izQXNaEbw+II4owlYo1Ls\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 2670,
    "path": "../public/_nuxt/BNw1qcRV.js.br"
  },
  "/_nuxt/BNw1qcRV.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"b4e-+EYG5+u6Ispj6y/EdUqFi2b30TA\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 2894,
    "path": "../public/_nuxt/BNw1qcRV.js.gz"
  },
  "/_nuxt/Bp3YSIOJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1d-XTRk/a8dZSvGUfYTL7csKBNSuhc\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 29,
    "path": "../public/_nuxt/Bp3YSIOJ.js"
  },
  "/_nuxt/BQqOBYOt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"30f-DFefkXRPVNlNKqV9hwp3odATW2k\"",
    "mtime": "2026-03-17T17:11:35.675Z",
    "size": 783,
    "path": "../public/_nuxt/BQqOBYOt.js"
  },
  "/_nuxt/Bqwlaqsq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4fd-DVGFBOfzAmSKkG43UbdHOeXaxoo\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 1277,
    "path": "../public/_nuxt/Bqwlaqsq.js"
  },
  "/_nuxt/Bqwlaqsq.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"18a-DcwGDvodzGbFPJK89FzEIUlmj9Q\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 394,
    "path": "../public/_nuxt/Bqwlaqsq.js.br"
  },
  "/_nuxt/Bqwlaqsq.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1de-kR+VhlWNLBoeobfB1uyCe1DixY0\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 478,
    "path": "../public/_nuxt/Bqwlaqsq.js.gz"
  },
  "/_nuxt/BrpB3aUX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"af1-sSmK9OkkrqFkhV3wamaEp1wGl70\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 2801,
    "path": "../public/_nuxt/BrpB3aUX.js"
  },
  "/_nuxt/BrpB3aUX.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"4d9-C3hrC4hkNr5K1BPo/eBXyD7x2QU\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 1241,
    "path": "../public/_nuxt/BrpB3aUX.js.br"
  },
  "/_nuxt/BrpB3aUX.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"560-rC8j+6aukBIWEHCic/feXexs4uA\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 1376,
    "path": "../public/_nuxt/BrpB3aUX.js.gz"
  },
  "/_nuxt/BrpYeIH1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2070-9CwV+bCtKmCNGzUY6I1A0c2X6d0\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 8304,
    "path": "../public/_nuxt/BrpYeIH1.js"
  },
  "/_nuxt/BrpYeIH1.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"ab7-ofYmOp5O0pUobCaJ3Ch6Ru3n+OE\"",
    "mtime": "2026-03-17T17:12:18.979Z",
    "size": 2743,
    "path": "../public/_nuxt/BrpYeIH1.js.br"
  },
  "/_nuxt/BrpYeIH1.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"bea-K9kN0wqXsGYdUgpa2tQTuayPgKk\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 3050,
    "path": "../public/_nuxt/BrpYeIH1.js.gz"
  },
  "/_nuxt/BT43cFF4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"815-Gu9v3Ip+Ai5wtN8ktXEdXNkxwRU\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 2069,
    "path": "../public/_nuxt/BT43cFF4.js"
  },
  "/_nuxt/BT43cFF4.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"378-tYHaVxRfG3mzp/ZkzY0mpAktCSg\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 888,
    "path": "../public/_nuxt/BT43cFF4.js.br"
  },
  "/_nuxt/BT43cFF4.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"3d7-9om1OQXy5Pr6WHc7d+t1aDbPW7o\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 983,
    "path": "../public/_nuxt/BT43cFF4.js.gz"
  },
  "/_nuxt/BuJXcnF6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"16b7-d0GcdVft9Hw2v7NBxaVAZayslzs\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 5815,
    "path": "../public/_nuxt/BuJXcnF6.js"
  },
  "/_nuxt/BuJXcnF6.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"8d2-WAutL4XbTXmSvPo4+lHe7DJL0lQ\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 2258,
    "path": "../public/_nuxt/BuJXcnF6.js.br"
  },
  "/_nuxt/BuJXcnF6.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"a08-61lnbRhk2heILHgP+wJLA50cQWM\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 2568,
    "path": "../public/_nuxt/BuJXcnF6.js.gz"
  },
  "/_nuxt/BuM1G9MB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"53-0zsCy2zSRJA/GG6Wn/kvLV4yJ90\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 83,
    "path": "../public/_nuxt/BuM1G9MB.js"
  },
  "/_nuxt/BuPzkPfP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"194b-5nCdlOOQYn7hcxwshQQ4TPxRa/8\"",
    "mtime": "2026-03-17T17:11:35.675Z",
    "size": 6475,
    "path": "../public/_nuxt/BuPzkPfP.js"
  },
  "/_nuxt/BuPzkPfP.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"9d4-aXP+AsVMI6MexAwb5Fsc6zH+Y1s\"",
    "mtime": "2026-03-17T17:12:18.979Z",
    "size": 2516,
    "path": "../public/_nuxt/BuPzkPfP.js.br"
  },
  "/_nuxt/BuPzkPfP.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"aab-/7U/ev/zjdsQrBdT75uCGW1zJoA\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 2731,
    "path": "../public/_nuxt/BuPzkPfP.js.gz"
  },
  "/_nuxt/BuyEbX8F.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3732-uE5RT60pVwoT0mJ6N596Upl7yM8\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 14130,
    "path": "../public/_nuxt/BuyEbX8F.js"
  },
  "/_nuxt/BuyEbX8F.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1298-b3kHYLukiI9xr0h5dV2sALfyJ/M\"",
    "mtime": "2026-03-17T17:11:38.348Z",
    "size": 4760,
    "path": "../public/_nuxt/BuyEbX8F.js.gz"
  },
  "/_nuxt/BvjVHqn5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"410-anQG7+WJhd5gEk9H5B5erY7Aieo\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 1040,
    "path": "../public/_nuxt/BvjVHqn5.js"
  },
  "/_nuxt/BvjVHqn5.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"1fc-cqyzgmZY2ETxUNdTFkFCIRKXCKU\"",
    "mtime": "2026-03-17T17:12:18.979Z",
    "size": 508,
    "path": "../public/_nuxt/BvjVHqn5.js.br"
  },
  "/_nuxt/BvjVHqn5.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"24b-3WKbdJhicJVyat9ziXEzA1Q+VeE\"",
    "mtime": "2026-03-17T17:12:18.978Z",
    "size": 587,
    "path": "../public/_nuxt/BvjVHqn5.js.gz"
  },
  "/_nuxt/BwQOo05w.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ff7-CW5xfGYX9vri7nnm+MMBj5ofLdk\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 4087,
    "path": "../public/_nuxt/BwQOo05w.js"
  },
  "/_nuxt/BwQOo05w.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"5f3-0FIWDjPxiusuMTDUOnMbi8qJ3Vc\"",
    "mtime": "2026-03-17T17:12:18.979Z",
    "size": 1523,
    "path": "../public/_nuxt/BwQOo05w.js.br"
  },
  "/_nuxt/BwQOo05w.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"664-rd59tHwerfLR63chPhKk9TX99aQ\"",
    "mtime": "2026-03-17T17:12:18.979Z",
    "size": 1636,
    "path": "../public/_nuxt/BwQOo05w.js.gz"
  },
  "/_nuxt/BxXfD5gX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"15bb-N9XTZ3ZsAxx8I8MWKjqYHxLc3wA\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 5563,
    "path": "../public/_nuxt/BxXfD5gX.js"
  },
  "/_nuxt/BxXfD5gX.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"7c7-v9llBa+yzVfAe733Qzs6iY6FJ0c\"",
    "mtime": "2026-03-17T17:12:18.979Z",
    "size": 1991,
    "path": "../public/_nuxt/BxXfD5gX.js.br"
  },
  "/_nuxt/BxXfD5gX.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"8b0-+95I6rzaZgdb6WkTl0fIXzBtjas\"",
    "mtime": "2026-03-17T17:12:18.979Z",
    "size": 2224,
    "path": "../public/_nuxt/BxXfD5gX.js.gz"
  },
  "/_nuxt/ByJcNbOa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b49-7ATAft80gxu0kVyxxapUod/kQoQ\"",
    "mtime": "2026-03-17T17:11:35.673Z",
    "size": 2889,
    "path": "../public/_nuxt/ByJcNbOa.js"
  },
  "/_nuxt/ByJcNbOa.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"465-Nv7J1DPnedK+XnT6YV8bv2O6gc4\"",
    "mtime": "2026-03-17T17:12:18.979Z",
    "size": 1125,
    "path": "../public/_nuxt/ByJcNbOa.js.br"
  },
  "/_nuxt/ByJcNbOa.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"547-zyb5aK4zXbf8y169SyhjrE2M94U\"",
    "mtime": "2026-03-17T17:12:18.979Z",
    "size": 1351,
    "path": "../public/_nuxt/ByJcNbOa.js.gz"
  },
  "/_nuxt/BZGs5BPf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"5146-qRKu2PtuY6ZJEzaLfrct4n+dEO0\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 20806,
    "path": "../public/_nuxt/BZGs5BPf.js"
  },
  "/_nuxt/BZGs5BPf.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"2459-lTcqs8tR+sq0XKM2Pm9TzLqldtI\"",
    "mtime": "2026-03-17T17:11:38.348Z",
    "size": 9305,
    "path": "../public/_nuxt/BZGs5BPf.js.gz"
  },
  "/_nuxt/BzpIVaGY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f73-r9BLGDgyoLaaOrgEZChYdfsh8Zk\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 3955,
    "path": "../public/_nuxt/BzpIVaGY.js"
  },
  "/_nuxt/BzpIVaGY.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"643-XH1q0X0HJOHZ/0yjivFaPLkkGyk\"",
    "mtime": "2026-03-17T17:12:18.979Z",
    "size": 1603,
    "path": "../public/_nuxt/BzpIVaGY.js.br"
  },
  "/_nuxt/BzpIVaGY.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"6f9-ihRj+FUSLUWPdbhcrhUlff3sfJ4\"",
    "mtime": "2026-03-17T17:12:18.979Z",
    "size": 1785,
    "path": "../public/_nuxt/BzpIVaGY.js.gz"
  },
  "/_nuxt/BzwKVEFT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b50-Z+/G/yctBtfAHDdPzWvZBeifk78\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 2896,
    "path": "../public/_nuxt/BzwKVEFT.js"
  },
  "/_nuxt/BzwKVEFT.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"484-j/bsO7tvLYXkMM6YLTFJM/xlhBY\"",
    "mtime": "2026-03-17T17:12:18.980Z",
    "size": 1156,
    "path": "../public/_nuxt/BzwKVEFT.js.br"
  },
  "/_nuxt/BzwKVEFT.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"504-nzU4J81W83CIQm9qSIZK97vVof0\"",
    "mtime": "2026-03-17T17:12:18.979Z",
    "size": 1284,
    "path": "../public/_nuxt/BzwKVEFT.js.gz"
  },
  "/_nuxt/C-ymAV1H.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"775-SzVTlbnComH7PsEjvbzeMuffntg\"",
    "mtime": "2026-03-17T17:11:35.680Z",
    "size": 1909,
    "path": "../public/_nuxt/C-ymAV1H.js"
  },
  "/_nuxt/C-ymAV1H.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"318-fazA/huTsILOFgnkcdssqtgQNYQ\"",
    "mtime": "2026-03-17T17:12:18.980Z",
    "size": 792,
    "path": "../public/_nuxt/C-ymAV1H.js.br"
  },
  "/_nuxt/C-ymAV1H.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"391-Dgr/Zvh+ZwvJDFGIHOa3g8GLneQ\"",
    "mtime": "2026-03-17T17:12:18.979Z",
    "size": 913,
    "path": "../public/_nuxt/C-ymAV1H.js.gz"
  },
  "/_nuxt/C25smb7I.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cc7-xmQd/WuytjzgFnfqqH/lN3dAAtA\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 3271,
    "path": "../public/_nuxt/C25smb7I.js"
  },
  "/_nuxt/C25smb7I.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2c6-lMrsXOPKfeFZdhlsBe6LjoOsHe8\"",
    "mtime": "2026-03-17T17:12:18.980Z",
    "size": 710,
    "path": "../public/_nuxt/C25smb7I.js.br"
  },
  "/_nuxt/C25smb7I.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"372-lxU6r4XvPcfcciyrtduBs8iGl9k\"",
    "mtime": "2026-03-17T17:12:18.979Z",
    "size": 882,
    "path": "../public/_nuxt/C25smb7I.js.gz"
  },
  "/_nuxt/C2KQn_3W.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a2a-OIpWty+GZi5zhTzVd/GSkG8Fyss\"",
    "mtime": "2026-03-17T17:11:35.675Z",
    "size": 2602,
    "path": "../public/_nuxt/C2KQn_3W.js"
  },
  "/_nuxt/C2KQn_3W.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"532-3Raefo6/+/XgrnpuNpKeRcY8oik\"",
    "mtime": "2026-03-17T17:12:18.980Z",
    "size": 1330,
    "path": "../public/_nuxt/C2KQn_3W.js.br"
  },
  "/_nuxt/C2KQn_3W.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"5d5-QFnEZX5DQAVG7ZOzsHq7EPjr/ao\"",
    "mtime": "2026-03-17T17:12:18.980Z",
    "size": 1493,
    "path": "../public/_nuxt/C2KQn_3W.js.gz"
  },
  "/_nuxt/C3f8Ysf7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c34-oFv+jsTxXHstmajyod19ibaqmhg\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 3124,
    "path": "../public/_nuxt/C3f8Ysf7.js"
  },
  "/_nuxt/C3f8Ysf7.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"435-FOb0UcN6d9G2Qz6LmXepkXQpcqE\"",
    "mtime": "2026-03-17T17:12:18.980Z",
    "size": 1077,
    "path": "../public/_nuxt/C3f8Ysf7.js.br"
  },
  "/_nuxt/C3f8Ysf7.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"4b1-s8BLPEuxFMqOxSjNDdcSTq9Ix94\"",
    "mtime": "2026-03-17T17:12:18.980Z",
    "size": 1201,
    "path": "../public/_nuxt/C3f8Ysf7.js.gz"
  },
  "/_nuxt/C3Gn_uJK.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"652-unmA3eX14wtzZiiBzZq/92mvoCY\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 1618,
    "path": "../public/_nuxt/C3Gn_uJK.js"
  },
  "/_nuxt/C3Gn_uJK.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2a8-W3cV8f41Ax9jfCLdh56j4D7MQzE\"",
    "mtime": "2026-03-17T17:12:18.980Z",
    "size": 680,
    "path": "../public/_nuxt/C3Gn_uJK.js.br"
  },
  "/_nuxt/C3Gn_uJK.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"305-dXbjniyUWpp6rdvEhK3POZoRmow\"",
    "mtime": "2026-03-17T17:12:18.980Z",
    "size": 773,
    "path": "../public/_nuxt/C3Gn_uJK.js.gz"
  },
  "/_nuxt/C41bIUwD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"18e0-ok5bgVSVtP3rZsL6S6iN8lz3OoI\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 6368,
    "path": "../public/_nuxt/C41bIUwD.js"
  },
  "/_nuxt/C41bIUwD.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"859-AJlOQdH6jjW1/xmo0w2U2/VZXGE\"",
    "mtime": "2026-03-17T17:12:18.980Z",
    "size": 2137,
    "path": "../public/_nuxt/C41bIUwD.js.br"
  },
  "/_nuxt/C41bIUwD.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"951-Q3GaxrCzGGd+DU2fInqRf4QHeDA\"",
    "mtime": "2026-03-17T17:12:18.980Z",
    "size": 2385,
    "path": "../public/_nuxt/C41bIUwD.js.gz"
  },
  "/_nuxt/C4LP7Hcl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"25e-g9QCecH5DQ1bgq9XQ8hg/UBC6vM\"",
    "mtime": "2026-03-17T17:11:35.675Z",
    "size": 606,
    "path": "../public/_nuxt/C4LP7Hcl.js"
  },
  "/_nuxt/C5CVI8_E.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3666-/mnHMqJI111f7NYJ/UOxInGGBN4\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 13926,
    "path": "../public/_nuxt/C5CVI8_E.js"
  },
  "/_nuxt/C5CVI8_E.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"147a-+SJ1fcKv3kZVI+UJccThVx1FXmg\"",
    "mtime": "2026-03-17T17:11:38.347Z",
    "size": 5242,
    "path": "../public/_nuxt/C5CVI8_E.js.gz"
  },
  "/_nuxt/C6RDOZhf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2034-iQtXMdqgAH3R04z9SsHXFudwbK0\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 8244,
    "path": "../public/_nuxt/C6RDOZhf.js"
  },
  "/_nuxt/C6RDOZhf.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"c35-/h6ZFXg9rxmWYnrfVQ1ZhUYXVdc\"",
    "mtime": "2026-03-17T17:12:18.980Z",
    "size": 3125,
    "path": "../public/_nuxt/C6RDOZhf.js.br"
  },
  "/_nuxt/C6RDOZhf.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"dba-NBHWHbCEtk38S0DkLVk2HKHaQk4\"",
    "mtime": "2026-03-17T17:12:18.980Z",
    "size": 3514,
    "path": "../public/_nuxt/C6RDOZhf.js.gz"
  },
  "/_nuxt/C78fOPTZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"29b-t1+k46tbt13NbzZqsbOnyYWsuOA\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 667,
    "path": "../public/_nuxt/C78fOPTZ.js"
  },
  "/_nuxt/Cabwm37j.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1408-yJcFOwPhqDMWLPoCOAb1QW47C14\"",
    "mtime": "2026-03-17T17:11:35.676Z",
    "size": 5128,
    "path": "../public/_nuxt/Cabwm37j.js"
  },
  "/_nuxt/Cabwm37j.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"7b2-/pwLfnW6SDTU46Ato9D1dWukRIM\"",
    "mtime": "2026-03-17T17:12:18.980Z",
    "size": 1970,
    "path": "../public/_nuxt/Cabwm37j.js.br"
  },
  "/_nuxt/Cabwm37j.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"902-pwZmKFuBacd/bE0LnLA8xJBCsRk\"",
    "mtime": "2026-03-17T17:12:18.980Z",
    "size": 2306,
    "path": "../public/_nuxt/Cabwm37j.js.gz"
  },
  "/_nuxt/card.RQs4RtNN.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"2dbd-W4yQVXTzx8qFGhtsmGPegJGX/cU\"",
    "mtime": "2026-03-17T17:11:35.671Z",
    "size": 11709,
    "path": "../public/_nuxt/card.RQs4RtNN.css"
  },
  "/_nuxt/card.RQs4RtNN.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"800-3+qLDoAZYVIydFJejxNvBN/fDtg\"",
    "mtime": "2026-03-17T17:11:38.348Z",
    "size": 2048,
    "path": "../public/_nuxt/card.RQs4RtNN.css.gz"
  },
  "/_nuxt/CbXSZ2in.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7e0d-UYTMWkqctecMOv0BKUMyPWaKoPc\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 32269,
    "path": "../public/_nuxt/CbXSZ2in.js"
  },
  "/_nuxt/CbXSZ2in.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"32f7-hBbEsQjYcELjdHeMX6BEMTddvoI\"",
    "mtime": "2026-03-17T17:11:38.348Z",
    "size": 13047,
    "path": "../public/_nuxt/CbXSZ2in.js.gz"
  },
  "/_nuxt/CD6nQmrY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"11e-DU4fVbRxiE4qUUxsEf3fqMur/+A\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 286,
    "path": "../public/_nuxt/CD6nQmrY.js"
  },
  "/_nuxt/CdXCOZ3F.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2619-rtqKWYGjGbGZG5x8wqUNYLxSXFY\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 9753,
    "path": "../public/_nuxt/CdXCOZ3F.js"
  },
  "/_nuxt/CdXCOZ3F.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"bf0-6mi0dZ37xEo26KtXtv5qyFfY+qg\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 3056,
    "path": "../public/_nuxt/CdXCOZ3F.js.br"
  },
  "/_nuxt/CdXCOZ3F.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"d7f-SINgd8eV/il/QPcjd5lg7iAg+SU\"",
    "mtime": "2026-03-17T17:12:18.980Z",
    "size": 3455,
    "path": "../public/_nuxt/CdXCOZ3F.js.gz"
  },
  "/_nuxt/CDyGwa7X.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7c2-7vuqMcb2oG5cn8Nk5aii6bsMmsY\"",
    "mtime": "2026-03-17T17:11:35.676Z",
    "size": 1986,
    "path": "../public/_nuxt/CDyGwa7X.js"
  },
  "/_nuxt/CDyGwa7X.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2cf-omFOi8C52pG9t7vVCvDgv7mqtQE\"",
    "mtime": "2026-03-17T17:12:18.980Z",
    "size": 719,
    "path": "../public/_nuxt/CDyGwa7X.js.br"
  },
  "/_nuxt/CDyGwa7X.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"327-pBWVfr2XvtRjq5/3n1FaQ6JjPPM\"",
    "mtime": "2026-03-17T17:12:18.980Z",
    "size": 807,
    "path": "../public/_nuxt/CDyGwa7X.js.gz"
  },
  "/_nuxt/Ce8LsrhD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"29f4-64K5WrZQJHPYhhLWpdtztuw7EEs\"",
    "mtime": "2026-03-17T17:11:35.673Z",
    "size": 10740,
    "path": "../public/_nuxt/Ce8LsrhD.js"
  },
  "/_nuxt/Ce8LsrhD.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"10db-WBqEE9yJkzsQBf4CrmyMtiF052M\"",
    "mtime": "2026-03-17T17:11:38.348Z",
    "size": 4315,
    "path": "../public/_nuxt/Ce8LsrhD.js.gz"
  },
  "/_nuxt/CeLmN5R-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"284f-T5YF6nOBFDy8quoLSyr5Y/zDt7w\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 10319,
    "path": "../public/_nuxt/CeLmN5R-.js"
  },
  "/_nuxt/CeLmN5R-.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"efd-XfHjujFyCM5V2Ma3qcNQnT5H0Gk\"",
    "mtime": "2026-03-17T17:11:38.348Z",
    "size": 3837,
    "path": "../public/_nuxt/CeLmN5R-.js.gz"
  },
  "/_nuxt/CevX1Tat.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9e6-nhIEIH5KoZ2UqhJgrZGe1gHbQSo\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 2534,
    "path": "../public/_nuxt/CevX1Tat.js"
  },
  "/_nuxt/CevX1Tat.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"496-22XTHYUEZKdfnst5HuF8yPFR+i8\"",
    "mtime": "2026-03-17T17:12:18.980Z",
    "size": 1174,
    "path": "../public/_nuxt/CevX1Tat.js.br"
  },
  "/_nuxt/CevX1Tat.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"565-q8VyatqQG6r8WdkF05CbZhxOIqY\"",
    "mtime": "2026-03-17T17:12:18.980Z",
    "size": 1381,
    "path": "../public/_nuxt/CevX1Tat.js.gz"
  },
  "/_nuxt/CFHJl5sT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1e59-dwhojfQzryHqzl6IMu0/Bb2TFqk\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 7769,
    "path": "../public/_nuxt/CFHJl5sT.js"
  },
  "/_nuxt/CFHJl5sT.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"bc9-ADEiA/xbok6jg4RFDbrAfnj+zwc\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 3017,
    "path": "../public/_nuxt/CFHJl5sT.js.br"
  },
  "/_nuxt/CFHJl5sT.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"d02-BcnwduP4F27zhyTl/IqqeKci2C8\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 3330,
    "path": "../public/_nuxt/CFHJl5sT.js.gz"
  },
  "/_nuxt/CfJYG6tj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"12c0-Zt2XLLQHY+NLRqqZjKAglrC3y9I\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 4800,
    "path": "../public/_nuxt/CfJYG6tj.js"
  },
  "/_nuxt/CfJYG6tj.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"736-805p8I1EM6ktk/ce5p+R3r2+sDY\"",
    "mtime": "2026-03-17T17:12:18.980Z",
    "size": 1846,
    "path": "../public/_nuxt/CfJYG6tj.js.br"
  },
  "/_nuxt/CfJYG6tj.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"84c-1+z/DMlhwW+rIavxxtG2FVi7h6g\"",
    "mtime": "2026-03-17T17:12:18.980Z",
    "size": 2124,
    "path": "../public/_nuxt/CfJYG6tj.js.gz"
  },
  "/_nuxt/Cfxof8CV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cba-xHrES+9AmrP4f3MMaT7ha46ZR6k\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 3258,
    "path": "../public/_nuxt/Cfxof8CV.js"
  },
  "/_nuxt/Cfxof8CV.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"5f8-TiMX76sUfc/XWwuLZ9Duon8ZwZs\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 1528,
    "path": "../public/_nuxt/Cfxof8CV.js.br"
  },
  "/_nuxt/Cfxof8CV.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"684-FWeZLzd9ikigYum1jMSrLCQFiEc\"",
    "mtime": "2026-03-17T17:12:18.980Z",
    "size": 1668,
    "path": "../public/_nuxt/Cfxof8CV.js.gz"
  },
  "/_nuxt/CH7OfBNF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"86d-HwR++TLvNR79B70OqlMbg1R+5lw\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 2157,
    "path": "../public/_nuxt/CH7OfBNF.js"
  },
  "/_nuxt/CH7OfBNF.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2d7-kDJrdjeLk/5ZFNflhPGAlikHASc\"",
    "mtime": "2026-03-17T17:12:18.980Z",
    "size": 727,
    "path": "../public/_nuxt/CH7OfBNF.js.br"
  },
  "/_nuxt/CH7OfBNF.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"334-MCzQAnkIZrsZqxmDvOjY2DpHbK4\"",
    "mtime": "2026-03-17T17:12:18.980Z",
    "size": 820,
    "path": "../public/_nuxt/CH7OfBNF.js.gz"
  },
  "/_nuxt/ChK-085T.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"360-Zw5nFUOUGoaKnMOBpZb/VdcEDmY\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 864,
    "path": "../public/_nuxt/ChK-085T.js"
  },
  "/_nuxt/CjFT_Tl9.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a0b-TMrn13AvPZxLrJEXP5XkqBTemRE\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 2571,
    "path": "../public/_nuxt/CjFT_Tl9.js"
  },
  "/_nuxt/CjFT_Tl9.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"456-uiyI6VMMEuJqXIAnNAshjtyjnCA\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 1110,
    "path": "../public/_nuxt/CjFT_Tl9.js.br"
  },
  "/_nuxt/CjFT_Tl9.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"4be-095aX/v9cli5BCfIHi8rjD4wot8\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 1214,
    "path": "../public/_nuxt/CjFT_Tl9.js.gz"
  },
  "/_nuxt/CjQqDB4T.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1720-JiGKqCR9r9oBSeZ5i3WilDPhSSo\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 5920,
    "path": "../public/_nuxt/CjQqDB4T.js"
  },
  "/_nuxt/CjQqDB4T.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"95d-6+rJLV5pkLSO9+MAktu9D12zG4U\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 2397,
    "path": "../public/_nuxt/CjQqDB4T.js.br"
  },
  "/_nuxt/CjQqDB4T.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"a78-YQ9vwwu/dgu5BXUUOISdvgpzDF0\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 2680,
    "path": "../public/_nuxt/CjQqDB4T.js.gz"
  },
  "/_nuxt/Ck1zUtKM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"902-OnFiVodNmsLNuv5z7LQlgsFfjDs\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 2306,
    "path": "../public/_nuxt/Ck1zUtKM.js"
  },
  "/_nuxt/Ck1zUtKM.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"3f0-y4LT1G0V1W6kHI6RJSEiZgb97j8\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 1008,
    "path": "../public/_nuxt/Ck1zUtKM.js.br"
  },
  "/_nuxt/Ck1zUtKM.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"446-9N0Yrz/6h2dFUHiL0fjZudn++mk\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 1094,
    "path": "../public/_nuxt/Ck1zUtKM.js.gz"
  },
  "/_nuxt/CKdyzqz6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"538-ho6DWcQ7JI7MbXYo4gROv4ZNxyo\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 1336,
    "path": "../public/_nuxt/CKdyzqz6.js"
  },
  "/_nuxt/CKdyzqz6.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"1ed-boe5yI0Fmcr2x1uMKyFTMKID3QM\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 493,
    "path": "../public/_nuxt/CKdyzqz6.js.br"
  },
  "/_nuxt/CKdyzqz6.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"23f-rLhh7a09O3UW2ZBmv+ppct/MvIE\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 575,
    "path": "../public/_nuxt/CKdyzqz6.js.gz"
  },
  "/_nuxt/CKoEvynW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"149-2VSP2fPKfHI6hn00WTs6yXrR1Ns\"",
    "mtime": "2026-03-17T17:11:35.673Z",
    "size": 329,
    "path": "../public/_nuxt/CKoEvynW.js"
  },
  "/_nuxt/CLzApCjC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"34a4-5MdUU/CLp0NcKKuqKwIT9Erslw8\"",
    "mtime": "2026-03-17T17:11:35.673Z",
    "size": 13476,
    "path": "../public/_nuxt/CLzApCjC.js"
  },
  "/_nuxt/CLzApCjC.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1385-9CHZ8zmrbgxrphmrmaqPI5ZVxV0\"",
    "mtime": "2026-03-17T17:11:38.348Z",
    "size": 4997,
    "path": "../public/_nuxt/CLzApCjC.js.gz"
  },
  "/_nuxt/Cm0sxU4D.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3a3ff-AEpgApKY8Dk4pPKFjirB+27Ojxs\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 238591,
    "path": "../public/_nuxt/Cm0sxU4D.js"
  },
  "/_nuxt/Cm0sxU4D.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"151b9-3472fnb1jIJL2apsMr4EcXTt7Fw\"",
    "mtime": "2026-03-17T17:11:38.461Z",
    "size": 86457,
    "path": "../public/_nuxt/Cm0sxU4D.js.gz"
  },
  "/_nuxt/CmGdzxic.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f40-vHhsqgEar8aB6YsABjjHbFIIs+0\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 3904,
    "path": "../public/_nuxt/CmGdzxic.js"
  },
  "/_nuxt/CmGdzxic.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"63b-b6wycvd8RT/XGnMGAaPbVzV+HfQ\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 1595,
    "path": "../public/_nuxt/CmGdzxic.js.br"
  },
  "/_nuxt/CmGdzxic.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"702-h/KpTDhj3b1iB1mg/gZKWhSm9JM\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 1794,
    "path": "../public/_nuxt/CmGdzxic.js.gz"
  },
  "/_nuxt/CnDTJFAw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a91-XPwM9rQDJlXP3PcumIKVz+kLK8k\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 6801,
    "path": "../public/_nuxt/CnDTJFAw.js"
  },
  "/_nuxt/CnDTJFAw.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"8c1-SxATWwRStf5lsCaOiLFBXjetEaU\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 2241,
    "path": "../public/_nuxt/CnDTJFAw.js.br"
  },
  "/_nuxt/CnDTJFAw.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"985-u4mP2iznKtf6sX7wWqgrUALTiQU\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 2437,
    "path": "../public/_nuxt/CnDTJFAw.js.gz"
  },
  "/_nuxt/CnHTOXQT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7d7-elkNKybRkPVAu437KQ7GUMOTA+M\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 2007,
    "path": "../public/_nuxt/CnHTOXQT.js"
  },
  "/_nuxt/CnHTOXQT.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2f7-8S55aWmtm4HHGOSftDvvCvdTUOQ\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 759,
    "path": "../public/_nuxt/CnHTOXQT.js.br"
  },
  "/_nuxt/CnHTOXQT.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"34f-CQsCKOKV6cfOZ2gSjABB8Ot4biM\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 847,
    "path": "../public/_nuxt/CnHTOXQT.js.gz"
  },
  "/_nuxt/CNhZ1qSd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"575-ihPON8Z8YUh2vjvUpYhECzfZmW8\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 1397,
    "path": "../public/_nuxt/CNhZ1qSd.js"
  },
  "/_nuxt/CNhZ1qSd.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"24a-pSc258QqLpAzX2EV0KHeIE7HSn4\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 586,
    "path": "../public/_nuxt/CNhZ1qSd.js.br"
  },
  "/_nuxt/CNhZ1qSd.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"295-is1vREkp5tnJaKl+ZcZ87CIZ0qE\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 661,
    "path": "../public/_nuxt/CNhZ1qSd.js.gz"
  },
  "/_nuxt/CnydiIhH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"70f-Aq2J5vHiDoeektgwv6r8EweXlBI\"",
    "mtime": "2026-03-17T17:11:35.676Z",
    "size": 1807,
    "path": "../public/_nuxt/CnydiIhH.js"
  },
  "/_nuxt/CnydiIhH.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"334-qkybpuG0FMA+YrzwhyyHbxSxyBU\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 820,
    "path": "../public/_nuxt/CnydiIhH.js.br"
  },
  "/_nuxt/CnydiIhH.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"399-MlpasURWkKUFzoMmplxTRbH7+PA\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 921,
    "path": "../public/_nuxt/CnydiIhH.js.gz"
  },
  "/_nuxt/CPoTgMEN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"12535-nL6h1NZuAzjoKm4alDgDtZnqeKs\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 75061,
    "path": "../public/_nuxt/CPoTgMEN.js"
  },
  "/_nuxt/CPoTgMEN.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"65be-hspVWuVcwp2jaucUidefcdv1M9c\"",
    "mtime": "2026-03-17T17:11:38.356Z",
    "size": 26046,
    "path": "../public/_nuxt/CPoTgMEN.js.gz"
  },
  "/_nuxt/CPxSyiUj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"37a-2alGtU3b1GU/RtyJ24DbKLePb3Y\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 890,
    "path": "../public/_nuxt/CPxSyiUj.js"
  },
  "/_nuxt/CqGSI99y.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"59-DRITqS/KEYd0y9ZdVDCQ1f/k5J4\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 89,
    "path": "../public/_nuxt/CqGSI99y.js"
  },
  "/_nuxt/CqizBe5N.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ec151-FiXvu1Y76a+lc81BfeXfULNDDug\"",
    "mtime": "2026-03-17T17:11:35.681Z",
    "size": 966993,
    "path": "../public/_nuxt/CqizBe5N.js"
  },
  "/_nuxt/CqizBe5N.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"52ac7-PCFsf1CTbnR/6jbCSb3t3H4GKzU\"",
    "mtime": "2026-03-17T17:11:38.770Z",
    "size": 338631,
    "path": "../public/_nuxt/CqizBe5N.js.gz"
  },
  "/_nuxt/CQJVR1Ed.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"12ea-9bojgbZCokjKT87M6CmJzrWz3Rc\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 4842,
    "path": "../public/_nuxt/CQJVR1Ed.js"
  },
  "/_nuxt/CQJVR1Ed.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"6e1-byx0RNdN8Cefm4MtpKTL+fvZ+VA\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 1761,
    "path": "../public/_nuxt/CQJVR1Ed.js.br"
  },
  "/_nuxt/CQJVR1Ed.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"7aa-a1wRhbbjwTt27VcL5dPmpMbJYcc\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 1962,
    "path": "../public/_nuxt/CQJVR1Ed.js.gz"
  },
  "/_nuxt/Cr3jEq5x.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1d1f-IF8UdYxKJHA6ywPyOF474JkJQmk\"",
    "mtime": "2026-03-17T17:11:35.673Z",
    "size": 7455,
    "path": "../public/_nuxt/Cr3jEq5x.js"
  },
  "/_nuxt/Cr3jEq5x.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"ba7-d2VJi5P1ZHkygJ/axaFb7t2/QPI\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 2983,
    "path": "../public/_nuxt/Cr3jEq5x.js.br"
  },
  "/_nuxt/Cr3jEq5x.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"ca8-uu9hIoovuFyt1io0wcSc8dJfDio\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 3240,
    "path": "../public/_nuxt/Cr3jEq5x.js.gz"
  },
  "/_nuxt/CTh6ddhW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"7836-B1ZVJiJtd58J1NRsGwp4/UulfAo\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 30774,
    "path": "../public/_nuxt/CTh6ddhW.js"
  },
  "/_nuxt/CTh6ddhW.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"315c-QmJH9pGcbGHw/iTpBuKC2cYY9WU\"",
    "mtime": "2026-03-17T17:11:38.348Z",
    "size": 12636,
    "path": "../public/_nuxt/CTh6ddhW.js.gz"
  },
  "/_nuxt/CTu-6PCP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"656-G3UZSa34P7Tw0n/dtK+KFlbyceY\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 1622,
    "path": "../public/_nuxt/CTu-6PCP.js"
  },
  "/_nuxt/CTu-6PCP.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2e2-HhIwprt7OziZ8aEoTlPjZ3iEYOM\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 738,
    "path": "../public/_nuxt/CTu-6PCP.js.br"
  },
  "/_nuxt/CTu-6PCP.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"340-nip/hOQ/5rmKoq5TPcyWiWz6QyE\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 832,
    "path": "../public/_nuxt/CTu-6PCP.js.gz"
  },
  "/_nuxt/CuNb6cKV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"c8a-2iTqnP9JpKYp9KfTTRX2Lhxb/oE\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 3210,
    "path": "../public/_nuxt/CuNb6cKV.js"
  },
  "/_nuxt/CuNb6cKV.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"309-p729yRx/y5yzXAWs+Qg4c+847pk\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 777,
    "path": "../public/_nuxt/CuNb6cKV.js.br"
  },
  "/_nuxt/CuNb6cKV.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"422-cebv9VWJZ2OO/QbU/zi4g3zhjC0\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 1058,
    "path": "../public/_nuxt/CuNb6cKV.js.gz"
  },
  "/_nuxt/Cw1EW3IL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1046-49HTM0ZR3VJYGLxLTlkKYWjaotM\"",
    "mtime": "2026-03-17T17:11:35.676Z",
    "size": 4166,
    "path": "../public/_nuxt/Cw1EW3IL.js"
  },
  "/_nuxt/Cw1EW3IL.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"6c3-fFfsq46k+v+4eFfQ7WwXZJcDfu0\"",
    "mtime": "2026-03-17T17:12:18.982Z",
    "size": 1731,
    "path": "../public/_nuxt/Cw1EW3IL.js.br"
  },
  "/_nuxt/Cw1EW3IL.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"762-1jXh7NqdB4/+mg+XQvlKJiscmjA\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 1890,
    "path": "../public/_nuxt/Cw1EW3IL.js.gz"
  },
  "/_nuxt/CWcv1MsR.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1839-Y+z7+FegnI5mhOV3RPbsQlymgu8\"",
    "mtime": "2026-03-17T17:11:35.675Z",
    "size": 6201,
    "path": "../public/_nuxt/CWcv1MsR.js"
  },
  "/_nuxt/CWcv1MsR.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"9a6-FBQVk2HD3v3UrqSnuqv1ArmdQIA\"",
    "mtime": "2026-03-17T17:12:18.982Z",
    "size": 2470,
    "path": "../public/_nuxt/CWcv1MsR.js.br"
  },
  "/_nuxt/CWcv1MsR.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"b8c-bUL/D9gpuOsLKOMFT4d5tRbkZYs\"",
    "mtime": "2026-03-17T17:12:18.982Z",
    "size": 2956,
    "path": "../public/_nuxt/CWcv1MsR.js.gz"
  },
  "/_nuxt/CXdrOF99.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"12b4-PLLfcvk2EoA/+V2x5P2kC1n+B1g\"",
    "mtime": "2026-03-17T17:11:35.676Z",
    "size": 4788,
    "path": "../public/_nuxt/CXdrOF99.js"
  },
  "/_nuxt/CXdrOF99.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"567-FNU9sSV+YCHv6kntktKGjVou6Wc\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 1383,
    "path": "../public/_nuxt/CXdrOF99.js.br"
  },
  "/_nuxt/CXdrOF99.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"5fd-ns6hq08oR3hOusq8rwjK4aWjw98\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 1533,
    "path": "../public/_nuxt/CXdrOF99.js.gz"
  },
  "/_nuxt/cYD-iVg8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b017-QcPhSTmpwGJ0KUelc/kxgFo2Ugo\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 45079,
    "path": "../public/_nuxt/cYD-iVg8.js"
  },
  "/_nuxt/cYD-iVg8.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"4ac0-cvSwErfRlbzuzUDS1ALl5iqGL5w\"",
    "mtime": "2026-03-17T17:11:38.356Z",
    "size": 19136,
    "path": "../public/_nuxt/cYD-iVg8.js.gz"
  },
  "/_nuxt/C_CwsFkJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"de9-b/iha8a7ituYd7CFd8YilK6YRuU\"",
    "mtime": "2026-03-17T17:11:35.675Z",
    "size": 3561,
    "path": "../public/_nuxt/C_CwsFkJ.js"
  },
  "/_nuxt/C_CwsFkJ.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"555-y+CsEkICHbgIItX2scCQdQNji7g\"",
    "mtime": "2026-03-17T17:12:18.982Z",
    "size": 1365,
    "path": "../public/_nuxt/C_CwsFkJ.js.br"
  },
  "/_nuxt/C_CwsFkJ.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"5eb-kgsC17dgfSSbXRb/VGLhW5u4TsY\"",
    "mtime": "2026-03-17T17:12:18.982Z",
    "size": 1515,
    "path": "../public/_nuxt/C_CwsFkJ.js.gz"
  },
  "/_nuxt/D0FvdTBr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8cd-DL0znX+YmGcsPSnNhezkHhN9u8s\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 2253,
    "path": "../public/_nuxt/D0FvdTBr.js"
  },
  "/_nuxt/D0FvdTBr.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2c0-p+TQyJNQVkba35zwjW9AkfVTv7c\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 704,
    "path": "../public/_nuxt/D0FvdTBr.js.br"
  },
  "/_nuxt/D0FvdTBr.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"36b-XgXRMYWhnajtNIlLMXTDG5jkyUc\"",
    "mtime": "2026-03-17T17:12:18.981Z",
    "size": 875,
    "path": "../public/_nuxt/D0FvdTBr.js.gz"
  },
  "/_nuxt/D0XecflT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"90bc-OEu6xQNoDZ/2cvoiOJuMDJCw+NQ\"",
    "mtime": "2026-03-17T17:11:35.676Z",
    "size": 37052,
    "path": "../public/_nuxt/D0XecflT.js"
  },
  "/_nuxt/D0XecflT.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"2ab7-f/pi6Ex3GBKwg6dTWxBfCLi+0Y4\"",
    "mtime": "2026-03-17T17:11:38.348Z",
    "size": 10935,
    "path": "../public/_nuxt/D0XecflT.js.gz"
  },
  "/_nuxt/D6-9zbid.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"959-yjEQRazL0IRQfA8eysYiwq0d3YY\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 2393,
    "path": "../public/_nuxt/D6-9zbid.js"
  },
  "/_nuxt/D6-9zbid.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"541-uWZC0bNQdvPMh2Eg8uHpqe4AQsU\"",
    "mtime": "2026-03-17T17:12:18.982Z",
    "size": 1345,
    "path": "../public/_nuxt/D6-9zbid.js.br"
  },
  "/_nuxt/D6-9zbid.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"5cf-cxHdsYJSDwVy+qiVOOCjazgk8Ek\"",
    "mtime": "2026-03-17T17:12:18.982Z",
    "size": 1487,
    "path": "../public/_nuxt/D6-9zbid.js.gz"
  },
  "/_nuxt/D8B20fx6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"a6f-m/nBGE855Ir4XymA1hp45GRfqDg\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 2671,
    "path": "../public/_nuxt/D8B20fx6.js"
  },
  "/_nuxt/D8B20fx6.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"3d6-gI2cxX40gw8IpSaSuadWVMhqqLQ\"",
    "mtime": "2026-03-17T17:12:18.982Z",
    "size": 982,
    "path": "../public/_nuxt/D8B20fx6.js.br"
  },
  "/_nuxt/D8B20fx6.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"455-uJJLQCZ+TP9g6DxzKb4KRwQD9IE\"",
    "mtime": "2026-03-17T17:12:18.982Z",
    "size": 1109,
    "path": "../public/_nuxt/D8B20fx6.js.gz"
  },
  "/_nuxt/D8WNWjGc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"128f-k5tHcnyb9JuBvcJiWH0T3scH0Q4\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 4751,
    "path": "../public/_nuxt/D8WNWjGc.js"
  },
  "/_nuxt/D8WNWjGc.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"6d2-vSvUC3RMXCcg+02ADqWCLwzfW6I\"",
    "mtime": "2026-03-17T17:12:18.983Z",
    "size": 1746,
    "path": "../public/_nuxt/D8WNWjGc.js.br"
  },
  "/_nuxt/D8WNWjGc.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"788-0yLglqemwYNnaw5TK4Vi5YMLM2E\"",
    "mtime": "2026-03-17T17:12:18.982Z",
    "size": 1928,
    "path": "../public/_nuxt/D8WNWjGc.js.gz"
  },
  "/_nuxt/D9Dt4D0W.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"102b-pzPFOaVufiyE1YwWZrBTrCmkhxE\"",
    "mtime": "2026-03-17T17:11:35.676Z",
    "size": 4139,
    "path": "../public/_nuxt/D9Dt4D0W.js"
  },
  "/_nuxt/D9Dt4D0W.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"632-MArzxD/8jJtgw199dvl8S6qdsrM\"",
    "mtime": "2026-03-17T17:12:18.983Z",
    "size": 1586,
    "path": "../public/_nuxt/D9Dt4D0W.js.br"
  },
  "/_nuxt/D9Dt4D0W.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"6e5-h79c5qE5K5yBV3Q1ThcWbqAH/zQ\"",
    "mtime": "2026-03-17T17:12:18.982Z",
    "size": 1765,
    "path": "../public/_nuxt/D9Dt4D0W.js.gz"
  },
  "/_nuxt/DAC6PRWa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a4-Mqmb3/wHChVx0z6vcqvp3ac1XoU\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 420,
    "path": "../public/_nuxt/DAC6PRWa.js"
  },
  "/_nuxt/DapKOQyX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6c5-gBkVDWNkSmtS6VG+wJZAFd/M3+8\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 1733,
    "path": "../public/_nuxt/DapKOQyX.js"
  },
  "/_nuxt/DapKOQyX.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"329-T2IqhqBZZFqdkggdKd5U46K1cN0\"",
    "mtime": "2026-03-17T17:12:18.983Z",
    "size": 809,
    "path": "../public/_nuxt/DapKOQyX.js.br"
  },
  "/_nuxt/DapKOQyX.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"37d-jyykCPV8ZwF+84wNVmhYg2Xzwn0\"",
    "mtime": "2026-03-17T17:12:18.982Z",
    "size": 893,
    "path": "../public/_nuxt/DapKOQyX.js.gz"
  },
  "/_nuxt/DAQRGQpS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2c7-Od38r6YYPz9uX6mvfG780cdjyHk\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 711,
    "path": "../public/_nuxt/DAQRGQpS.js"
  },
  "/_nuxt/DbItnlRl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"135-iKoNteNzucuZpKMc/f8fhN9OpPU\"",
    "mtime": "2026-03-17T17:11:35.676Z",
    "size": 309,
    "path": "../public/_nuxt/DbItnlRl.js"
  },
  "/_nuxt/DBKNyK5s.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"913-JNIFxTycsFfR24dy75Mxh0lwBEc\"",
    "mtime": "2026-03-17T17:11:35.675Z",
    "size": 2323,
    "path": "../public/_nuxt/DBKNyK5s.js"
  },
  "/_nuxt/DBKNyK5s.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"3df-Nktt2+ia+puK53JgIiPzvi1Heho\"",
    "mtime": "2026-03-17T17:12:18.983Z",
    "size": 991,
    "path": "../public/_nuxt/DBKNyK5s.js.br"
  },
  "/_nuxt/DBKNyK5s.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"44c-7ehze1d4lUI+l92Fsh4Uy74i4Zk\"",
    "mtime": "2026-03-17T17:12:18.983Z",
    "size": 1100,
    "path": "../public/_nuxt/DBKNyK5s.js.gz"
  },
  "/_nuxt/DBlCnlav.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"350-W/j73uiF9oxpuOzp4/xe12/JXII\"",
    "mtime": "2026-03-17T17:11:35.676Z",
    "size": 848,
    "path": "../public/_nuxt/DBlCnlav.js"
  },
  "/_nuxt/DbmMY5lU.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"863-G9rgVzcr6VyeKdOrPxCtQs5tv4g\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 2147,
    "path": "../public/_nuxt/DbmMY5lU.js"
  },
  "/_nuxt/DbmMY5lU.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"339-vA/jXOSHEBca5Ie3ZALvsZFx0Z4\"",
    "mtime": "2026-03-17T17:12:18.983Z",
    "size": 825,
    "path": "../public/_nuxt/DbmMY5lU.js.br"
  },
  "/_nuxt/DbmMY5lU.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"3aa-5IpxeAm3YWN7DobcxfhqqgVaQ40\"",
    "mtime": "2026-03-17T17:12:18.983Z",
    "size": 938,
    "path": "../public/_nuxt/DbmMY5lU.js.gz"
  },
  "/_nuxt/Dc1JOy9r.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"ae4-NUU0j+JASz1UDU4xXNM46TogNRE\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 2788,
    "path": "../public/_nuxt/Dc1JOy9r.js"
  },
  "/_nuxt/Dc1JOy9r.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"447-4m9xwrVuv8LJAKZhVVV4+8A0nQ8\"",
    "mtime": "2026-03-17T17:12:18.983Z",
    "size": 1095,
    "path": "../public/_nuxt/Dc1JOy9r.js.br"
  },
  "/_nuxt/Dc1JOy9r.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"504-YsiDNnW6R/E1fWU/3C+Kv69NuvU\"",
    "mtime": "2026-03-17T17:12:18.983Z",
    "size": 1284,
    "path": "../public/_nuxt/Dc1JOy9r.js.gz"
  },
  "/_nuxt/DCiSCalN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8ca-NgsN4RnCh16El3ItcPREyfGhYlA\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 2250,
    "path": "../public/_nuxt/DCiSCalN.js"
  },
  "/_nuxt/DCiSCalN.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2ec-e+PPePD3NBlpT4E6EctjxspWiTw\"",
    "mtime": "2026-03-17T17:12:18.983Z",
    "size": 748,
    "path": "../public/_nuxt/DCiSCalN.js.br"
  },
  "/_nuxt/DCiSCalN.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"369-s7TMhMh22BqDmTQdbxu/9H/1w6w\"",
    "mtime": "2026-03-17T17:12:18.983Z",
    "size": 873,
    "path": "../public/_nuxt/DCiSCalN.js.gz"
  },
  "/_nuxt/DdIZxoE0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1cad-Ag5o9p4F/Djr8tWoCEUn/sAmGPM\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 7341,
    "path": "../public/_nuxt/DdIZxoE0.js"
  },
  "/_nuxt/DdIZxoE0.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"94d-jZTdoM3V4N1kbjsjajL3yrx7MEQ\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 2381,
    "path": "../public/_nuxt/DdIZxoE0.js.br"
  },
  "/_nuxt/DdIZxoE0.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"aa0-xo2m+wlag4VNNGK8f+ITWZAzgc4\"",
    "mtime": "2026-03-17T17:12:18.983Z",
    "size": 2720,
    "path": "../public/_nuxt/DdIZxoE0.js.gz"
  },
  "/_nuxt/De8H0sN0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"20d-ZgYXUKzhL+f1n+ql4MubynFlD2M\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 525,
    "path": "../public/_nuxt/De8H0sN0.js"
  },
  "/_nuxt/default.B_nMDQOn.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"c06-cplgk5rVAyN5W6f1EUQigUWiiPE\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 3078,
    "path": "../public/_nuxt/default.B_nMDQOn.css"
  },
  "/_nuxt/default.B_nMDQOn.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"43a-Zcz5yBMCke8fpslv6PXnR11DUtk\"",
    "mtime": "2026-03-17T17:12:18.983Z",
    "size": 1082,
    "path": "../public/_nuxt/default.B_nMDQOn.css.br"
  },
  "/_nuxt/default.B_nMDQOn.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"4f7-kjTqdx+N+xOuwOw4ViWpLf5+KrM\"",
    "mtime": "2026-03-17T17:12:18.983Z",
    "size": 1271,
    "path": "../public/_nuxt/default.B_nMDQOn.css.gz"
  },
  "/_nuxt/DehyRSwq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"362-O3fim2FTRqQbD5Nike7nHACpoEk\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 866,
    "path": "../public/_nuxt/DehyRSwq.js"
  },
  "/_nuxt/DeOs1z7P.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9f00-PK6mObolRynWI7sRL5SKKR1c/LQ\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 40704,
    "path": "../public/_nuxt/DeOs1z7P.js"
  },
  "/_nuxt/DeOs1z7P.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"4145-vMG0lnbScYZvx1Of04kRNhbkgQE\"",
    "mtime": "2026-03-17T17:11:38.356Z",
    "size": 16709,
    "path": "../public/_nuxt/DeOs1z7P.js.gz"
  },
  "/_nuxt/Df11BRmG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"312-zgv63uF9+m69mVQpB/3X2oZack4\"",
    "mtime": "2026-03-17T17:11:35.675Z",
    "size": 786,
    "path": "../public/_nuxt/Df11BRmG.js"
  },
  "/_nuxt/DF_7sFjM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"80b-0VuaWO4Z20J89uVLSegrylfzc6Q\"",
    "mtime": "2026-03-17T17:11:35.676Z",
    "size": 2059,
    "path": "../public/_nuxt/DF_7sFjM.js"
  },
  "/_nuxt/DF_7sFjM.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"316-fuYfFnjCjSphtGbdLlIojiKdGUE\"",
    "mtime": "2026-03-17T17:12:18.983Z",
    "size": 790,
    "path": "../public/_nuxt/DF_7sFjM.js.br"
  },
  "/_nuxt/DF_7sFjM.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"369-64C2XHdlQRHAEnKAAKoJORmlJwg\"",
    "mtime": "2026-03-17T17:12:18.983Z",
    "size": 873,
    "path": "../public/_nuxt/DF_7sFjM.js.gz"
  },
  "/_nuxt/DGYXhP31.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"cb1-CBxGs3g6yI/Til8lz0MQ8B7+LsY\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 3249,
    "path": "../public/_nuxt/DGYXhP31.js"
  },
  "/_nuxt/DGYXhP31.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"47e-6Cqi9gAgwhZCyddsUc/D20hmyC4\"",
    "mtime": "2026-03-17T17:12:18.983Z",
    "size": 1150,
    "path": "../public/_nuxt/DGYXhP31.js.br"
  },
  "/_nuxt/DGYXhP31.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"4ea-oBWYl3TLJSKnXkbav5SvBk152dA\"",
    "mtime": "2026-03-17T17:12:18.983Z",
    "size": 1258,
    "path": "../public/_nuxt/DGYXhP31.js.gz"
  },
  "/_nuxt/DkYu6x3z.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"dd9-3MUWvjAjkneJnafow3LlXxEOwhI\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 3545,
    "path": "../public/_nuxt/DkYu6x3z.js"
  },
  "/_nuxt/DkYu6x3z.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"5be-+lqzjYV36HU98A1/mcZbcBWqcqA\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 1470,
    "path": "../public/_nuxt/DkYu6x3z.js.br"
  },
  "/_nuxt/DkYu6x3z.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"659-RiZijX8ylG+9zqf+RfdZv5mMYDM\"",
    "mtime": "2026-03-17T17:12:18.983Z",
    "size": 1625,
    "path": "../public/_nuxt/DkYu6x3z.js.gz"
  },
  "/_nuxt/DLUYMRdI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4bf-Tow2AnCV7oA0Udi+RMLLGQcyheQ\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 1215,
    "path": "../public/_nuxt/DLUYMRdI.js"
  },
  "/_nuxt/DLUYMRdI.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"23a-4nBUpA44I49IvPFPSyO3C17tIj0\"",
    "mtime": "2026-03-17T17:12:18.983Z",
    "size": 570,
    "path": "../public/_nuxt/DLUYMRdI.js.br"
  },
  "/_nuxt/DLUYMRdI.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"297-hJd+YaF2QXbFMbb88eU3GiQh5x0\"",
    "mtime": "2026-03-17T17:12:18.983Z",
    "size": 663,
    "path": "../public/_nuxt/DLUYMRdI.js.gz"
  },
  "/_nuxt/DMA9R1ak.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9ef-cuCZFM83+8nE1R+YxFnJWw7osAA\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 2543,
    "path": "../public/_nuxt/DMA9R1ak.js"
  },
  "/_nuxt/DMA9R1ak.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"40b-athoR/uJtpsHr3OqxHFtNX5weZU\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 1035,
    "path": "../public/_nuxt/DMA9R1ak.js.br"
  },
  "/_nuxt/DMA9R1ak.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"4b1-A+mqLg/npEfqqhkPMFWuBY+nrwY\"",
    "mtime": "2026-03-17T17:12:18.983Z",
    "size": 1201,
    "path": "../public/_nuxt/DMA9R1ak.js.gz"
  },
  "/_nuxt/DmEaEF-D.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2f6-taJE7LJAB8hW3d19zXhEVgPQ3eA\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 758,
    "path": "../public/_nuxt/DmEaEF-D.js"
  },
  "/_nuxt/DmH-S1Md.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"29f-3Dzn0XQJsy7JN/Eb1lKKWHpwO4M\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 671,
    "path": "../public/_nuxt/DmH-S1Md.js"
  },
  "/_nuxt/Dn4vWT7y.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"28ea-QOXVHUeEzaP46YAXp7JPFJvdGho\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 10474,
    "path": "../public/_nuxt/Dn4vWT7y.js"
  },
  "/_nuxt/Dn4vWT7y.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"b26-fSEUkywowds+6Rzwixz7P4Fe70w\"",
    "mtime": "2026-03-17T17:11:38.353Z",
    "size": 2854,
    "path": "../public/_nuxt/Dn4vWT7y.js.gz"
  },
  "/_nuxt/DncUxgFP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1736-hwlpAd2V/9G8SqY4a7UPdmIIjms\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 5942,
    "path": "../public/_nuxt/DncUxgFP.js"
  },
  "/_nuxt/DncUxgFP.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"8c1-zNBkRPRrWu6SoTAOrL4xoCpbfZs\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 2241,
    "path": "../public/_nuxt/DncUxgFP.js.br"
  },
  "/_nuxt/DncUxgFP.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"9eb-3uPVY52TPdV9RsiVxxuLc3M8HWw\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 2539,
    "path": "../public/_nuxt/DncUxgFP.js.gz"
  },
  "/_nuxt/DO-Gjzrf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"add-eF0z+5+hZFYkWOPVFXELE2MDM80\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 2781,
    "path": "../public/_nuxt/DO-Gjzrf.js"
  },
  "/_nuxt/DO-Gjzrf.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"3a3-bv8AD79Z5H3w2yKoWlwrtczJ6WI\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 931,
    "path": "../public/_nuxt/DO-Gjzrf.js.br"
  },
  "/_nuxt/DO-Gjzrf.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"42c-09pYs1AOoPKtaQghwLKei0bWHm0\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 1068,
    "path": "../public/_nuxt/DO-Gjzrf.js.gz"
  },
  "/_nuxt/DOaH1VGv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"423-BiYrmCwDHP2AX/weN5jtZjGyuFM\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 1059,
    "path": "../public/_nuxt/DOaH1VGv.js"
  },
  "/_nuxt/DOaH1VGv.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"220-jakRTIyaLwppD+0Pu0H7D1p2eWU\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 544,
    "path": "../public/_nuxt/DOaH1VGv.js.br"
  },
  "/_nuxt/DOaH1VGv.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"273-ARf1HPTakWfionj/APp7cjlDni0\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 627,
    "path": "../public/_nuxt/DOaH1VGv.js.gz"
  },
  "/_nuxt/DOGmv6Hj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"594-guIvF1lIoII0sMf49hVkSHkU8sE\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 1428,
    "path": "../public/_nuxt/DOGmv6Hj.js"
  },
  "/_nuxt/DOGmv6Hj.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2a4-8OIco6uiNsJs8zI2/rnLuqJ0gXE\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 676,
    "path": "../public/_nuxt/DOGmv6Hj.js.br"
  },
  "/_nuxt/DOGmv6Hj.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"2e4-0YhgNOfjj8HxPTQfxBsSw77qNek\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 740,
    "path": "../public/_nuxt/DOGmv6Hj.js.gz"
  },
  "/_nuxt/DpBAmp0B.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"b51-wMsj4HizkKFGPoHPxMeqqC8wl9w\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 2897,
    "path": "../public/_nuxt/DpBAmp0B.js"
  },
  "/_nuxt/DpBAmp0B.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"4a4-oZrBZeS++w9kAXpCly0N/gDnMaM\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 1188,
    "path": "../public/_nuxt/DpBAmp0B.js.br"
  },
  "/_nuxt/DpBAmp0B.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"529-hPEh8mry4HCxNYkRuBeV8zalfII\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 1321,
    "path": "../public/_nuxt/DpBAmp0B.js.gz"
  },
  "/_nuxt/DrKnGC_8.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2f2-/uDtikQ0K+iWn0NTB8Sgo8kZHX4\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 754,
    "path": "../public/_nuxt/DrKnGC_8.js"
  },
  "/_nuxt/DRSkxBNb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1537-vv6hQo4EB6Bls3MrZvjqXVralEY\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 5431,
    "path": "../public/_nuxt/DRSkxBNb.js"
  },
  "/_nuxt/DRSkxBNb.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"79f-oVWD03Vk6Dx6NOFEpk9+vFpGrA4\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 1951,
    "path": "../public/_nuxt/DRSkxBNb.js.br"
  },
  "/_nuxt/DRSkxBNb.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"8ee-W+ToNCE/UZqbP9y0fq9qhs/qCwE\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 2286,
    "path": "../public/_nuxt/DRSkxBNb.js.gz"
  },
  "/_nuxt/DRVMUuUg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"44d-8EyyOg/WUV2/7JOdvupUDlpe1VU\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 1101,
    "path": "../public/_nuxt/DRVMUuUg.js"
  },
  "/_nuxt/DRVMUuUg.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"1fd-wLRddYOR4xjM40nLLE0HMplKLlc\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 509,
    "path": "../public/_nuxt/DRVMUuUg.js.br"
  },
  "/_nuxt/DRVMUuUg.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"24a-RjEjqrHpixuzEhW16/LGBKrV4aU\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 586,
    "path": "../public/_nuxt/DRVMUuUg.js.gz"
  },
  "/_nuxt/DTrFuWx2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"77c-KDyCLr975q/BsxuznEF2gewyX98\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 1916,
    "path": "../public/_nuxt/DTrFuWx2.js"
  },
  "/_nuxt/DTrFuWx2.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2c2-HNZqWv3T1zt/COp53MiXsKu9h7M\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 706,
    "path": "../public/_nuxt/DTrFuWx2.js.br"
  },
  "/_nuxt/DTrFuWx2.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"32f-fbujTJWFW8Oc0W1BrGYLMhjGRR4\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 815,
    "path": "../public/_nuxt/DTrFuWx2.js.gz"
  },
  "/_nuxt/DUgIEROo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"228-2xNr7ITHLwwSm09EljAhLsfLhLM\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 552,
    "path": "../public/_nuxt/DUgIEROo.js"
  },
  "/_nuxt/DuME0IfC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1509-x4Zh2hxD4bhUJ1ND15203y+4fTY\"",
    "mtime": "2026-03-17T17:11:35.676Z",
    "size": 5385,
    "path": "../public/_nuxt/DuME0IfC.js"
  },
  "/_nuxt/DuME0IfC.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"7ae-zprnYmWKAKOy/RCYUHg9vJHGOEY\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 1966,
    "path": "../public/_nuxt/DuME0IfC.js.br"
  },
  "/_nuxt/DuME0IfC.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"85d-LHPIE/DuDTVJR4H3WglgcC89dhg\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 2141,
    "path": "../public/_nuxt/DuME0IfC.js.gz"
  },
  "/_nuxt/DuUbzikq.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e5a-uuZqcHiNtgH7tCZAqOTpEp9JU6s\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 3674,
    "path": "../public/_nuxt/DuUbzikq.js"
  },
  "/_nuxt/DuUbzikq.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"682-ef3O0/yDjOQ566+3BR2O0ld4zb0\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 1666,
    "path": "../public/_nuxt/DuUbzikq.js.br"
  },
  "/_nuxt/DuUbzikq.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"745-2CMphvQLH5o/5huO2aMCf8U4lKQ\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 1861,
    "path": "../public/_nuxt/DuUbzikq.js.gz"
  },
  "/_nuxt/DVfN8rqt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"934-CGECd1FAu+HyHd7f4ALcSct3NSw\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 2356,
    "path": "../public/_nuxt/DVfN8rqt.js"
  },
  "/_nuxt/DVfN8rqt.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"426-MjqJDXb6i79NE7SO3kHlSv+etlM\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 1062,
    "path": "../public/_nuxt/DVfN8rqt.js.br"
  },
  "/_nuxt/DVfN8rqt.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"4cb-9ffI2PME+Hw7HvkiFAJDt/8BeXk\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 1227,
    "path": "../public/_nuxt/DVfN8rqt.js.gz"
  },
  "/_nuxt/DWPfRuLp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"343-RAxDuyulu44CaBUmYdPDZpeI3q8\"",
    "mtime": "2026-03-17T17:11:35.673Z",
    "size": 835,
    "path": "../public/_nuxt/DWPfRuLp.js"
  },
  "/_nuxt/DwRh75JA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"fd3-Ch05H7ujPtjXf7WNKuZyroZASm4\"",
    "mtime": "2026-03-17T17:11:35.676Z",
    "size": 4051,
    "path": "../public/_nuxt/DwRh75JA.js"
  },
  "/_nuxt/DwRh75JA.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"5ba-pRcqNDI5vxK2GW09VPUk1ipOamQ\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 1466,
    "path": "../public/_nuxt/DwRh75JA.js.br"
  },
  "/_nuxt/DwRh75JA.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"676-a1iEOgRufZsuovf2NvQ1l+xJoUc\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 1654,
    "path": "../public/_nuxt/DwRh75JA.js.gz"
  },
  "/_nuxt/DXaQK4_Z.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4d10-zhsAq2Jqyu0sSvq4y/cCJvDjQxo\"",
    "mtime": "2026-03-17T17:11:35.675Z",
    "size": 19728,
    "path": "../public/_nuxt/DXaQK4_Z.js"
  },
  "/_nuxt/DXaQK4_Z.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"241d-D/MLWrJu4ymZvonm9xWKSvjhI5g\"",
    "mtime": "2026-03-17T17:11:38.354Z",
    "size": 9245,
    "path": "../public/_nuxt/DXaQK4_Z.js.gz"
  },
  "/_nuxt/DXKMIuUS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"110a-5d+IUjxoZZoJvnCi8bsGB9b0tW4\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 4362,
    "path": "../public/_nuxt/DXKMIuUS.js"
  },
  "/_nuxt/DXKMIuUS.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"6d3-wAe1qe1y8hx6qk79yJ5EDnnQdUA\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 1747,
    "path": "../public/_nuxt/DXKMIuUS.js.br"
  },
  "/_nuxt/DXKMIuUS.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"819-Lgav2o/xj5vUixI1FyP71tFqa3c\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 2073,
    "path": "../public/_nuxt/DXKMIuUS.js.gz"
  },
  "/_nuxt/Dy1Hrb_3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2d2-hT1XKV/gbjdooJYr5k7wjt23BfY\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 722,
    "path": "../public/_nuxt/Dy1Hrb_3.js"
  },
  "/_nuxt/DYz_wnZ1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"122c-HFpuJCvimy2mde2Vpdg6lComrks\"",
    "mtime": "2026-03-17T17:11:35.676Z",
    "size": 4652,
    "path": "../public/_nuxt/DYz_wnZ1.js"
  },
  "/_nuxt/DYz_wnZ1.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"701-Jdlr5iXXAfDeimLelR4owpIIDU8\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 1793,
    "path": "../public/_nuxt/DYz_wnZ1.js.br"
  },
  "/_nuxt/DYz_wnZ1.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"7d6-DiB+m5V/cyQIbg77j0cF5l5I/RU\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 2006,
    "path": "../public/_nuxt/DYz_wnZ1.js.gz"
  },
  "/_nuxt/DZA5V6hS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3ef-eFnmR+KuEIYR1cTOjLkl1mUcaJc\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 1007,
    "path": "../public/_nuxt/DZA5V6hS.js"
  },
  "/_nuxt/DzFWVndE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"19e0-r3rS68onllqLKva+U5pHUAGEs1g\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 6624,
    "path": "../public/_nuxt/DzFWVndE.js"
  },
  "/_nuxt/DzFWVndE.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"8fd-3MGjz5q6XMRX7ciLwSN6oyWq/E0\"",
    "mtime": "2026-03-17T17:12:18.986Z",
    "size": 2301,
    "path": "../public/_nuxt/DzFWVndE.js.br"
  },
  "/_nuxt/DzFWVndE.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"a00-GXtDgUkK9Idf9fTzvzgwg4m3slk\"",
    "mtime": "2026-03-17T17:12:18.985Z",
    "size": 2560,
    "path": "../public/_nuxt/DzFWVndE.js.gz"
  },
  "/_nuxt/DZPZEOli.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1a07-XAnlBsXh3CqPnwx+4OiqczddAwo\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 6663,
    "path": "../public/_nuxt/DZPZEOli.js"
  },
  "/_nuxt/DZPZEOli.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"6cd-LT3i7t1fdE+UI6JomwdOvh+rSRU\"",
    "mtime": "2026-03-17T17:12:18.986Z",
    "size": 1741,
    "path": "../public/_nuxt/DZPZEOli.js.br"
  },
  "/_nuxt/DZPZEOli.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"78b-wurIRJDF9uUQkYuQOFQvoR8mWew\"",
    "mtime": "2026-03-17T17:12:18.985Z",
    "size": 1931,
    "path": "../public/_nuxt/DZPZEOli.js.gz"
  },
  "/_nuxt/edit.XkQYC3nL.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"18e6-A9jHmTjDEJ6nm5DYr21E5cGqnbk\"",
    "mtime": "2026-03-17T17:11:35.671Z",
    "size": 6374,
    "path": "../public/_nuxt/edit.XkQYC3nL.css"
  },
  "/_nuxt/edit.XkQYC3nL.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"58d-QrnDA3dWjSNdPcGxlSyUJW+5YZM\"",
    "mtime": "2026-03-17T17:12:18.986Z",
    "size": 1421,
    "path": "../public/_nuxt/edit.XkQYC3nL.css.br"
  },
  "/_nuxt/edit.XkQYC3nL.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"67e-6NMr0R5XPhwJlShTcvcQKJLORyw\"",
    "mtime": "2026-03-17T17:12:18.986Z",
    "size": 1662,
    "path": "../public/_nuxt/edit.XkQYC3nL.css.gz"
  },
  "/_nuxt/EdZsLKOL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f8d-v13dPajnH2aGZoNyzQWo3bhJHpw\"",
    "mtime": "2026-03-17T17:11:35.675Z",
    "size": 3981,
    "path": "../public/_nuxt/EdZsLKOL.js"
  },
  "/_nuxt/EdZsLKOL.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"66e-42n9cUDxx3ivWrySYYx9CtYYONw\"",
    "mtime": "2026-03-17T17:12:18.985Z",
    "size": 1646,
    "path": "../public/_nuxt/EdZsLKOL.js.br"
  },
  "/_nuxt/EdZsLKOL.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"7a3-oNZuFW/+n6fanZW2MLAsyHOphBs\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 1955,
    "path": "../public/_nuxt/EdZsLKOL.js.gz"
  },
  "/_nuxt/el-button.Dxh9C6p7.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"3cf5-cS0jcwfb6PmMioS4zTiaqhvKsi8\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 15605,
    "path": "../public/_nuxt/el-button.Dxh9C6p7.css"
  },
  "/_nuxt/el-button.Dxh9C6p7.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"798-k24E0MXIuJNwuXpfgm8Mv4HUdcI\"",
    "mtime": "2026-03-17T17:11:38.354Z",
    "size": 1944,
    "path": "../public/_nuxt/el-button.Dxh9C6p7.css.gz"
  },
  "/_nuxt/el-card.D2idZXpV.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"3a0-6UnE+Dm98GbMbvHmLh1IgMgD6LY\"",
    "mtime": "2026-03-17T17:11:35.671Z",
    "size": 928,
    "path": "../public/_nuxt/el-card.D2idZXpV.css"
  },
  "/_nuxt/el-checkbox.D71c_XrV.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1a0e-rZJERheMQfDFf86qvODLVPcgjbk\"",
    "mtime": "2026-03-17T17:11:35.671Z",
    "size": 6670,
    "path": "../public/_nuxt/el-checkbox.D71c_XrV.css"
  },
  "/_nuxt/el-checkbox.D71c_XrV.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"424-54s6Q0JgB3H21HQeIjIx+iCbTvc\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 1060,
    "path": "../public/_nuxt/el-checkbox.D71c_XrV.css.br"
  },
  "/_nuxt/el-checkbox.D71c_XrV.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"4d5-dTextCz6JdmtGTUBA63FkwXrEYI\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 1237,
    "path": "../public/_nuxt/el-checkbox.D71c_XrV.css.gz"
  },
  "/_nuxt/el-form.CzZ02g5r.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"130e-1T/4iCKfhIjOn/3eqUZxSIxCm9M\"",
    "mtime": "2026-03-17T17:11:35.671Z",
    "size": 4878,
    "path": "../public/_nuxt/el-form.CzZ02g5r.css"
  },
  "/_nuxt/el-form.CzZ02g5r.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"2f3-D8MzDR+7s3AbeEGNdeeR1ZtNCGs\"",
    "mtime": "2026-03-17T17:12:18.985Z",
    "size": 755,
    "path": "../public/_nuxt/el-form.CzZ02g5r.css.br"
  },
  "/_nuxt/el-form.CzZ02g5r.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"379-L1D5MXVF3/DJU2RPztyN7EtvEuk\"",
    "mtime": "2026-03-17T17:12:18.984Z",
    "size": 889,
    "path": "../public/_nuxt/el-form.CzZ02g5r.css.gz"
  },
  "/_nuxt/el-input.AZDna0_z.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"2b67-tbQ3BYisPnfVRI/9vpRZYCF1ilE\"",
    "mtime": "2026-03-17T17:11:35.671Z",
    "size": 11111,
    "path": "../public/_nuxt/el-input.AZDna0_z.css"
  },
  "/_nuxt/el-input.AZDna0_z.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"719-rtOKohnOsAFSAwvX8zUgTfTAqbI\"",
    "mtime": "2026-03-17T17:11:38.354Z",
    "size": 1817,
    "path": "../public/_nuxt/el-input.AZDna0_z.css.gz"
  },
  "/_nuxt/el-overlay.D7mMCPTQ.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1363-f2MjQ3SNQ57UdyDXUaJpGuLFjJU\"",
    "mtime": "2026-03-17T17:11:35.671Z",
    "size": 4963,
    "path": "../public/_nuxt/el-overlay.D7mMCPTQ.css"
  },
  "/_nuxt/el-overlay.D7mMCPTQ.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"3eb-CdjUSCnx6bKKvkbf8fA/jyjEb2E\"",
    "mtime": "2026-03-17T17:12:18.985Z",
    "size": 1003,
    "path": "../public/_nuxt/el-overlay.D7mMCPTQ.css.br"
  },
  "/_nuxt/el-overlay.D7mMCPTQ.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"4b8-KcSrDkWfXG2PDKnjh1zcH8j4SMU\"",
    "mtime": "2026-03-17T17:12:18.986Z",
    "size": 1208,
    "path": "../public/_nuxt/el-overlay.D7mMCPTQ.css.gz"
  },
  "/_nuxt/el-pagination.BFWjApoe.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1b7d-7zu00Lsce/cg3PbABx3vbmJv9+w\"",
    "mtime": "2026-03-17T17:11:35.671Z",
    "size": 7037,
    "path": "../public/_nuxt/el-pagination.BFWjApoe.css"
  },
  "/_nuxt/el-pagination.BFWjApoe.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"40a-AML6mgJLl+OunUmLxgRETC6MECc\"",
    "mtime": "2026-03-17T17:12:18.985Z",
    "size": 1034,
    "path": "../public/_nuxt/el-pagination.BFWjApoe.css.br"
  },
  "/_nuxt/el-pagination.BFWjApoe.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"4b3-Vl6P8eyRFgx0N/+m798OTFGSI/U\"",
    "mtime": "2026-03-17T17:12:18.985Z",
    "size": 1203,
    "path": "../public/_nuxt/el-pagination.BFWjApoe.css.gz"
  },
  "/_nuxt/el-popper.BeQtVd-b.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"8e2-yZc1TG4KpNXLbt5KonEotAyj/9o\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 2274,
    "path": "../public/_nuxt/el-popper.BeQtVd-b.css"
  },
  "/_nuxt/el-popper.BeQtVd-b.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"1bf-th6kVFf0bXNmAqgq3mQRWcPr2yc\"",
    "mtime": "2026-03-17T17:12:18.985Z",
    "size": 447,
    "path": "../public/_nuxt/el-popper.BeQtVd-b.css.br"
  },
  "/_nuxt/el-popper.BeQtVd-b.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"218-WPcLSjxiVYoxSbf2DVSDG0EsK+w\"",
    "mtime": "2026-03-17T17:12:18.986Z",
    "size": 536,
    "path": "../public/_nuxt/el-popper.BeQtVd-b.css.gz"
  },
  "/_nuxt/el-scrollbar.DuhuuQ5e.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1b7a-5wJIUN8+cVOdrA6STW6YFJwrGB8\"",
    "mtime": "2026-03-17T17:11:35.671Z",
    "size": 7034,
    "path": "../public/_nuxt/el-scrollbar.DuhuuQ5e.css"
  },
  "/_nuxt/el-scrollbar.DuhuuQ5e.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"405-5HFl0vTAfqxlxdWL5AXQAp0bN/g\"",
    "mtime": "2026-03-17T17:12:18.985Z",
    "size": 1029,
    "path": "../public/_nuxt/el-scrollbar.DuhuuQ5e.css.br"
  },
  "/_nuxt/el-scrollbar.DuhuuQ5e.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"4d7-+CVV3bJav9x3faJU02sQ82ynTrI\"",
    "mtime": "2026-03-17T17:12:18.985Z",
    "size": 1239,
    "path": "../public/_nuxt/el-scrollbar.DuhuuQ5e.css.gz"
  },
  "/_nuxt/el-select.BM4Vocf6.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"2464-YfAIugbCl6bmwtUVV7yMnnBmx6Y\"",
    "mtime": "2026-03-17T17:11:35.671Z",
    "size": 9316,
    "path": "../public/_nuxt/el-select.BM4Vocf6.css"
  },
  "/_nuxt/el-select.BM4Vocf6.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"64c-7qelx/fHKiQaJj2FhpwliHOX360\"",
    "mtime": "2026-03-17T17:12:18.986Z",
    "size": 1612,
    "path": "../public/_nuxt/el-select.BM4Vocf6.css.br"
  },
  "/_nuxt/el-select.BM4Vocf6.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"78f-0zHqjYvGa2trgUwOffKfSmCsSek\"",
    "mtime": "2026-03-17T17:12:18.986Z",
    "size": 1935,
    "path": "../public/_nuxt/el-select.BM4Vocf6.css.gz"
  },
  "/_nuxt/el-table.BPBSxMVO.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"47a1-YF7okYKOwkbwnzyhabcecxPsCZ0\"",
    "mtime": "2026-03-17T17:11:35.671Z",
    "size": 18337,
    "path": "../public/_nuxt/el-table.BPBSxMVO.css"
  },
  "/_nuxt/el-table.BPBSxMVO.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"b29-28r0W7L6AGjcE/UPG3WLAgB5Abw\"",
    "mtime": "2026-03-17T17:11:38.354Z",
    "size": 2857,
    "path": "../public/_nuxt/el-table.BPBSxMVO.css.gz"
  },
  "/_nuxt/el-tooltip.tn0RQdqM.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\"",
    "mtime": "2026-03-17T17:11:35.614Z",
    "size": 0,
    "path": "../public/_nuxt/el-tooltip.tn0RQdqM.css"
  },
  "/_nuxt/entry.BwHDKv_-.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"53c1-FjgRCkbQHO852SO0bCwgVMZF9JE\"",
    "mtime": "2026-03-17T17:11:35.670Z",
    "size": 21441,
    "path": "../public/_nuxt/entry.BwHDKv_-.css"
  },
  "/_nuxt/entry.BwHDKv_-.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1220-bpDgSCRo8q03a0/KlbJOGygZEQI\"",
    "mtime": "2026-03-17T17:11:38.354Z",
    "size": 4640,
    "path": "../public/_nuxt/entry.BwHDKv_-.css.gz"
  },
  "/_nuxt/fCUp34qd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"791-gn8j6SReDoPz3O3kGoLegFp0TJM\"",
    "mtime": "2026-03-17T17:11:35.675Z",
    "size": 1937,
    "path": "../public/_nuxt/fCUp34qd.js"
  },
  "/_nuxt/fCUp34qd.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"248-TQPW0iPjpvNZUrbaAJlPcM/iMQs\"",
    "mtime": "2026-03-17T17:12:18.986Z",
    "size": 584,
    "path": "../public/_nuxt/fCUp34qd.js.br"
  },
  "/_nuxt/fCUp34qd.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"291-zK0A5cSzsTUqeRa3HC1te50GhtI\"",
    "mtime": "2026-03-17T17:12:18.986Z",
    "size": 657,
    "path": "../public/_nuxt/fCUp34qd.js.gz"
  },
  "/_nuxt/Fdmw2Ycg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"133b-EGPsIxyw7iHoMuWr/nCoz5X9iEc\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 4923,
    "path": "../public/_nuxt/Fdmw2Ycg.js"
  },
  "/_nuxt/Fdmw2Ycg.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"85a-0tGNnlMEagtxINWPdz9lxNaNPzo\"",
    "mtime": "2026-03-17T17:12:18.986Z",
    "size": 2138,
    "path": "../public/_nuxt/Fdmw2Ycg.js.br"
  },
  "/_nuxt/Fdmw2Ycg.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"92c-4vUmUinU6p4j9ZaXWJ6500qR6eI\"",
    "mtime": "2026-03-17T17:12:18.986Z",
    "size": 2348,
    "path": "../public/_nuxt/Fdmw2Ycg.js.gz"
  },
  "/_nuxt/Ffai-XNe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9f0-Z5RFrlG+6Q0NSJKuIxBBS9NHTTs\"",
    "mtime": "2026-03-17T17:11:35.676Z",
    "size": 2544,
    "path": "../public/_nuxt/Ffai-XNe.js"
  },
  "/_nuxt/Ffai-XNe.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"472-FD2+HQXCdbHM9a5vs7A0UDME9GA\"",
    "mtime": "2026-03-17T17:12:18.986Z",
    "size": 1138,
    "path": "../public/_nuxt/Ffai-XNe.js.br"
  },
  "/_nuxt/Ffai-XNe.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"532-zDn+7rhhtx4uvvdeSg0hJ4syPRQ\"",
    "mtime": "2026-03-17T17:12:18.986Z",
    "size": 1330,
    "path": "../public/_nuxt/Ffai-XNe.js.gz"
  },
  "/_nuxt/Footer.nE9sn4qZ.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"186a-KLQUgt9n6ZUeUtIxovw9XJKwyps\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 6250,
    "path": "../public/_nuxt/Footer.nE9sn4qZ.css"
  },
  "/_nuxt/Footer.nE9sn4qZ.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"553-Nu/cRvec6nKLYrooScDMaF1L5ik\"",
    "mtime": "2026-03-17T17:12:18.986Z",
    "size": 1363,
    "path": "../public/_nuxt/Footer.nE9sn4qZ.css.br"
  },
  "/_nuxt/Footer.nE9sn4qZ.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"638-ituA49qBm+oqKe6KA+7MR5buT4o\"",
    "mtime": "2026-03-17T17:12:18.986Z",
    "size": 1592,
    "path": "../public/_nuxt/Footer.nE9sn4qZ.css.gz"
  },
  "/_nuxt/gg1lkPQ7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"64d-10BmWLpM41Ut1o4u+69cwSwSuwM\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 1613,
    "path": "../public/_nuxt/gg1lkPQ7.js"
  },
  "/_nuxt/gg1lkPQ7.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2fb-7USdpzXLe73cX4K+vCDmjJZQeto\"",
    "mtime": "2026-03-17T17:12:18.986Z",
    "size": 763,
    "path": "../public/_nuxt/gg1lkPQ7.js.br"
  },
  "/_nuxt/gg1lkPQ7.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"36f-D5bWdjwJ0370d/yFUABCx5RAyCM\"",
    "mtime": "2026-03-17T17:12:18.986Z",
    "size": 879,
    "path": "../public/_nuxt/gg1lkPQ7.js.gz"
  },
  "/_nuxt/GW_nhZxv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"8e5-Qnam6yHPVXhuyPtogPeG28t+2XA\"",
    "mtime": "2026-03-17T17:11:35.676Z",
    "size": 2277,
    "path": "../public/_nuxt/GW_nhZxv.js"
  },
  "/_nuxt/GW_nhZxv.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"3e2-Z9rSdoKI2VE1/h3VdGFjy1y8a2k\"",
    "mtime": "2026-03-17T17:12:18.986Z",
    "size": 994,
    "path": "../public/_nuxt/GW_nhZxv.js.br"
  },
  "/_nuxt/GW_nhZxv.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"440-dDq48YDKLBx4ZompX6FOEYIv7Zg\"",
    "mtime": "2026-03-17T17:12:18.986Z",
    "size": 1088,
    "path": "../public/_nuxt/GW_nhZxv.js.gz"
  },
  "/_nuxt/H-WmDvRZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1ed5-7TkdHIj3N3n0ZQdhXr2eQNeFOv4\"",
    "mtime": "2026-03-17T17:11:35.676Z",
    "size": 7893,
    "path": "../public/_nuxt/H-WmDvRZ.js"
  },
  "/_nuxt/H-WmDvRZ.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"a87-OR/u/95+EGCN0qK8ydqZVZlQY/s\"",
    "mtime": "2026-03-17T17:12:18.987Z",
    "size": 2695,
    "path": "../public/_nuxt/H-WmDvRZ.js.br"
  },
  "/_nuxt/H-WmDvRZ.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"b7f-AwlslVeWcZ41/InPQrBzLKTMRBw\"",
    "mtime": "2026-03-17T17:12:18.986Z",
    "size": 2943,
    "path": "../public/_nuxt/H-WmDvRZ.js.gz"
  },
  "/_nuxt/Header.BEKlw7k4.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1a11-fkCN/QfDuGHwQ19MINgrLwSt9Tc\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 6673,
    "path": "../public/_nuxt/Header.BEKlw7k4.css"
  },
  "/_nuxt/Header.BEKlw7k4.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"5a3-wF2W2gBmF7krKD8VsNs6UfDwPCU\"",
    "mtime": "2026-03-17T17:12:18.987Z",
    "size": 1443,
    "path": "../public/_nuxt/Header.BEKlw7k4.css.br"
  },
  "/_nuxt/Header.BEKlw7k4.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"689-HVve2dLwuzNWLjsvhu1b2Tf8EOs\"",
    "mtime": "2026-03-17T17:12:18.986Z",
    "size": 1673,
    "path": "../public/_nuxt/Header.BEKlw7k4.css.gz"
  },
  "/_nuxt/Header.CGwOzqpx.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"39e8-UnfSmlyG5PELZIb37qB/E+CCKAo\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 14824,
    "path": "../public/_nuxt/Header.CGwOzqpx.css"
  },
  "/_nuxt/Header.CGwOzqpx.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"c04-s3ImNTVM8PRLgkNp82fnu9SG3ME\"",
    "mtime": "2026-03-17T17:11:38.354Z",
    "size": 3076,
    "path": "../public/_nuxt/Header.CGwOzqpx.css.gz"
  },
  "/_nuxt/heZmZLOM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"27af-TlRoCc6JmX5to1abwsqDWHNfS6c\"",
    "mtime": "2026-03-17T17:11:35.676Z",
    "size": 10159,
    "path": "../public/_nuxt/heZmZLOM.js"
  },
  "/_nuxt/heZmZLOM.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"101c-Z1IgUzF0NsVdGvyheDnVZg4Tugk\"",
    "mtime": "2026-03-17T17:12:18.987Z",
    "size": 4124,
    "path": "../public/_nuxt/heZmZLOM.js.br"
  },
  "/_nuxt/heZmZLOM.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"13e4-CK1xH0IW46bty20Kh7rP0G0jGNA\"",
    "mtime": "2026-03-17T17:12:18.987Z",
    "size": 5092,
    "path": "../public/_nuxt/heZmZLOM.js.gz"
  },
  "/_nuxt/Hz9HOZM7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"6d7-C5cQ6t4wd3M3XSWve4Yg0xvd/w8\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 1751,
    "path": "../public/_nuxt/Hz9HOZM7.js"
  },
  "/_nuxt/Hz9HOZM7.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2f0-Kuj30jkDsPVQdp/4lBkS39Voyug\"",
    "mtime": "2026-03-17T17:12:18.986Z",
    "size": 752,
    "path": "../public/_nuxt/Hz9HOZM7.js.br"
  },
  "/_nuxt/Hz9HOZM7.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"329-2gKkWgrDDubpy3xOL62whkEAs18\"",
    "mtime": "2026-03-17T17:12:18.986Z",
    "size": 809,
    "path": "../public/_nuxt/Hz9HOZM7.js.gz"
  },
  "/_nuxt/index.2DoFZR5O.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"2c05-lqsEyAxa92tXwlMkJ0R33hv3qBw\"",
    "mtime": "2026-03-17T17:11:35.670Z",
    "size": 11269,
    "path": "../public/_nuxt/index.2DoFZR5O.css"
  },
  "/_nuxt/index.2DoFZR5O.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"833-BWoLVpmXVvXoH1Wzba4VESlxpJA\"",
    "mtime": "2026-03-17T17:11:38.354Z",
    "size": 2099,
    "path": "../public/_nuxt/index.2DoFZR5O.css.gz"
  },
  "/_nuxt/index.3zumvwMd.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"19c0-Rcgj2xj3CBm6Tz+LlAbbK0rRtHI\"",
    "mtime": "2026-03-17T17:11:35.670Z",
    "size": 6592,
    "path": "../public/_nuxt/index.3zumvwMd.css"
  },
  "/_nuxt/index.3zumvwMd.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"59d-i2VL5b4ZPPuC39lBJHk8pPqA3xc\"",
    "mtime": "2026-03-17T17:12:18.986Z",
    "size": 1437,
    "path": "../public/_nuxt/index.3zumvwMd.css.br"
  },
  "/_nuxt/index.3zumvwMd.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"68d-Cbv8o10OBaS3T0WaQ+COmgipyNQ\"",
    "mtime": "2026-03-17T17:12:18.986Z",
    "size": 1677,
    "path": "../public/_nuxt/index.3zumvwMd.css.gz"
  },
  "/_nuxt/index.B1xdHpp-.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"2b84-+ONmx3Ikolci7DTW+sPRzeWI+WI\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 11140,
    "path": "../public/_nuxt/index.B1xdHpp-.css"
  },
  "/_nuxt/index.B1xdHpp-.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"7f5-olMrxaiGZU1G85ctrpykWwbMFBo\"",
    "mtime": "2026-03-17T17:11:38.354Z",
    "size": 2037,
    "path": "../public/_nuxt/index.B1xdHpp-.css.gz"
  },
  "/_nuxt/index.BHyFZKkU.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"128f-6XPPBnlpgUsKWWZxNRrkyKfAd6Q\"",
    "mtime": "2026-03-17T17:11:35.671Z",
    "size": 4751,
    "path": "../public/_nuxt/index.BHyFZKkU.css"
  },
  "/_nuxt/index.BHyFZKkU.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"372-fGeERBSacpESxzsECeKSYok/tG4\"",
    "mtime": "2026-03-17T17:12:18.987Z",
    "size": 882,
    "path": "../public/_nuxt/index.BHyFZKkU.css.br"
  },
  "/_nuxt/index.BHyFZKkU.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"428-gRiAuyzSU84Nubi5M7L9fx+mUzI\"",
    "mtime": "2026-03-17T17:12:18.987Z",
    "size": 1064,
    "path": "../public/_nuxt/index.BHyFZKkU.css.gz"
  },
  "/_nuxt/index.BnevpzhZ.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"167c-Q7apJx+umR2/mNYLKIsmVLk2IVw\"",
    "mtime": "2026-03-17T17:11:35.670Z",
    "size": 5756,
    "path": "../public/_nuxt/index.BnevpzhZ.css"
  },
  "/_nuxt/index.BnevpzhZ.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"50f-dgdxOu8S/CgaKqcJwYC8B94rTPA\"",
    "mtime": "2026-03-17T17:12:18.987Z",
    "size": 1295,
    "path": "../public/_nuxt/index.BnevpzhZ.css.br"
  },
  "/_nuxt/index.BnevpzhZ.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"5eb-9xaj9rd60khlw5OTDqad2vcZHsc\"",
    "mtime": "2026-03-17T17:12:18.987Z",
    "size": 1515,
    "path": "../public/_nuxt/index.BnevpzhZ.css.gz"
  },
  "/_nuxt/index.DWXnDI4r.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"26b0-Za86tShpdcx9Jd0ncKE67UbvDpw\"",
    "mtime": "2026-03-17T17:11:35.671Z",
    "size": 9904,
    "path": "../public/_nuxt/index.DWXnDI4r.css"
  },
  "/_nuxt/index.DWXnDI4r.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"86d-pojVahvjfhzoRo0OGfEGhrBAC0M\"",
    "mtime": "2026-03-17T17:12:18.987Z",
    "size": 2157,
    "path": "../public/_nuxt/index.DWXnDI4r.css.br"
  },
  "/_nuxt/index.DWXnDI4r.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"9b0-1CvbSRc7jhl9bRQ9XUUF7mQA7TU\"",
    "mtime": "2026-03-17T17:12:18.987Z",
    "size": 2480,
    "path": "../public/_nuxt/index.DWXnDI4r.css.gz"
  },
  "/_nuxt/index.Dyi_v_CQ.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"2fe9-LFxEoGFcmkLfQB1epS26B4nqLV8\"",
    "mtime": "2026-03-17T17:11:35.669Z",
    "size": 12265,
    "path": "../public/_nuxt/index.Dyi_v_CQ.css"
  },
  "/_nuxt/index.Dyi_v_CQ.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"8bf-UiWRuRi0eAzj4nBzyclALyBjKEc\"",
    "mtime": "2026-03-17T17:11:38.354Z",
    "size": 2239,
    "path": "../public/_nuxt/index.Dyi_v_CQ.css.gz"
  },
  "/_nuxt/iXu5QeM3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"42ba-Jrkh6yB+gxsGW73sfx1X+OVjiRs\"",
    "mtime": "2026-03-17T17:11:35.676Z",
    "size": 17082,
    "path": "../public/_nuxt/iXu5QeM3.js"
  },
  "/_nuxt/iXu5QeM3.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1676-lybRrvX/ugKok6Svv487K9fuFAs\"",
    "mtime": "2026-03-17T17:11:38.354Z",
    "size": 5750,
    "path": "../public/_nuxt/iXu5QeM3.js.gz"
  },
  "/_nuxt/k5dKIZmb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"470b-k8gxuE0RsbUAtMstulS0hYffpV0\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 18187,
    "path": "../public/_nuxt/k5dKIZmb.js"
  },
  "/_nuxt/k5dKIZmb.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"192b-mBKLIIMBW/yvGukEU4RYF3107Po\"",
    "mtime": "2026-03-17T17:11:38.354Z",
    "size": 6443,
    "path": "../public/_nuxt/k5dKIZmb.js.gz"
  },
  "/_nuxt/Kvtd6kyn.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"81b-En9t/MZ9xb1v1U0h4wrBF3fb/OM\"",
    "mtime": "2026-03-17T17:11:35.676Z",
    "size": 2075,
    "path": "../public/_nuxt/Kvtd6kyn.js"
  },
  "/_nuxt/Kvtd6kyn.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"354-r2hA9ZVXGJIHAit4cgNqFXj1gLY\"",
    "mtime": "2026-03-17T17:12:18.987Z",
    "size": 852,
    "path": "../public/_nuxt/Kvtd6kyn.js.br"
  },
  "/_nuxt/Kvtd6kyn.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"3b5-5hrOjkvLb0kJ9myvQ+VDrjCz/Zo\"",
    "mtime": "2026-03-17T17:12:18.987Z",
    "size": 949,
    "path": "../public/_nuxt/Kvtd6kyn.js.gz"
  },
  "/_nuxt/L2me1ATb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"345f-TVgiTTSCVYhT/eUmxImJnaN1bm0\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 13407,
    "path": "../public/_nuxt/L2me1ATb.js"
  },
  "/_nuxt/L2me1ATb.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"14c3-9+d0khyqERrKqZDZnK3MicDUMrM\"",
    "mtime": "2026-03-17T17:11:38.354Z",
    "size": 5315,
    "path": "../public/_nuxt/L2me1ATb.js.gz"
  },
  "/_nuxt/login.DS-Ob8jA.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"226b-bD0AmSZt3QVn5iJfu+LM8bV5H10\"",
    "mtime": "2026-03-17T17:11:35.670Z",
    "size": 8811,
    "path": "../public/_nuxt/login.DS-Ob8jA.css"
  },
  "/_nuxt/login.DS-Ob8jA.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"723-YWsEZYivhCQbt0QkSPpjA+NQFmU\"",
    "mtime": "2026-03-17T17:12:18.987Z",
    "size": 1827,
    "path": "../public/_nuxt/login.DS-Ob8jA.css.br"
  },
  "/_nuxt/login.DS-Ob8jA.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"82c-MzAArTEG+7P+BpKYtuqOGkYTVy0\"",
    "mtime": "2026-03-17T17:12:18.987Z",
    "size": 2092,
    "path": "../public/_nuxt/login.DS-Ob8jA.css.gz"
  },
  "/_nuxt/lSbBsy5d.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"d14-gX6Arn5K0XGgU1+DzMtMeeJRUug\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 3348,
    "path": "../public/_nuxt/lSbBsy5d.js"
  },
  "/_nuxt/lSbBsy5d.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"54a-7SAT86dF7yS77EMQiYw9hxU6uNY\"",
    "mtime": "2026-03-17T17:12:18.987Z",
    "size": 1354,
    "path": "../public/_nuxt/lSbBsy5d.js.br"
  },
  "/_nuxt/lSbBsy5d.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"5e6-oA44fae3GYVL9bhm05UETnpMtLI\"",
    "mtime": "2026-03-17T17:12:18.987Z",
    "size": 1510,
    "path": "../public/_nuxt/lSbBsy5d.js.gz"
  },
  "/_nuxt/Lue37fgP.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"1147c-b875g9UZRFBx9IKI13aqh4O2HPE\"",
    "mtime": "2026-03-17T17:11:35.675Z",
    "size": 70780,
    "path": "../public/_nuxt/Lue37fgP.js"
  },
  "/_nuxt/Lue37fgP.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"64c9-7lxYl3HRhaJdVmIqMF8pJkPiy44\"",
    "mtime": "2026-03-17T17:11:38.398Z",
    "size": 25801,
    "path": "../public/_nuxt/Lue37fgP.js.gz"
  },
  "/_nuxt/md-editor-v3.B9zPpmu6.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1118f-Dfme0Fjw2qWuiUP52IzcG0JHWQ8\"",
    "mtime": "2026-03-17T17:11:35.669Z",
    "size": 70031,
    "path": "../public/_nuxt/md-editor-v3.B9zPpmu6.css"
  },
  "/_nuxt/md-editor-v3.B9zPpmu6.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"327d-8CiC0so/fIkQ1EfCfXPqJhz/cZ4\"",
    "mtime": "2026-03-17T17:11:38.354Z",
    "size": 12925,
    "path": "../public/_nuxt/md-editor-v3.B9zPpmu6.css.gz"
  },
  "/_nuxt/mezWK8KO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"75a-2YPEwCAumjVCt0lwHKEm6dF4f84\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 1882,
    "path": "../public/_nuxt/mezWK8KO.js"
  },
  "/_nuxt/mezWK8KO.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"36d-ok+4z7yNtzfj2rgTrXcSqW5EMRs\"",
    "mtime": "2026-03-17T17:12:18.987Z",
    "size": 877,
    "path": "../public/_nuxt/mezWK8KO.js.br"
  },
  "/_nuxt/mezWK8KO.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"3d3-fgABO3uoAkYWvml5amULoq1jxpU\"",
    "mtime": "2026-03-17T17:12:18.987Z",
    "size": 979,
    "path": "../public/_nuxt/mezWK8KO.js.gz"
  },
  "/_nuxt/nuxt-icon.BdpeBhx2.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"fe-23rdvH8wBVm0gSnUqmHDhubj+to\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 254,
    "path": "../public/_nuxt/nuxt-icon.BdpeBhx2.css"
  },
  "/_nuxt/oBRhwrVT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"333-WfBG6iDd4Ea4GyYLTqrgxFhvU78\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 819,
    "path": "../public/_nuxt/oBRhwrVT.js"
  },
  "/_nuxt/pRatUO7H.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"e87-4Sd67z21b858eZdNPWOSWUCsbOg\"",
    "mtime": "2026-03-17T17:11:35.675Z",
    "size": 3719,
    "path": "../public/_nuxt/pRatUO7H.js"
  },
  "/_nuxt/pRatUO7H.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"5c7-jprBAzDcvmLc2ELd9quIaECOKKI\"",
    "mtime": "2026-03-17T17:12:18.988Z",
    "size": 1479,
    "path": "../public/_nuxt/pRatUO7H.js.br"
  },
  "/_nuxt/pRatUO7H.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"694-pLQVds9PF/qHlfQ3upiwNFwFng0\"",
    "mtime": "2026-03-17T17:12:18.987Z",
    "size": 1684,
    "path": "../public/_nuxt/pRatUO7H.js.gz"
  },
  "/_nuxt/project.DBeWUUx4.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1464-KnG35kcfT58a3/gsxc4QzSzxnA0\"",
    "mtime": "2026-03-17T17:11:35.670Z",
    "size": 5220,
    "path": "../public/_nuxt/project.DBeWUUx4.css"
  },
  "/_nuxt/project.DBeWUUx4.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"4b3-K0QVT4V8TxqPHGkjRuk6XewumeI\"",
    "mtime": "2026-03-17T17:12:18.987Z",
    "size": 1203,
    "path": "../public/_nuxt/project.DBeWUUx4.css.br"
  },
  "/_nuxt/project.DBeWUUx4.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"57c-9i8bz6EfqO1nn0+eJ+gWjAhbN3o\"",
    "mtime": "2026-03-17T17:12:18.987Z",
    "size": 1404,
    "path": "../public/_nuxt/project.DBeWUUx4.css.gz"
  },
  "/_nuxt/pXgVlZs6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"fc0-+tnnu3Zv5w173x5s+tHiksk7xHM\"",
    "mtime": "2026-03-17T17:11:35.677Z",
    "size": 4032,
    "path": "../public/_nuxt/pXgVlZs6.js"
  },
  "/_nuxt/pXgVlZs6.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"611-hadX/DFhtvba97cao24RtPcImGk\"",
    "mtime": "2026-03-17T17:12:18.988Z",
    "size": 1553,
    "path": "../public/_nuxt/pXgVlZs6.js.br"
  },
  "/_nuxt/pXgVlZs6.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"689-PnOR8V4yhbtBNa8PDqa7j1Qa6IU\"",
    "mtime": "2026-03-17T17:12:18.987Z",
    "size": 1673,
    "path": "../public/_nuxt/pXgVlZs6.js.gz"
  },
  "/_nuxt/qZIts_gO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"74ef-TG6OfdmLKlIxVtWTmZdUdd4vY/M\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 29935,
    "path": "../public/_nuxt/qZIts_gO.js"
  },
  "/_nuxt/qZIts_gO.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"2812-xUS8Y4ZYBtINagLusFu4LprZSLc\"",
    "mtime": "2026-03-17T17:11:38.354Z",
    "size": 10258,
    "path": "../public/_nuxt/qZIts_gO.js.gz"
  },
  "/_nuxt/S37ZYGWr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"f1c-C79rmrw8Aapy/dpLhOPAtBEAOjo\"",
    "mtime": "2026-03-17T17:11:35.675Z",
    "size": 3868,
    "path": "../public/_nuxt/S37ZYGWr.js"
  },
  "/_nuxt/S37ZYGWr.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"627-6+ZcY5/krFg+lYoomADxz5L4zGo\"",
    "mtime": "2026-03-17T17:12:18.988Z",
    "size": 1575,
    "path": "../public/_nuxt/S37ZYGWr.js.br"
  },
  "/_nuxt/S37ZYGWr.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"698-G48Bciq2ApdiSsKeZcRlvB4uuLE\"",
    "mtime": "2026-03-17T17:12:18.988Z",
    "size": 1688,
    "path": "../public/_nuxt/S37ZYGWr.js.gz"
  },
  "/_nuxt/Sa3GyR5C.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"17dd2-vx5GOhU7uoFuJxMZOjgl4TB93xg\"",
    "mtime": "2026-03-17T17:11:35.675Z",
    "size": 97746,
    "path": "../public/_nuxt/Sa3GyR5C.js"
  },
  "/_nuxt/Sa3GyR5C.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"6ee6-lhJN5C4nO4UXhLum9dWE7uYwR5o\"",
    "mtime": "2026-03-17T17:11:38.410Z",
    "size": 28390,
    "path": "../public/_nuxt/Sa3GyR5C.js.gz"
  },
  "/_nuxt/SideBar.B0x6Jz__.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"4c09-eQN3uWPpCogwR6Afcg9zDHkebUQ\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 19465,
    "path": "../public/_nuxt/SideBar.B0x6Jz__.css"
  },
  "/_nuxt/SideBar.B0x6Jz__.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"daa-v9kyuQ5Io5VjF2URIq4c1/SQanE\"",
    "mtime": "2026-03-17T17:11:38.354Z",
    "size": 3498,
    "path": "../public/_nuxt/SideBar.B0x6Jz__.css.gz"
  },
  "/_nuxt/SjHAIU92.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"140a-oa2TteYUwUMj6+FSzKnUqbQNxfc\"",
    "mtime": "2026-03-17T17:11:35.675Z",
    "size": 5130,
    "path": "../public/_nuxt/SjHAIU92.js"
  },
  "/_nuxt/SjHAIU92.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"74d-Zf4era9sPqq+eROZeO0D3FD039A\"",
    "mtime": "2026-03-17T17:12:18.989Z",
    "size": 1869,
    "path": "../public/_nuxt/SjHAIU92.js.br"
  },
  "/_nuxt/SjHAIU92.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"815-tEg2rcS1unUhh+GVJyl/pcq4HN0\"",
    "mtime": "2026-03-17T17:12:18.987Z",
    "size": 2069,
    "path": "../public/_nuxt/SjHAIU92.js.gz"
  },
  "/_nuxt/SXcjEB42.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"671e-S5NQx7Z5qhZ8yZvqToxZL7zRRsE\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 26398,
    "path": "../public/_nuxt/SXcjEB42.js"
  },
  "/_nuxt/SXcjEB42.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"2452-nkeP6ZecsUJmVc0FWtDoeBYgWZo\"",
    "mtime": "2026-03-17T17:11:38.354Z",
    "size": 9298,
    "path": "../public/_nuxt/SXcjEB42.js.gz"
  },
  "/_nuxt/tag.GWGiIyFP.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"5bdf-F2q9KvE9aPkChgAN7VtNzmyIKno\"",
    "mtime": "2026-03-17T17:11:35.670Z",
    "size": 23519,
    "path": "../public/_nuxt/tag.GWGiIyFP.css"
  },
  "/_nuxt/tag.GWGiIyFP.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"d2d-n06c3PhJsAV8CVAjjTZ7U0NYQS0\"",
    "mtime": "2026-03-17T17:11:38.354Z",
    "size": 3373,
    "path": "../public/_nuxt/tag.GWGiIyFP.css.gz"
  },
  "/_nuxt/Ufm_odmG.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3fd8-fhXFDwU0pcqtA0ReA0Orrhf6WNQ\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 16344,
    "path": "../public/_nuxt/Ufm_odmG.js"
  },
  "/_nuxt/Ufm_odmG.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1853-1AcIKwGfrCZww5xXl/cFaEcpF5U\"",
    "mtime": "2026-03-17T17:11:38.354Z",
    "size": 6227,
    "path": "../public/_nuxt/Ufm_odmG.js.gz"
  },
  "/_nuxt/vaK0vZtc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2d94-G9O1vFaLP+K/WU4aRJUC+Kq1+ZU\"",
    "mtime": "2026-03-17T17:11:35.672Z",
    "size": 11668,
    "path": "../public/_nuxt/vaK0vZtc.js"
  },
  "/_nuxt/vaK0vZtc.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"1398-VYnI3NckwfeWIUgAtjlmZJqSGDc\"",
    "mtime": "2026-03-17T17:11:38.354Z",
    "size": 5016,
    "path": "../public/_nuxt/vaK0vZtc.js.gz"
  },
  "/_nuxt/vLlmbW-K.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"763-SFLhT0nMq4hoOD1+xUM3co7G+S4\"",
    "mtime": "2026-03-17T17:11:35.676Z",
    "size": 1891,
    "path": "../public/_nuxt/vLlmbW-K.js"
  },
  "/_nuxt/vLlmbW-K.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2dc-/OpvTkg0Rh6cHYMOVKNIkbsmS3s\"",
    "mtime": "2026-03-17T17:12:18.989Z",
    "size": 732,
    "path": "../public/_nuxt/vLlmbW-K.js.br"
  },
  "/_nuxt/vLlmbW-K.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"338-OrtmiJIO3hkZUfUd5IPjAmBg26Q\"",
    "mtime": "2026-03-17T17:12:18.988Z",
    "size": 824,
    "path": "../public/_nuxt/vLlmbW-K.js.gz"
  },
  "/_nuxt/wAsdV37c.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"3c0-mUkUiEGUVGGeaORIpPc4OFyPTL0\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 960,
    "path": "../public/_nuxt/wAsdV37c.js"
  },
  "/_nuxt/wxst0i1d.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"69c-4//Ivf3lewffUvCZBy1zE4Fj+OI\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 1692,
    "path": "../public/_nuxt/wxst0i1d.js"
  },
  "/_nuxt/wxst0i1d.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"2a7-86GWgyP+VIZhGelxAL5/mzf7Ejg\"",
    "mtime": "2026-03-17T17:12:19.059Z",
    "size": 679,
    "path": "../public/_nuxt/wxst0i1d.js.br"
  },
  "/_nuxt/wxst0i1d.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"308-JrT6flyPmD4LKU8XZV7ciY0tZzQ\"",
    "mtime": "2026-03-17T17:12:19.059Z",
    "size": 776,
    "path": "../public/_nuxt/wxst0i1d.js.gz"
  },
  "/_nuxt/ycZsTBb-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"59bb-2M39YTNbbjrTLkwn5TUodASM6VU\"",
    "mtime": "2026-03-17T17:11:35.675Z",
    "size": 22971,
    "path": "../public/_nuxt/ycZsTBb-.js"
  },
  "/_nuxt/ycZsTBb-.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"286c-RLKpBdDQlCga44IJIevnTWCAAYY\"",
    "mtime": "2026-03-17T17:11:38.354Z",
    "size": 10348,
    "path": "../public/_nuxt/ycZsTBb-.js.gz"
  },
  "/_nuxt/YV6pgnrJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"18ba2-4AxnCQSpO5zsM6BSs3PXbO/wk04\"",
    "mtime": "2026-03-17T17:11:35.674Z",
    "size": 101282,
    "path": "../public/_nuxt/YV6pgnrJ.js"
  },
  "/_nuxt/YV6pgnrJ.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"8359-yN+eTN8DznKdPlZFSQIY99Bjly8\"",
    "mtime": "2026-03-17T17:11:38.445Z",
    "size": 33625,
    "path": "../public/_nuxt/YV6pgnrJ.js.gz"
  },
  "/_nuxt/ZiTiGuanJiaHeiTi-1.3MxoPTpZ.ttf": {
    "type": "font/ttf",
    "etag": "\"a7801c-psRCG2xdQHDyrrynfzlMMHxWwKM\"",
    "mtime": "2026-03-17T17:11:36.182Z",
    "size": 10977308,
    "path": "../public/_nuxt/ZiTiGuanJiaHeiTi-1.3MxoPTpZ.ttf"
  },
  "/_nuxt/ZiTiGuanJiaHeiTi-1.3MxoPTpZ.ttf.br": {
    "type": "font/ttf",
    "encoding": "br",
    "etag": "\"6231a7-IiihupCLU8eINvQ1nxqBHpQGiN0\"",
    "mtime": "2026-03-17T17:13:03.774Z",
    "size": 6435239,
    "path": "../public/_nuxt/ZiTiGuanJiaHeiTi-1.3MxoPTpZ.ttf.br"
  },
  "/_nuxt/ZiTiGuanJiaHeiTi-1.3MxoPTpZ.ttf.gz": {
    "type": "font/ttf",
    "encoding": "gzip",
    "etag": "\"6e76b0-pivt2UFGdDRyGEOZlLi3uLvntqo\"",
    "mtime": "2026-03-17T17:12:20.417Z",
    "size": 7239344,
    "path": "../public/_nuxt/ZiTiGuanJiaHeiTi-1.3MxoPTpZ.ttf.gz"
  },
  "/_nuxt/ZXfAyPTL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9d5-e97eMejt72jA1LVSCEz2L9N/0jA\"",
    "mtime": "2026-03-17T17:11:35.679Z",
    "size": 2517,
    "path": "../public/_nuxt/ZXfAyPTL.js"
  },
  "/_nuxt/ZXfAyPTL.js.br": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "br",
    "etag": "\"43f-KpTew5sPxS9MHRL3qXEew7Lz7co\"",
    "mtime": "2026-03-17T17:12:19.061Z",
    "size": 1087,
    "path": "../public/_nuxt/ZXfAyPTL.js.br"
  },
  "/_nuxt/ZXfAyPTL.js.gz": {
    "type": "text/javascript; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"4e8-ZxcsdpEldqR3lyPlY+WgCC4/DC0\"",
    "mtime": "2026-03-17T17:12:19.059Z",
    "size": 1256,
    "path": "../public/_nuxt/ZXfAyPTL.js.gz"
  },
  "/_nuxt/_id_.BrPkno_a.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"4877-CRwiOIF0R1OXyGw/RP7cy+et724\"",
    "mtime": "2026-03-17T17:11:35.670Z",
    "size": 18551,
    "path": "../public/_nuxt/_id_.BrPkno_a.css"
  },
  "/_nuxt/_id_.BrPkno_a.css.gz": {
    "type": "text/css; charset=utf-8",
    "encoding": "gzip",
    "etag": "\"bb4-6h4K6HuXYjt6A/cuu9jw7txoHFc\"",
    "mtime": "2026-03-17T17:11:38.354Z",
    "size": 2996,
    "path": "../public/_nuxt/_id_.BrPkno_a.css.gz"
  },
  "/_nuxt/builds/latest.json": {
    "type": "application/json",
    "etag": "\"47-O7L4PQLg+kDt4MGg55kkff6BUpw\"",
    "mtime": "2026-03-17T17:12:16.888Z",
    "size": 71,
    "path": "../public/_nuxt/builds/latest.json"
  },
  "/_nuxt/builds/meta/0391ee58-5e48-4a27-8bf7-e190eff263e9.json": {
    "type": "application/json",
    "etag": "\"bb-xtD+QsrMHRipT+zA/oqgofTJfvA\"",
    "mtime": "2026-03-17T17:12:16.888Z",
    "size": 187,
    "path": "../public/_nuxt/builds/meta/0391ee58-5e48-4a27-8bf7-e190eff263e9.json"
  }
};

const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
  if (!input) {
    return input;
  }
  return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
function cwd() {
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    return process.cwd().replace(/\\/g, "/");
  }
  return "/";
}
const resolve$1 = function(...arguments_) {
  arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
    const path = index >= 0 ? arguments_[index] : cwd();
    if (!path || path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute(path);
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) {
      char = path[index];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === index - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = index;
            dots = 0;
            continue;
          } else if (res.length > 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = index;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path.slice(lastSlash + 1, index)}`;
        } else {
          res = path.slice(lastSlash + 1, index);
        }
        lastSegmentLength = index - lastSlash - 1;
      }
      lastSlash = index;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
};
const dirname = function(p) {
  const segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
  if (segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0])) {
    segments[0] += "/";
  }
  return segments.join("/") || (isAbsolute(p) ? "/" : ".");
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve$1(serverDir, assets[id].path))
}

const publicAssetBases = {"/_nuxt/builds/meta/":{"maxAge":31536000},"/_nuxt/builds/":{"maxAge":1},"/_nuxt/":{"maxAge":31536000}};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _xYUv4t = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  if (encodings.length > 1) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError$1({ statusCode: 404 });
    }
    return;
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

const _KStmQI = defineEventHandler((event) => {
  const url = new URL(event.node.req.url || "/", "http://localhost");
  const path = url.pathname;
  const isProtectedAPI = path.startsWith("/api/admin") && path !== "/api/admin/login";
  if (!isProtectedAPI) {
    return;
  }
  const token = getHeader(event, "token") || "";
  if (!token) {
    setResponseStatus(event, 401);
    return { code: "UNAUTHORIZED", message: "\u672A\u767B\u5F55\u6216\u767B\u5F55\u8FC7\u671F" };
  }
  const secret = useRuntimeConfig().authSecret || "dev-secret";
  try {
    const payload = jwt.verify(token, secret);
    event.context.auth = {
      username: payload.sub,
      timestamp: Date.now().toString()
    };
  } catch (e) {
    setResponseStatus(event, 401);
    return {
      code: "INVALID_TOKEN",
      message: "Token \u9A8C\u8BC1\u5931\u8D25\u6216\u5DF2\u8FC7\u671F"
    };
  }
});

const VueResolver = (_, value) => {
  return isRef(value) ? toValue(value) : value;
};

const headSymbol = "usehead";
// @__NO_SIDE_EFFECTS__
function vueInstall(head) {
  const plugin = {
    install(app) {
      app.config.globalProperties.$unhead = head;
      app.config.globalProperties.$head = head;
      app.provide(headSymbol, head);
    }
  };
  return plugin.install;
}

// @__NO_SIDE_EFFECTS__
function injectHead() {
  if (hasInjectionContext()) {
    const instance = inject(headSymbol);
    if (!instance) {
      throw new Error("useHead() was called without provide context, ensure you call it through the setup() function.");
    }
    return instance;
  }
  throw new Error("useHead() was called without provide context, ensure you call it through the setup() function.");
}
function useHead(input, options = {}) {
  const head = options.head || /* @__PURE__ */ injectHead();
  return head.ssr ? head.push(input || {}, options) : clientUseHead(head, input, options);
}
function clientUseHead(head, input, options = {}) {
  const deactivated = ref(false);
  let entry;
  watchEffect(() => {
    const i = deactivated.value ? {} : walkResolver(input, VueResolver);
    if (entry) {
      entry.patch(i);
    } else {
      entry = head.push(i, options);
    }
  });
  const vm = getCurrentInstance();
  if (vm) {
    onBeforeUnmount(() => {
      entry.dispose();
    });
    onDeactivated(() => {
      deactivated.value = true;
    });
    onActivated(() => {
      deactivated.value = false;
    });
  }
  return entry;
}
function useSeoMeta(input = {}, options = {}) {
  const head = options.head || /* @__PURE__ */ injectHead();
  head.use(FlatMetaPlugin);
  const { title, titleTemplate, ...meta } = input;
  return useHead({
    title,
    titleTemplate,
    _flatMeta: meta
  }, options);
}

// @__NO_SIDE_EFFECTS__
function resolveUnrefHeadInput(input) {
  return walkResolver(input, VueResolver);
}

const createHeadCore = createUnhead;

// @__NO_SIDE_EFFECTS__
function createHead(options = {}) {
  const head = createHead$1({
    ...options,
    propResolvers: [VueResolver]
  });
  head.install = vueInstall(head);
  return head;
}

const unheadOptions = {
  disableDefaults: true,
};

function createSSRContext(event) {
  const ssrContext = {
    url: event.path,
    event,
    runtimeConfig: useRuntimeConfig(event),
    noSSR: event.context.nuxt?.noSSR || (false),
    head: createHead(unheadOptions),
    error: false,
    nuxt: void 0,
    /* NuxtApp */
    payload: {},
    _payloadReducers: /* @__PURE__ */ Object.create(null),
    modules: /* @__PURE__ */ new Set()
  };
  return ssrContext;
}
function setSSRError(ssrContext, error) {
  ssrContext.error = true;
  ssrContext.payload = { error };
  ssrContext.url = error.url;
}

const APP_ROOT_OPEN_TAG = `<${appRootTag}${propsToString(appRootAttrs)}>`;
const APP_ROOT_CLOSE_TAG = `</${appRootTag}>`;
const getServerEntry = () => import('../build/server.mjs').then((r) => r.default || r);
const getPrecomputedDependencies = () => import('../build/client.precomputed.mjs').then((r) => r.default || r).then((r) => typeof r === "function" ? r() : r);
const getSSRRenderer = lazyCachedFunction(async () => {
  const createSSRApp = await getServerEntry();
  if (!createSSRApp) {
    throw new Error("Server bundle is not available");
  }
  const precomputed = await getPrecomputedDependencies();
  const renderer = createRenderer(createSSRApp, {
    precomputed,
    manifest: void 0,
    renderToString: renderToString$1,
    buildAssetsURL
  });
  async function renderToString$1(input, context) {
    const html = await renderToString(input, context);
    return APP_ROOT_OPEN_TAG + html + APP_ROOT_CLOSE_TAG;
  }
  return renderer;
});
const getSPARenderer = lazyCachedFunction(async () => {
  const precomputed = await getPrecomputedDependencies();
  const spaTemplate = await import('../virtual/_virtual_spa-template.mjs').then((r) => r.template).catch(() => "").then((r) => {
    {
      const APP_SPA_LOADER_OPEN_TAG = `<${appSpaLoaderTag}${propsToString(appSpaLoaderAttrs)}>`;
      const APP_SPA_LOADER_CLOSE_TAG = `</${appSpaLoaderTag}>`;
      const appTemplate = APP_ROOT_OPEN_TAG + APP_ROOT_CLOSE_TAG;
      const loaderTemplate = r ? APP_SPA_LOADER_OPEN_TAG + r + APP_SPA_LOADER_CLOSE_TAG : "";
      return appTemplate + loaderTemplate;
    }
  });
  const renderer = createRenderer(() => () => {
  }, {
    precomputed,
    manifest: void 0,
    renderToString: () => spaTemplate,
    buildAssetsURL
  });
  const result = await renderer.renderToString({});
  const renderToString = (ssrContext) => {
    const config = useRuntimeConfig(ssrContext.event);
    ssrContext.modules ||= /* @__PURE__ */ new Set();
    ssrContext.payload.serverRendered = false;
    ssrContext.config = {
      public: config.public,
      app: config.app
    };
    return Promise.resolve(result);
  };
  return {
    rendererContext: renderer.rendererContext,
    renderToString
  };
});
function lazyCachedFunction(fn) {
  let res = null;
  return () => {
    if (res === null) {
      res = fn().catch((err) => {
        res = null;
        throw err;
      });
    }
    return res;
  };
}
function getRenderer(ssrContext) {
  return ssrContext.noSSR ? getSPARenderer() : getSSRRenderer();
}
const getSSRStyles = lazyCachedFunction(() => import('../build/styles.mjs').then((r) => r.default || r));

async function renderInlineStyles(usedModules) {
  const styleMap = await getSSRStyles();
  const inlinedStyles = /* @__PURE__ */ new Set();
  for (const mod of usedModules) {
    if (mod in styleMap && styleMap[mod]) {
      for (const style of await styleMap[mod]()) {
        inlinedStyles.add(style);
      }
    }
  }
  return Array.from(inlinedStyles).map((style) => ({ innerHTML: style }));
}

const ROOT_NODE_REGEX = new RegExp(`^<${appRootTag}[^>]*>([\\s\\S]*)<\\/${appRootTag}>$`);
function getServerComponentHTML(body) {
  const match = body.match(ROOT_NODE_REGEX);
  return match?.[1] || body;
}
const SSR_SLOT_TELEPORT_MARKER = /^uid=([^;]*);slot=(.*)$/;
const SSR_CLIENT_TELEPORT_MARKER = /^uid=([^;]*);client=(.*)$/;
const SSR_CLIENT_SLOT_MARKER = /^island-slot=([^;]*);(.*)$/;
function getSlotIslandResponse(ssrContext) {
  if (!ssrContext.islandContext || !Object.keys(ssrContext.islandContext.slots).length) {
    return void 0;
  }
  const response = {};
  for (const [name, slot] of Object.entries(ssrContext.islandContext.slots)) {
    response[name] = {
      ...slot,
      fallback: ssrContext.teleports?.[`island-fallback=${name}`]
    };
  }
  return response;
}
function getClientIslandResponse(ssrContext) {
  if (!ssrContext.islandContext || !Object.keys(ssrContext.islandContext.components).length) {
    return void 0;
  }
  const response = {};
  for (const [clientUid, component] of Object.entries(ssrContext.islandContext.components)) {
    const html = ssrContext.teleports?.[clientUid]?.replaceAll("<!--teleport start anchor-->", "") || "";
    response[clientUid] = {
      ...component,
      html,
      slots: getComponentSlotTeleport(clientUid, ssrContext.teleports ?? {})
    };
  }
  return response;
}
function getComponentSlotTeleport(clientUid, teleports) {
  const entries = Object.entries(teleports);
  const slots = {};
  for (const [key, value] of entries) {
    const match = key.match(SSR_CLIENT_SLOT_MARKER);
    if (match) {
      const [, id, slot] = match;
      if (!slot || clientUid !== id) {
        continue;
      }
      slots[slot] = value;
    }
  }
  return slots;
}
function replaceIslandTeleports(ssrContext, html) {
  const { teleports, islandContext } = ssrContext;
  if (islandContext || !teleports) {
    return html;
  }
  for (const key in teleports) {
    const matchClientComp = key.match(SSR_CLIENT_TELEPORT_MARKER);
    if (matchClientComp) {
      const [, uid, clientId] = matchClientComp;
      if (!uid || !clientId) {
        continue;
      }
      html = html.replace(new RegExp(` data-island-uid="${uid}" data-island-component="${clientId}"[^>]*>`), (full) => {
        return full + teleports[key];
      });
      continue;
    }
    const matchSlot = key.match(SSR_SLOT_TELEPORT_MARKER);
    if (matchSlot) {
      const [, uid, slot] = matchSlot;
      if (!uid || !slot) {
        continue;
      }
      html = html.replace(new RegExp(` data-island-uid="${uid}" data-island-slot="${slot}"[^>]*>`), (full) => {
        return full + teleports[key];
      });
    }
  }
  return html;
}

const ISLAND_SUFFIX_RE = /\.json(?:\?.*)?$/;
const _SxA8c9 = defineEventHandler(async (event) => {
  const nitroApp = useNitroApp();
  setResponseHeaders(event, {
    "content-type": "application/json;charset=utf-8",
    "x-powered-by": "Nuxt"
  });
  const islandContext = await getIslandContext(event);
  const ssrContext = {
    ...createSSRContext(event),
    islandContext,
    noSSR: false,
    url: islandContext.url
  };
  const renderer = await getSSRRenderer();
  const renderResult = await renderer.renderToString(ssrContext).catch(async (err) => {
    await ssrContext.nuxt?.hooks.callHook("app:error", err);
    throw err;
  });
  if (ssrContext.payload?.error) {
    throw ssrContext.payload.error;
  }
  const inlinedStyles = await renderInlineStyles(ssrContext.modules ?? []);
  await ssrContext.nuxt?.hooks.callHook("app:rendered", { ssrContext, renderResult });
  if (inlinedStyles.length) {
    ssrContext.head.push({ style: inlinedStyles });
  }
  const islandHead = {};
  for (const entry of ssrContext.head.entries.values()) {
    for (const [key, value] of Object.entries(resolveUnrefHeadInput(entry.input))) {
      const currentValue = islandHead[key];
      if (Array.isArray(currentValue)) {
        currentValue.push(...value);
      }
      islandHead[key] = value;
    }
  }
  const islandResponse = {
    id: islandContext.id,
    head: islandHead,
    html: getServerComponentHTML(renderResult.html),
    components: getClientIslandResponse(ssrContext),
    slots: getSlotIslandResponse(ssrContext)
  };
  await nitroApp.hooks.callHook("render:island", islandResponse, { event, islandContext });
  return islandResponse;
});
async function getIslandContext(event) {
  let url = event.path || "";
  const componentParts = url.substring("/__nuxt_island".length + 1).replace(ISLAND_SUFFIX_RE, "").split("_");
  const hashId = componentParts.length > 1 ? componentParts.pop() : void 0;
  const componentName = componentParts.join("_");
  const context = event.method === "GET" ? getQuery(event) : await readBody(event);
  const ctx = {
    url: "/",
    ...context,
    id: hashId,
    name: componentName,
    props: destr(context.props) || {},
    slots: {},
    components: {}
  };
  return ctx;
}

const _q2Ne7o = eventHandler(async (e) => {
  if (e.context._initedSiteConfig)
    return;
  const runtimeConfig = useRuntimeConfig(e);
  const config = runtimeConfig["nuxt-site-config"];
  const nitroApp = useNitroApp();
  const siteConfig = e.context.siteConfig || createSiteConfigStack({
    debug: config.debug
  });
  const nitroOrigin = getNitroOrigin(e);
  e.context.siteConfigNitroOrigin = nitroOrigin;
  {
    siteConfig.push({
      _context: "nitro:init",
      _priority: -4,
      url: nitroOrigin
    });
  }
  siteConfig.push({
    _context: "runtimeEnv",
    _priority: 0,
    ...runtimeConfig.site || {},
    ...runtimeConfig.public.site || {},
    ...envSiteConfig(globalThis._importMeta_.env)
    // just in-case, shouldn't be needed
  });
  const buildStack = config.stack || [];
  buildStack.forEach((c) => siteConfig.push(c));
  if (e.context._nitro.routeRules.site) {
    siteConfig.push({
      _context: "route-rules",
      ...e.context._nitro.routeRules.site
    });
  }
  if (config.multiTenancy) {
    const host = parseURL(nitroOrigin).host;
    const tenant = config.multiTenancy?.find((t) => t.hosts.includes(host));
    if (tenant) {
      siteConfig.push({
        _context: `multi-tenancy:${host}`,
        _priority: 0,
        ...tenant.config
      });
    }
  }
  const ctx = { siteConfig, event: e };
  await nitroApp.hooks.callHook("site-config:init", ctx);
  e.context.siteConfig = ctx.siteConfig;
  e.context._initedSiteConfig = true;
});

const _AnTRJi = defineEventHandler(async (e) => {
  const nitroApp = useNitroApp();
  const { indexable} = getSiteRobotConfig(e);
  const { credits, isNuxtContentV2, cacheControl } = useRuntimeConfigNuxtRobots(e);
  let robotsTxtCtx = {
    sitemaps: [],
    groups: [
      {
        allow: [],
        comment: [],
        userAgent: ["*"],
        disallow: ["/"]
      }
    ]
  };
  if (indexable) {
    robotsTxtCtx = await resolveRobotsTxtContext(e);
    robotsTxtCtx.sitemaps = [...new Set(
      asArray(robotsTxtCtx.sitemaps).map((s) => !s.startsWith("http") ? withSiteUrl(e, s, { withBase: true}) : s)
    )];
    if (isNuxtContentV2) {
      const contentWithRobotRules = await e.$fetch("/__robots__/nuxt-content.json", {
        headers: {
          Accept: "application/json"
        }
      });
      if (String(contentWithRobotRules).trim().startsWith("<!DOCTYPE")) {
        logger$2.error("Invalid HTML returned from /__robots__/nuxt-content.json, skipping.");
      } else {
        for (const group of robotsTxtCtx.groups) {
          if (group.userAgent.includes("*")) {
            group.disallow.push(...contentWithRobotRules);
            group.disallow = group.disallow.filter(Boolean);
          }
        }
      }
    }
  }
  let robotsTxt = generateRobotsTxt(robotsTxtCtx);
  if (credits) {
    robotsTxt = [
      `# START nuxt-robots (${indexable ? "indexable" : "indexing disabled"})`,
      robotsTxt,
      "# END nuxt-robots"
    ].filter(Boolean).join("\n");
  }
  setHeader(e, "Content-Type", "text/plain; charset=utf-8");
  setHeader(e, "Cache-Control", globalThis._importMeta_.test || !cacheControl ? "no-store" : cacheControl);
  const hookCtx = { robotsTxt, e };
  await nitroApp.hooks.callHook("robots:robots-txt", hookCtx);
  return hookCtx.robotsTxt;
});

const _D0Q3DA = defineEventHandler(async (e) => {
  if (e.path === "/robots.txt" || e.path.startsWith("/__") || e.path.startsWith("/api") || e.path.startsWith("/_nuxt"))
    return;
  const nuxtRobotsConfig = useRuntimeConfigNuxtRobots(e);
  if (nuxtRobotsConfig) {
    const { header } = nuxtRobotsConfig;
    const robotConfig = getPathRobotConfig(e, { skipSiteIndexable: Boolean(getQuery(e)?.mockProductionEnv) });
    if (header) {
      setHeader(e, "X-Robots-Tag", robotConfig.rule);
    }
    e.context.robots = robotConfig;
  }
});

const logger = createConsola({
  defaults: {
    tag: "@nuxt/sitemap"
  }
});
const merger = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) && Array.isArray(value))
    obj[key] = Array.from(/* @__PURE__ */ new Set([...obj[key], ...value]));
  return obj[key];
});
function mergeOnKey(arr, key) {
  const seen = /* @__PURE__ */ new Map();
  let resultLength = 0;
  const result = Array.from({ length: arr.length });
  for (const item of arr) {
    const k = item[key];
    if (seen.has(k)) {
      const existingIndex = seen.get(k);
      result[existingIndex] = merger(item, result[existingIndex]);
    } else {
      seen.set(k, resultLength);
      result[resultLength++] = item;
    }
  }
  return result.slice(0, resultLength);
}
function splitForLocales(path, locales) {
  const prefix = withLeadingSlash(path).split("/")[1];
  if (locales.includes(prefix))
    return [prefix, path.replace(`/${prefix}`, "")];
  return [null, path];
}
const StringifiedRegExpPattern = /\/(.*?)\/([gimsuy]*)$/;
function normalizeRuntimeFilters(input) {
  return (input || []).map((rule) => {
    if (rule instanceof RegExp || typeof rule === "string")
      return rule;
    const match = rule.regex.match(StringifiedRegExpPattern);
    if (match)
      return new RegExp(match[1], match[2]);
    return false;
  }).filter(Boolean);
}
function createPathFilter(options = {}) {
  const urlFilter = createFilter(options);
  return (loc) => {
    let path = loc;
    try {
      path = parseURL(loc).pathname;
    } catch {
      return false;
    }
    return urlFilter(path);
  };
}
function createFilter(options = {}) {
  const include = options.include || [];
  const exclude = options.exclude || [];
  if (include.length === 0 && exclude.length === 0)
    return () => true;
  return function(path) {
    for (const v of [{ rules: exclude, result: false }, { rules: include, result: true }]) {
      const regexRules = v.rules.filter((r) => r instanceof RegExp);
      if (regexRules.some((r) => r.test(path)))
        return v.result;
      const stringRules = v.rules.filter((r) => typeof r === "string");
      if (stringRules.length > 0) {
        const routes = {};
        for (const r of stringRules) {
          if (r === path)
            return v.result;
          routes[r] = true;
        }
        const routeRulesMatcher = toRouteMatcher(createRouter$1({ routes, strictTrailingSlash: false }));
        if (routeRulesMatcher.matchAll(path).length > 0)
          return Boolean(v.result);
      }
    }
    return include.length === 0;
  };
}

function xmlEscape(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function useSitemapRuntimeConfig(e) {
  const clone = JSON.parse(JSON.stringify(useRuntimeConfig(e).sitemap));
  for (const k in clone.sitemaps) {
    const sitemap = clone.sitemaps[k];
    sitemap.include = normalizeRuntimeFilters(sitemap.include);
    sitemap.exclude = normalizeRuntimeFilters(sitemap.exclude);
    clone.sitemaps[k] = sitemap;
  }
  return Object.freeze(clone);
}

function withoutQuery(path) {
  return path.split("?")[0];
}
function createNitroRouteRuleMatcher() {
  const { nitro, app } = useRuntimeConfig();
  const _routeRulesMatcher = toRouteMatcher(
    createRouter$1({
      routes: Object.fromEntries(
        Object.entries(nitro?.routeRules || {}).map(([path, rules]) => [path === "/" ? path : withoutTrailingSlash(path), rules])
      )
    })
  );
  return (pathOrUrl) => {
    const path = pathOrUrl[0] === "/" ? pathOrUrl : parseURL(pathOrUrl, app.baseURL).pathname;
    const pathWithoutQuery = withoutQuery(path);
    return defu({}, ..._routeRulesMatcher.matchAll(
      // radix3 does not support trailing slashes
      withoutBase(pathWithoutQuery === "/" ? pathWithoutQuery : withoutTrailingSlash(pathWithoutQuery), app.baseURL)
    ).reverse());
  };
}

function resolve(s, resolvers) {
  if (typeof s === "undefined" || !resolvers)
    return s;
  s = typeof s === "string" ? s : s.toString();
  if (hasProtocol(s, { acceptRelative: true, strict: false }))
    return resolvers.fixSlashes(s);
  return resolvers.canonicalUrlResolver(s);
}
function removeTrailingSlash(s) {
  return s.replace(/\/(\?|#|$)/, "$1");
}
function preNormalizeEntry(_e, resolvers) {
  const e = typeof _e === "string" ? { loc: _e } : { ..._e };
  if (e.url && !e.loc) {
    e.loc = e.url;
    delete e.url;
  }
  if (typeof e.loc !== "string") {
    e.loc = "";
  }
  e.loc = removeTrailingSlash(e.loc);
  e._abs = hasProtocol(e.loc, { acceptRelative: false, strict: false });
  try {
    e._path = e._abs ? parseURL(e.loc) : parsePath(e.loc);
  } catch (e2) {
    e2._path = null;
  }
  if (e._path) {
    const query = parseQuery(e._path.search);
    const qs = stringifyQuery(query);
    e._relativeLoc = `${encodePath(e._path?.pathname)}${qs.length ? `?${qs}` : ""}`;
    if (e._path.host) {
      e.loc = stringifyParsedURL(e._path);
    } else {
      e.loc = e._relativeLoc;
    }
  } else if (!isEncoded(e.loc)) {
    e.loc = encodeURI(e.loc);
  }
  if (e.loc === "")
    e.loc = `/`;
  e.loc = resolve(e.loc, resolvers);
  e._key = `${e._sitemap || ""}${withoutTrailingSlash(e.loc)}`;
  return e;
}
function isEncoded(url) {
  try {
    return url !== decodeURIComponent(url);
  } catch {
    return false;
  }
}
function normaliseEntry(_e, defaults, resolvers) {
  const e = defu(_e, defaults);
  if (e.lastmod) {
    const date = normaliseDate(e.lastmod);
    if (date)
      e.lastmod = date;
    else
      delete e.lastmod;
  }
  if (!e.lastmod)
    delete e.lastmod;
  e.loc = resolve(e.loc, resolvers);
  if (e.alternatives) {
    const alternatives = e.alternatives.map((a) => ({ ...a }));
    for (let i = 0; i < alternatives.length; i++) {
      const alt = alternatives[i];
      if (typeof alt.href === "string") {
        alt.href = resolve(alt.href, resolvers);
      } else if (typeof alt.href === "object" && alt.href) {
        alt.href = resolve(alt.href.href, resolvers);
      }
    }
    e.alternatives = mergeOnKey(alternatives, "hreflang");
  }
  if (e.images) {
    const images = e.images.map((i) => ({ ...i }));
    for (let i = 0; i < images.length; i++) {
      images[i].loc = resolve(images[i].loc, resolvers);
    }
    e.images = mergeOnKey(images, "loc");
  }
  if (e.videos) {
    const videos = e.videos.map((v) => ({ ...v }));
    for (let i = 0; i < videos.length; i++) {
      if (videos[i].content_loc) {
        videos[i].content_loc = resolve(videos[i].content_loc, resolvers);
      }
    }
    e.videos = mergeOnKey(videos, "content_loc");
  }
  return e;
}
const IS_VALID_W3C_DATE = [
  /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/,
  /^\d{4}-[01]\d-[0-3]\d$/,
  /^\d{4}-[01]\d$/,
  /^\d{4}$/
];
function isValidW3CDate(d) {
  return IS_VALID_W3C_DATE.some((r) => r.test(d));
}
function normaliseDate(d) {
  if (typeof d === "string") {
    if (d.includes("T")) {
      const t = d.split("T")[1];
      if (!t.includes("+") && !t.includes("-") && !t.includes("Z")) {
        d += "Z";
      }
    }
    if (!isValidW3CDate(d))
      return false;
    d = new Date(d);
    d.setMilliseconds(0);
    if (Number.isNaN(d.getTime()))
      return false;
  }
  const z = (n) => `0${n}`.slice(-2);
  const date = `${d.getUTCFullYear()}-${z(d.getUTCMonth() + 1)}-${z(d.getUTCDate())}`;
  if (d.getUTCHours() > 0 || d.getUTCMinutes() > 0 || d.getUTCSeconds() > 0) {
    return `${date}T${z(d.getUTCHours())}:${z(d.getUTCMinutes())}:${z(d.getUTCSeconds())}Z`;
  }
  return date;
}

function isValidString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
function parseNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) {
    const num = Number.parseFloat(value.trim());
    return Number.isNaN(num) ? void 0 : num;
  }
  return void 0;
}
function parseInteger(value) {
  if (typeof value === "number") return Math.floor(value);
  if (typeof value === "string" && value.trim()) {
    const num = Number.parseInt(value.trim(), 10);
    return Number.isNaN(num) ? void 0 : num;
  }
  return void 0;
}
function extractUrlFromParsedElement(urlElement, warnings) {
  if (!isValidString(urlElement.loc)) {
    warnings.push({
      type: "validation",
      message: "URL entry missing required loc element",
      context: { url: String(urlElement.loc || "undefined") }
    });
    return null;
  }
  const urlObj = { loc: urlElement.loc };
  if (isValidString(urlElement.lastmod)) {
    urlObj.lastmod = urlElement.lastmod;
  }
  if (isValidString(urlElement.changefreq)) {
    const validFreqs = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"];
    if (validFreqs.includes(urlElement.changefreq)) {
      urlObj.changefreq = urlElement.changefreq;
    } else {
      warnings.push({
        type: "validation",
        message: "Invalid changefreq value",
        context: { url: urlElement.loc, field: "changefreq", value: urlElement.changefreq }
      });
    }
  }
  const priority = parseNumber(urlElement.priority);
  if (priority !== void 0 && !Number.isNaN(priority)) {
    if (priority < 0 || priority > 1) {
      warnings.push({
        type: "validation",
        message: "Priority value should be between 0.0 and 1.0, clamping to valid range",
        context: { url: urlElement.loc, field: "priority", value: priority }
      });
    }
    urlObj.priority = Math.max(0, Math.min(1, priority));
  } else if (urlElement.priority !== void 0) {
    warnings.push({
      type: "validation",
      message: "Invalid priority value",
      context: { url: urlElement.loc, field: "priority", value: urlElement.priority }
    });
  }
  if (urlElement.image) {
    const images = Array.isArray(urlElement.image) ? urlElement.image : [urlElement.image];
    const validImages = images.map((img) => {
      if (isValidString(img.loc)) {
        return { loc: img.loc };
      } else {
        warnings.push({
          type: "validation",
          message: "Image missing required loc element",
          context: { url: urlElement.loc, field: "image.loc" }
        });
        return null;
      }
    }).filter((img) => img !== null);
    if (validImages.length > 0) {
      urlObj.images = validImages;
    }
  }
  if (urlElement.video) {
    const videos = Array.isArray(urlElement.video) ? urlElement.video : [urlElement.video];
    const validVideos = videos.map((video) => {
      const missingFields = [];
      if (!isValidString(video.title)) missingFields.push("title");
      if (!isValidString(video.thumbnail_loc)) missingFields.push("thumbnail_loc");
      if (!isValidString(video.description)) missingFields.push("description");
      if (!isValidString(video.content_loc)) missingFields.push("content_loc");
      if (missingFields.length > 0) {
        warnings.push({
          type: "validation",
          message: `Video missing required fields: ${missingFields.join(", ")}`,
          context: { url: urlElement.loc, field: "video" }
        });
        return null;
      }
      const videoObj = {
        title: video.title,
        thumbnail_loc: video.thumbnail_loc,
        description: video.description,
        content_loc: video.content_loc
      };
      if (isValidString(video.player_loc)) {
        videoObj.player_loc = video.player_loc;
      }
      const duration = parseInteger(video.duration);
      if (duration !== void 0) {
        videoObj.duration = duration;
      } else if (video.duration !== void 0) {
        warnings.push({
          type: "validation",
          message: "Invalid video duration value",
          context: { url: urlElement.loc, field: "video.duration", value: video.duration }
        });
      }
      if (isValidString(video.expiration_date)) {
        videoObj.expiration_date = video.expiration_date;
      }
      const rating = parseNumber(video.rating);
      if (rating !== void 0) {
        if (rating < 0 || rating > 5) {
          warnings.push({
            type: "validation",
            message: "Video rating should be between 0.0 and 5.0",
            context: { url: urlElement.loc, field: "video.rating", value: rating }
          });
        }
        videoObj.rating = rating;
      } else if (video.rating !== void 0) {
        warnings.push({
          type: "validation",
          message: "Invalid video rating value",
          context: { url: urlElement.loc, field: "video.rating", value: video.rating }
        });
      }
      const viewCount = parseInteger(video.view_count);
      if (viewCount !== void 0) {
        videoObj.view_count = viewCount;
      } else if (video.view_count !== void 0) {
        warnings.push({
          type: "validation",
          message: "Invalid video view_count value",
          context: { url: urlElement.loc, field: "video.view_count", value: video.view_count }
        });
      }
      if (isValidString(video.publication_date)) {
        videoObj.publication_date = video.publication_date;
      }
      if (isValidString(video.family_friendly)) {
        const validValues = ["yes", "no"];
        if (validValues.includes(video.family_friendly)) {
          videoObj.family_friendly = video.family_friendly;
        } else {
          warnings.push({
            type: "validation",
            message: 'Invalid video family_friendly value, should be "yes" or "no"',
            context: { url: urlElement.loc, field: "video.family_friendly", value: video.family_friendly }
          });
        }
      }
      if (isValidString(video.requires_subscription)) {
        const validValues = ["yes", "no"];
        if (validValues.includes(video.requires_subscription)) {
          videoObj.requires_subscription = video.requires_subscription;
        } else {
          warnings.push({
            type: "validation",
            message: 'Invalid video requires_subscription value, should be "yes" or "no"',
            context: { url: urlElement.loc, field: "video.requires_subscription", value: video.requires_subscription }
          });
        }
      }
      if (isValidString(video.live)) {
        const validValues = ["yes", "no"];
        if (validValues.includes(video.live)) {
          videoObj.live = video.live;
        } else {
          warnings.push({
            type: "validation",
            message: 'Invalid video live value, should be "yes" or "no"',
            context: { url: urlElement.loc, field: "video.live", value: video.live }
          });
        }
      }
      if (video.restriction && typeof video.restriction === "object") {
        const restriction = video.restriction;
        if (isValidString(restriction.relationship) && isValidString(restriction["#text"])) {
          const validRelationships = ["allow", "deny"];
          if (validRelationships.includes(restriction.relationship)) {
            videoObj.restriction = {
              relationship: restriction.relationship,
              restriction: restriction["#text"]
            };
          } else {
            warnings.push({
              type: "validation",
              message: 'Invalid video restriction relationship, should be "allow" or "deny"',
              context: { url: urlElement.loc, field: "video.restriction.relationship", value: restriction.relationship }
            });
          }
        }
      }
      if (video.platform && typeof video.platform === "object") {
        const platform = video.platform;
        if (isValidString(platform.relationship) && isValidString(platform["#text"])) {
          const validRelationships = ["allow", "deny"];
          if (validRelationships.includes(platform.relationship)) {
            videoObj.platform = {
              relationship: platform.relationship,
              platform: platform["#text"]
            };
          } else {
            warnings.push({
              type: "validation",
              message: 'Invalid video platform relationship, should be "allow" or "deny"',
              context: { url: urlElement.loc, field: "video.platform.relationship", value: platform.relationship }
            });
          }
        }
      }
      if (video.price) {
        const prices = Array.isArray(video.price) ? video.price : [video.price];
        const validPrices = prices.map((price) => {
          const priceValue = price["#text"];
          if (priceValue == null || typeof priceValue !== "string" && typeof priceValue !== "number") {
            warnings.push({
              type: "validation",
              message: "Video price missing value",
              context: { url: urlElement.loc, field: "video.price" }
            });
            return null;
          }
          const validTypes = ["rent", "purchase", "package", "subscription"];
          if (price.type && !validTypes.includes(price.type)) {
            warnings.push({
              type: "validation",
              message: `Invalid video price type "${price.type}", should be one of: ${validTypes.join(", ")}`,
              context: { url: urlElement.loc, field: "video.price.type", value: price.type }
            });
          }
          return {
            price: String(priceValue),
            currency: price.currency,
            type: price.type
          };
        }).filter((p) => p !== null);
        if (validPrices.length > 0) {
          videoObj.price = validPrices;
        }
      }
      if (video.uploader && typeof video.uploader === "object") {
        const uploader = video.uploader;
        if (isValidString(uploader.info) && isValidString(uploader["#text"])) {
          videoObj.uploader = {
            uploader: uploader["#text"],
            info: uploader.info
          };
        } else {
          warnings.push({
            type: "validation",
            message: "Video uploader missing required info or name",
            context: { url: urlElement.loc, field: "video.uploader" }
          });
        }
      }
      if (video.tag) {
        const tags = Array.isArray(video.tag) ? video.tag : [video.tag];
        const validTags = tags.filter(isValidString);
        if (validTags.length > 0) {
          videoObj.tag = validTags;
        }
      }
      return videoObj;
    }).filter((video) => video !== null);
    if (validVideos.length > 0) {
      urlObj.videos = validVideos;
    }
  }
  if (urlElement.link) {
    const links = Array.isArray(urlElement.link) ? urlElement.link : [urlElement.link];
    const alternatives = links.map((link) => {
      if (link.rel === "alternate" && isValidString(link.hreflang) && isValidString(link.href)) {
        return {
          hreflang: link.hreflang,
          href: link.href
        };
      } else {
        warnings.push({
          type: "validation",
          message: 'Alternative link missing required rel="alternate", hreflang, or href',
          context: { url: urlElement.loc, field: "link" }
        });
        return null;
      }
    }).filter((alt) => alt !== null);
    if (alternatives.length > 0) {
      urlObj.alternatives = alternatives;
    }
  }
  if (urlElement.news && typeof urlElement.news === "object") {
    const news = urlElement.news;
    if (isValidString(news.title) && isValidString(news.publication_date) && news.publication && isValidString(news.publication.name) && isValidString(news.publication.language)) {
      urlObj.news = {
        title: news.title,
        publication_date: news.publication_date,
        publication: {
          name: news.publication.name,
          language: news.publication.language
        }
      };
    } else {
      warnings.push({
        type: "validation",
        message: "News entry missing required fields (title, publication_date, publication.name, publication.language)",
        context: { url: urlElement.loc, field: "news" }
      });
    }
  }
  const filteredUrlObj = Object.fromEntries(
    Object.entries(urlObj).filter(
      ([_, value]) => value != null && (!Array.isArray(value) || value.length > 0)
    )
  );
  return filteredUrlObj;
}
async function parseSitemapXml(xml) {
  const warnings = [];
  if (!xml) {
    throw new Error("Empty XML input provided");
  }
  const { XMLParser } = await import('fast-xml-parser');
  const parser = new XMLParser({
    isArray: (tagName) => ["url", "image", "video", "link", "tag", "price"].includes(tagName),
    removeNSPrefix: true,
    parseAttributeValue: false,
    ignoreAttributes: false,
    attributeNamePrefix: "",
    trimValues: true
  });
  try {
    const parsed = parser.parse(xml);
    if (!parsed?.urlset) {
      throw new Error("XML does not contain a valid urlset element");
    }
    if (!parsed.urlset.url) {
      throw new Error("Sitemap contains no URL entries");
    }
    const urls = Array.isArray(parsed.urlset.url) ? parsed.urlset.url : [parsed.urlset.url];
    const validUrls = urls.map((url) => extractUrlFromParsedElement(url, warnings)).filter((url) => url !== null);
    if (validUrls.length === 0 && urls.length > 0) {
      warnings.push({
        type: "validation",
        message: "No valid URLs found in sitemap after validation"
      });
    }
    return { urls: validUrls, warnings };
  } catch (error) {
    if (error instanceof Error && (error.message === "Empty XML input provided" || error.message === "XML does not contain a valid urlset element" || error.message === "Sitemap contains no URL entries")) {
      throw error;
    }
    throw new Error(`Failed to parse XML: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function tryFetchWithFallback(url, options, event) {
  const isExternalUrl = !url.startsWith("/");
  if (isExternalUrl) {
    const strategies = [
      // Strategy 1: Use globalThis.$fetch (original approach)
      () => globalThis.$fetch(url, options),
      // Strategy 2: If event is available, try using event context even for external URLs
      event ? () => event.$fetch(url, options) : null,
      // Strategy 3: Use native fetch as last resort
      () => $fetch(url, options)
    ].filter(Boolean);
    let lastError = null;
    for (const strategy of strategies) {
      try {
        return await strategy();
      } catch (error) {
        lastError = error;
        continue;
      }
    }
    throw lastError;
  }
  const fetchContainer = url.startsWith("/") && event ? event : globalThis;
  return await fetchContainer.$fetch(url, options);
}
async function fetchDataSource(input, event) {
  const context = typeof input.context === "string" ? { name: input.context } : input.context || { name: "fetch" };
  const url = typeof input.fetch === "string" ? input.fetch : input.fetch[0];
  const options = typeof input.fetch === "string" ? {} : input.fetch[1];
  const start = Date.now();
  const isExternalUrl = !url.startsWith("/");
  const timeout = isExternalUrl ? 1e4 : options.timeout || 5e3;
  const timeoutController = new AbortController();
  const abortRequestTimeout = setTimeout(() => timeoutController.abort(), timeout);
  try {
    let isMaybeErrorResponse = false;
    const isXmlRequest = parseURL(url).pathname.endsWith(".xml");
    const mergedHeaders = defu(
      options?.headers,
      {
        Accept: isXmlRequest ? "text/xml" : "application/json"
      },
      event ? { host: getRequestHost(event, { xForwardedHost: true }) } : {}
    );
    const fetchOptions = {
      ...options,
      responseType: isXmlRequest ? "text" : "json",
      signal: timeoutController.signal,
      headers: mergedHeaders,
      // Use ofetch's built-in retry for external sources
      ...isExternalUrl && {
        retry: 2,
        retryDelay: 200
      },
      // @ts-expect-error untyped
      onResponse({ response }) {
        if (typeof response._data === "string" && response._data.startsWith("<!DOCTYPE html>"))
          isMaybeErrorResponse = true;
      }
    };
    const res = await tryFetchWithFallback(url, fetchOptions, event);
    const timeTakenMs = Date.now() - start;
    if (isMaybeErrorResponse) {
      return {
        ...input,
        context,
        urls: [],
        timeTakenMs,
        error: "Received HTML response instead of JSON"
      };
    }
    let urls = [];
    if (typeof res === "object") {
      urls = res.urls || res;
    } else if (typeof res === "string" && parseURL(url).pathname.endsWith(".xml")) {
      const result = await parseSitemapXml(res);
      urls = result.urls;
    }
    return {
      ...input,
      context,
      timeTakenMs,
      urls
    };
  } catch (_err) {
    const error = _err;
    if (isExternalUrl) {
      const errorInfo = {
        url,
        timeout,
        error: error.message,
        statusCode: error.response?.status,
        statusText: error.response?.statusText,
        method: options?.method || "GET"
      };
      logger.error("Failed to fetch external source.", errorInfo);
    } else {
      logger.error("Failed to fetch source.", { url, error: error.message });
    }
    return {
      ...input,
      context,
      urls: [],
      error: error.message,
      _isFailure: true
      // Mark as failure to prevent caching
    };
  } finally {
    if (abortRequestTimeout) {
      clearTimeout(abortRequestTimeout);
    }
  }
}
async function globalSitemapSources() {
  const m = await import('../virtual/global-sources.mjs');
  return m.sources;
}
async function childSitemapSources(definition) {
  if (!definition?._hasSourceChunk)
    return [];
  const m = await import('../virtual/child-sources.mjs');
  return m.sources[definition.sitemapName] || [];
}
async function resolveSitemapSources(sources, event) {
  return (await Promise.all(
    sources.map((source) => {
      if (typeof source === "object" && "urls" in source) {
        return {
          timeTakenMs: 0,
          ...source,
          urls: source.urls
        };
      }
      if (source.fetch)
        return fetchDataSource(source, event);
      return {
        ...source,
        error: "Invalid source"
      };
    })
  )).flat();
}

function sortInPlace(urls) {
  urls.sort((a, b) => {
    const aLoc = typeof a === "string" ? a : a.loc;
    const bLoc = typeof b === "string" ? b : b.loc;
    const aSegments = aLoc.split("/").length;
    const bSegments = bLoc.split("/").length;
    if (aSegments !== bSegments) {
      return aSegments - bSegments;
    }
    return aLoc.localeCompare(bLoc, void 0, { numeric: true });
  });
  return urls;
}

function parseChunkInfo(sitemapName, sitemaps, defaultChunkSize) {
  defaultChunkSize = defaultChunkSize || 1e3;
  if (typeof sitemaps.chunks !== "undefined" && !Number.isNaN(Number(sitemapName))) {
    return {
      isChunked: true,
      baseSitemapName: "sitemap",
      chunkIndex: Number(sitemapName),
      chunkSize: defaultChunkSize
    };
  }
  if (sitemapName.includes("-")) {
    const parts = sitemapName.split("-");
    const lastPart = parts.pop();
    if (!Number.isNaN(Number(lastPart))) {
      const baseSitemapName = parts.join("-");
      const baseSitemap = sitemaps[baseSitemapName];
      if (baseSitemap && (baseSitemap.chunks || baseSitemap._isChunking)) {
        const chunkSize = typeof baseSitemap.chunks === "number" ? baseSitemap.chunks : baseSitemap.chunkSize || defaultChunkSize;
        return {
          isChunked: true,
          baseSitemapName,
          chunkIndex: Number(lastPart),
          chunkSize
        };
      }
    }
  }
  return {
    isChunked: false,
    baseSitemapName: sitemapName,
    chunkIndex: void 0,
    chunkSize: defaultChunkSize
  };
}
function getSitemapConfig(sitemapName, sitemaps, defaultChunkSize = 1e3) {
  const chunkInfo = parseChunkInfo(sitemapName, sitemaps, defaultChunkSize);
  if (chunkInfo.isChunked) {
    if (chunkInfo.baseSitemapName === "sitemap" && typeof sitemaps.chunks !== "undefined") {
      return {
        ...sitemaps.chunks,
        sitemapName,
        _isChunking: true,
        _chunkSize: chunkInfo.chunkSize
      };
    }
    const baseSitemap = sitemaps[chunkInfo.baseSitemapName];
    if (baseSitemap) {
      return {
        ...baseSitemap,
        sitemapName,
        // Use the full name with chunk index
        _isChunking: true,
        _chunkSize: chunkInfo.chunkSize
      };
    }
  }
  return sitemaps[sitemapName];
}
function sliceUrlsForChunk(urls, sitemapName, sitemaps, defaultChunkSize = 1e3) {
  const chunkInfo = parseChunkInfo(sitemapName, sitemaps, defaultChunkSize);
  if (chunkInfo.isChunked && chunkInfo.chunkIndex !== void 0) {
    const startIndex = chunkInfo.chunkIndex * chunkInfo.chunkSize;
    const endIndex = (chunkInfo.chunkIndex + 1) * chunkInfo.chunkSize;
    return urls.slice(startIndex, endIndex);
  }
  return urls;
}

function escapeValueForXml(value) {
  if (value === true || value === false)
    return value ? "yes" : "no";
  return xmlEscape(String(value));
}
const URLSET_OPENING_TAG = '<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
function buildUrlXml(url) {
  const capacity = 50;
  const parts = Array.from({ length: capacity });
  let partIndex = 0;
  parts[partIndex++] = "    <url>";
  if (url.loc) {
    parts[partIndex++] = `        <loc>${escapeValueForXml(url.loc)}</loc>`;
  }
  if (url.lastmod) {
    parts[partIndex++] = `        <lastmod>${url.lastmod}</lastmod>`;
  }
  if (url.changefreq) {
    parts[partIndex++] = `        <changefreq>${url.changefreq}</changefreq>`;
  }
  if (url.priority !== void 0) {
    const priorityValue = Number.parseFloat(String(url.priority));
    const formattedPriority = priorityValue % 1 === 0 ? String(priorityValue) : priorityValue.toFixed(1);
    parts[partIndex++] = `        <priority>${formattedPriority}</priority>`;
  }
  const keys = Object.keys(url).filter((k) => !k.startsWith("_") && !["loc", "lastmod", "changefreq", "priority"].includes(k));
  for (const key of keys) {
    const value = url[key];
    if (value === void 0 || value === null) continue;
    switch (key) {
      case "alternatives":
        if (Array.isArray(value) && value.length > 0) {
          for (const alt of value) {
            const attrs = Object.entries(alt).map(([k, v]) => `${k}="${escapeValueForXml(v)}"`).join(" ");
            parts[partIndex++] = `        <xhtml:link rel="alternate" ${attrs} />`;
          }
        }
        break;
      case "images":
        if (Array.isArray(value) && value.length > 0) {
          for (const img of value) {
            parts[partIndex++] = "        <image:image>";
            parts[partIndex++] = `            <image:loc>${escapeValueForXml(img.loc)}</image:loc>`;
            if (img.title) parts[partIndex++] = `            <image:title>${escapeValueForXml(img.title)}</image:title>`;
            if (img.caption) parts[partIndex++] = `            <image:caption>${escapeValueForXml(img.caption)}</image:caption>`;
            if (img.geo_location) parts[partIndex++] = `            <image:geo_location>${escapeValueForXml(img.geo_location)}</image:geo_location>`;
            if (img.license) parts[partIndex++] = `            <image:license>${escapeValueForXml(img.license)}</image:license>`;
            parts[partIndex++] = "        </image:image>";
          }
        }
        break;
      case "videos":
        if (Array.isArray(value) && value.length > 0) {
          for (const video of value) {
            parts[partIndex++] = "        <video:video>";
            parts[partIndex++] = `            <video:title>${escapeValueForXml(video.title)}</video:title>`;
            if (video.thumbnail_loc) {
              parts[partIndex++] = `            <video:thumbnail_loc>${escapeValueForXml(video.thumbnail_loc)}</video:thumbnail_loc>`;
            }
            parts[partIndex++] = `            <video:description>${escapeValueForXml(video.description)}</video:description>`;
            if (video.content_loc) {
              parts[partIndex++] = `            <video:content_loc>${escapeValueForXml(video.content_loc)}</video:content_loc>`;
            }
            if (video.player_loc) {
              const attrs = video.player_loc.allow_embed ? ' allow_embed="yes"' : "";
              const autoplay = video.player_loc.autoplay ? ' autoplay="yes"' : "";
              parts[partIndex++] = `            <video:player_loc${attrs}${autoplay}>${escapeValueForXml(video.player_loc)}</video:player_loc>`;
            }
            if (video.duration !== void 0) {
              parts[partIndex++] = `            <video:duration>${video.duration}</video:duration>`;
            }
            if (video.expiration_date) {
              parts[partIndex++] = `            <video:expiration_date>${video.expiration_date}</video:expiration_date>`;
            }
            if (video.rating !== void 0) {
              parts[partIndex++] = `            <video:rating>${video.rating}</video:rating>`;
            }
            if (video.view_count !== void 0) {
              parts[partIndex++] = `            <video:view_count>${video.view_count}</video:view_count>`;
            }
            if (video.publication_date) {
              parts[partIndex++] = `            <video:publication_date>${video.publication_date}</video:publication_date>`;
            }
            if (video.family_friendly !== void 0) {
              parts[partIndex++] = `            <video:family_friendly>${video.family_friendly === "yes" || video.family_friendly === true ? "yes" : "no"}</video:family_friendly>`;
            }
            if (video.restriction) {
              const relationship = video.restriction.relationship || "allow";
              parts[partIndex++] = `            <video:restriction relationship="${relationship}">${escapeValueForXml(video.restriction.restriction)}</video:restriction>`;
            }
            if (video.platform) {
              const relationship = video.platform.relationship || "allow";
              parts[partIndex++] = `            <video:platform relationship="${relationship}">${escapeValueForXml(video.platform.platform)}</video:platform>`;
            }
            if (video.requires_subscription !== void 0) {
              parts[partIndex++] = `            <video:requires_subscription>${video.requires_subscription === "yes" || video.requires_subscription === true ? "yes" : "no"}</video:requires_subscription>`;
            }
            if (video.price) {
              const prices = Array.isArray(video.price) ? video.price : [video.price];
              for (const price of prices) {
                const attrs = [];
                if (price.currency) attrs.push(`currency="${price.currency}"`);
                if (price.type) attrs.push(`type="${price.type}"`);
                const attrsStr = attrs.length > 0 ? " " + attrs.join(" ") : "";
                parts[partIndex++] = `            <video:price${attrsStr}>${escapeValueForXml(price.price)}</video:price>`;
              }
            }
            if (video.uploader) {
              const info = video.uploader.info ? ` info="${escapeValueForXml(video.uploader.info)}"` : "";
              parts[partIndex++] = `            <video:uploader${info}>${escapeValueForXml(video.uploader.uploader)}</video:uploader>`;
            }
            if (video.live !== void 0) {
              parts[partIndex++] = `            <video:live>${video.live === "yes" || video.live === true ? "yes" : "no"}</video:live>`;
            }
            if (video.tag) {
              const tags = Array.isArray(video.tag) ? video.tag : [video.tag];
              for (const tag of tags) {
                parts[partIndex++] = `            <video:tag>${escapeValueForXml(tag)}</video:tag>`;
              }
            }
            if (video.category) {
              parts[partIndex++] = `            <video:category>${escapeValueForXml(video.category)}</video:category>`;
            }
            if (video.gallery_loc) {
              const title = video.gallery_loc.title ? ` title="${escapeValueForXml(video.gallery_loc.title)}"` : "";
              parts[partIndex++] = `            <video:gallery_loc${title}>${escapeValueForXml(video.gallery_loc)}</video:gallery_loc>`;
            }
            parts[partIndex++] = "        </video:video>";
          }
        }
        break;
      case "news":
        if (value) {
          parts[partIndex++] = "        <news:news>";
          parts[partIndex++] = "            <news:publication>";
          parts[partIndex++] = `                <news:name>${escapeValueForXml(value.publication.name)}</news:name>`;
          parts[partIndex++] = `                <news:language>${escapeValueForXml(value.publication.language)}</news:language>`;
          parts[partIndex++] = "            </news:publication>";
          if (value.title) {
            parts[partIndex++] = `            <news:title>${escapeValueForXml(value.title)}</news:title>`;
          }
          if (value.publication_date) {
            parts[partIndex++] = `            <news:publication_date>${value.publication_date}</news:publication_date>`;
          }
          if (value.access) {
            parts[partIndex++] = `            <news:access>${value.access}</news:access>`;
          }
          if (value.genres) {
            parts[partIndex++] = `            <news:genres>${escapeValueForXml(value.genres)}</news:genres>`;
          }
          if (value.keywords) {
            parts[partIndex++] = `            <news:keywords>${escapeValueForXml(value.keywords)}</news:keywords>`;
          }
          if (value.stock_tickers) {
            parts[partIndex++] = `            <news:stock_tickers>${escapeValueForXml(value.stock_tickers)}</news:stock_tickers>`;
          }
          parts[partIndex++] = "        </news:news>";
        }
        break;
    }
  }
  parts[partIndex++] = "    </url>";
  return parts.slice(0, partIndex).join("\n");
}
function urlsToXml(urls, resolvers, { version, xsl, credits, minify }, errorInfo) {
  const estimatedSize = urls.length + 5;
  const xmlParts = Array.from({ length: estimatedSize });
  let partIndex = 0;
  let xslHref = xsl ? resolvers.relativeBaseUrlResolver(xsl) : false;
  if (xslHref && errorInfo && errorInfo.messages.length > 0) {
    xslHref = withQuery(xslHref, {
      errors: "true",
      error_messages: errorInfo.messages,
      error_urls: errorInfo.urls
    });
  }
  if (xslHref) {
    xmlParts[partIndex++] = `<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="${escapeValueForXml(xslHref)}"?>`;
  } else {
    xmlParts[partIndex++] = '<?xml version="1.0" encoding="UTF-8"?>';
  }
  xmlParts[partIndex++] = URLSET_OPENING_TAG;
  for (const url of urls) {
    xmlParts[partIndex++] = buildUrlXml(url);
  }
  xmlParts[partIndex++] = "</urlset>";
  if (credits) {
    xmlParts[partIndex++] = `<!-- XML Sitemap generated by @nuxtjs/sitemap v${version} at ${(/* @__PURE__ */ new Date()).toISOString()} -->`;
  }
  const xmlContent = xmlParts.slice(0, partIndex);
  if (minify) {
    return xmlContent.join("").replace(/(?<!<[^>]*)\s(?![^<]*>)/g, "");
  }
  return xmlContent.join("\n");
}

function resolveSitemapEntries(sitemap, urls, runtimeConfig, resolvers) {
  const {
    autoI18n,
    isI18nMapped
  } = runtimeConfig;
  const filterPath = createPathFilter({
    include: sitemap.include,
    exclude: sitemap.exclude
  });
  const _urls = urls.map((_e) => {
    const e = preNormalizeEntry(_e, resolvers);
    if (!e.loc || !filterPath(e.loc))
      return false;
    return e;
  }).filter(Boolean);
  let validI18nUrlsForTransform = [];
  const withoutPrefixPaths = {};
  if (autoI18n && autoI18n.strategy !== "no_prefix") {
    const localeCodes = autoI18n.locales.map((l) => l.code);
    validI18nUrlsForTransform = _urls.map((_e, i) => {
      if (_e._abs)
        return false;
      const split = splitForLocales(_e._relativeLoc, localeCodes);
      let localeCode = split[0];
      const pathWithoutPrefix = split[1];
      if (!localeCode)
        localeCode = autoI18n.defaultLocale;
      const e = _e;
      e._pathWithoutPrefix = pathWithoutPrefix;
      const locale = autoI18n.locales.find((l) => l.code === localeCode);
      if (!locale)
        return false;
      e._locale = locale;
      e._index = i;
      e._key = `${e._sitemap || ""}${e._path?.pathname || "/"}${e._path.search}`;
      withoutPrefixPaths[pathWithoutPrefix] = withoutPrefixPaths[pathWithoutPrefix] || [];
      if (!withoutPrefixPaths[pathWithoutPrefix].some((e2) => e2._locale.code === locale.code))
        withoutPrefixPaths[pathWithoutPrefix].push(e);
      return e;
    }).filter(Boolean);
    for (const e of validI18nUrlsForTransform) {
      if (!e._i18nTransform && !e.alternatives?.length) {
        const alternatives = withoutPrefixPaths[e._pathWithoutPrefix].map((u) => {
          const entries = [];
          if (u._locale.code === autoI18n.defaultLocale) {
            entries.push({
              href: u.loc,
              hreflang: "x-default"
            });
          }
          entries.push({
            href: u.loc,
            hreflang: u._locale._hreflang || autoI18n.defaultLocale
          });
          return entries;
        }).flat().filter(Boolean);
        if (alternatives.length)
          e.alternatives = alternatives;
      } else if (e._i18nTransform) {
        delete e._i18nTransform;
        if (autoI18n.strategy === "no_prefix") ;
        if (autoI18n.differentDomains) {
          e.alternatives = [
            {
              // apply default locale domain
              ...autoI18n.locales.find((l) => [l.code, l.language].includes(autoI18n.defaultLocale)),
              code: "x-default"
            },
            ...autoI18n.locales.filter((l) => !!l.domain)
          ].map((locale) => {
            return {
              hreflang: locale._hreflang,
              href: joinURL(withHttps(locale.domain), e._pathWithoutPrefix)
            };
          });
        } else {
          for (const l of autoI18n.locales) {
            let loc = e._pathWithoutPrefix;
            if (autoI18n.pages) {
              const pageKey = e._pathWithoutPrefix.replace(/^\//, "").replace(/\/index$/, "") || "index";
              const pageMappings = autoI18n.pages[pageKey];
              if (pageMappings && pageMappings[l.code] !== void 0) {
                const customPath = pageMappings[l.code];
                if (customPath === false)
                  continue;
                if (typeof customPath === "string")
                  loc = customPath.startsWith("/") ? customPath : `/${customPath}`;
              } else if (!autoI18n.differentDomains && !(["prefix_and_default", "prefix_except_default"].includes(autoI18n.strategy) && l.code === autoI18n.defaultLocale)) {
                loc = joinURL(`/${l.code}`, e._pathWithoutPrefix);
              }
            } else {
              if (!autoI18n.differentDomains && !(["prefix_and_default", "prefix_except_default"].includes(autoI18n.strategy) && l.code === autoI18n.defaultLocale))
                loc = joinURL(`/${l.code}`, e._pathWithoutPrefix);
            }
            const _sitemap = isI18nMapped ? l._sitemap : void 0;
            const newEntry = preNormalizeEntry({
              _sitemap,
              ...e,
              _index: void 0,
              _key: `${_sitemap || ""}${loc || "/"}${e._path.search}`,
              _locale: l,
              loc,
              alternatives: [{ code: "x-default", _hreflang: "x-default" }, ...autoI18n.locales].map((locale) => {
                const code = locale.code === "x-default" ? autoI18n.defaultLocale : locale.code;
                const isDefault = locale.code === "x-default" || locale.code === autoI18n.defaultLocale;
                let href = e._pathWithoutPrefix;
                if (autoI18n.pages) {
                  const pageKey = e._pathWithoutPrefix.replace(/^\//, "").replace(/\/index$/, "") || "index";
                  const pageMappings = autoI18n.pages[pageKey];
                  if (pageMappings && pageMappings[code] !== void 0) {
                    const customPath = pageMappings[code];
                    if (customPath === false)
                      return false;
                    if (typeof customPath === "string")
                      href = customPath.startsWith("/") ? customPath : `/${customPath}`;
                  } else if (autoI18n.strategy === "prefix") {
                    href = joinURL("/", code, e._pathWithoutPrefix);
                  } else if (["prefix_and_default", "prefix_except_default"].includes(autoI18n.strategy)) {
                    if (!isDefault) {
                      href = joinURL("/", code, e._pathWithoutPrefix);
                    }
                  }
                } else {
                  if (autoI18n.strategy === "prefix") {
                    href = joinURL("/", code, e._pathWithoutPrefix);
                  } else if (["prefix_and_default", "prefix_except_default"].includes(autoI18n.strategy)) {
                    if (!isDefault) {
                      href = joinURL("/", code, e._pathWithoutPrefix);
                    }
                  }
                }
                if (!filterPath(href))
                  return false;
                return {
                  hreflang: locale._hreflang,
                  href
                };
              }).filter(Boolean)
            }, resolvers);
            if (e._locale.code === newEntry._locale.code) {
              _urls[e._index] = newEntry;
              e._index = void 0;
            } else {
              _urls.push(newEntry);
            }
          }
        }
      }
      if (isI18nMapped) {
        e._sitemap = e._sitemap || e._locale._sitemap;
        e._key = `${e._sitemap || ""}${e.loc || "/"}${e._path.search}`;
      }
      if (e._index)
        _urls[e._index] = e;
    }
  }
  return _urls;
}
async function buildSitemapUrls(sitemap, resolvers, runtimeConfig, nitro) {
  const {
    sitemaps,
    // enhancing
    autoI18n,
    isI18nMapped,
    isMultiSitemap,
    // sorting
    sortEntries,
    // chunking
    defaultSitemapsChunkSize
  } = runtimeConfig;
  const chunkInfo = parseChunkInfo(sitemap.sitemapName, sitemaps, defaultSitemapsChunkSize);
  function maybeSort(urls2) {
    return sortEntries ? sortInPlace(urls2) : urls2;
  }
  function maybeSlice(urls2) {
    return sliceUrlsForChunk(urls2, sitemap.sitemapName, sitemaps, defaultSitemapsChunkSize);
  }
  if (autoI18n?.differentDomains) {
    const domain = autoI18n.locales.find((e) => [e.language, e.code].includes(sitemap.sitemapName))?.domain;
    if (domain) {
      const _tester = resolvers.canonicalUrlResolver;
      resolvers.canonicalUrlResolver = (path) => resolveSitePath(path, {
        absolute: true,
        withBase: false,
        siteUrl: withHttps(domain),
        trailingSlash: _tester("/test/").endsWith("/"),
        base: "/"
      });
    }
  }
  let effectiveSitemap = sitemap;
  const baseSitemapName = chunkInfo.baseSitemapName;
  if (chunkInfo.isChunked && baseSitemapName !== sitemap.sitemapName && sitemaps[baseSitemapName]) {
    effectiveSitemap = sitemaps[baseSitemapName];
  }
  let sourcesInput = effectiveSitemap.includeAppSources ? await globalSitemapSources() : [];
  sourcesInput.push(...await childSitemapSources(effectiveSitemap));
  if (nitro && resolvers.event) {
    const ctx = {
      event: resolvers.event,
      sitemapName: baseSitemapName,
      sources: sourcesInput
    };
    await nitro.hooks.callHook("sitemap:sources", ctx);
    sourcesInput = ctx.sources;
  }
  const sources = await resolveSitemapSources(sourcesInput, resolvers.event);
  const failedSources = sources.filter((source) => source.error && source._isFailure).map((source) => ({
    url: typeof source.fetch === "string" ? source.fetch : source.fetch?.[0] || "unknown",
    error: source.error || "Unknown error"
  }));
  const resolvedCtx = {
    urls: sources.flatMap((s) => s.urls),
    sitemapName: sitemap.sitemapName,
    event: resolvers.event
  };
  await nitro?.hooks.callHook("sitemap:input", resolvedCtx);
  const enhancedUrls = resolveSitemapEntries(sitemap, resolvedCtx.urls, { autoI18n, isI18nMapped }, resolvers);
  const filteredUrls = enhancedUrls.filter((e) => {
    if (e._sitemap === false)
      return false;
    if (isMultiSitemap && e._sitemap && sitemap.sitemapName) {
      if (sitemap._isChunking)
        return sitemap.sitemapName.startsWith(e._sitemap + "-");
      return e._sitemap === sitemap.sitemapName;
    }
    return true;
  });
  const sortedUrls = maybeSort(filteredUrls);
  const urls = maybeSlice(sortedUrls);
  return { urls, failedSources };
}

function useNitroUrlResolvers(e) {
  const canonicalQuery = getQuery(e).canonical;
  const isShowingCanonical = typeof canonicalQuery !== "undefined" && canonicalQuery !== "false";
  const siteConfig = useSiteConfig(e);
  return {
    event: e,
    fixSlashes: (path) => fixSlashes(siteConfig.trailingSlash, path),
    // we need these as they depend on the nitro event
    canonicalUrlResolver: createSitePathResolver(e, {
      canonical: isShowingCanonical || true,
      absolute: true,
      withBase: true
    }),
    relativeBaseUrlResolver: createSitePathResolver(e, { absolute: false, withBase: true })
  };
}
async function buildSitemapXml(event, definition, resolvers, runtimeConfig) {
  const { sitemapName } = definition;
  const nitro = useNitroApp();
  const { urls: sitemapUrls, failedSources } = await buildSitemapUrls(definition, resolvers, runtimeConfig, nitro);
  const routeRuleMatcher = createNitroRouteRuleMatcher();
  const { autoI18n } = runtimeConfig;
  let validCount = 0;
  for (let i = 0; i < sitemapUrls.length; i++) {
    const u = sitemapUrls[i];
    const path = u._path?.pathname || u.loc;
    if (!getPathRobotConfig(event, { path, skipSiteIndexable: true }).indexable)
      continue;
    let routeRules = routeRuleMatcher(path);
    if (autoI18n?.locales && autoI18n?.strategy !== "no_prefix") {
      const match = splitForLocales(path, autoI18n.locales.map((l) => l.code));
      const pathWithoutPrefix = match[1];
      if (pathWithoutPrefix && pathWithoutPrefix !== path)
        routeRules = defu(routeRules, routeRuleMatcher(pathWithoutPrefix));
    }
    if (routeRules.sitemap === false)
      continue;
    if (typeof routeRules.robots !== "undefined" && !routeRules.robots)
      continue;
    const hasRobotsDisabled = Object.entries(routeRules.headers || {}).some(([name, value]) => name.toLowerCase() === "x-robots-tag" && value.toLowerCase().includes("noindex"));
    if (routeRules.redirect || hasRobotsDisabled)
      continue;
    sitemapUrls[validCount++] = routeRules.sitemap ? defu(u, routeRules.sitemap) : u;
  }
  sitemapUrls.length = validCount;
  const locSize = sitemapUrls.length;
  const resolvedCtx = {
    urls: sitemapUrls,
    sitemapName,
    event
  };
  await nitro.hooks.callHook("sitemap:resolved", resolvedCtx);
  if (resolvedCtx.urls.length !== locSize) {
    resolvedCtx.urls = resolvedCtx.urls.map((e) => preNormalizeEntry(e, resolvers));
  }
  const maybeSort = (urls2) => runtimeConfig.sortEntries ? sortInPlace(urls2) : urls2;
  const normalizedPreDedupe = resolvedCtx.urls.map((e) => normaliseEntry(e, definition.defaults, resolvers));
  const urls = maybeSort(mergeOnKey(normalizedPreDedupe, "_key").map((e) => normaliseEntry(e, definition.defaults, resolvers)));
  if (definition._isChunking && definition.sitemapName.includes("-")) {
    const parts = definition.sitemapName.split("-");
    const lastPart = parts.pop();
    if (!Number.isNaN(Number(lastPart))) {
      const chunkIndex = Number(lastPart);
      const baseSitemapName = parts.join("-");
      if (urls.length === 0 && chunkIndex > 0) {
        throw createError$1({
          statusCode: 404,
          message: `Sitemap chunk ${chunkIndex} for "${baseSitemapName}" does not exist.`
        });
      }
    }
  }
  const errorInfo = failedSources.length > 0 ? {
    messages: failedSources.map((f) => f.error),
    urls: failedSources.map((f) => f.url)
  } : void 0;
  const sitemap = urlsToXml(urls, resolvers, runtimeConfig, errorInfo);
  const ctx = { sitemap, sitemapName, event };
  await nitro.hooks.callHook("sitemap:output", ctx);
  return ctx.sitemap;
}
const buildSitemapXmlCached = defineCachedFunction(
  buildSitemapXml,
  {
    name: "sitemap:xml",
    group: "sitemap",
    maxAge: 60 * 10,
    // Default 10 minutes
    base: "sitemap",
    // Use the sitemap storage
    getKey: (event, definition) => {
      const host = getHeader(event, "host") || getHeader(event, "x-forwarded-host") || "";
      const proto = getHeader(event, "x-forwarded-proto") || "https";
      const sitemapName = definition.sitemapName || "default";
      return `${sitemapName}-${proto}-${host}`;
    },
    swr: true
    // Enable stale-while-revalidate
  }
);
async function createSitemap(event, definition, runtimeConfig) {
  const resolvers = useNitroUrlResolvers(event);
  const shouldCache = typeof runtimeConfig.cacheMaxAgeSeconds === "number" && runtimeConfig.cacheMaxAgeSeconds > 0;
  const xml = shouldCache ? await buildSitemapXmlCached(event, definition, resolvers, runtimeConfig) : await buildSitemapXml(event, definition, resolvers, runtimeConfig);
  setHeader(event, "Content-Type", "text/xml; charset=UTF-8");
  if (runtimeConfig.cacheMaxAgeSeconds) {
    setHeader(event, "Cache-Control", `public, max-age=${runtimeConfig.cacheMaxAgeSeconds}, s-maxage=${runtimeConfig.cacheMaxAgeSeconds}, stale-while-revalidate=3600`);
    const now = /* @__PURE__ */ new Date();
    setHeader(event, "X-Sitemap-Generated", now.toISOString());
    setHeader(event, "X-Sitemap-Cache-Duration", `${runtimeConfig.cacheMaxAgeSeconds}s`);
    const expiryTime = new Date(now.getTime() + runtimeConfig.cacheMaxAgeSeconds * 1e3);
    setHeader(event, "X-Sitemap-Cache-Expires", expiryTime.toISOString());
    const remainingSeconds = Math.floor((expiryTime.getTime() - now.getTime()) / 1e3);
    setHeader(event, "X-Sitemap-Cache-Remaining", `${remainingSeconds}s`);
  } else {
    setHeader(event, "Cache-Control", `no-cache, no-store`);
  }
  event.context._isSitemap = true;
  return xml;
}

const _Q7rnAj = defineEventHandler(async (e) => {
  const runtimeConfig = useSitemapRuntimeConfig();
  const { sitemaps } = runtimeConfig;
  if ("index" in sitemaps) {
    return sendRedirect(e, withBase("/sitemap_index.xml", useRuntimeConfig().app.baseURL), 301);
  }
  return createSitemap(e, Object.values(sitemaps)[0], runtimeConfig);
});

const storage = prefixStorage(useStorage(), "i18n");
function cachedFunctionI18n(fn, opts) {
  opts = { maxAge: 1, ...opts };
  const pending = {};
  async function get(key, resolver) {
    const isPending = pending[key];
    if (!isPending) {
      pending[key] = Promise.resolve(resolver());
    }
    try {
      return await pending[key];
    } finally {
      delete pending[key];
    }
  }
  return async (...args) => {
    const key = [opts.name, opts.getKey(...args)].join(":").replace(/:\/$/, ":index");
    const maxAge = opts.maxAge ?? 1;
    const isCacheable = !opts.shouldBypassCache(...args) && maxAge >= 0;
    const cache = isCacheable && await storage.getItemRaw(key);
    if (!cache || cache.ttl < Date.now()) {
      pending[key] = Promise.resolve(fn(...args));
      const value = await get(key, () => fn(...args));
      if (isCacheable) {
        await storage.setItemRaw(key, { ttl: Date.now() + maxAge * 1e3, value, mtime: Date.now() });
      }
      return value;
    }
    return cache.value;
  };
}

const _getMessages = async (locale) => {
  return { [locale]: await getLocaleMessagesMerged(locale, localeLoaders[locale]) };
};
const _getMessagesCached = cachedFunctionI18n(_getMessages, {
  name: "messages",
  maxAge: 60 * 60 * 24,
  getKey: (locale) => locale,
  shouldBypassCache: (locale) => !isLocaleCacheable(locale)
});
const getMessages = _getMessagesCached;
const _getMergedMessages = async (locale, fallbackLocales) => {
  const merged = {};
  try {
    if (fallbackLocales.length > 0) {
      const messages = await Promise.all(fallbackLocales.map(getMessages));
      for (const message2 of messages) {
        deepCopy(message2, merged);
      }
    }
    const message = await getMessages(locale);
    deepCopy(message, merged);
    return merged;
  } catch (e) {
    throw new Error("Failed to merge messages: " + e.message);
  }
};
const getMergedMessages = cachedFunctionI18n(_getMergedMessages, {
  name: "merged-single",
  maxAge: 60 * 60 * 24,
  getKey: (locale, fallbackLocales) => `${locale}-[${[...new Set(fallbackLocales)].sort().join("-")}]`,
  shouldBypassCache: (locale, fallbackLocales) => !isLocaleWithFallbacksCacheable(locale, fallbackLocales)
});
const _getAllMergedMessages = async (locales) => {
  const merged = {};
  try {
    const messages = await Promise.all(locales.map(getMessages));
    for (const message of messages) {
      deepCopy(message, merged);
    }
    return merged;
  } catch (e) {
    throw new Error("Failed to merge messages: " + e.message);
  }
};
cachedFunctionI18n(_getAllMergedMessages, {
  name: "merged-all",
  maxAge: 60 * 60 * 24,
  getKey: (locales) => locales.join("-"),
  shouldBypassCache: (locales) => !locales.every((locale) => isLocaleCacheable(locale))
});

const _messagesHandler = defineEventHandler(async (event) => {
  const locale = getRouterParam(event, "locale");
  if (!locale) {
    throw createError$1({ status: 400, message: "Locale not specified." });
  }
  const ctx = useI18nContext(event);
  if (ctx.localeConfigs && locale in ctx.localeConfigs === false) {
    throw createError$1({ status: 404, message: `Locale '${locale}' not found.` });
  }
  const messages = await getMergedMessages(locale, ctx.localeConfigs?.[locale]?.fallbacks ?? []);
  deepCopy(messages, ctx.messages);
  return ctx.messages;
});
const _cachedMessageLoader = defineCachedFunction(_messagesHandler, {
  name: "i18n:messages-internal",
  maxAge: 60 * 60 * 24,
  getKey: (event) => [getRouterParam(event, "locale") ?? "null", getRouterParam(event, "hash") ?? "null"].join("-"),
  async shouldBypassCache(event) {
    const locale = getRouterParam(event, "locale");
    if (locale == null) {
      return false;
    }
    const ctx = tryUseI18nContext(event) || await initializeI18nContext(event);
    return !ctx.localeConfigs?.[locale]?.cacheable;
  }
});
const _messagesHandlerCached = defineCachedEventHandler(_cachedMessageLoader, {
  name: "i18n:messages",
  maxAge: 10,
  swr: false,
  getKey: (event) => [getRouterParam(event, "locale") ?? "null", getRouterParam(event, "hash") ?? "null"].join("-")
});
const _nEGvFq = _messagesHandlerCached;

const _REEIte = lazyEventHandler(() => {
  const opts = useRuntimeConfig().ipx || {};
  const fsDir = opts?.fs?.dir ? (Array.isArray(opts.fs.dir) ? opts.fs.dir : [opts.fs.dir]).map((dir) => isAbsolute(dir) ? dir : fileURLToPath(new URL(dir, globalThis._importMeta_.url))) : void 0;
  const fsStorage = opts.fs?.dir ? ipxFSStorage({ ...opts.fs, dir: fsDir }) : void 0;
  const httpStorage = opts.http?.domains ? ipxHttpStorage({ ...opts.http }) : void 0;
  if (!fsStorage && !httpStorage) {
    throw new Error("IPX storage is not configured!");
  }
  const ipxOptions = {
    ...opts,
    storage: fsStorage || httpStorage,
    httpStorage
  };
  const ipx = createIPX(ipxOptions);
  const ipxHandler = createIPXH3Handler(ipx);
  return useBase(opts.baseURL, ipxHandler);
});

const _lazy_fg6KH0 = () => import('../routes/api/admin/dashboard.get.mjs');
const _lazy_TbJVYg = () => import('../routes/api/admin/login.post.mjs');
const _lazy_VnMlnL = () => import('../routes/api/admin/logout.post.mjs');
const _lazy_3T_fBm = () => import('../routes/api/article/_id_.delete.mjs');
const _lazy_MGsiCA = () => import('../routes/api/article/_id_.get.mjs');
const _lazy_6oW9iu = () => import('../routes/api/article/_id_.post.mjs');
const _lazy_8D1vZD = () => import('../routes/api/index.get.mjs');
const _lazy_7Q0nh2 = () => import('../routes/api/index.post.mjs');
const _lazy_TRF4fe = () => import('../routes/api/category/_id_.delete.mjs');
const _lazy_Nx0hUu = () => import('../routes/api/category/_id_.put.mjs');
const _lazy_sVJa90 = () => import('../routes/api/index.get2.mjs');
const _lazy_H3OxZ3 = () => import('../routes/api/index.post2.mjs');
const _lazy_a12IAc = () => import('../routes/api/home.data.get.mjs');
const _lazy_OFBmgo = () => import('../routes/api/sitemap-urls.mjs');
const _lazy_7hQGVU = () => import('../routes/api/index.get3.mjs');
const _lazy_cPAn0N = () => import('../routes/api/tag/sync.post.mjs');
const _lazy_Man6Tj = () => import('../routes/api/upload.post.mjs');
const _lazy_ddWOEA = () => import('../routes/_nuxt/_...slug_.mjs');
const _lazy_5evvsO = () => import('../routes/.well-known/_...slug_.mjs');
const _lazy_TNVD1s = () => import('../routes/uploads/_...path_.get.mjs');
const _lazy_CRyTuy = () => import('../routes/renderer.mjs');
const _lazy_CGpE8M = () => import('../routes/sitemap_index.xml.mjs');
const _lazy_9UAQvy = () => import('../routes/__sitemap__/_sitemap_.xml.mjs');
const _lazy_ozTkcY = () => import('../routes/__og-image__/font/font.mjs');
const _lazy_pMn39Y = () => import('../routes/__og-image__/image/image.mjs');

const handlers = [
  { route: '', handler: _xYUv4t, lazy: false, middleware: true, method: undefined },
  { route: '', handler: _KStmQI, lazy: false, middleware: true, method: undefined },
  { route: '/api/admin/dashboard', handler: _lazy_fg6KH0, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/login', handler: _lazy_TbJVYg, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/logout', handler: _lazy_VnMlnL, lazy: true, middleware: false, method: "post" },
  { route: '/api/article/:id', handler: _lazy_3T_fBm, lazy: true, middleware: false, method: "delete" },
  { route: '/api/article/:id', handler: _lazy_MGsiCA, lazy: true, middleware: false, method: "get" },
  { route: '/api/article/:id', handler: _lazy_6oW9iu, lazy: true, middleware: false, method: "post" },
  { route: '/api/article', handler: _lazy_8D1vZD, lazy: true, middleware: false, method: "get" },
  { route: '/api/article', handler: _lazy_7Q0nh2, lazy: true, middleware: false, method: "post" },
  { route: '/api/category/:id', handler: _lazy_TRF4fe, lazy: true, middleware: false, method: "delete" },
  { route: '/api/category/:id', handler: _lazy_Nx0hUu, lazy: true, middleware: false, method: "put" },
  { route: '/api/category', handler: _lazy_sVJa90, lazy: true, middleware: false, method: "get" },
  { route: '/api/category', handler: _lazy_H3OxZ3, lazy: true, middleware: false, method: "post" },
  { route: '/api/home.data', handler: _lazy_a12IAc, lazy: true, middleware: false, method: "get" },
  { route: '/api/sitemap-urls', handler: _lazy_OFBmgo, lazy: true, middleware: false, method: undefined },
  { route: '/api/tag', handler: _lazy_7hQGVU, lazy: true, middleware: false, method: "get" },
  { route: '/api/tag/sync', handler: _lazy_cPAn0N, lazy: true, middleware: false, method: "post" },
  { route: '/api/upload', handler: _lazy_Man6Tj, lazy: true, middleware: false, method: "post" },
  { route: '/_nuxt/**:slug', handler: _lazy_ddWOEA, lazy: true, middleware: false, method: undefined },
  { route: '/.well-known/**:slug', handler: _lazy_5evvsO, lazy: true, middleware: false, method: undefined },
  { route: '/uploads/**:path', handler: _lazy_TNVD1s, lazy: true, middleware: false, method: "get" },
  { route: '/__nuxt_error', handler: _lazy_CRyTuy, lazy: true, middleware: false, method: undefined },
  { route: '/__nuxt_island/**', handler: _SxA8c9, lazy: false, middleware: false, method: undefined },
  { route: '', handler: _q2Ne7o, lazy: false, middleware: true, method: undefined },
  { route: '/robots.txt', handler: _AnTRJi, lazy: false, middleware: false, method: undefined },
  { route: '', handler: _D0Q3DA, lazy: false, middleware: true, method: undefined },
  { route: '/sitemap_index.xml', handler: _lazy_CGpE8M, lazy: true, middleware: false, method: undefined },
  { route: '/__sitemap__/**:sitemap', handler: _lazy_9UAQvy, lazy: true, middleware: false, method: undefined },
  { route: '/sitemap.xml', handler: _Q7rnAj, lazy: false, middleware: false, method: undefined },
  { route: '/__og-image__/font/**', handler: _lazy_ozTkcY, lazy: true, middleware: false, method: undefined },
  { route: '/__og-image__/image/**', handler: _lazy_pMn39Y, lazy: true, middleware: false, method: undefined },
  { route: '/__og-image__/static/**', handler: _lazy_pMn39Y, lazy: true, middleware: false, method: undefined },
  { route: '/_i18n/:hash/:locale/messages.json', handler: _nEGvFq, lazy: false, middleware: false, method: undefined },
  { route: '/_ipx/**', handler: _REEIte, lazy: false, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_CRyTuy, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(false),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => b$1(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return C$1(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp = createNitroApp();
function useNitroApp() {
  return nitroApp;
}
runNitroPlugins(nitroApp);

function parse(str, options) {
  if (typeof str !== "string") {
    throw new TypeError("argument str must be a string");
  }
  const obj = {};
  const opt = options || {};
  const dec = opt.decode || decode;
  let index = 0;
  while (index < str.length) {
    const eqIdx = str.indexOf("=", index);
    if (eqIdx === -1) {
      break;
    }
    let endIdx = str.indexOf(";", index);
    if (endIdx === -1) {
      endIdx = str.length;
    } else if (endIdx < eqIdx) {
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }
    const key = str.slice(index, eqIdx).trim();
    if (opt?.filter && !opt?.filter(key)) {
      index = endIdx + 1;
      continue;
    }
    if (void 0 === obj[key]) {
      let val = str.slice(eqIdx + 1, endIdx).trim();
      if (val.codePointAt(0) === 34) {
        val = val.slice(1, -1);
      }
      obj[key] = tryDecode(val, dec);
    }
    index = endIdx + 1;
  }
  return obj;
}
function decode(str) {
  return str.includes("%") ? decodeURIComponent(str) : str;
}
function tryDecode(str, decode2) {
  try {
    return decode2(str);
  } catch {
    return str;
  }
}

const debug = (...args) => {
};
function GracefulShutdown(server, opts) {
  opts = opts || {};
  const options = Object.assign(
    {
      signals: "SIGINT SIGTERM",
      timeout: 3e4,
      development: false,
      forceExit: true,
      onShutdown: (signal) => Promise.resolve(signal),
      preShutdown: (signal) => Promise.resolve(signal)
    },
    opts
  );
  let isShuttingDown = false;
  const connections = {};
  let connectionCounter = 0;
  const secureConnections = {};
  let secureConnectionCounter = 0;
  let failed = false;
  let finalRun = false;
  function onceFactory() {
    let called = false;
    return (emitter, events, callback) => {
      function call() {
        if (!called) {
          called = true;
          return Reflect.apply(callback, this, arguments);
        }
      }
      for (const e of events) {
        emitter.on(e, call);
      }
    };
  }
  const signals = options.signals.split(" ").map((s) => s.trim()).filter((s) => s.length > 0);
  const once = onceFactory();
  once(process, signals, (signal) => {
    debug("received shut down signal", signal);
    shutdown(signal).then(() => {
      if (options.forceExit) {
        process.exit(failed ? 1 : 0);
      }
    }).catch((error) => {
      debug("server shut down error occurred", error);
      process.exit(1);
    });
  });
  function isFunction(functionToCheck) {
    const getType = Object.prototype.toString.call(functionToCheck);
    return /^\[object\s([A-Za-z]+)?Function]$/.test(getType);
  }
  function destroy(socket, force = false) {
    if (socket._isIdle && isShuttingDown || force) {
      socket.destroy();
      if (socket.server instanceof http.Server) {
        delete connections[socket._connectionId];
      } else {
        delete secureConnections[socket._connectionId];
      }
    }
  }
  function destroyAllConnections(force = false) {
    debug("Destroy Connections : " + (force ? "forced close" : "close"));
    let counter = 0;
    let secureCounter = 0;
    for (const key of Object.keys(connections)) {
      const socket = connections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        counter++;
        destroy(socket);
      }
    }
    debug("Connections destroyed : " + counter);
    debug("Connection Counter    : " + connectionCounter);
    for (const key of Object.keys(secureConnections)) {
      const socket = secureConnections[key];
      const serverResponse = socket._httpMessage;
      if (serverResponse && !force) {
        if (!serverResponse.headersSent) {
          serverResponse.setHeader("connection", "close");
        }
      } else {
        secureCounter++;
        destroy(socket);
      }
    }
    debug("Secure Connections destroyed : " + secureCounter);
    debug("Secure Connection Counter    : " + secureConnectionCounter);
  }
  server.on("request", (req, res) => {
    req.socket._isIdle = false;
    if (isShuttingDown && !res.headersSent) {
      res.setHeader("connection", "close");
    }
    res.on("finish", () => {
      req.socket._isIdle = true;
      destroy(req.socket);
    });
  });
  server.on("connection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = connectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      connections[id] = socket;
      socket.once("close", () => {
        delete connections[socket._connectionId];
      });
    }
  });
  server.on("secureConnection", (socket) => {
    if (isShuttingDown) {
      socket.destroy();
    } else {
      const id = secureConnectionCounter++;
      socket._isIdle = true;
      socket._connectionId = id;
      secureConnections[id] = socket;
      socket.once("close", () => {
        delete secureConnections[socket._connectionId];
      });
    }
  });
  process.on("close", () => {
    debug("closed");
  });
  function shutdown(sig) {
    function cleanupHttp() {
      destroyAllConnections();
      debug("Close http server");
      return new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            return reject(err);
          }
          return resolve(true);
        });
      });
    }
    debug("shutdown signal - " + sig);
    if (options.development) {
      debug("DEV-Mode - immediate forceful shutdown");
      return process.exit(0);
    }
    function finalHandler() {
      if (!finalRun) {
        finalRun = true;
        if (options.finally && isFunction(options.finally)) {
          debug("executing finally()");
          options.finally();
        }
      }
      return Promise.resolve();
    }
    function waitForReadyToShutDown(totalNumInterval) {
      debug(`waitForReadyToShutDown... ${totalNumInterval}`);
      if (totalNumInterval === 0) {
        debug(
          `Could not close connections in time (${options.timeout}ms), will forcefully shut down`
        );
        return Promise.resolve(true);
      }
      const allConnectionsClosed = Object.keys(connections).length === 0 && Object.keys(secureConnections).length === 0;
      if (allConnectionsClosed) {
        debug("All connections closed. Continue to shutting down");
        return Promise.resolve(false);
      }
      debug("Schedule the next waitForReadyToShutdown");
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(waitForReadyToShutDown(totalNumInterval - 1));
        }, 250);
      });
    }
    if (isShuttingDown) {
      return Promise.resolve();
    }
    debug("shutting down");
    return options.preShutdown(sig).then(() => {
      isShuttingDown = true;
      cleanupHttp();
    }).then(() => {
      const pollIterations = options.timeout ? Math.round(options.timeout / 250) : 0;
      return waitForReadyToShutDown(pollIterations);
    }).then((force) => {
      debug("Do onShutdown now");
      if (force) {
        destroyAllConnections(force);
      }
      return options.onShutdown(sig);
    }).then(finalHandler).catch((error) => {
      const errString = typeof error === "string" ? error : JSON.stringify(error);
      debug(errString);
      failed = true;
      throw errString;
    });
  }
  function shutdownManual() {
    return shutdown("manual");
  }
  return shutdownManual;
}

function getGracefulShutdownConfig() {
  return {
    disabled: !!process.env.NITRO_SHUTDOWN_DISABLED,
    signals: (process.env.NITRO_SHUTDOWN_SIGNALS || "SIGTERM SIGINT").split(" ").map((s) => s.trim()),
    timeout: Number.parseInt(process.env.NITRO_SHUTDOWN_TIMEOUT || "", 10) || 3e4,
    forceExit: !process.env.NITRO_SHUTDOWN_NO_FORCE_EXIT
  };
}
function setupGracefulShutdown(listener, nitroApp) {
  const shutdownConfig = getGracefulShutdownConfig();
  if (shutdownConfig.disabled) {
    return;
  }
  GracefulShutdown(listener, {
    signals: shutdownConfig.signals.join(" "),
    timeout: shutdownConfig.timeout,
    forceExit: shutdownConfig.forceExit,
    onShutdown: async () => {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn("Graceful shutdown timeout, force exiting...");
          resolve();
        }, shutdownConfig.timeout);
        nitroApp.hooks.callHook("close").catch((error) => {
          console.error(error);
        }).finally(() => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }
  });
}

export { parseChunkInfo as $, publicAssetsURL as A, appTeleportTag as B, appTeleportAttrs as C, createSSRContext as D, appHead as E, setSSRError as F, getRouteRules as G, getRenderer as H, renderInlineStyles as I, replaceIslandTeleports as J, defineCachedFunction as K, escapeValueForXml as L, withQuery as M, globalSitemapSources as N, resolveSitemapSources as O, resolveSitemapEntries as P, defu as Q, joinURL as R, normaliseDate as S, childSitemapSources as T, sortInPlace as U, getHeader as V, useSitemapRuntimeConfig as W, useNitroUrlResolvers as X, getRouterParam as Y, withoutLeadingSlash as Z, withoutTrailingSlash as _, trapUnhandledNodeErrors as a, getSitemapConfig as a0, createSitemap as a1, prefixStorage as a2, useStorage as a3, useNitroOrigin as a4, emojiCache as a5, useOgImageRuntimeConfig as a6, fetchIsland as a7, createHeadCore as a8, normaliseFontInput as a9, $fetch$1 as aA, baseURL as aB, createHooks as aC, executeAsync as aD, titleCase as aE, withHttps as aF, toRouteMatcher as aG, createRouter$1 as aH, stringifyQuery as aI, camelCase as aJ, withBase as aK, withoutBase as aL, getRequestURL as aM, useSeoMeta as aN, createDefu as aO, hasTrailingSlash as aP, resolveUnrefHeadInput as aQ, encodeParam as aR, encodePath as aS, isEqual$1 as aT, decodeHtml as aU, logger$1 as aV, toBase64Image as aW, htmlDecodeQuotes as aX, sendError as aY, fontCache as aZ, theme$2 as aa, withTrailingSlash as ab, handleCacheHeaders as ac, setHeaders as ad, hash$1 as ae, parseURL as af, setResponseHeader as ag, proxyRequest as ah, sendRedirect as ai, resolveContext as aj, H3Error as ak, useHead as al, headSymbol as am, parseQuery as an, hasProtocol as ao, isScriptProtocol as ap, sanitizeStatusCode as aq, getContext as ar, klona as as, parsePath as at, parse as au, getRequestHeader as av, isEqual as aw, getCookie as ax, deleteCookie as ay, withLeadingSlash as az, useNitroApp as b, defineEventHandler as c, destr as d, setResponseStatus as e, setCookie as f, execute as g, updateTagsCount as h, updateCategoryCount as i, getQuery as j, getUploadsBaseDir as k, readMultipartFormData as l, createError$1 as m, setHeader as n, sendStream as o, getResponseStatusText as p, query as q, readBody as r, setupGracefulShutdown as s, toNodeListener as t, useRuntimeConfig as u, getResponseStatus as v, withTransaction as w, appId as x, defineRenderHandler as y, buildAssetsURL as z };
//# sourceMappingURL=nitro.mjs.map
