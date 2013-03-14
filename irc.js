/*
Copyright (c) 2013 Wei Cheng Pan

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
var CHANNEL = '#sitcon';
var NICK = 'comment';
var PORT = 9527;

var IRC = require( 'irc' );
var SocketIO = require( 'socket.io' );

var server = SocketIO.listen( PORT );
server.sockets.on( 'connection', function( socket ) {
	socket.join( CHANNEL );
} );

var client = new IRC.Client( 'irc.freenode.net', NICK, {
	channels: [
		CHANNEL,
	],
} );
client.addListener( 'message', function( nick, to, text ) {
	var pattern = new RegExp( '^' + NICK + '[,:]\\s*(.*)\\s*$' );
	pattern = text.match( pattern );
	if( to === CHANNEL && !pattern ) {
		text = pattern[1];
	} else if( to !== NICK ) {
		return;
	}
	server.sockets.in( CHANNEL ).emit( 'comment', text );
} );
client.addListener( 'error', function( msg ) {
	console.log( msg );
} );
