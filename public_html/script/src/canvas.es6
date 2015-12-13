/*
    Set up the canvas
*/
'use strict';
import $ from 'jquery';

export const $canvas = $('canvas#main');
export const canvas = $canvas[0];
export const c2d = canvas.getContext('2d');

// Initialize canvas
$canvas
    .attr('width', $canvas.width())
    .attr('height', $canvas.height());

export default {$canvas, canvas, c2d};