'use strict';
const globals = {};

export const set = (k, v) => globals[k] = v;
export const get = (k) => globals[k];
export const remove = (k) => delete globals[k];
export default {set, get};