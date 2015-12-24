/*
    Actor to show the menu options and take input
*/
'use strict';
import $ from 'jquery';
import {$canvas} from '../canvas.es6';
import {socket} from '../socket.es6';

import {input, InputState} from '../input.es6';
import {Actor} from '../actor.es6';
import {range} from '../util.es6';
import draw from '../draw.es6';

const [SELECTED, OPTIONS, ALPHA, LAYER, PULSE, AWAITING, SEND, FORM, MESSAGE, CLOSE] = [
    Symbol('SELECTED'),
    Symbol('OPTIONS'),
    Symbol('ALPHA'),
    Symbol('LAYER'),
    Symbol('PULSE'),
    Symbol('AWAITING'),
    Symbol('SEND'),
    Symbol('FORM'),
    Symbol('MESSAGE'),
    Symbol('CLOSE')
];

const temp = $('<input>').attr('required', true);
const defaultValidationMessage = temp[0].validationMessage;
temp.remove();

const floatingBox = new draw.Path()
    .arc(25, 25, 25, Math.PI / 2, Math.PI / 2 * 3)
    .line(275, 0)
    .arc(275, 25, 25, Math.PI / 2 * 3, Math.PI / 2)
    .line(25, 50);

export const Menu = class extends Actor {
    constructor(next) {
        super();
        this[SELECTED] = 0;
        this[CLOSE] = next;
        this[ALPHA] = [0, 0, 0, 0];
        this[LAYER] = 0;
        this[PULSE] = 0;
        this[AWAITING] = false;
        this[MESSAGE] = '';
    }

    mousedown(which) {
        switch(this[LAYER]) {
        case 0:
            this[LAYER]++;
            break;
        case 1:
            if(which === InputState.mouse('left')) {
                if(floatingBox.contains($canvas.width() / 2 - 150, $canvas.height() - 100 - 25, input.mousestate.x, input.mousestate.y)) {
                    this[LAYER] = 3;
                    this[FORM]('signup');
                } else if(floatingBox.contains($canvas.width() / 2 - 150, $canvas.height() - 175 - 25, input.mousestate.x, input.mousestate.y)) {
                    this[LAYER] = 2;
                    this[FORM]('login');
                }
            }
            break;
        case 2: case 3:
            if(!this[AWAITING]) {
                if(which === InputState.mouse('left')) {
                    if(floatingBox.contains($canvas.width() / 2 - 150, $canvas.height() - 100 - 25, input.mousestate.x, input.mousestate.y)) {
                        this[LAYER] = 1;
                        $('form').remove();
                    } else if(floatingBox.contains($canvas.width() / 2 - 150, $canvas.height() - 175 - 25, input.mousestate.x, input.mousestate.y)) {
                        this[SEND](this[LAYER] === 2 ? 'login' : 'signup');
                    }
                }
            }
            break;
        }
    }

    keydown(which) {
        if(this[LAYER] === 0) {
            this[LAYER]++;
        } else if(this[LAYER] >= 2) {
            if(which === InputState.keyboard('enter')) {
                if($('#username:focus').length === 1) {
                    $('#password').focus();
                } else if($('#password:focus').length === 1) {
                    if(this[LAYER] === 2) {
                        this[SEND]('login');
                    } else {
                        $('#confirm-password').focus();
                    }
                } else if($('#confirm-password:focus').length === 1) {
                    $('#email').focus();
                } else if($('#email:focus').length === 1) {
                    this[SEND]('signup');
                }
            }
        }
    }

    step() {
        for(let i in this[ALPHA]) {
            if(i == this[LAYER]) {
                this[ALPHA][i] = range(0, 1, 0).constrain(this[ALPHA][i] + Math.max(0.02, 0.2 * (1 - this[ALPHA][i])));
            } else {
                this[ALPHA][i] = range(0, 1, 0).constrain(this[ALPHA][i] - Math.max(0.02, 0.2 * this[ALPHA][i]));
            }
        }
        switch(this[LAYER]) {
            case 0:
                this[PULSE] = (this[PULSE] + 6) % 360;
                if(floatingBox.contains($canvas.width() / 2 - 150, $canvas.height() - 100 - 25, input.mousestate.x, input.mousestate.y)) {
                    $canvas.css('cursor', 'pointer');
                } else {
                    $canvas.css('cursor', 'auto');
                }
                break;
            case 1: case 2: case 3:
                if( floatingBox.contains($canvas.width() / 2 - 150, $canvas.height() - 100 - 25, input.mousestate.x, input.mousestate.y) ||
                    floatingBox.contains($canvas.width() / 2 - 150, $canvas.height() - 175 - 25, input.mousestate.x, input.mousestate.y)) {
                    $canvas.css('cursor', 'pointer');
                } else {
                    $canvas.css('cursor', 'auto');
                }
                break;
        }
    }

    draw() {
        if(this[ALPHA][0] > 0) {
            draw.transformed({translate: {y: (1 - this[ALPHA][0]) * 50}}, () => {
                draw.setAlpha(0.5 * this[ALPHA][0]);
                draw.setColor('#eeeeee');
                floatingBox.fill({shadow: {blur: 10, color: '#eeeeee'}, transform: {translate: {x: $canvas.width() / 2 - 150, y: $canvas.height() - 100 - 25}}});
                draw.setAlpha((Math.sin((this[PULSE]) * Math.PI / 180) / 4 + 0.75) * this[ALPHA][0]);
                draw.setColor('#000000');
                draw.setFont({size: 24, family: '"Rii Pop",cursive', align: 'center', baseline: 'middle'});
                draw.text('Press any key to begin', $canvas.width() / 2, $canvas.height() - 100);
            });
        }
        if(this[ALPHA][1] > 0) {
            draw.transformed({translate: {y: (1 - this[ALPHA][1]) * 50}}, () => {
                draw.setAlpha(0.5 * this[ALPHA][1]);
                draw.setColor('#eeeeee');
                floatingBox.fill({shadow: {blur: 10, color: '#eeeeee'}, transform: {translate: {x: $canvas.width() / 2 - 150, y: $canvas.height() - 175 - 25}}});
                floatingBox.fill({shadow: {blur: 10, color: '#eeeeee'}, transform: {translate: {x: $canvas.width() / 2 - 150, y: $canvas.height() - 100 - 25}}});

                draw.setAlpha(this[ALPHA][1]);
                draw.setColor('#000000');
                draw.setFont({size: 12, family: '"Rii Pop",cursive', align: 'center', baseline: 'middle'});
                if(this[MESSAGE] !== '') {
                    draw.text(this[MESSAGE], $canvas.width() / 2, $canvas.height() - 83);
                }

                draw.setFont({size: 24});

                draw.text('Log in', $canvas.width() / 2, $canvas.height() - 175);
                draw.text('Create a new account', $canvas.width() / 2, $canvas.height() - 100);
            });
        }
        if(this[ALPHA][2] > 0) {
            $('#username')
                .css({
                    top: $canvas.height() - 350 + (1 - this[ALPHA][2]) * 50
                });
            $('#password')
                .css({
                    top: $canvas.height() - 275 + (1 - this[ALPHA][2]) * 50
                });
            draw.transformed({translate: {y: (1 - this[ALPHA][2]) * 50}}, () => {
                draw.setAlpha(0.5 * this[ALPHA][2]);
                draw.setColor('#eeeeee');
                floatingBox.fill({shadow: {blur: 10, color: '#eeeeee'}, transform: {translate: {x: $canvas.width() / 2 - 150, y: $canvas.height() - 325 - 25}}});
                floatingBox.fill({shadow: {blur: 10, color: '#eeeeee'}, transform: {translate: {x: $canvas.width() / 2 - 150, y: $canvas.height() - 250 - 25}}});
                floatingBox.fill({shadow: {blur: 10, color: '#eeeeee'}, transform: {translate: {x: $canvas.width() / 2 - 150, y: $canvas.height() - 175 - 25}}});
                floatingBox.fill({shadow: {blur: 10, color: '#eeeeee'}, transform: {translate: {x: $canvas.width() / 2 - 150, y: $canvas.height() - 100 - 25}}});

                draw.setAlpha(this[ALPHA][2]);
                draw.setColor('#000000');
                draw.setFont({size: 12, family: '"Rii Pop",cursive', align: 'center', baseline: 'middle'});
                if(this[LAYER] === 2) {
                    if($('#username')[0].validationMessage !== defaultValidationMessage) {
                        draw.text($('#username')[0].validationMessage, $canvas.width() / 2, $canvas.height() - 308);
                    }
                    if($('#password')[0].validationMessage !== defaultValidationMessage) {
                        draw.text($('#password')[0].validationMessage, $canvas.width() / 2, $canvas.height() - 233);
                    }
                }

                draw.setFont({size: 24});
                draw.text('Log in', $canvas.width() / 2, $canvas.height() - 175);
                draw.text('Back', $canvas.width() / 2, $canvas.height() - 100);
            });
        }
        if(this[ALPHA][3] > 0) {
            if(this[LAYER] === 3) {
                $('#username')
                    .css({
                        top: $canvas.height() - 500 + (1 - this[ALPHA][3]) * 50
                    });
                $('#password')
                    .css({
                        top: $canvas.height() - 425 + (1 - this[ALPHA][3]) * 50
                    });
            }
            $('#confirm-password')
                .css({
                    top: $canvas.height() - 350 + (1 - this[ALPHA][3]) * 50
                });
            $('#email')
                .css({
                    top: $canvas.height() - 275 + (1 - this[ALPHA][3]) * 50
                });
            draw.transformed({translate: {y: (1 - this[ALPHA][3]) * 50}}, () => {
                draw.setAlpha(0.5 * this[ALPHA][3]);
                draw.setColor('#eeeeee');
                floatingBox.fill({shadow: {blur: 10, color: '#eeeeee'}, transform: {translate: {x: $canvas.width() / 2 - 150, y: $canvas.height() - 475 - 25}}});
                floatingBox.fill({shadow: {blur: 10, color: '#eeeeee'}, transform: {translate: {x: $canvas.width() / 2 - 150, y: $canvas.height() - 400 - 25}}});
                floatingBox.fill({shadow: {blur: 10, color: '#eeeeee'}, transform: {translate: {x: $canvas.width() / 2 - 150, y: $canvas.height() - 325 - 25}}});
                floatingBox.fill({shadow: {blur: 10, color: '#eeeeee'}, transform: {translate: {x: $canvas.width() / 2 - 150, y: $canvas.height() - 250 - 25}}});
                floatingBox.fill({shadow: {blur: 10, color: '#eeeeee'}, transform: {translate: {x: $canvas.width() / 2 - 150, y: $canvas.height() - 175 - 25}}});
                floatingBox.fill({shadow: {blur: 10, color: '#eeeeee'}, transform: {translate: {x: $canvas.width() / 2 - 150, y: $canvas.height() - 100 - 25}}});

                draw.setAlpha(this[ALPHA][3]);
                draw.setColor('#000000');
                draw.setFont({size: 12, family: '"Rii Pop",cursive', align: 'center', baseline: 'middle'});
                if(this[LAYER] === 3) {
                    if($('#username')[0].validationMessage !== defaultValidationMessage) {
                        draw.text($('#username')[0].validationMessage, $canvas.width() / 2, $canvas.height() - 458);
                    }
                    if($('#confirm-password')[0].validationMessage !== defaultValidationMessage) {
                        draw.text($('#confirm-password')[0].validationMessage, $canvas.width() / 2, $canvas.height() - 308);
                    }
                    if($('#email')[0].validationMessage !== defaultValidationMessage) {
                        draw.text($('#email')[0].validationMessage, $canvas.width() / 2, $canvas.height() - 233);
                    }
                }

                draw.setFont({size: 24});
                draw.text('Sign up', $canvas.width() / 2, $canvas.height() - 175);
                draw.text('Back', $canvas.width() / 2, $canvas.height() - 100);
            });
        }
    }

    [SEND](evt) {
        if(evt === 'login') {
            if( $('#username').val() !== '' &&
                $('#password').val() !== ''
            ) {
                this[AWAITING] = true;
                socket.emit('login', {
                    username: $('#username').val(),
                    password: $('#password').val()
                }, ({username, password, error}) => {
                    this[AWAITING] = false;
                    if(!username) {
                        $('#password')[0].setCustomValidity('There is no user with this name');
                    }
                    if(!password) {
                        $('#password')[0].setCustomValidity('The password for this user is incorrect');
                    }
                    if(error !== '') {
                        console.error(error);
                    }
                    if(username && password && error === '') {
                        this[CLOSE]($('#username').val());
                        $('input').remove();
                    }
                });
            }
        } else {
            if( $('#username').val() !== '' &&
                $('#email').val() !== '' &&
                $('#email:valid').length !== 0 &&
                $('#password').val() !== '' &&
                $('#password').val() === $('#confirm-password').val()
            ) {
                this[AWAITING] = true;
                socket.emit('signup', {
                    username: $('#username').val(),
                    password: $('#password').val(),
                    email: $('#email').val()
                }, ({username, email, error}) => {
                    this[AWAITING] = false;
                    if(username !== '') {
                        $('#username')[0].setCustomValidity(username);
                    }
                    if(email !== '') {
                        $('#email')[0].setCustomValidity(email);
                    }
                    if(error !== '') {
                        console.error(error);
                    }
                    if(username === '' && email === '' && error === '') {
                        this[LAYER] = 1;
                        $('form').remove();
                        this[MESSAGE] = 'Account created successfully';
                    }
                });
            } else {
                if($('#password').val() !== $('#confirm-password').val()) {
                    $('#confirm-password')[0].setCustomValidity('Passwords must match');
                } else if($('#password').val() === '' || $('#confirm-password').val() === '' ) {
                    $('#confirm-password')[0].setCustomValidity('Passwords cannot be blank');
                }
                if($('#username').val() === '') {
                    $('#username')[0].setCustomValidity('Username cannot be blank');
                }
                if($('#email').val() === '') {
                    $('#email')[0].setCustomValidity('Email cannot be blank');
                } else {
                    $('#email')[0].setCustomValidity('');
                }
            }
        }
    }
    [FORM](evt) {
        $('body').append(
            $('<form></form>')
                .submit(() => false)
        );
        $('form').append(
            $('<input>')
                .attr({
                    id: 'username',
                    type: 'text',
                    placeholder: 'Username',
                    required: true
                }),
            $('<input>')
                .attr({
                    id: 'password',
                    type: 'password',
                    placeholder: 'Password',
                    required: true
                })
        );
        if(evt === 'signup') {
            $('form').append(
                $('<input>')
                    .attr({
                        id: 'confirm-password',
                        type: 'password',
                        placeholder: 'Confirm Password',
                        required: true
                    }),
                $('<input>')
                    .attr({
                        id: 'email',
                        type: 'email',
                        placeholder: 'email@example.com',
                        required: true
                    })
            );
        }
        $('input')
            .css({
                left: $canvas.width() / 2 - 150,
                width: 300,
                height: 50,
                'line-height': 50,
                padding: 10,
                'font-size': 24,
                'border-radius': 25
            })
            .on('input', function() {
                $(this)[0].setCustomValidity('');
            });
        $('#username').focus();
    }
};

export default {Menu};